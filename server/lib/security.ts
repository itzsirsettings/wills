import {
  createHmac,
  hkdfSync,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { RedisClient } from './redis.js';

type SecuritySeverity = 'info' | 'warning' | 'critical';

interface SecurityLogDetails {
  event: string;
  ip?: string;
  method?: string;
  path?: string;
  reference?: string;
  outcome?: 'allowed' | 'blocked' | 'failed' | 'succeeded';
  reason?: string;
  statusCode?: number;
}

interface SecurityLogPayload extends SecurityLogDetails {
  category: 'security';
  environment: string;
  service: string;
  severity: SecuritySeverity;
  siteUrl: string;
  timestamp: string;
}

interface RateLimitOptions {
  max: number;
  windowMs: number;
  name: string;
  keyResolver?: (request: Request) => string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitStoreResult {
  count: number;
  resetAfterMs: number;
}

const HSTS_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
const RECEIPT_COOKIE_PREFIX = 'thewworksict_receipt_';
const RECEIPT_COOKIE_MAX_AGE_MS = 2 * 60 * 60 * 1000;
const DEFAULT_SECURITY_ALERT_COOLDOWN_MS = 5 * 60 * 1000;
const MAX_RATE_LIMIT_KEYS = 10_000;
const MAX_ALERT_KEYS = 200;
const MAX_PENDING_ALERTS = 20;
const logIdentityKey = randomBytes(32);

const rateLimitStore = new Map<string, RateLimitEntry>();
const securityAlertCooldownStore = new Map<string, number>();
let redisRateLimitClient: RedisClient | null = null;
let redisRateLimitUrl = '';
let securityAlertDispatchQueue: Promise<void> = Promise.resolve();
let pendingSecurityAlerts = 0;

function getRequiredSecret(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is missing.`);
  }

  return value;
}

function getDerivedKey(materialName: string, info: string) {
  const rawSecret = getRequiredSecret(materialName);

  return Buffer.from(
    hkdfSync(
      'sha256',
      Buffer.from(rawSecret, 'utf8'),
      Buffer.from('thewworksict-security-salt', 'utf8'),
      Buffer.from(info, 'utf8'),
      32,
    ),
  );
}

export function getTrustedSiteUrl() {
  const configuredUrl =
    process.env.PUBLIC_SITE_URL?.trim() ||
    `http://localhost:${process.env.SERVER_PORT || 3001}`;

  return new URL(configuredUrl);
}

export function getCheckoutReturnUrl() {
  return new URL('/store', getTrustedSiteUrl()).toString();
}

export function createReceiptToken() {
  return randomBytes(32).toString('base64url');
}

export function getReceiptCookieName(reference: string) {
  return `${RECEIPT_COOKIE_PREFIX}${reference}`;
}

export function getCsrfSecret() {
  return getRequiredSecret('CSRF_SECRET');
}

function signCsrfNonce(nonce: string) {
  return createHmac('sha256', getDerivedKey('CSRF_SECRET', 'csrf-token'))
    .update(nonce, 'utf8')
    .digest('base64url');
}

export function generateCsrfToken() {
  const nonce = randomBytes(32).toString('base64url');
  return `${nonce}.${signCsrfNonce(nonce)}`;
}

function csrfTokenMatches(cookieToken: string, headerToken: string) {
  if (cookieToken !== headerToken) {
    return false;
  }

  const [nonce, signature, ...extra] = cookieToken.split('.');

  if (!nonce || !signature || extra.length > 0) {
    return false;
  }

  const expectedSignature = signCsrfNonce(nonce);
  const actualDigest = Buffer.from(signature, 'base64url');
  const expectedDigest = Buffer.from(expectedSignature, 'base64url');

  return actualDigest.length === expectedDigest.length && timingSafeEqual(actualDigest, expectedDigest);
}

export const csrfProtectionMiddleware: RequestHandler = (request, response, next) => {
  if (process.env.NODE_ENV === 'test' && !process.env.ENABLE_CSRF_TEST) {
    return next();
  }

  // Only check state-changing methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return next();
  }

  if (request.path === '/api/payments/paystack/webhook') {
    return next();
  }

  const csrfTokenFromCookie = request.cookies?.['XSRF-TOKEN'];
  const csrfTokenFromHeader = request.header('X-XSRF-TOKEN');

  if (
    !csrfTokenFromCookie ||
    !csrfTokenFromHeader ||
    !csrfTokenMatches(csrfTokenFromCookie, csrfTokenFromHeader)
  ) {
    logSecurityEvent({
      event: 'csrf_failed',
      ip: getClientIp(request),
      method: request.method,
      path: request.path,
      outcome: 'blocked',
      reason: 'Missing or mismatched CSRF token',
      statusCode: 403,
    });
    return response.status(403).json({ message: 'Security validation failed (CSRF).' });
  }

  next();
};

export function hashReceiptToken(token: string) {
  return createHmac('sha256', getDerivedKey('ORDER_TOKEN_SECRET', 'receipt-token'))
    .update(token, 'utf8')
    .digest('hex');
}

export function receiptTokenMatches(
  candidateToken: string | undefined,
  expectedTokenHash: string | undefined,
) {
  if (!candidateToken || !expectedTokenHash) {
    return false;
  }

  const actualDigest = Buffer.from(hashReceiptToken(candidateToken), 'hex');
  const expectedDigest = Buffer.from(expectedTokenHash, 'hex');

  if (actualDigest.length !== expectedDigest.length) {
    return false;
  }

  return timingSafeEqual(actualDigest, expectedDigest);
}

export function getOrderStoreEncryptionKey() {
  const configuredKey = process.env.ORDER_STORE_ENCRYPTION_KEY?.trim();

  if (configuredKey) {
    return Buffer.from(
      hkdfSync(
        'sha256',
        Buffer.from(configuredKey, 'utf8'),
        Buffer.from('thewworksict-order-store-salt', 'utf8'),
        Buffer.from('order-store', 'utf8'),
        32,
      ),
    );
  }

  return getDerivedKey('ORDER_STORE_ENCRYPTION_KEY', 'order-store');
}

function shouldUseSecureCookies(request: Request) {
  const trustedSiteUrl = getTrustedSiteUrl();

  return (
    request.secure ||
    trustedSiteUrl.protocol === 'https:'
  );
}

function getConfiguredRedisRateLimitClient() {
  const configuredUrl = process.env.REDIS_URL?.trim();

  if (!configuredUrl) {
    return null;
  }

  if (!redisRateLimitClient || redisRateLimitUrl !== configuredUrl) {
    redisRateLimitClient = new RedisClient(configuredUrl);
    redisRateLimitUrl = configuredUrl;
  }

  return redisRateLimitClient;
}

function incrementMemoryRateLimitWindow(key: string, windowMs: number): RateLimitStoreResult {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt <= now) {
    if (!entry && rateLimitStore.size >= MAX_RATE_LIMIT_KEYS) {
      for (const [storedKey, storedEntry] of rateLimitStore) {
        if (storedEntry.resetAt <= now) rateLimitStore.delete(storedKey);
      }
      if (rateLimitStore.size >= MAX_RATE_LIMIT_KEYS) throw new Error('Rate limit capacity exhausted.');
    }
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      count: 1,
      resetAfterMs: windowMs,
    };
  }

  entry.count += 1;

  return {
    count: entry.count,
    resetAfterMs: Math.max(entry.resetAt - now, 0),
  };
}

