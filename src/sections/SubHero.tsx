import { useEffect, useRef, useState } from 'react';

import { subHeroConfig } from '../config';

const useCountUp = (end: number, duration: number = 2000, start: boolean = false) => {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [start, end, duration]);

  return count;
};

interface SubHeroStatCardProps {
  isVisible: boolean;
  label: string;
  suffix: string;
  value: number;
}

const SubHeroStatCard = ({
  isVisible,
  label,
  suffix,
  value,
}: SubHeroStatCardProps) => {
  const count = useCountUp(value, 2000, isVisible);

  return (
    <div className="text-center">
      <span className="font-heading text-4xl md:text-5xl font-bold text-[var(--chevron-blue)]">
        {count}{suffix}
      </span>
      <span className="block text-sm text-[var(--chevron-muted)] mt-2">{label}</span>
    </div>
  );
};

const SubHero = () => {
  const shouldRenderNothing = !subHeroConfig.heading;

  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (shouldRenderNothing) return null;

  return (
    <section
      id="subhero"
      ref={sectionRef}
      className="relative py-20 md:py-28 lg:py-32 bg-white"
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content Side */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="inline-block mb-4 text-sm font-medium tracking-widest uppercase text-[var(--chevron-blue)]">
              {subHeroConfig.tag}
            </span>
            <h2 className="font-heading text-[1.3125rem] md:text-[1.575rem] lg:text-[2.1rem] text-black leading-tight mb-6">
              {subHeroConfig.heading}
            </h2>
            {subHeroConfig.bodyParagraphs.map((paragraph, index) => (
              <p key={index} className="text-[var(--chevron-muted)] text-lg leading-relaxed mb-5">
                {paragraph}
              </p>
            ))}
            {subHeroConfig.linkText && (
              <a
                href={subHeroConfig.linkTarget}
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector(subHeroConfig.linkTarget)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 text-[var(--chevron-blue)] font-medium hover:gap-3 transition-all duration-300"
              >
                {subHeroConfig.linkText}

              </a>
            )}
          </div>

          {/* Image Side - Clean Split Layout */}
          <div className="relative h-[400px] md:h-[500px]">
            {subHeroConfig.image1 && (
              <div
                className="absolute top-0 right-0 w-[85%] h-[70%] overflow-hidden"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateX(0)' : 'translateX(40px)',
                  transition: 'all 0.8s ease 0.3s',
                }}
              >
                <img
                  src={subHeroConfig.image1}
                  alt="Wills Group supplied door design"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {subHeroConfig.image2 && (
              <div
                className="absolute bottom-0 left-0 w-[60%] h-[50%] overflow-hidden shadow-xl"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateX(0)' : 'translateX(-40px)',
                  transition: 'all 0.8s ease 0.5s',
                }}
              >
                <img
                  src={subHeroConfig.image2}
                  alt="Print samples and finished products"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Stats Section - Chevron Style */}
        {subHeroConfig.stats.length > 0 && (
          <div ref={statsRef} className="mt-16 md:mt-24 pt-12 border-t border-[var(--chevron-border)]">
            <div
              className={`grid grid-cols-3 gap-8 md:gap-4 text-center transition-all duration-700 delay-300 ${
                statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {subHeroConfig.stats.map((stat, index) => (
                <SubHeroStatCard
                  key={`${stat.label}-${index}`}
                  isVisible={statsVisible}
                  label={stat.label}
                  suffix={stat.suffix}
                  value={stat.value}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SubHero;
