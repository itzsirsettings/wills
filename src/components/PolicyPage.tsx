import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import SEO from './SEO';
import Footer from '../sections/Footer';
import { brand } from '../lib/brand';
import { openCookieSettings } from '../lib/cookie-consent';
import { policies, type PolicyKind } from '../lib/policies';

export default function PolicyPage({ kind }: { kind: PolicyKind }) {
  const policy = policies[kind];
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    heading.current?.focus({ preventScroll: true });
  }, [kind]);

  return (
    <div className="wills-site policy-site" lang="en">
      <SEO title={policy.title} description={policy.description} />
      <a href="#policy-content" className="skip-link">Skip to main content</a>
      <header className="wills-header">
        <div className="wills-container header-inner">
          <Link to="/" className="policy-back">← Back to home</Link>
          <Link to="/" className="header-home" aria-label={`${brand.name} home`}><BrandLogo showText={false} markClassName="header-logo" /></Link>
          <a href="/#contact" className="header-quote">Contact Wills</a>
        </div>
      </header>
      <main id="policy-content" className="wills-container policy-main">
        <div className="policy-intro">
          <h1 ref={heading} tabIndex={-1}>{policy.title}</h1>
          <p>{policy.description}</p>
          <p className="policy-date">Last updated <time dateTime="2026-10-04">4 October 2026</time></p>
        </div>
        <div className="policy-layout">
          <aside className="policy-sidebar">
            <nav aria-label="Policies and website information">
              {Object.entries(policies).map(([key, item]) => <Link key={key} to={item.path} aria-current={key === kind ? 'page' : undefined}>{item.title}</Link>)}
            </nav>
            <button type="button" className="wills-button button-outline" onClick={openCookieSettings}>Cookie settings</button>
          </aside>
          <article className="policy-article" aria-label={policy.title}>
            {policy.sections.map(([title, text]) => <section key={title}><h2>{title}</h2><p>{text}</p></section>)}
            <section className="policy-contact"><h2>Contact Wills</h2><p>For questions about this information or an enquiry you have shared, contact <a href="https://wa.me/2347057450799" target="_blank" rel="noopener noreferrer">Wills on WhatsApp +234 705 745 0799</a>{brand.email && <> or <a href={`mailto:${brand.email}`}>{brand.email}</a></>}.</p></section>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
