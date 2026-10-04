> Historical pre-rebrand document retained for preservation. The active public website is Wills Group of Company (doors, gates, metalwork and interiors). Former business details are not current. See docs/REBRAND_DECISIONS.md for current scope and configuration.

# Deployment Guide

Current deployment instructions: [Railway migration](RAILWAY_MIGRATION.md).
The active runtime is Railway-only and does not use the historical provider setup
below. Commerce is disabled by default and no customer data was transferred.

## Temporary store closure

The project package name is `wills`. New checkout requests are closed by default.
Keep `STORE_CHECKOUT_ENABLED=false` (or unset) in the server environment and deploy
the updated server to enforce the closure. Only the exact value `true` reopens
checkout. Reopening requires approval of the payment security remediation.

Closed checkout returns HTTP 503 with `STORE_TEMPORARILY_CLOSED` before body parsing,
order creation or payment initialization. Existing payment verification and webhook
routes remain available to reconcile previously started transactions. This does not
cancel checkout sessions already issued by the payment provider or disable separate
payment links configured outside this application.

This guide covers deploying Thewworks to production.

## Prerequisites

1. **Supabase Project**: Created at https://supabase.com
2. **Paystack Account**: For payment processing
3. **Railway Account**: Used for the full-stack public deployment

## Step 1: Database Setup

### 1.1 Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Note your project URL and anon key

### 1.2 Run Migrations

Run the SQL migrations in your Supabase SQL Editor:

```sql
-- Run 20260412_initial_schema.sql
-- Run 20260412_seed_data.sql
-- Run 20260425_product_storage_hardening.sql
-- Run 20260428_security_hardening.sql
-- Run 20260430_restore_is_admin_rpc.sql
```

### 1.3 Configure Storage

1. Go to Storage in Supabase dashboard
2. Create a bucket named `products`
3. Add the policy from `20260425_product_storage_hardening.sql`

## Step 2: Environment Variables

### Required Variables

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional legacy direct Postgres access
DATABASE_URL=postgresql://user:pass@host:5432/database
DATABASE_SSL_MODE=require

# Paystack
PAYSTACK_SECRET_KEY=sk_live_xxx
PAYSTACK_PUBLIC_KEY=pk_live_xxx

# Server
SERVER_PORT=3001
NODE_ENV=production
PUBLIC_SITE_URL=https://thewworksict.com
CORS_ALLOWED_ORIGINS=https://thewworksict.com

# Security
CSRF_SECRET=use-openssl-rand-hex-32
ORDER_TOKEN_SECRET=use-openssl-rand-base64-32
ORDER_STORE_ENCRYPTION_KEY=use-openssl-rand-base64-32
```

Generate fresh production secrets with:

```bash
npm run security:keys
```

### Optional Variables

```env
# Admin
ADMIN_EMAILS=admin@example.com

# Logging
LOG_LEVEL=info
```

## Step 3: Build

```bash
npm run lint
npm run test:run
npm run security:audit
npm run security:env:check:production
npm run security:supabase:check
npm run build
```

This creates:
- `dist/` - Frontend build
- `server-dist/` - Backend build

## Step 4: Railway Deployment

This repository is configured for Railway through `railway.json`:

- Build command: `npm run build`
- Start command: `npm run start`
- Healthcheck path: `/api/health`

Railway config reference: https://docs.railway.com/reference/config-as-code

1. Install Railway CLI:

   ```bash
   npm i -g @railway/cli
   ```

2. Login and link the project:

   ```bash
   railway login
   railway init
   ```

3. Set production variables in Railway:

   ```bash
   railway variable set NODE_ENV=production
   railway variable set PUBLIC_SITE_URL=https://thewworksict.com
   railway variable set CORS_ALLOWED_ORIGINS=https://thewworksict.com
   railway variable set VITE_SUPABASE_URL=https://your-project.supabase.co
   railway variable set VITE_SUPABASE_ANON_KEY=your-anon-key
   railway variable set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   railway variable set PAYSTACK_SECRET_KEY=sk_live_xxx
   railway variable set PAYSTACK_PUBLIC_KEY=pk_live_xxx
   railway variable set ADMIN_EMAILS=admin@example.com
   ```

4. Generate and set fresh production secrets:

   ```bash
   npm run security:keys
   railway variable set CSRF_SECRET=...
   railway variable set ORDER_TOKEN_SECRET=...
   railway variable set ORDER_STORE_ENCRYPTION_KEY=...
   ```

5. Deploy:

   ```bash
   railway up
   ```

6. Attach custom domains in Railway:
   - `thewworksict.com`
   - `www.thewworksict.com`

7. Add the Railway-provided DNS records at the domain registrar. The app redirects `www.thewworksict.com` to `https://thewworksict.com`.
8. Confirm the domain is registered and publicly reachable:

   ```bash
   npm run seo:dns:check
   ```

