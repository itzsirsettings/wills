import { useEffect, useRef, useState } from 'react';
import DesignLightbox from './DesignLightbox';
import { galleryPreviewPath, projectImages, projectSrc, suppliedVideos } from '../lib/welding-media';
import { mediaDimensions } from '../lib/media-dimensions';
import StickyScroll from './ui/sticky-scroll';
import ClippedMediaGallery, { type ClippedMediaItem, type ClipShape } from './ui/clip-path-image';

const mobileGalleryQuery = '(max-width: 760px), (max-width: 900px) and (pointer: coarse)';
const clipShapes: ClipShape[] = ['clip-squiggle', 'clip-rect', 'clip-another'];
const videoPreviews: Extract<ClippedMediaItem, { type: 'video' }>[] = suppliedVideos.map((src, index) => ({
  id: src, src, type: 'video', alt: `Clip ${String(index + 1).padStart(2, '0')}`,
  clipId: clipShapes[index % clipShapes.length],
  poster: src.replace(/^https?:\/\/[^/]+/, '').replace(/\.mp4$/, '.webp'),
}));

export default function ProjectGallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const returnFocusRef = useRef<HTMLButtonElement>(null);
  const [mobileStack, setMobileStack] = useState(() => matchMedia(mobileGalleryQuery).matches);
  useEffect(() => {
    const viewport = matchMedia(mobileGalleryQuery);
    const update = () => setMobileStack(viewport.matches);
    update();
    viewport.addEventListener('change', update);
    return () => viewport.removeEventListener('change', update);
  }, []);

  return (
    <section id="gallery" className="wills-section wills-gallery">
      <span id="products" className="anchor-alias" />
      <div className="wills-container">
        <div className="section-heading sticky-gallery-intro">
          <h2>Find your next<br /><em>entrance.</em></h2>
          <p>Explore the details, compare the designs, and bring a reference to your project discussion. Use a design reference to start a conversation about your space.</p>
        </div>
        <StickyScroll stacked={mobileStack} items={projectImages.map((project, index) => ({ id: project.number, content: (
            <button type="button" className="project-tile" key={project.number} onClick={(event) => { returnFocusRef.current = event.currentTarget; setSelectedIndex(index); }} aria-label={`View ${project.title} ${project.category}`}>
              <div className="project-image">
                <picture>
                  <source type="image/avif" srcSet={[360, 720, 1080].map(width => `${galleryPreviewPath(project, width, 'avif')} ${width}w`).join(', ')} sizes={mobileStack ? '(max-width: 760px) calc(100vw - 40px), calc(100vw - 64px)' : '(max-width: 1100px) 30vw, 430px'} />
                  <img src={galleryPreviewPath(project, 720)} srcSet={[360, 720, 1080].map(width => `${galleryPreviewPath(project, width)} ${width}w`).join(', ')} sizes={mobileStack ? '(max-width: 760px) calc(100vw - 40px), calc(100vw - 64px)' : '(max-width: 1100px) 30vw, 430px'} alt={project.alt} loading="lazy" decoding="async" width="720" height="900" />
                </picture>

              </div>
            </button>
          ) }))} />
        <div className="video-library">
          <div className="video-library-heading">
            <h3>See the details in motion.</h3>
            <p>Explore twelve design videos. Choose a clip to view it.</p>
          </div>
          <ClippedMediaGallery mediaItems={videoPreviews} aria-label="Choose a video" />
        </div>
      </div>
      <DesignLightbox returnFocusRef={returnFocusRef} images={projectImages.map((project) => ({ src: projectSrc(project), avif: projectSrc(project).replace(/\.webp$/, '.avif'), title: project.title, alt: project.alt, ...mediaDimensions[project.number] }))} selectedIndex={selectedIndex} onSelectedIndexChange={setSelectedIndex} description="Design reference. Confirm materials, dimensions and finishes in your project quote." />
    </section>
  );
}
