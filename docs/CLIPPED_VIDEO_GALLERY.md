# Clipped video previews

**Decision:** Adapt the supplied `ClippedMediaGallery` at `src/components/ui/clip-path-image.tsx`, using its three original normalized SVG clipping paths for the twelve Wills video posters. The heading and description are centered. The grid uses three columns on desktop, two at widths of 601-1024px and one on phones up to 600px. Preview buttons remain rectangular focus targets; only the poster is clipped.

**Alternatives:** Autoplaying all twelve videos inside the clipped frames, using the template's external stock media, or keeping the previous text-only clip picker.

**Rationale:** Preserve the supplied visual treatment and the company's optimized media while keeping video downloads on demand. Posters use native lazy loading and fixed aspect ratios with a short-screen height cap. Selecting any play button replaces that poster with a player inside the same card and frame. Only the selected video is mounted. Its native controls remain unclipped, with inline playback, sound enabled at 50% volume after selection and keyboard focus; closing restores the preview and focus. Hidden tabs pause the selected video. A failed clip shows an explicit retry action. SVG definitions have unique IDs so multiple instances cannot collide. Motion uses CSS hover transitions and respects reduced motion; no dependency is added.

**Revisit when:** The company supplies replacement footage, requests a different preview arrangement, or measured poster transfer warrants further resizing.

The existing gallery, three sticky center images, all 33 image references and caption/filter removal remain outside this component. Video files continue to use Railway on the Cloudflare build, where native range requests are supported; optimized posters stay on the same origin as the frontend.

## Validation and release

The browser checks cover responsive columns at 320/390/768/1440px, clipping paths, twelve accessible preview buttons, zero video requests before selection, playback of all twelve clips in their own frames, one selected player, keyboard focus, native controls, hidden-tab pausing, failed loading and retry. Playback checks verify the click starts each clip naturally, with sound enabled and volume set to 0.5.

Validated on 2026-10-05: lint, TypeScript, normal and Cloudflare production builds passed. All five focused browser tests passed in Edge, including the 33 mobile sticky cards, three sticky center images and existing navigation. Desktop and phone screenshots were inspected. All twelve optimized MP4 files contain audio tracks. The full suite passed all 114 tests using `npm run test:run -- --testTimeout=30000` after the build finished; the earlier concurrent run passed 113 tests and hit the default five-second timeout while reading 99 gallery image metadata records. No assertion was weakened and no test configuration was changed.

For each release, verify the exact pushed commit reaches success on both platforms, check Railway health, and repeat the live gallery/hero and twelve-clip playback checks before declaring the deployment complete.

Previous successful matching release for rollback:

- Git commit: `54673764fa0216287aa846a7dc5ce1c535a7f27b`.
- Railway deployment: `225bf035-51b8-4109-a507-4636180bd278`.
- Cloudflare deployment: `bc8510f1-2fec-4006-b18d-2e0830fc3b9a`.

Restore these deployments through the platform controls, or revert the video integration and rebuild/deploy the same reverted commit on both hosts. Verify Railway health, gallery stickiness, video selection and browser errors after rollback.
