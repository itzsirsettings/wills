# Wills hero, sticky navigation and gallery

## Presentation and controller

**Decision:** `PrismaHero` owns the hero typography, word entrances and actions. The existing `Hero` controller supplies typed React-node slots for the optimized backgrounds and accessible playback button, and forwards its focus handlers.

**Alternatives:** Replacing the slideshow controller with the supplied template's video or moving timers into the presentation component.

**Rationale:** Preserve the seven Wills images, ten-second interval, reduced-motion preference, hidden-tab pause, focus pause, AVIF/WebP delivery and delayed next-image preload. There is no hero video or additional navigation bar. The gallery action remains mounted while animation features load or fail.

The user's latest instruction removes the hero's secondary "Plan your project" link. The hero now has only "Explore the designs" linking to `#gallery`; contact links in navigation and the other sections retain their existing behavior.

**Revisit when:** The number of slides or playback requirements change.

The user's subsequent layout instructions override the reference's rounded frame: the hero now fills its section edge to edge, with no outer padding or rounded container. Content stacks below 1024px and uses a split layout above that width. Short screens can scroll through the expanded content.

The main overlay's black opacity changed from 65%/68%/88% to 47.5%/52%/82%. That admits 50% more image light at each gradient stop. A separate feathered scrim behind the copy preserves text contrast. This describes overlay transmission, not a claim that every image's perceived brightness rises by precisely 50%.

## Animation delivery

**Decision:** Use Motion's lightweight `m` components with a separately imported `domAnimation` feature bundle. Keep automatic Rollup chunk splitting for Motion.

**Alternatives:** A synchronous full Motion import, template video, or another animation dependency.

**Rationale:** Reuse the installed package and defer animation features. Render visible static content before loading and on failure. Reduced-motion visitors do not request the feature bundle. The 20px pull-up, 0.6-second duration and 0.08-second word stagger run once and do not restart when images change.

**Revisit when:** Measured loading cost warrants moving all hero animation code into a separate optional enhancement.

## Sticky content

**Decision:** Pin the company navbar as soon as scrolling starts. Keep the interiors copy in a sticky rail alongside the interior imagery on desktop; stack the copy and imagery on mobile.

**Alternatives:** Waiting until the services section passes, or pinning the entire interiors section permanently.

**Rationale:** Follow the latest requested timing and keep navigation and the interior enquiry action available. ResizeObserver measures the copy after fonts or viewport changes. Stickiness is enabled only when the copy fits; mobile also reserves at least 240px for viewing and operating designs. Short screens retain ordinary scrolling. Section motion targets children of the sticky panel rather than transforming its containing box.

**Revisit when:** Interior copy changes materially or design previews need a different reading layout.

## Entrance gallery

The supplied sticky-scroll gallery is adapted at `src/components/ui/sticky-scroll.tsx`: three columns with three pinned center designs on suitable desktop screens, and the existing native sticky stack of all 33 cards on mobile. The center previews have different heights, using 40%, 34% and 26% of the image space available beneath the navbar after reserving room for gaps. Minimum heights preserve usability on short screens; the measured stack returns to normal scrolling when it cannot fit. Gallery images use `object-fit: cover` to fill their frames; side columns and mobile previews retain their 4:5 portrait frames. The gallery heading and description are centered. Category filter buttons, their counts and visible card captions are removed, while all 33 designs, accessible image labels, responsive AVIF/WebP images, lightbox focus handling and on-demand video selection remain available. Visitors can enlarge each image to inspect the full design.

**Decision:** Use the reference's CSS sticky layout with native browser scrolling, without adding a global Lenis root, another main landmark, template stock images or a second footer.

**Alternatives:** Wrapping the whole app in the supplied Lenis root or copying its fixed stock-photo arrays.

**Rationale:** The requested gallery effect needs only CSS positioning. Keep the existing anchor, reduced-motion, touch and lightbox behavior and avoid another animation dependency. The user's latest instruction requests three center images with distinct heights, superseding the single large center card. ResizeObserver enables the center pin only when the full stack fits beneath the navbar. The optimized source dimensions remain unchanged.