function getTrustedSiteOrigin() {
  try {
    return getTrustedSiteUrl().origin;
  } catch {
    return 'unknown';
  }
}

function getSecurityAlertWebhookUrl() {
  return process.env.SECURITY_ALERT_WEBHOOK_URL?.trim() || '';
}

function getSecurityAlertCooldownMs() {
  const configuredCooldown = Number(
    process.env.SECURITY_ALERT_COOLDOWN_MS || DEFAULT_SECURITY_ALERT_COOLDOWN_MS,
  );

  if (!Number.isFinite(configuredCooldown) || configuredCooldown < 0) {
    return DEFAULT_SECURITY_ALERT_COOLDOWN_MS;
  }

  return configuredCooldown;
}

function getSecurityAlertMinimumSeverity(): SecuritySeverity {
  const configuredValue = process.env.SECURITY_ALERT_MIN_SEVERITY?.trim().toLowerCase();

  if (
    configuredValue === 'info' ||
    configuredValue === 'warning' ||
    configuredValue === 'critical'
  ) {
    return configuredValue;
  }

  return 'critical';
}

function getSeverityRank(severity: SecuritySeverity) {
  switch (severity) {
    case 'critical':
      return 3;
    case 'warning':
      return 2;
    default:
      return 1;
  }
}

