# Security Documentation

Current active scope and evidence: [security remediation](docs/SECURITY_REMEDIATION.md).
Report issues privately through https://willsinteriors.com/#security or the published
Wills business WhatsApp contact. Do not include credentials or other people's data.
The remaining provider-specific notes below are historical, not current controls.

## Overview
This document outlines the security measures implemented in the ThewworksICT e-commerce application and provides guidelines for maintaining a secure deployment.

---

## Security Features Implemented

### 1. Authentication & Authorization
- **Supabase Authentication**: Using JWT tokens for secure admin access
- **Role-based access control**: Admin-only endpoints require trusted `app_metadata.role=admin` or an approved server-side email allowlist
- **Token validation**: All API requests validated server-side
- **Metadata hardening**: User-editable `user_metadata` is never trusted for authorization decisions

### 2. Data Protection
- **AES-256-GCM Encryption**: Customer PII (name, email, phone, address) encrypted at rest
- **Secure Key Derivation**: HKDF with salt for deriving encryption keys from secrets
- **Timing-safe comparison**: Constant-time comparison to prevent timing attacks

### 3. API Security
- **Helmet.js**: Comprehensive security headers
- **Rate Limiting**: Configurable rate limits per endpoint
- **CSRF Protection**: Token-based CSRF validation for state-changing operations
- **Signed double-submit tokens**: Browser mutations fetch `/api/security/csrf-token` and echo the signed token in `X-XSRF-TOKEN`; Paystack webhooks are exempt from CSRF and protected by Paystack signatures
- **Input Validation**: Zod schema validation on all inputs
- **Request Size Limits**: Configurable max body size (default: 5MB)

### 4. Payment Security
- **Paystack Webhook Verification**: Signature validation for payment webhooks
- **Receipt Token Validation**: Secure order lookup using hashed tokens
- **Currency Validation**: Prevent payment amount manipulation

### 5. Infrastructure Security
- **CORS**: Whitelist-based origin validation
- **HSTS**: HTTP Strict Transport Security (1 year max-age in production)
- **Content Security Policy**: Prevent XSS and injection attacks
- **Cache Control**: Prevent sensitive data caching

---

## Environment Variables

### Required Secrets
| Variable | Description | Generate |
|----------|------------|---------|
| `PAYSTACK_SECRET_KEY` | Paystack API key | Dashboard |
| `ORDER_STORE_ENCRYPTION_KEY` | Database encryption | `openssl rand -base64 32` |
| `ORDER_TOKEN_SECRET` | Token signing | `openssl rand -base64 32` |
| `CSRF_SECRET` | CSRF protection | `openssl rand -hex 32` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin | Dashboard |

### Optional but Recommended
| Variable | Description |
|----------|------------|
| `REDIS_URL` | Redis for rate limiting |
| `TURNSTILE_SITE_KEY` | Cloudflare Turnstile |
| `SECURITY_ALERT_WEBHOOK_URL` | Security alert Discord/Slack webhook |
| `CORS_ALLOWED_ORIGINS` | Additional comma-separated browser origins beyond `PUBLIC_SITE_URL` |

---

## Deployment Security Checklist

### Pre-Deployment
- [ ] All secrets replaced with production values in `.env`
- [ ] `NODE_ENV=production` set
- [ ] `PUBLIC_SITE_URL` set to production domain
- [ ] `CORS_ALLOWED_ORIGINS` limited to trusted production origins only
- [ ] Database SSL enabled (`DATABASE_SSL_MODE=require`)
- [ ] CSRF_SECRET minimum 32 characters
- [ ] `PAYSTACK_SECRET_KEY` is a live `sk_live_...` key in production
- [ ] Paystack webhook URL configured as `/api/payments/paystack/webhook`; Paystack signs webhook requests with the live secret key in `x-paystack-signature`
- [ ] `npm run security:env:check:production` passes against the production environment
- [ ] Redis configured for rate limiting (production)
- [ ] SSL/TLS certificate configured on load balancer

### Infrastructure Security
- [ ] WAF enabled (Cloudflare, AWS WAF, etc.)
- [ ] DDoS protection enabled
- [ ] Database in private subnet
- [ ] API only accessible via load balancer
- [ ] Backups configured
- [ ] Logging and monitoring active

### Monitoring
- [ ] Security alerting configured
- [ ] Error logging active
- [ ] Performance monitoring
- [ ] Uptime monitoring

---

## Security Headers

The application sets the following security headers:

| Header | Value | Purpose |
|--------|-------|--------|
| `Strict-Transport-Security` | max-age=31536000; includeSubDomains; preload | HSTS |
| `Content-Security-Policy` | Restrictive CSP | XSS Prevention |
| `X-Content-Type-Options` | nosniff | MIME sniffing |
| `X-Frame-Options` | DENY | Clickjacking |
| `X-XSS-Protection` | 1; mode=block | Legacy XSS |
| `Referrer-Policy` | no-referrer | Privacy |
| `Permissions-Policy` | camera=(), microphone=(), geolocation=() | Features |
| `Expect-CT` | max-age=31536000, enforce | Certificate Transparency |

---

## Common Threats Mitigated

### 1. SQL Injection
- **Mitigation**: Parameterized queries via pg library
- **Status**: ✅ Protected

### 2. XSS (Cross-Site Scripting)
- **Mitigation**: Content Security Policy, input sanitization
- **Status**: ✅ Protected

### 3. CSRF (Cross-Site Request Forgery)
- **Mitigation**: CSRF token validation
- **Status**: ✅ Protected

### 4. Clickjacking
- **Mitigation**: X-Frame-Options: DENY
- **Status**: ✅ Protected

### 5. Man-in-the-Middle
- **Mitigation**: HSTS, TLS 1.2+
- **Status**: ✅ Protected

### 6. DDoS
- **Mitigation**: Rate limiting, WAF
- **Status**: ✅ Protected (with Redis/WAF)

### 7. Payment Fraud
- **Mitigation**: Paystack signature verification, receipt tokens
- **Status**: ✅ Protected

### 8. Data Breaches
- **Mitigation**: AES-256-GCM encryption for PII
- **Status**: ✅ Protected

---

## Reporting Security Issues

If you discover a security vulnerability, please report it to: stankingshomevalue@gmail.com

We appreciate responsible disclosure and will work to address issues promptly.

---

## Dependencies

Regular security audits are recommended:
```bash
npm run security:audit
```

Update dependencies regularly:
```bash
npm update
npm run security:audit:fix
```

---

## License

This security documentation is part of the ThewworksICT e-commerce application.
