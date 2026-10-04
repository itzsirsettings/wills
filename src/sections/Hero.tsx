import { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { heroConfig } from '../config';
import { mediaPath } from '../lib/brand';

const heroAssets = [
  { src: mediaPath('0067'), alt: 'Black entrance gate with gold decorative details', label: 'Metalwork and gates' },
  { src: '/media/wills/interiors/living-room.webp', alt: 'Living room interior design concept', label: 'Living room concept' },
  { src: mediaPath('0039'), alt: 'Black entrance door with a curved wood-tone panel and silver handle', label: 'Sculpted entrance door' },
  { src: '/media/wills/interiors/kitchen.webp', alt: 'Fitted kitchen interior design concept', label: 'Fitted kitchen concept' },
  { src: mediaPath('0044'), alt: 'Pair of wood-tone entrance doors with black metal frames', label: 'Double entrance doors' },
  { src: '/media/wills/interiors/bedroom.webp', alt: 'Bedroom interior design concept', label: 'Bedroom concept' },
  { src: mediaPath('0018'), alt: 'Polished gold-tone entrance door with decorative glazed lattice panel', label: 'Gold entrance door' },
];

export default function Hero() {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [previousBgIndex, setPreviousBgIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const respectPreference = () => { if (preference.matches) setIsPaused(true); };
    const visibilityChanged = () => setIsVisible(!document.hidden);
    respectPreference();
    preference.addEventListener('change', respectPreference);
    document.addEventListener('visibilitychange', visibilityChanged);
    return () => {
      preference.removeEventListener('change', respectPreference);
      document.removeEventListener('visibilitychange', visibilityChanged);
    };
  }, []);

  useEffect(() => {
    if (isPaused || isInteracting || !isVisible) return;
    const timer = window.setTimeout(() => {
      setPreviousBgIndex(currentBgIndex);
      setCurrentBgIndex((index) => (index + 1) % heroAssets.length);
    }, 10_000);
    return () => window.clearTimeout(timer);
  }, [currentBgIndex, isPaused, isInteracting, isVisible]);

  useEffect(() => {
    const nextImage = document.createElement('link');
    nextImage.rel = 'preload';
    nextImage.as = 'image';
    nextImage.type = 'image/avif';
    nextImage.href = heroAssets[(currentBgIndex + 1) % heroAssets.length].src.replace(/\.webp$/, '.avif');
    nextImage.fetchPriority = 'low';
    const timer = window.setTimeout(() => document.head.append(nextImage), 2000);
    return () => { window.clearTimeout(timer); nextImage.remove(); };
  }, [currentBgIndex]);

  if (!heroConfig.title) return null;
  return (
    <section id="hero" className="wills-hero" aria-label="Featured doors, metalwork and interiors" aria-roledescription="carousel" onFocus={() => setIsInteracting(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsInteracting(false); }}>
      <div className="hero-photo">
        <picture>
        <source srcSet={heroAssets[currentBgIndex].src.replace(/\.webp$/, '.avif')} type="image/avif" />
        <img key={heroAssets[currentBgIndex].src} className={previousBgIndex === null ? 'hero-current-image' : 'hero-current-image is-changing'} onAnimationEnd={() => setPreviousBgIndex(null)} src={heroAssets[currentBgIndex].src} alt={heroAssets[currentBgIndex].alt} fetchPriority="high" loading="eager" decoding="async" width="1440" height="1080" />
        </picture>
        {previousBgIndex !== null && <picture><source srcSet={heroAssets[previousBgIndex].src.replace(/\.webp$/, '.avif')} type="image/avif" /><img className="hero-previous-image" src={heroAssets[previousBgIndex].src} alt="" aria-hidden="true" decoding="async" width="1440" height="1080" /></picture>}
      </div>
      <div className="hero-shade" />
      <div className="wills-container hero-content">
        <h1>Strong entrances.<br /><em>Considered interiors.</em></h1>
        <p>Doors, gates and metalwork with presence.<br className="desktop-break" /> Interior projects shaped around the way you live.</p>
        <div className="hero-actions">
          <a className="wills-button button-primary" href={heroConfig.ctaPrimaryTarget}>{heroConfig.ctaPrimaryText}</a>
          <a className="hero-secondary" href={heroConfig.ctaSecondaryTarget}>{heroConfig.ctaSecondaryText}</a>
        </div>
      </div>
      <button type="button" className="hero-motion-toggle" onClick={() => setIsPaused((paused) => !paused)} aria-label={isPaused ? 'Play hero slideshow' : 'Pause hero slideshow'}>{isPaused ? <Play size={20} aria-hidden="true" /> : <Pause size={20} aria-hidden="true" />}</button>
    </section>
  );
}
