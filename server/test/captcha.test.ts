import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyCheckoutCaptcha, CaptchaValidationError } from '../lib/captcha.js';

describe('Captcha Verification (Turnstile)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    process.env.VITE_TURNSTILE_SITE_KEY = 'test-site-key';
    process.env.TURNSTILE_SECRET_KEY = 'test-secret-key';
    process.env.PUBLIC_SITE_URL = 'http://localhost:5173';
    process.env.NODE_ENV = 'production';
  });

  it('should succeed with valid token', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        hostname: 'localhost',
      }),
    } as Response);

    await expect(verifyCheckoutCaptcha('valid-token', '127.0.0.1')).resolves.not.toThrow();
  });

  it('should throw CaptchaValidationError with invalid token', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: false,
        'error-codes': ['invalid-input-response'],
      }),
    } as Response);

    await expect(verifyCheckoutCaptcha('invalid-token')).rejects.toThrow(CaptchaValidationError);
  });

  it('should throw error if Turnstile is unavailable', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
    } as Response);

    await expect(verifyCheckoutCaptcha('some-token')).rejects.toThrow('Captcha verification is unavailable right now.');
  });

  it('should throw CaptchaValidationError on hostname mismatch in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.PUBLIC_SITE_URL = 'https://thewworksict.com';
    
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        hostname: 'malicious-site.com',
      }),
    } as Response);

    await expect(verifyCheckoutCaptcha('token')).rejects.toThrow('Security check was issued for the wrong hostname.');
  });

  it('should skip hostname check when not in production', async () => {
    process.env.NODE_ENV = 'development';
    process.env.PUBLIC_SITE_URL = 'https://thewworksict.com';
    
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        hostname: 'localhost', // mismatch, but should be ignored
      }),
    } as Response);

    await expect(verifyCheckoutCaptcha('token')).resolves.not.toThrow();
  });

  it('should throw error if captcha is partially configured', async () => {
    process.env.TURNSTILE_SECRET_KEY = '';
    
    await expect(verifyCheckoutCaptcha('token')).rejects.toThrow('Turnstile is partially configured');
  });

  it('should reject production verification if captcha is not configured', async () => {
    process.env.VITE_TURNSTILE_SITE_KEY = '';
    process.env.TURNSTILE_SECRET_KEY = '';
    
    await expect(verifyCheckoutCaptcha('token')).rejects.toThrow('Turnstile is required');
  });
});
