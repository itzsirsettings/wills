import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { videoSectionConfig } from '../config';

const VideoSection = () => {
  const shouldRenderNothing = !videoSectionConfig.heading;

  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (shouldRenderNothing) return null;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[70vh] flex flex-col lg:flex-row"
    >
      {/* Image/Video Side */}
      <div className="relative w-full lg:w-1/2 h-[45vh] lg:h-auto min-h-[350px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${videoSectionConfig.backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-black/30" />

        {/* Play Button */}
        <button
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
          aria-label="Play video"
        >
          <Play size={24} className="text-black ml-1" fill="currentColor" />
        </button>
      </div>

      {/* Content Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-10 md:p-14 lg:p-20 bg-[var(--chevron-bg-alt)]">
        <div className="max-w-lg">
          <span
            className={`inline-block mb-4 text-sm font-medium tracking-widest uppercase text-[var(--chevron-blue)] transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {videoSectionConfig.tag}
          </span>

          <h2
            className={`font-heading text-[1.3125rem] md:text-[1.575rem] text-black leading-tight mb-6 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '150ms' }}
          >
            {videoSectionConfig.heading}
          </h2>

          {videoSectionConfig.bodyParagraphs.map((paragraph, index) => (
            <p
              key={index}
              className={`text-[var(--chevron-muted)] text-lg leading-relaxed mb-5 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              {paragraph}
            </p>
          ))}

          {videoSectionConfig.ctaText && (
            <a
              href={videoSectionConfig.ctaTarget}
              onClick={(e) => {
                e.preventDefault();
                document.querySelector(videoSectionConfig.ctaTarget)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-2 text-[var(--chevron-blue)] font-medium mt-6 hover:gap-3 transition-all ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '500ms' }}
            >
              {videoSectionConfig.ctaText}

            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
