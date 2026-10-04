// @vitest-environment node
import express from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { applySecurityHeaders, createRateLimiter, getClientIp } from '../lib/security.js';
import { getProxyTrust, validateProductionConfig } from '../lib/runtime-config.js';
import { isPaystackDemoMode } from '../lib/paystack.js';
import { requireCommerceEnabled } from '../lib/checkout-availability.js';
import { validatePaymentForOrder } from '../lib/payment-validation.js';
import type { OrderRecord } from '../lib/types.js';

afterEach(() => vi.unstubAllEnvs());

describe('production hardening', () => {
  it('does not let forged forwarding headers bypass the limiter', async () => {
    const app = express();
    app.use(createRateLimiter({ name: `spoof-${Date.now()}`, max: 1, windowMs: 60_000 }));
    app.get('/', (_req, res) => res.sendStatus(200));
    expect((await request(app).get('/').set('X-Forwarded-For', '198.51.100.1')).status).toBe(200);
    expect((await request(app).get('/').set('X-Forwarded-For', '198.51.100.2')).status).toBe(429);
  });
  it('uses the trusted proxy result rather than the leftmost supplied address', async () => {
    const app = express();
    app.set('trust proxy', 'loopback');
    app.get('/', (req, res) => res.json({ ip: getClientIp(req) }));
    expect((await request(app).get('/').set('X-Forwarded-For', '198.51.100.99, 203.0.113.1')).body.ip).toBe('203.0.113.1');
  });
  it.each(['true', '1', '0.0.0.0/0', '::/0'])('rejects unsafe proxy configuration %s', value => {
    vi.stubEnv('TRUST_PROXY', value);
    expect(getProxyTrust).toThrow();
  });
  it('allows the production informational site without database or payment credentials', () => {
    vi.stubEnv('NODE_ENV', 'production'); vi.stubEnv('PUBLIC_SITE_URL', 'https://willsinteriors.com');
    vi.stubEnv('LEGACY_COMMERCE_ENABLED', 'false'); vi.stubEnv('STORE_CHECKOUT_ENABLED', 'false');
    vi.stubEnv('DATABASE_URL', undefined); vi.stubEnv('TRUST_PROXY', 'false'); vi.stubEnv('ENABLE_CSRF_TEST', undefined);
    expect(validateProductionConfig).not.toThrow();
  });
  it('cannot enable production payment demo mode', () => {
    vi.stubEnv('NODE_ENV', 'production'); vi.stubEnv('PUBLIC_SITE_URL', undefined); vi.stubEnv('PAYSTACK_SECRET_KEY', undefined);
    expect(isPaystackDemoMode()).toBe(false);
  });
  it('requires HTTPS production origin', () => {
    vi.stubEnv('NODE_ENV', 'production'); vi.stubEnv('PUBLIC_SITE_URL', 'http://willsinteriors.com');
    expect(validateProductionConfig).toThrow('HTTPS');
  });
  it('keeps commerce APIs unavailable without enabling configuration', async () => {
    vi.stubEnv('LEGACY_COMMERCE_ENABLED', undefined);
    const app = express(); app.use(requireCommerceEnabled); app.get('/', (_req, res) => res.sendStatus(200));
    expect((await request(app).get('/')).status).toBe(503);
  });
  it('sets a unique CSP nonce and never enables preload implicitly', async () => {
    vi.stubEnv('PUBLIC_SITE_URL', 'https://willsinteriors.com');
    vi.stubEnv('HSTS_PRELOAD', undefined); vi.stubEnv('HSTS_INCLUDE_SUBDOMAINS', undefined);
    const app = express(); app.use(applySecurityHeaders); app.get('/', (_req, res) => res.sendStatus(200));
    const a = await request(app).get('/'); const b = await request(app).get('/');
    expect(a.headers['content-security-policy']).toContain("'nonce-");
    expect(a.headers['content-security-policy']).not.toBe(b.headers['content-security-policy']);
    expect(a.headers['strict-transport-security']).not.toContain('preload');
    expect(a.headers['content-security-policy']).toContain("frame-ancestors 'none'");
  });
});

describe('payment integrity', () => {
  const order = { reference: 'TW-123', amountInKobo: 10000, currency: 'NGN', status: 'pending' } as OrderRecord;
  const payment = { id: 123, reference: 'TW-123', amount: 10000, currency: 'NGN', status: 'success' };
  it.each([{ amount: 1 }, { currency: 'USD' }, { reference: 'TW-other' }, { status: 'failed' }, { id: -1 }])('rejects mismatched payment %j', overrides => {
    expect(() => validatePaymentForOrder(order, { ...payment, ...overrides })).toThrow();
  });
  it('accepts the matching successful payment', () => expect(validatePaymentForOrder(order, payment).id).toBe(123));
  it('rejects rebinding a paid order to another provider transaction', () => {
    expect(() => validatePaymentForOrder({ ...order, status: 'paid', paystackTransactionId: '999' }, payment)).toThrow();
  });
});
