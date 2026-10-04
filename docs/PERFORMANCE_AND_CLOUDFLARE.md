# Loading and Cloudflare delivery

**Decision:** Render the homepage from the initial application bundle; keep policy content lazy. The homepage is the main entry point, and a second JavaScript discovery round trip delayed its first render. Revisit if other application routes become the main product.

**Decision:** Use deferred GSAP reveals and native CSS slideshow transitions instead of loading a second animation engine for the homepage. Leaflet and its stylesheet now load together only for a configured workshop map. Typography uses WOFF2 compression with the original glyphs and outlines; `python scripts/optimize-fonts.py` regenerates these assets with fonttools and brotli. Revisit if new animation or map functionality requires different dependencies.

Railway caches fingerprinted `/assets` files for one year with `immutable`; HTML remains revalidated. Unversioned media retain shorter browser caching so content can be updated.

Hero images have AVIF variants with WebP fallbacks. The first AVIF is preloaded; the next image is requested at low priority after a two-second delay, avoiding immediate competition with the first render. `npx tsx scripts/optimize-hero-assets.ts` regenerates variants from the existing WebP references.

Run `npm run build:cloudflare` to prepare `work/cloudflare-build`, then `wrangler pages deploy work/cloudflare-build --project-name wills-group --branch main`. The artifact includes standalone policy HTML, hash-authorized structured data, security headers and immutable hashed asset caching. The informational site uses browser-only project briefs; commerce remains disabled. Railway remains the canonical origin and API host. No custom domain is assumed to be owned.

**Decision:** Cloudflare serves the frontend and images; the twelve videos stream from Railway using the public `VITE_VIDEO_ORIGIN` build setting (default: the verified Railway host). Pages builds exclude duplicate MP4 assets and allow that HTTPS media origin in CSP. This keeps all videos available while avoiding the large uploads that stalled this connection. Railway builds retain local video paths. Alternative: duplicate the videos on Pages or use a dedicated object-storage/CDN origin. Revisit if measured playback latency or traffic warrants migrating video delivery. Both Railway and Cloudflare are dependencies for video playback on the mirror.

Only the supplied public MP4 responses permit cross-origin embedding through Cross-Origin-Resource-Policy. API, account and other response security controls remain in place.

The Pages project uses Direct Upload. Uploads from this connection encountered resets/timeouts with the CLI's default concurrent 40 MiB batches. Windows native HTTPS requests to the Pages asset and deployment APIs completed the release, using sequential 4 MiB batches and credentials held only in memory. The installed CLI and repository runtime were not modified. Successful upload and HTTP/browser verification are required for every release. Rollback uses the previous verified Railway deployment or Cloudflare Pages production deployment.

Performance budgets: no map or second animation engine in initial requests, no video requests before selecting a clip, first image prioritized, lazy responsive gallery images, no horizontal overflow, reduced-motion content visible, and target cold-mobile LCP below 2.5 seconds. Synthetic measurements use a 390 × 844 viewport, cold cache, 1.6 Mbps download, 150 ms added latency and 4× CPU slowdown. Connection variability means measurements from this machine are diagnostic, not a guarantee for every visitor.
