import { isIP } from 'node:net';
import { isCommerceEnabled } from './checkout-availability.js';

export function getProxyTrust(): false | string[] {
  const value = process.env.TRUST_PROXY?.trim();
  if (!value || value === 'false') return false;
  const entries = value.split(',').map(entry => entry.trim());
  for (const entry of entries) {
    if (['loopback', 'linklocal', 'uniquelocal'].includes(entry)) continue;
    const [address, mask, extra] = entry.split('/');
    const version = isIP(address);
    if (!version || extra || (mask !== undefined && (!/^\d+$/.test(mask) || Number(mask) < 1 || Number(mask) > (version === 4 ? 32 : 128)))) {
      throw new Error('TRUST_PROXY must contain explicit trusted proxy IPs or restricted CIDR ranges.');
    }
  }
  return entries;
}

export function validateProductionConfig() {
  getProxyTrust();
  if (process.env.NODE_ENV !== 'production') return;
  const configuredUrl = process.env.PUBLIC_SITE_URL;
  let url: URL;
  try { url = new URL(configuredUrl || ''); } catch { throw new Error('PUBLIC_SITE_URL must be a production HTTPS origin.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/' || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
    throw new Error('PUBLIC_SITE_URL must be a production HTTPS origin.');
  }
  for (const origin of (process.env.CORS_ALLOWED_ORIGINS || '').split(',').filter(Boolean)) {
    const parsed = new URL(origin.trim());
    if (parsed.protocol !== 'https:' || parsed.origin !== origin.trim()) throw new Error('CORS_ALLOWED_ORIGINS must contain exact HTTPS origins.');
  }
  if (process.env.ENABLE_CSRF_TEST) throw new Error('Test-only CSRF configuration is forbidden in production.');
  if (process.env.HSTS_PRELOAD === 'true' && process.env.HSTS_INCLUDE_SUBDOMAINS !== 'true') throw new Error('HSTS preload requires verified subdomain coverage.');
  if (!isCommerceEnabled()) {
    if (process.env.STORE_CHECKOUT_ENABLED === 'true') throw new Error('Checkout cannot reopen while commerce is disabled.');
    return;
  }
  const required = ['CSRF_SECRET', 'ORDER_TOKEN_SECRET', 'ORDER_STORE_ENCRYPTION_KEY'];
  for (const name of required) {
    const value = process.env[name]?.trim();
    if (!value || value.length < 32 || /your_|placeholder/i.test(value)) throw new Error(`${name} must contain at least 32 characters of non-placeholder secret material.`);
  }
  if (new Set(required.map(name => process.env[name])).size !== required.length) throw new Error('Security secrets must be independent.');
  for (const name of ['DATABASE_URL', 'PAYSTACK_SECRET_KEY', 'REDIS_URL', 'ADMIN_OIDC_ISSUER', 'ADMIN_OIDC_AUDIENCE', 'ADMIN_OIDC_JWKS_URL', 'ADMIN_SUBJECTS']) {
    if (!process.env[name]?.trim() || /your_|placeholder/i.test(process.env[name] || '')) throw new Error(`${name} is required before enabling commerce.`);
  }
  if (!process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_live_')) throw new Error('Production commerce requires a live Paystack secret.');
  if (process.env.STORE_CHECKOUT_ENABLED === 'true' && (!process.env.TURNSTILE_SECRET_KEY || !process.env.VITE_TURNSTILE_SITE_KEY)) throw new Error('Turnstile must be configured before reopening checkout.');
}