function classifySecuritySeverity(details: SecurityLogDetails): SecuritySeverity {
  if (
    details.event === 'paystack_webhook_rejected' ||
    details.event === 'rate_limit_store_failed' ||
    details.event === 'checkout_initialize_failed' ||
    details.event === 'checkout_verify_failed' ||
    details.event === 'paystack_webhook_failed' ||
    (details.statusCode !== undefined && details.statusCode >= 500)
  ) {
    return 'critical';
  }

  if (
    details.outcome === 'blocked' ||
    details.outcome === 'failed' ||
    details.statusCode === 401 ||
    details.statusCode === 403 ||
    details.statusCode === 409 ||
    details.statusCode === 429
  ) {
    return 'warning';
  }

  return 'info';
}

function shouldDispatchSecurityAlert(payload: SecurityLogPayload) {
  const webhookUrl = getSecurityAlertWebhookUrl();

  if (!webhookUrl) {
    return false;
  }

  if (
    getSeverityRank(payload.severity) <
    getSeverityRank(getSecurityAlertMinimumSeverity())
  ) {
    return false;
  }

  const cooldownKey = [
    payload.event,
    payload.statusCode || '',
  ].join(':');
  const now = Date.now();
  const lastSentAt = securityAlertCooldownStore.get(cooldownKey) || 0;

  if (now - lastSentAt < getSecurityAlertCooldownMs()) {
    return false;
  }

  if (securityAlertCooldownStore.size >= MAX_ALERT_KEYS) {
    const oldestKey = securityAlertCooldownStore.keys().next().value;
    if (oldestKey) securityAlertCooldownStore.delete(oldestKey);
  }
  securityAlertCooldownStore.set(cooldownKey, now);
  return true;
}

async function dispatchSecurityAlert(payload: SecurityLogPayload) {
  const webhookUrl = getSecurityAlertWebhookUrl();

  if (!webhookUrl) {
    return;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const bearerToken = process.env.SECURITY_ALERT_BEARER_TOKEN?.trim();

  if (bearerToken) {
    headers.Authorization = `Bearer ${bearerToken}`;
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`Security alert delivery failed with status ${response.status}.`);
  }
}

function queueSecurityAlert(payload: SecurityLogPayload) {
  if (pendingSecurityAlerts >= MAX_PENDING_ALERTS) return;
  pendingSecurityAlerts += 1;
  securityAlertDispatchQueue = securityAlertDispatchQueue
    .then(async () => {
      try {
        await dispatchSecurityAlert(payload);
      } catch {
        console.error(
          JSON.stringify({
            timestamp: new Date().toISOString(),
            category: 'security',
            severity: 'critical',
            event: 'security_alert_delivery_failed',
            reason: 'Alert delivery failed. Check the configured endpoint and provider status.',
            originalEvent: payload.event,
          }),
        );
      }
    })
    .finally(() => { pendingSecurityAlerts -= 1; });
}

function parseCookieHeader(cookieHeader: string | undefined) {
  if (!cookieHeader) {
    return new Map<string, string>();
  }

  return new Map(
    cookieHeader
      .split(';')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const separatorIndex = entry.indexOf('=');

        if (separatorIndex === -1) {
          return [entry, ''] as const;
        }

        return [
          decodeURIComponent(entry.slice(0, separatorIndex)),
          decodeURIComponent(entry.slice(separatorIndex + 1)),
        ] as const;
      }),
  );
}

export function setReceiptTokenCookie(
  request: Request,
  response: Response,
  reference: string,
  token: string,
) {
  response.cookie(getReceiptCookieName(reference), token, {
    httpOnly: true,
    maxAge: RECEIPT_COOKIE_MAX_AGE_MS,
    path: `/api/checkout/verify/${reference}`,
    sameSite: 'lax',
    secure: shouldUseSecureCookies(request),
  });
}

export function clearReceiptTokenCookie(
  request: Request,
  response: Response,
  reference: string,
) {
  response.clearCookie(getReceiptCookieName(reference), {
    httpOnly: true,
    path: `/api/checkout/verify/${reference}`,
    sameSite: 'lax',
    secure: shouldUseSecureCookies(request),
  });
}

export function getReceiptTokenFromRequest(request: Request, reference: string) {
  const cookies = parseCookieHeader(request.header('cookie'));
  const cookieToken = cookies.get(getReceiptCookieName(reference));

  return cookieToken || request.header('x-order-token')?.trim();
}

export function getClientIp(request: Request) {
  return request.ip || request.socket?.remoteAddress || 'unknown';
}

