import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import DesignLightbox from './DesignLightbox';
import { galleryPreviewPath, projectImages, projectSrc, suppliedVideos } from '../lib/welding-media';
import { mediaDimensions } from '../lib/media-dimensions';

const mobileGalleryQuery = '(max-width: 760px), (max-width: 900px) and (pointer: coarse)';

export default function ProjectGallery() {
  const [category, setCategory] = useState('All');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const returnFocusRef = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [mobileStack, setMobileStack] = useState(() => matchMedia(mobileGalleryQuery).matches);
  useEffect(() => {
    const viewport = matchMedia(mobileGalleryQuery);
    const update = () => setMobileStack(viewport.matches);
    update();
    viewport.addEventListener('change', update);
    return () => viewport.removeEventListener('change', update);
  }, []);
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const filtered = projectImages.filter((image) => category === 'All' || image.category === category);
  const visible = mobileStack || expanded ? filtered : filtered.slice(0, 8);

  return (
    <section id="gallery" className="wills-section wills-gallery">
      <span id="products" className="anchor-alias" />
      <div className="wills-container">
        <div className="section-heading">
          <h2>Find your next<br /><em>entrance.</em></h2>
          <p>Explore the details, compare the designs, and bring a reference to your project discussion. Use a design reference to start a conversation about your space.</p>
        </div>
        <div className="gallery-filters" aria-label="Filter designs">
          {['All', 'Doors', 'Gates', 'Interiors', 'Grilles', 'Fabrication'].map((item) => (
            <button key={item} type="button" aria-pressed={category === item} onClick={() => { setCategory(item); setExpanded(false); }}>
              {item}
              <span>{item === 'All' ? projectImages.length : projectImages.filter((image) => image.category === item).length}</span>
            </button>
          ))}
        </div>
        <div className="project-grid">
          {visible.map((project) => (
            <button type="button" className="project-tile" key={project.number} onClick={(event) => { returnFocusRef.current = event.currentTarget; setSelectedIndex(filtered.indexOf(project)); }} aria-label={`View ${project.title} ${project.category}`}>
              <div className="project-image">
                <picture>
                  <source type="image/avif" srcSet={[360, 720, 1080].map(width => `${galleryPreviewPath(project, width, 'avif')} ${width}w`).join(', ')} sizes={mobileStack ? '(max-width: 760px) calc(100vw - 40px), calc(100vw - 64px)' : '(max-width: 1100px) 30vw, 430px'} />
                  <img src={galleryPreviewPath(project, 720)} srcSet={[360, 720, 1080].map(width => `${galleryPreviewPath(project, width)} ${width}w`).join(', ')} sizes={mobileStack ? '(max-width: 760px) calc(100vw - 40px), calc(100vw - 64px)' : '(max-width: 1100px) 30vw, 430px'} alt={project.alt} loading="lazy" decoding="async" width="720" height="900" />
                </picture>

              </div>
              <span className="project-caption"><strong>{project.title}</strong><span>{project.category}</span></span>
            </button>
          ))}
        </div>
        {!mobileStack && !expanded && filtered.length > visible.length && <button type="button" className="wills-button button-outline gallery-more" onClick={() => setExpanded(true)}>View all {filtered.length} designs </button>}
        <div className="video-library">
          <div>
            <h3>See the details in motion.</h3>
            <p>Explore twelve design videos. Choose a clip to view it.</p>
          </div>
          <div className="video-picker" aria-label="Choose a video">
            {suppliedVideos.map((src, index) => <button key={src} type="button" aria-pressed={activeVideo === index} onClick={() => setActiveVideo(index)}><Play size={14} aria-hidden="true" />Clip {String(index + 1).padStart(2, '0')}</button>)}
          </div>
          {activeVideo !== null && <video key={activeVideo} className="project-video" src={suppliedVideos[activeVideo]} poster={suppliedVideos[activeVideo].replace(/\.mp4$/, '.webp')} controls playsInline preload="metadata" aria-label={`Supplied metalwork video ${activeVideo + 1}`}>Your browser does not support video playback.</video>}
          {activeVideo !== null && <p className="video-note">Use the playback controls to pause, adjust volume or view the details full-screen.</p>}
        </div>
      </div>
      <DesignLightbox returnFocusRef={returnFocusRef} images={filtered.map((project) => ({ src: projectSrc(project), avif: projectSrc(project).replace(/\.webp$/, '.avif'), title: project.title, alt: project.alt, ...mediaDimensions[project.number] }))} selectedIndex={selectedIndex} onSelectedIndexChange={setSelectedIndex} description="Design reference. Confirm materials, dimensions and finishes in your project quote." />
    </section>
  );
}