### Traditional Server Fallback

If Railway is unavailable, deploy the same artifact on a Node server:

   ```bash
   npm run build
   npm run start
   ```

Use PM2 or another process manager:

   ```bash
   pm2 start server-dist/index.js --name thewworks
   ```

## Step 5: Post-Deployment

### 5.1 Update Supabase Settings

1. Go to Supabase Dashboard → Settings → API
2. Update `site_url` to your production URL

### 5.2 Configure Paystack

1. Go to Paystack Dashboard → Settings → API & Webhooks
2. Add `https://thewworksict.com/api/payments/paystack/webhook` to webhook settings
3. Confirm `PUBLIC_SITE_URL` points to the same production origin used for checkout callbacks
4. Keep `PAYSTACK_SECRET_KEY` set to the live secret key. Paystack signs webhook payloads with this secret key via the `x-paystack-signature` header.

### 5.3 Verify Setup

1. Test `/api/health` endpoint
2. Test checkout flow
3. Test admin login
4. Verify email notifications work
5. Run `npm run security:supabase:check` to confirm admin metadata and the `public.is_admin` RPC exist on the connected Supabase project
6. Verify public SEO endpoints:
   ```bash
   curl -I https://thewworksict.com/
   curl -I https://thewworksict.com/store
   curl https://thewworksict.com/robots.txt
   curl https://thewworksict.com/sitemap.xml
   ```

## Production Checklist

- [ ] HTTPS enabled
- [ ] Railway custom domains attached for apex and `www`
- [ ] Registrar DNS records match Railway's domain instructions
- [ ] Environment variables set
- [ ] `NODE_ENV=production`, `PUBLIC_SITE_URL`, and `CORS_ALLOWED_ORIGINS` are production-only values
- [ ] If `DATABASE_URL` is set for legacy direct Postgres access, it resolves and uses SSL
- [ ] Database migrations run
- [ ] Storage bucket configured
- [ ] Webhooks set up with Paystack
- [ ] `npm run security:env:check:production` passes against the production environment
- [ ] `npm run security:supabase:check` passes against the connected Supabase project
- [ ] ADMIN_EMAILS configured
- [ ] Admin roles use Supabase `app_metadata`, not user-editable `user_metadata`
- [ ] `npm run lint`, `npm run test:run`, and `npm run build` pass
- [ ] `curl -I https://thewworksict.com/` returns `200`
- [ ] `curl -I https://www.thewworksict.com/` returns a `301` to `https://thewworksict.com/`
- [ ] `https://thewworksict.com/sitemap.xml` is reachable
- [ ] Error monitoring set up
- [ ] Logging configured

## Troubleshooting

### Frontend Not Loading

1. Check `dist/` directory exists
2. Verify build completed successfully
3. Check environment variables

### API Errors

1. Check Supabase connection
2. Verify environment variables
3. Check server logs

### Payment Issues

1. Verify Paystack keys are correct
2. Check webhook is configured
3. Check callback URL in Paystack dashboard

### 404 on Routes

Ensure your server is configured to serve `index.html` for all routes:
```typescript
app.get(/^(?!\/api).*/, async (_request, response) => {
  response.sendFile(path.join(distDirectory, 'index.html'));
});
```

## Rollback

To rollback to a previous version:

Use the Railway dashboard deployment history to redeploy the previous known-good deployment.
