import { useEffect, useRef, useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { faqConfig } from '../config';

const FAQ = () => {
  const shouldRenderNothing = !faqConfig.heading && faqConfig.faqs.length === 0;

  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const toggleFaq = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  if (shouldRenderNothing) return null;

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="py-20 md:py-28 bg-white"
    >
      <div className="max-w-[800px] mx-auto px-6">
        <div className="text-center mb-12">
          <span
            className={`inline-block mb-4 text-sm font-medium tracking-widest uppercase text-[var(--chevron-blue)] transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {faqConfig.tag}
          </span>
          <h2
            className={`font-heading text-[1.3125rem] md:text-[1.575rem] text-black transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '150ms' }}
          >
            {faqConfig.heading}
          </h2>
        </div>

        <div className="space-y-3">
          {faqConfig.faqs.map((faq, index) => (
            <div
              key={faq.id}
              className={`live-card border border-[var(--chevron-border)] transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${250 + index * 80}ms` }}
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--chevron-bg-alt)] transition-colors"
                aria-expanded={openId === faq.id}
              >
                <span className="font-heading text-lg pr-4">{faq.question}</span>
                {openId === faq.id ? (
                  <Minus size={20} className="text-[var(--chevron-blue)] flex-shrink-0" />
                ) : (
                  <Plus size={20} className="text-[var(--chevron-muted)] flex-shrink-0" />
                )}
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openId === faq.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="px-5 pb-5 text-[var(--chevron-muted)] leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        {faqConfig.ctaText && (
          <div
            className={`text-center mt-10 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            <a
              href={faqConfig.ctaTarget}
              onClick={(e) => {
                e.preventDefault();
                document.querySelector(faqConfig.ctaTarget)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 text-[var(--chevron-blue)] font-medium hover:gap-3 transition-all"
            >
              {faqConfig.ctaText}
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default FAQ;
