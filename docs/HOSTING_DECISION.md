# Hosting decision for this repository

[Certain] Current code is a React/Vite SPA with an Express API, provider integrations and an existing Railway configuration. The approved rebrand retains this architecture and does not deploy or migrate the application.

| Concern | Cloudflare | Vercel |
| --- | --- | --- |
| Vite frontend | Pages supports static React/Vite builds using npm run build and dist. | Static frontend hosting is available; Express can also run as a Vercel Function. |
| Existing Express backend | Pages Functions use their own routing/runtime model. Preserving the existing Node backend requires a separately retained host or a reviewed runtime adaptation. | Official Express support makes Vercel the preferred candidate of these two for a future full-stack migration. Function limits still apply. |
| Images | Pre-generated responsive WebP and transparent PNG work as static assets. Pages has a per-asset size limit. | Pre-generated static assets do not require an image transformation integration. No runtime image optimization has been configured here. |
| Videos | Largest supplied MP4 is under 25 MiB, the currently documented Pages per-file limit. Transfer volume still needs planning. | Static video transfer must be evaluated against the actual plan and traffic. No transfer-cost estimate is available. |
| SSR/ISR | This SPA does not use SSR or ISR. Existing Express HTML metadata injection must be retained if the backend serves the app. | The SPA still does not use SSR/ISR. Express compatibility and SEO injection must be validated in a preview if migrated. |
| Forms/API | The current browser-only brief hands off to WhatsApp. Existing financial APIs must remain on a compatible backend. | Same enquiry model. Review execution, payload, persistence and provider behavior before moving the financial APIs. |
| Persistent data | Do not substitute runtime local storage for the existing database. | Do not assume function-local filesystem state persists. Existing database paths need review before migration. |
| Nigeria/foreign latency | Not verified. Measure actual previews from relevant locations. | Not verified. Measure actual previews from relevant locations. |
| Cost, bandwidth, WAF and bot protection | Not verified for a selected plan or unknown traffic level. | Not verified for a selected plan or unknown traffic level. |

**Decision:** Preserve Railway configuration for this rebrand. If selecting between Cloudflare and Vercel for a later full-stack move, evaluate Vercel first because the current API is Express. Cloudflare Pages is a reasonable candidate for the static frontend if the existing API remains on a separate compatible host.

**Alternatives:** Move the entire application immediately, or split the frontend from the API during a visual rebrand.

**Rationale:** Neither is necessary for media replacement. Payment, database, security and webhook compatibility must be established before changing their runtime.

**Revisit when:** A domain, expected traffic, hosting budget and migration scope are confirmed. A live preview must validate API behavior, headers, provider callbacks, persistence and rollback before production migration.

Official primary sources inspected on 2026-10-03:

- Vercel Express: https://vercel.com/docs/frameworks/backend/express
- Vercel Functions limits: https://vercel.com/docs/functions/limitations
- Cloudflare React/Vite guide: https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/
- Cloudflare Pages limits: https://developers.cloudflare.com/pages/platform/limits/
- Cloudflare Pages Functions routing: https://developers.cloudflare.com/pages/functions/routing/

No paid plan, latency target, cost estimate or deployment completion is claimed.
