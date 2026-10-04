import { useEffect, type RefObject } from 'react';

/** Load scroll animation only when a visitor reaches the service content. */
export function useSiteMotion(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const element = root.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false;
    let observer: IntersectionObserver | undefined;
    let engine: Promise<typeof import('gsap')> | undefined;
    const contexts: gsap.Context[] = [];
    const stop = () => {
      observer?.disconnect();
      contexts.forEach(context => context.revert());
      contexts.length = 0;
    };
    const start = () => {
      stop();
      if (preference.matches || disposed) return;
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer?.unobserve(entry.target);
          engine ??= import('gsap');
          engine.then(({ gsap }) => {
            if (disposed || preference.matches || entry.target.getBoundingClientRect().bottom < 0) return;
            contexts.push(gsap.context(() => {
              gsap.fromTo(entry.target,
                { y: 18, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out', clearProps: 'transform,opacity' });
            }, element));
          }).catch((error: unknown) => console.warn('Section animation unavailable; content remains visible.', error));
        }
      }, { threshold: 0.12 });
      element.querySelectorAll('#subhero h2, #subhero p, #subhero .grid, #services .section-heading, .service-list article, .interiors-copy, .interior-concepts .section-heading, .project-grid, .process-grid article, .finishes-grid, .considerations-grid article, .faq-grid, .wills-contact-card').forEach(target => observer?.observe(target));
    };
    start();
    preference.addEventListener('change', start);
    return () => { disposed = true; stop(); preference.removeEventListener('change', start); };
  }, [root]);
}
