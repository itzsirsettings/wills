import { forwardRef, useEffect, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';

export interface StickyScrollItem { id: string; content: ReactNode }
interface StickyScrollProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  items: StickyScrollItem[];
  stacked?: boolean;
}

function GalleryColumn({ items, sticky = false }: { items: StickyScrollItem[]; sticky?: boolean }) {
  const columnRef = useRef<HTMLDivElement>(null);
  const [fitsViewport, setFitsViewport] = useState(false);
  useEffect(() => {
    if (!sticky || !columnRef.current) return;
    const column = columnRef.current;
    const update = () => {
      const headerHeight = document.querySelector('.header-inner')?.getBoundingClientRect().height ?? 80;
      setFitsViewport(column.getBoundingClientRect().height <= innerHeight - headerHeight - 32);
    };
    update();
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update);
    observer?.observe(column);
    window.addEventListener('resize', update);
    return () => { observer?.disconnect(); window.removeEventListener('resize', update); };
  }, [sticky]);
  return <div ref={columnRef} className={`sticky-scroll-column${sticky ? ' sticky-scroll-center' : ''}${fitsViewport ? ' is-sticky' : ''}`}>
    {items.map(item => <div className="sticky-scroll-item" key={item.id}>{item.content}</div>)}
  </div>;
}

/** Wills adaptation of the supplied three-column, sticky-center gallery. */
const StickyScroll = forwardRef<HTMLDivElement, StickyScrollProps>(function StickyScroll({ items, stacked = false, className = '', ...props }, ref) {
  const flat = stacked || items.length < 7;
  if (flat) return <div {...props} ref={ref} className={`project-grid ${className}`}>{items.map(item => item.content)}</div>;

  const featured = items.slice(1, 4);
  const featuredIds = new Set(featured.map(item => item.id));
  const remaining = items.filter(item => !featuredIds.has(item.id));
  const left = remaining.filter((_, index) => index % 2 === 0);
  const right = remaining.filter((_, index) => index % 2 === 1);
  return <div {...props} ref={ref} className={`project-grid sticky-scroll-gallery ${className}`}>
    <GalleryColumn items={left} /><GalleryColumn items={featured} sticky /><GalleryColumn items={right} />
  </div>;
});

export default StickyScroll;
