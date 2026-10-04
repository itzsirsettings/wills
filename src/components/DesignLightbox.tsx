import { useRef, type RefObject } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';

export interface DesignImage { src: string; title: string; alt: string; width: number; height: number }
interface Props { images: DesignImage[]; selectedIndex: number | null; onSelectedIndexChange: (index: number | null) => void; description: string; returnFocusRef: RefObject<HTMLButtonElement | null> }

export default function DesignLightbox({ images, selectedIndex, onSelectedIndexChange, description, returnFocusRef }: Props) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const selected = selectedIndex === null ? null : images[selectedIndex];
  const move = (direction: number) => {
    if (selectedIndex !== null && images.length > 1) onSelectedIndexChange((selectedIndex + direction + images.length) % images.length);
  };
  return <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) onSelectedIndexChange(null); }}>
    <DialogContent className="project-dialog" onCloseAutoFocus={(event) => {
      if (returnFocusRef.current) { event.preventDefault(); returnFocusRef.current.focus(); }
    }} onKeyDown={(event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
      }
    }}>
      <DialogTitle>{selected?.title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
      {selected && <div className="lightbox-photo" onTouchStart={(event) => {
        if (event.touches.length === 1) touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        else touchStart.current = null;
      }} onTouchEnd={(event) => {
        if (!touchStart.current || !event.changedTouches.length) return;
        const dx = event.changedTouches[0].clientX - touchStart.current.x;
        const dy = event.changedTouches[0].clientY - touchStart.current.y;
        touchStart.current = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) move(dx < 0 ? 1 : -1);
      }}>
        <img src={selected.src} alt={selected.alt} width={selected.width} height={selected.height} className="lightbox-image" />
      </div>}
      <div className="lightbox-controls">
        <button type="button" onClick={() => move(-1)} disabled={images.length < 2} aria-label="Previous design">Previous</button>
        <span aria-live="polite">{selectedIndex === null ? 0 : selectedIndex + 1} of {images.length}</span>
        <button type="button" onClick={() => move(1)} disabled={images.length < 2} aria-label="Next design">Next</button>
      </div>
    </DialogContent>
  </Dialog>;
}