**Revisit when:** The product explicitly requires scroll interpolation or synchronized canvas effects.

Gallery buttons inside each column use block layout. Inline button baseline spacing otherwise adds blank height below every image; that makes a viewport-sized center stack exceed its measured height budget and disables the sticky class. The browser regression checks verify the actual pinned position after multiple scroll distances at desktop and tablet sizes.

## Validation and loading comparison

Local validation on 2026-10-05:

- The latest hero action removal passed all 114 tests, lint, TypeScript and both normal and Cloudflare production builds. Five focused browser regressions passed: responsive and zoomed layouts, animation-feature failure, contrast and entrance behavior, the ten-second slideshow and gallery anchor, and absence of the removed hero link. Contact actions outside the hero retain their existing behavior.
- Lint, TypeScript, normal production build and the Cloudflare production build passed for the final gallery refinement.
- The preceding release passed 114 unit tests in 14 files. Command: `vitest run --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=60000`; extended runner timeouts accommodate this host's slow startup and media metadata checks.
- The preceding release passed 15 Edge/Playwright browser tests against the production preview, including 320/390/768/1440px widths, short landscape, 200% CSS zoom, focus targets, reduced motion, missing animation features, slideshow timing/wrap, sticky navigation/interiors, gallery proportions, lightboxes, video selection, policies and contact interactions.
- The gallery refinement passed four focused Edge/Playwright tests after the final layout fix: responsive side previews and on-demand videos; all 33 mobile sticky cards; three distinct center heights pinned after multiple scroll distances at 1440x900 and 1024x768; filter/caption removal, image fill, keyboard focus return and enlarged-view interactions; and existing navigation/interiors behavior. Short landscape screens preserve normal scrolling. The other 13 browser cases passed during the broader run before the final gallery spacing correction. No new dependencies or media files were added.
- The conservative hero text contrast bound over pure white imagery, including the brightest grain blend, passed the 4.5:1 check. No entrance movement or animation feature request occurs with reduced motion.

Three cold-cache runs per version used the same 390×844px profile, 1.6Mbps download, 150ms network latency and 4× CPU slowdown:

These loading measurements describe the preceding hero migration, before the clipped video integration and secondary-action removal. They are not measurements of the latest release.

| Measurement | Previous hero | Updated site |
| --- | ---: | ---: |
| Median LCP / FCP | 5,936ms | 5,476ms |
| Initial JavaScript transfer, including HTTP overhead | 122,397 bytes | 138,173 bytes |
| Deferred hero animation feature transfer | 0 bytes | 14,328 bytes |
| Median CLS | 0 | 0 |
| Hero images requested during initial capture, each run | 2 | 2 |
| Video requests during initial capture, each run | 0 | 0 |

Motion adds 15,776 bytes to the initial JavaScript transfer; its animation features remain a separate optional chunk. These synthetic runs have startup/TTFB variation and are not field Core Web Vitals or evidence of a statistically established speed improvement. Slow-device LCP remains above 2.5 seconds, so instant-loading performance is not claimed. Raw comparison evidence is retained locally in `work/prisma-performance-before.json`, `work/prisma-performance-after.json` and `work/prisma-performance-comparison.json`.

## Release and rollback

Release only to the independent `itzsirsettings/wills` repository. Railway uses that repository's main branch; Cloudflare Pages uses the matching committed frontend build. No API, database or backend configuration changes are required.

Previous successful releases, verified before this change:

- Git commit: `5f4ad08644b3775c9440ad6d607de422c6a14861`.
- Railway: `2b268879-61f7-45a5-a550-c21977fb3c78`.
- Cloudflare Pages: `eae9d7e8-b389-42c7-ae5c-618952bd4acc`.

Restore the preceding release through each platform's deployment controls if required. Verify the restored commit, Railway `/api/health`, hero actions, navigation, and browser errors. Alternatively, revert the frontend change, push it, and rebuild/upload the same reverted commit to Pages.
