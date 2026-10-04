# Company logo delivery

**Decision:** Use the supplied Wills Group of Company logo for the default social preview, browser favicon, Apple home-screen icon, Windows tile, app manifest and organization structured data. The header and footer continue to use the supplied transparent logo. Division logos identify their respective divisions.

**Alternatives:** A project photograph in shared links, or one transparent image reused at every icon size.

**Rationale:** The company logo identifies the website consistently. A white background keeps its dark artwork visible on browser and operating-system surfaces. A 1200 × 630 JPEG fits large social previews; square PNGs have explicit matching dimensions. A separate maskable icon keeps all artwork inside the circular safe zone. Original artwork is preserved.

**Revisit when:** The company supplies updated artwork or a dedicated small-size logo.

Run `npm run brand:assets` to regenerate variants from `public/media/wills/wills-group-logo.png`. This uses the existing Sharp dependency. Browser and app assets are under `/media/wills/optimized/branding/`; `/favicon.ico` and a self-contained `/favicon.svg` provide conventional fallbacks. Both server-injected and client-side metadata use `company-logo-share.jpg`, including all policy pages. Production server metadata supplies absolute image URLs before JavaScript runs. Cloudflare policy HTML is generated with the same metadata.

Validate crawler-facing HTML, actual image responses and manifest icon dimensions after deployment. Existing messages, browser shortcuts and installed apps can retain previously cached icons or previews; changing metadata does not rewrite historical messages or shortcuts.

References: [Open Graph image properties](https://ogp.me/#structured), [Web app manifest icons](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/icons), [Apple web application icons](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html).
