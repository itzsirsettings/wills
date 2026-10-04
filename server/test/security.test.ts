// @vitest-environment node
import { randomBytes } from 'node:crypto';
import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

process.env.ENABLE_CSRF_TEST = 'true';
process.env.NODE_ENV = 'test';
process.env.STORE_CHECKOUT_ENABLED = 'true';
process.env.LEGACY_COMMERCE_ENABLED = 'true';
process.env.SERVER_PORT = '3002';
process.env.CSRF_SECRET = randomBytes(32).toString('hex');
process.env.ORDER_TOKEN_SECRET = randomBytes(32).toString('hex');
process.env.ORDER_STORE_ENCRYPTION_KEY = randomBytes(32).toString('hex');
process.env.PAYSTACK_SECRET_KEY = 'sk_test_realistic_test_key';
process.env.PUBLIC_SITE_URL = 'http://localhost:3002';

let app: Awaited<typeof import('../index.js')>['app'];

describe('Security Hardening Tests', () => {
  beforeAll(async () => {
    ({ app } = await import('../index.js'));
  });

  it('should have security headers (Helmet)', async () => {
    const response = await request(app).get('/api/health');
    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['content-security-policy']).toBeDefined();
  });

  it('should block requests without CSRF token for state-changing methods', async () => {
    const response = await request(app)
      .post('/api/checkout/initialize')
      .send({ items: [] });

    expect(response.status).toBe(403);
    expect(response.body.message).toContain('CSRF');
  });

  it('should allow state-changing requests with a valid CSRF token', async () => {
    const agent = request.agent(app);
    const tokenResponse = await agent.get('/api/security/csrf-token');
    const response = await agent
      .post('/api/checkout/initialize')
      .set('X-XSRF-TOKEN', tokenResponse.body.token)
      .send({ items: [] });

    expect(response.status).toBe(400);
    expect(response.body.message).not.toContain('CSRF');
  });

  it('should allow GET requests without CSRF token', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
  });

  it('should let Paystack webhooks reach signature verification without CSRF', async () => {
    const response = await request(app)
      .post('/api/payments/paystack/webhook')
      .send({ event: 'charge.success' });

    expect(response.status).toBe(401);
    expect(response.body.message).toContain('Invalid Paystack signature');
  });

  it('should return 401 for unauthorized admin access', async () => {
    const response = await request(app).get('/api/admin/products');
    expect(response.status).toBe(401);
  });
});
