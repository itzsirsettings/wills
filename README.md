# Wills Group of Company

The Wills website presents doors, gates, custom metalwork and interiors. Project enquiries can be downloaded or prepared for WhatsApp; online commerce and payments remain disabled.

## Repository and hosting

- GitHub: https://github.com/itzsirsettings/wills, production branch `main`.
- Railway: https://wills-production-beec.up.railway.app, Express runtime and public videos.
- Cloudflare Pages: https://wills-group.pages.dev, frontend, images and optimized videos.
- `willsinteriors.com` has not been purchased and is not an active production domain.

This repository begins with an independent Wills initial commit. The previous repository and its history are preserved separately. Retained legacy source and historical documents do not enable commerce or define current public business details.

## Development

Use Node.js 24 and npm. Run `npm ci`, then `npm run dev`. Run `npm run build` for the Railway artifact and `npm run start` for the production server. The server exposes `/api/health`.

Checks: `npm run lint`, `npm run test:run`, `npm run build` and `npm run test:e2e:rebrand`. Install Playwright Chromium for browser checks. The existing script name is retained for tooling compatibility.

## Production configuration

Set `NODE_ENV=production`, `PUBLIC_SITE_URL` and `VITE_PUBLIC_SITE_URL` to the verified Railway URL. Keep `LEGACY_COMMERCE_ENABLED=false` and `STORE_CHECKOUT_ENABLED=false`. Secrets belong in provider configuration, never source control. Workshop address and email must be explicitly configured before they appear publicly.

Railway follows this repository's `main` branch using `railway.json`. Cloudflare uses Direct Upload: `npm run build:cloudflare` prepares `work/cloudflare-build`; publish that artifact to the `wills-group` project on branch `main`. A push alone does not publish the Cloudflare mirror. Verify the exact deployment reaches success, all policy routes load, and videos play. Images are served locally on each host. The Cloudflare mirror requests the optimized videos from Railway for byte-range playback compatibility.

## Implementation and operations

- [Responsive interactions](docs/RESPONSIVE_INTERACTIONS.md)
- [Performance and Cloudflare delivery](docs/PERFORMANCE_AND_CLOUDFLARE.md)
- [Independent repository decision](docs/REPOSITORY_DECISION.md)
- [Railway configuration](docs/RAILWAY_MIGRATION.md)
- [Security remediation](docs/SECURITY_REMEDIATION.md)

Rollback by redeploying a previously verified Railway or Cloudflare artifact. Preserve supplied media and any existing legacy financial records; public website changes do not migrate or delete them.
