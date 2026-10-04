import { Instagram, Facebook, Twitter } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import { footerConfig } from '../config';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import { openCookieSettings } from '../lib/cookie-consent';

const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  Instagram,
  Facebook,
  Twitter,
};

const Footer = () => {
  const { pathname } = useLocation();
  const shouldRenderNothing = !footerConfig.brandName;

  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const footerWordmark = footerConfig.brandName.split(' ')[0] || footerConfig.brandName;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();

    if (email) {
      window.open(buildWhatsAppUrl(`Hello Wills Group of Company, I would like to enquire about a project. My email is ${email}.`), '_blank', 'noopener,noreferrer');

      setIsSubscribed(true);
      setEmail('');
      window.setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const scrollToSection = (href: string) => {
    if (href === '#cookies') {
      openCookieSettings();
      return;
    }

    if (href === '#') return;
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  };

  if (shouldRenderNothing) return null;

  return (
    <footer className="bg-white pt-16 md:pt-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-[var(--chevron-border)]">
          {/* Brand Info */}
          <div className="lg:col-span-1">
            <BrandLogo
              className="mb-4"
              markClassName="h-12 w-[86px]"
              textClassName="text-2xl font-heading"
            />
            {footerConfig.brandTagline && (
              <p className="text-sm text-[var(--chevron-blue)] font-medium mb-3">
                {footerConfig.brandTagline}
              </p>
            )}
            <p className="text-[var(--chevron-muted)] text-sm leading-relaxed mb-6">
              {footerConfig.brandDescription}
            </p>
            {footerConfig.socialLinks.length > 0 ? (
              <div className="flex items-center gap-4">
                {footerConfig.socialLinks.map((social) => {
                  const IconComponent = iconMap[social.icon];
                  if (!IconComponent) return null;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      className="text-[var(--chevron-muted)] hover:text-black transition-colors"
                      aria-label={social.label}
                    >
                      <IconComponent size={20} strokeWidth={1.5} />
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* Link Groups */}
          {footerConfig.linkGroups.map((group) => (
            <div key={group.title}>
              <h4 className="font-heading text-[0.6125rem] font-semibold uppercase tracking-wider mb-5">{group.title}</h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href.startsWith('#') ? `/${link.href}` : link.href}
                      onClick={(e) => {
                        if (pathname === '/' && link.href.startsWith('#')) {
                          e.preventDefault();
                          scrollToSection(link.href);
                        }
                      }}
                      className="text-[var(--chevron-muted)] text-sm hover:text-black transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          {footerConfig.newsletterButtonText && (
            <div className="lg:col-span-1">
              {footerConfig.newsletterHeading && <h4 className="font-heading text-[0.6125rem] font-semibold uppercase tracking-wider mb-3">{footerConfig.newsletterHeading}</h4>}
              {footerConfig.newsletterDescription && <p className="text-[var(--chevron-muted)] text-sm mb-4">
                {footerConfig.newsletterDescription}
              </p>}
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                <div className="relative">
                  <input
                    type="email"
                    aria-label="Your email for the WhatsApp enquiry"
                    placeholder={footerConfig.newsletterPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-[var(--chevron-border)] text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-[var(--chevron-blue)] text-white text-sm font-medium transition-all hover:opacity-90"
                >
                  {isSubscribed ? (
                    <span>{footerConfig.newsletterSuccessText}</span>
                  ) : (
                    <>
                      <span>{footerConfig.newsletterButtonText}</span>

                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[var(--chevron-muted)] font-medium">
              {footerConfig.copyrightText}
            </p>
            <nav aria-label="Legal and privacy information" className="footer-policy-links">
              {footerConfig.legalLinks.map((link) => (
                link.href.startsWith('/') ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="text-xs text-[var(--chevron-muted)] hover:text-black transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => {
                      if (link.href === '#cookies') {
                        e.preventDefault();
                        scrollToSection(link.href);
                      }
                    }}
                    className="text-xs text-[var(--chevron-muted)] hover:text-black transition-colors"
                  >
                    {link.label}
                  </a>
                )
              ))}
              <button type="button" onClick={openCookieSettings} className="text-xs text-[var(--chevron-muted)] hover:text-black transition-colors">Cookie settings</button>
            </nav>
          </div>
        </div>

        {/* Wordmark */}
        <div className="footer-wordmark-crop">
          <p className="footer-wordmark font-heading tracking-tighter text-[var(--chevron-subtle)]">
            {footerWordmark}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
