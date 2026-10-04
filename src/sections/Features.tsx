import { useEffect, useRef, useState } from 'react';
import { Truck, ShieldCheck, Leaf, Heart } from 'lucide-react';
import { featuresConfig } from '../config';

const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  Truck,
  ShieldCheck,
  Leaf,
  Heart,
};

const Features = () => {
  const shouldRenderNothing = featuresConfig.features.length === 0;

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
      { threshold: 0.2 }
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
      className="py-16 md:py-20 bg-[var(--chevron-bg-alt)]"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
          {featuresConfig.features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon];
            return (
              <div
                key={feature.title}
                className={`p-8 lg:py-16 lg:px-10 transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: `${index * 120}ms`,
                  borderRight: index < 3 ? '1px solid var(--chevron-border)' : 'none'
                }}
              >
                {IconComponent && (
                  <IconComponent
                    size={32}
                    strokeWidth={1.5}
                    className="text-[var(--chevron-blue)] mb-5"
                  />
                )}
                <h3 className="font-heading text-[0.875rem] text-black mb-3">
                  {feature.title}
                </h3>
                <p className="text-[var(--chevron-muted)] text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
