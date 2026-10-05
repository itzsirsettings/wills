# Wills hero, sticky navigation and gallery

## Presentation and controller

**Decision:** `PrismaHero` owns the hero typography, word entrances and actions. The existing `Hero` controller supplies typed React-node slots for the optimized backgrounds and accessible playback button, and forwards its focus handlers.

**Alternatives:** Replacing the slideshow controller with the supplied template's video or moving timers into the presentation component.

**Rationale:** Preserve the seven Wills images, ten-second interval, reduced-motion preference, hidden-tab pause, focus pause, AVIF/WebP delivery and delayed next-image preload. There is no hero video or additional navigation bar. Buttons remain mounted while animation features load or fail.

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

The supplied sticky-scroll gallery is adapted at `src/components/ui/sticky-scroll.tsx`: three columns with one large pinned center design on suitable desktop screens, and the existing native sticky stack of all 33 cards on mobile. Following the user's height correction, previews retain their professional 4:5 portrait frames instead of being shortened to fit three center images at once. The gallery heading and description are centered. All category filters, counts, responsive AVIF/WebP images, lightbox focus handling and on-demand video selection remain in `ProjectGallery`. All filtered designs are now available directly on desktop as well. Short landscape screens use normal scrolling.

**Decision:** Use the reference's CSS sticky layout with native browser scrolling, without adding a global Lenis root, another main landmark, template stock images or a second footer.

**Alternatives:** Wrapping the whole app in the supplied Lenis root or copying its fixed stock-photo arrays.

**Rationale:** The requested gallery effect needs only CSS positioning. Keep the existing anchor, reduced-motion, touch and lightbox behavior and avoid another animation dependency. Every preview uses the same portrait proportions. ResizeObserver enables the center pin only when the full card fits beneath the navbar. The optimized source dimensions remain unchanged.

**Revisit when:** The product explicitly requires scroll interpolation or synchronized canvas effects.

## Validation and loading comparison

Local validation on 2026-10-05:

- Lint, TypeScript and normal production build passed.
- 114 unit tests passed in 14 files. Command: `vitest run --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=60000`; extended runner timeouts accommodate this host's slow startup and media metadata checks.
- 15 Edge/Playwright browser tests passed against the production preview, including 320/390/768/1440px widths, short landscape, 200% CSS zoom, focus targets, reduced motion, missing animation features, slideshow timing/wrap, sticky navigation/interiors, gallery proportions and filters, lightboxes, video selection, policies and contact interactions.
- The conservative hero text contrast bound over pure white imagery, including the brightest grain blend, passed the 4.5:1 check. No entrance movement or animation feature request occurs with reduced motion.

Three cold-cache runs per version used the same 390×844px profile, 1.6Mbps download, 150ms network latency and 4× CPU slowdown:

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

- Git commit: `51583a209bebe06b880a72981c2ac11abf2d8bd8`.
- Railway: `13024698-d4ab-4561-a4dc-4b0eaa579d8b`.
- Cloudflare Pages: `7efb6ea7-ebf5-424f-812d-dfcb5db1821b`.

Restore the preceding release through each platform's deployment controls if required. Verify the restored commit, Railway `/api/health`, hero actions, navigation, and browser errors. Alternatively, revert the frontend change, push it, and rebuild/upload the same reverted commit to Pages.
