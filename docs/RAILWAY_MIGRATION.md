# Railway migration

The owner confirmed no orders, no existing database and no Supabase project. There
is no customer-data transfer. The active site uses Railway hosting, and runtime
Supabase dependencies, clients and environment keys have been removed.

## Current deployment

Project: wills. Live address: https://wills-production-beec.up.railway.app. The proposed domain willsinteriors.com has not been purchased by the owner. The site is informational and stores no
project briefs in an application database. Browser memory, downloaded files and
WhatsApp/email handoff remain unchanged. No database, bucket or Redis is required
while commerce is disabled. Keep LEGACY_COMMERCE_ENABLED=false and
STORE_CHECKOUT_ENABLED=false. Both flags require an explicit true to enable.

Build: npm run build. Start: npm run start. Runtime: Node 24. Railway PORT is honored.
Set NODE_ENV=production, PUBLIC_SITE_URL=https://wills-production-beec.up.railway.app and
VITE_PUBLIC_SITE_URL=https://wills-production-beec.up.railway.app. Health check: /api/health.

TRUST_PROXY defaults to false. Set only verified ingress IPs/CIDRs after confirming
the last proxy overwrites forwarded headers. ENFORCE_HTTPS requires this topology
to avoid redirect loops behind TLS termination. HSTS subdomains/preload require
verified coverage before their flags are enabled. Do not invent origin allowlists.

## Retained commerce code

Existing admin, checkout and webhook paths remain present but return 503 while
commerce is disabled. The PostgreSQL adapter uses DATABASE_URL. Production startup
does not create schema or import historical local stores. Provision a Railway
PostgreSQL service only when commerce is approved. Use separate MIGRATION_DATABASE_URL
credentials with npm run db:migrate, then restricted app credentials for DATABASE_URL.
For public database access use certificate verification and DATABASE_CA_CERT when
needed. DATABASE_SSL_MODE=disable is restricted to Railway private hostnames in
production and requires verified private network protection.

Admin access requires an explicitly configured OIDC issuer, audience and HTTPS
JWKS endpoint, an allowlist of immutable ADMIN_SUBJECTS, and a verified MFA claim.
There is no public account registration or password store. Do not enable admin
access until the identity provider and session lifecycle are verified.

Product uploads use a private Railway S3-compatible bucket configured with
AWS_ENDPOINT_URL, AWS_S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY and
AWS_DEFAULT_REGION. Credentials are server-side only. Supported images are decoded,
bounded, rewritten to WebP and stripped of metadata. Only those product-image
objects can be delivered through /api/media/products/:id; the bucket is not public.

GET /api/checkout/verify/:reference reads status only. POST to that same path performs
reconciliation and requires the existing CSRF and receipt authorization controls.
Payment claims lock the order row inside a transaction before validation and mutation.
Turnstile, live Paystack configuration and shared Redis limits are mandatory before
production checkout can reopen.

## Rollback

Keep commerce closed. Redeploy the previous successful immutable Railway deployment
for a frontend rollback. Do not roll back to the former provider configuration.
No production data was moved or deleted. Future schema migrations require a tested
backup/restore procedure before release. Legacy SQL is archived in legacy-database
for provenance and is never applied by the current migration command.

References: https://docs.railway.com/databases/postgresql,
https://docs.railway.com/storage-buckets, https://node-postgres.com/features/ssl,
https://github.com/panva/jose.
