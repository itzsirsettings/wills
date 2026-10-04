// @vitest-environment node
import express, { type Request, type Response } from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { requireCheckoutEnabled } from '../lib/checkout-availability.js';

afterEach(() => vi.unstubAllEnvs());

function createCheckoutApp() {
  const app = express();
  const initializePayment = vi.fn((_request: Request, response: Response) => {
    response.status(200).json({ initialized: true });
  });
  app.post('/api/checkout/initialize', requireCheckoutEnabled);
  app.use(express.json());
  app.post('/api/checkout/initialize', initializePayment);
  app.get('/api/checkout/verify/:reference', (_request, response) => response.sendStatus(200));
  app.post('/api/payments/paystack/webhook', (_request, response) => response.sendStatus(200));
  return { app, initializePayment };
}

describe('temporary store closure', () => {
  it.each([undefined, 'false', 'TRUE', '1', ''])('blocks checkout when enabled flag is %s', async (value) => {
    vi.stubEnv('STORE_CHECKOUT_ENABLED', value);
    const { app, initializePayment } = createCheckoutApp();
    const response = await request(app).post('/api/checkout/initialize').send({});
    expect(response.status).toBe(503);
    expect(response.body.code).toBe('STORE_TEMPORARILY_CLOSED');
    expect(response.headers['cache-control']).toBe('no-store');
    expect(initializePayment).not.toHaveBeenCalled();
  });

  it('rejects closed checkout before parsing malformed request bodies', async () => {
    vi.stubEnv('STORE_CHECKOUT_ENABLED', 'false');
    const { app, initializePayment } = createCheckoutApp();
    const response = await request(app).post('/api/checkout/initialize')
      .set('Content-Type', 'application/json').send('{');
    expect(response.status).toBe(503);
    expect(initializePayment).not.toHaveBeenCalled();
  });

  it('allows checkout only when explicitly reopened', async () => {
    vi.stubEnv('STORE_CHECKOUT_ENABLED', 'true');
    const { app, initializePayment } = createCheckoutApp();
    expect((await request(app).post('/api/checkout/initialize').send({})).status).toBe(200);
    expect(initializePayment).toHaveBeenCalledOnce();
  });

  it('preserves verification and webhook routes while checkout is closed', async () => {
    vi.stubEnv('STORE_CHECKOUT_ENABLED', 'false');
    const { app } = createCheckoutApp();
    expect((await request(app).get('/api/checkout/verify/existing-order')).status).toBe(200);
    expect((await request(app).post('/api/payments/paystack/webhook').send({})).status).toBe(200);
  });
});
