import { useEffect, useRef, useState } from 'react';
import { aboutConfig } from '../config';

interface AboutSectionProps {
  id: string;
  image: string;
  contentBg: string;
  textColor: string;
  reverse?: boolean;
  children: React.ReactNode;
}

const AboutSection = ({ id, image, contentBg, textColor, reverse, children }: AboutSectionProps) => {
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

  return (
    <div
      ref={sectionRef}
      id={id}
      className={`min-h-[70vh] lg:min-h-[80vh] flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}
    >
      {/* Image Side */}
      <div
        className="w-full lg:w-3/5 h-[40vh] lg:h-auto min-h-[300px] bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />

      {/* Content Side */}
      <div
        className="w-full lg:w-2/5 flex items-center justify-center p-10 md:p-14 lg:p-16"
        style={{ backgroundColor: contentBg, color: textColor }}
      >
        <div
          className={`max-w-md transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const About = () => {
  if (aboutConfig.sections.length === 0) return null;

  return (
    <section id="about" className="relative">
      {aboutConfig.sections.map((section, index) => (
        <AboutSection
          key={index}
          id={`about-${index}`}
          image={section.image}
          contentBg={section.backgroundColor}
          textColor={section.textColor}
          reverse={index % 2 !== 0}
        >
          <span className="inline-block mb-4 text-sm font-medium tracking-widest uppercase opacity-70">
            {section.tag}
          </span>
          <h2 className="font-heading text-[1.3125rem] md:text-[1.575rem] leading-tight mb-6">
            {section.heading}
          </h2>
          {section.quote ? (
            <>
              <p className="text-lg font-light leading-relaxed opacity-90 mb-6">
                "{section.quote}"
              </p>
              {section.attribution && (
                <p className="text-sm font-medium opacity-70">
                  — {section.attribution}
                </p>
              )}
            </>
          ) : (
            (section.paragraphs || []).map((paragraph, pIndex) => (
              <p key={pIndex} className="text-base font-light leading-relaxed opacity-90 mb-5">
                {paragraph}
              </p>
            ))
          )}
        </AboutSection>
      ))}
    </section>
  );
};

export default About;
