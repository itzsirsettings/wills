import { useEffect, useRef, useState } from 'react';
import { MapPin, Mail, Phone, Send } from 'lucide-react';
import { contactConfig } from '../config';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import {
  createTelHref,
  openMailto,
  splitPhoneNumbers,
} from '../lib/browser-actions';

const Contact = () => {
  const shouldRenderNothing = !contactConfig.heading;

  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const phoneNumbers = splitPhoneNumbers(contactConfig.phone);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const enquiry = {
      subject: `Wills Group of Company project enquiry from ${formData.name}`,
      body: [
        `Name: ${formData.name}`,
        `Email: ${formData.email}`,
        '',
        'Message:',
        formData.message,
      ].join('\n'),
    };
    if (contactConfig.email) {
      openMailto(contactConfig.email, enquiry);
    } else {
      window.open(buildWhatsAppUrl(`${enquiry.subject}\n${enquiry.body}`), '_blank', 'noopener,noreferrer');
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
    window.setTimeout(() => setIsSubmitted(false), 5000);
  };

  if (shouldRenderNothing) return null;

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-20 md:py-28 flex items-center"
    >
      {/* Background Image */}
      {contactConfig.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${contactConfig.backgroundImage})` }}
        />
      )}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-16">
          {/* Left Side - Info */}
          <div
            className={`lg:w-[45%] text-white transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="font-heading text-[1.575rem] md:text-[2.1rem] lg:text-[2.625rem] mb-6 leading-none">
              {contactConfig.heading}
            </h2>

            <p className="text-lg font-light leading-relaxed opacity-90 mb-10 max-w-md">
              {contactConfig.description}
            </p>

            {/* Contact Info */}
            <div className="space-y-6 mb-10">
              {contactConfig.location && (
                <div className="flex items-start gap-4">
                  <MapPin size={20} strokeWidth={1.5} className="mt-1 text-white/70" />
                  <div>
                    <span className="block text-xs uppercase tracking-wider opacity-60 mb-1">{contactConfig.locationLabel}</span>
                    <span className="font-light whitespace-pre-line">{contactConfig.location}</span>
                  </div>
                </div>
              )}

              {contactConfig.email && (
                <div className="flex items-start gap-4">
                  <Mail size={20} strokeWidth={1.5} className="mt-1 text-white/70" />
                  <div>
                    <span className="block text-xs uppercase tracking-wider opacity-60 mb-1">{contactConfig.emailLabel}</span>
                    <a href={`mailto:${contactConfig.email}`} className="font-light hover:text-white transition-colors">
                      {contactConfig.email}
                    </a>
                  </div>
                </div>
              )}

              {phoneNumbers.length > 0 && (
                <div className="flex items-start gap-4">
                  <Phone size={20} strokeWidth={1.5} className="mt-1 text-white/70" />
                  <div>
                    <span className="mb-1 block text-xs uppercase tracking-wider opacity-60">
                      {contactConfig.phoneLabel}
                    </span>
                    <div className="flex flex-col gap-1">
                      {phoneNumbers.map((phoneNumber) => (
                        <a
                          key={phoneNumber}
                          href={createTelHref(phoneNumber)}
                          className="font-light hover:text-white transition-colors"
                        >
                          {phoneNumber}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Form */}
          <div
            className={`lg:w-[45%] max-w-md w-full transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder={contactConfig.formFields.namePlaceholder}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-transparent border-b border-white/40 text-white placeholder-white/50 py-3 focus:outline-none focus:border-white transition-colors font-light text-base"
                />
              </div>

              <div>
                <input
                  type="email"
                  placeholder={contactConfig.formFields.emailPlaceholder}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full bg-transparent border-b border-white/40 text-white placeholder-white/50 py-3 focus:outline-none focus:border-white transition-colors font-light text-base"
                />
              </div>

              <div>
                <textarea
                  placeholder={contactConfig.formFields.messagePlaceholder}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={4}
                  className="w-full bg-transparent border-b border-white/40 text-white placeholder-white/50 py-3 focus:outline-none focus:border-white transition-colors font-light text-base resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black font-medium tracking-wide text-sm transition-all hover:bg-[var(--chevron-blue)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">{contactConfig.submittingText}</span>
                ) : isSubmitted ? (
                  <span>{contactConfig.submittedText}</span>
                ) : (
                  <>
                    <span>{contactConfig.submitText}</span>
                    <Send size={16} />
                  </>
                )}
              </button>
            </form>

            {isSubmitted && (
              <p className="mt-4 text-green-400 text-center font-light">
                {contactConfig.successMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