export function logSecurityEvent(details: SecurityLogDetails) {
  const payload: SecurityLogPayload = {
    timestamp: new Date().toISOString(),
    category: 'security',
    severity: classifySecuritySeverity(details),
    service: process.env.SECURITY_SERVICE_NAME?.trim() || 'thewworksict-checkout-api',
    environment: process.env.NODE_ENV?.trim() || 'development',
    siteUrl: getTrustedSiteOrigin(),
    ...details,
    ip: details.ip ? createHmac('sha256', logIdentityKey).update(details.ip).digest('hex').slice(0, 16) : undefined,
    path: details.path?.replace(/\/verify\/[^/]+/, '/verify/:reference').slice(0, 160),
    reference: details.reference ? createHmac('sha256', logIdentityKey).update(details.reference).digest('hex').slice(0, 16) : undefined,
  };

  console.info(JSON.stringify(payload));

  if (shouldDispatchSecurityAlert(payload)) {
    queueSecurityAlert(payload);
  }
}

export function createRateLimiter({
  max,
  windowMs,
  name,
  keyResolver,
}: RateLimitOptions): RequestHandler {
  return async (request: Request, response: Response, next: NextFunction) => {
    const resolvedKey =
      keyResolver?.(request) || `${name}:${getClientIp(request)}`;
    let result: RateLimitStoreResult;

    try {
      const redisClient = getConfiguredRedisRateLimitClient();
      result = redisClient
        ? await redisClient.incrementWindow(resolvedKey, windowMs)
        : incrementMemoryRateLimitWindow(resolvedKey, windowMs);
    } catch {
      logSecurityEvent({
        event: 'rate_limit_store_failed',
        ip: getClientIp(request),
        method: request.method,
        path: request.path,
        outcome: 'failed',
        reason: name,
      });
      response.status(503).setHeader('Retry-After', '30');
      response.json({ message: 'Request protection is temporarily unavailable. Please try again later.' });
      return;
    }

    if (result.count > max) {
      const retryAfterSeconds = Math.max(1, Math.ceil(result.resetAfterMs / 1000));
      response.setHeader('Retry-After', retryAfterSeconds.toString());
      logSecurityEvent({
        event: 'rate_limit_triggered',
        ip: getClientIp(request),
        method: request.method,
        path: request.path,
        outcome: 'blocked',
        reason: name,
        statusCode: 429,
      });
      response.status(429).json({
        message: 'Too many requests. Please slow down and try again shortly.',
      });
      return;
    }

    next();
  };
}

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    const trustedOrigin = getTrustedSiteOrigin();
    const configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
      .split(',')
      .map((allowedOrigin) => allowedOrigin.trim())
      .filter(Boolean);
    const allowedOrigins = new Set([
      trustedOrigin,
      ...configuredOrigins,
    ]);

    if (process.env.NODE_ENV !== 'production') {
      allowedOrigins.add('http://localhost:3001');
      allowedOrigins.add('http://localhost:3002');
      allowedOrigins.add('http://localhost:5173');
      allowedOrigins.add('http://127.0.0.1:5173');
    }

    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Order-Token', 'X-XSRF-TOKEN', 'x-paystack-signature'],
});

export function applySecurityHeaders(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const trustedSiteUrl = getTrustedSiteUrl();
  const isHttps =
    request.secure ||
    trustedSiteUrl.protocol === 'https:';
  const nonce = randomBytes(24).toString('base64');
  response.locals.cspNonce = nonce;

  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'default-src': ["'self'"],
        'script-src': ["'self'", `'nonce-${nonce}'`, 'https://challenges.cloudflare.com'],
        'frame-ancestors': ["'none'"],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
        'img-src': ["'self'", 'data:', 'blob:', 'https:'],
        'connect-src': [
          "'self'",
          'https://challenges.cloudflare.com',
        ],
        'frame-src': ["'self'", 'https://challenges.cloudflare.com'],
        'form-action': ["'self'", 'https://checkout.paystack.com', 'https://paystack.com'],
        'upgrade-insecure-requests': isHttps ? [] : null,
      },
    },
    hsts: isHttps
      ? {
          maxAge: HSTS_MAX_AGE_SECONDS,
          includeSubDomains: process.env.HSTS_INCLUDE_SUBDOMAINS === 'true',
          preload: process.env.HSTS_PRELOAD === 'true',
        }
      : false,
    referrerPolicy: { policy: 'no-referrer' },
    frameguard: { action: 'deny' },
    xssFilter: true,
    noSniff: true,
  })(request, response, () => {
    // Additional custom headers not covered by helmet or needing specific logic
    response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    

    if (
      request.path.startsWith('/api/admin') ||
      request.path.startsWith('/api/checkout') ||
      request.path.startsWith('/api/payments')
    ) {
      response.setHeader('Cache-Control', 'no-store, max-age=0');
      response.setHeader('Pragma', 'no-cache');
    }

    next();
  });
}
