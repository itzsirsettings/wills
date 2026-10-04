import { useEffect, useRef, useState } from 'react';
import { Menu, X, MessageCircle, Check, DoorOpen, Fence, PanelsTopLeft, Grid2X2, Wrench, Hammer } from 'lucide-react';
import BrandLogo from './BrandLogo';
import SEO from './SEO';
import Hero from '../sections/Hero';
import Footer from '../sections/Footer';
import { HeroWithGreeting } from './ui/hero-with-greeting';
import { HoverSliderDemo } from './ui/animated-slideshow-demo';
import { CtaCard } from './ui/cta-card';
import LeafletMap from './ui/leaflet-map';
import ProjectGallery from './ProjectGallery';
import ProjectBrief from './ProjectBrief';
import InteriorConcepts from './InteriorConcepts';
import { brand, mediaPath } from '../lib/brand';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import { faqConfig } from '../config';
import { useSiteMotion } from '../lib/use-site-motion';

const services = [
  { icon: DoorOpen, title: 'Doors', detail: 'Statement entrances, decorative panels and door design enquiries.', spec: 'Opening dimensions · fittings · finish' },
  { icon: Fence, title: 'Gates', detail: 'From clean modern lines to intricate ornamental entrance designs.', spec: 'Access · opening style · design' },
  { icon: PanelsTopLeft, title: 'Interiors', detail: 'Room and interior project enquiries shaped around your space, style and priorities.', spec: 'Room plan · materials · detailing' },
  { icon: Grid2X2, title: 'Grilles & railings', detail: 'Metal details for windows, boundaries, stairs and other parts of your property.', spec: 'Site dimensions · use · specification' },
  { icon: Hammer, title: 'Fabrication', detail: 'Discuss structural and custom metalwork with a drawing or project brief.', spec: 'Drawing · material · fabrication scope' },
  { icon: Wrench, title: 'Custom work & repairs', detail: 'Bring an existing piece, a reference or a repair requirement for assessment.', spec: 'Condition · intended use · feasibility' },
];
const steps = [
  ['01', 'Discuss', 'Share your project, location, reference design and intended use.'],
  ['02', 'Measure & design', 'Confirm dimensions, drawings, materials, fittings and the proposed finish.'],
  ['03', 'Agree & fabricate', 'Agree on the written quote, scope and schedule before production.'],
  ['04', 'Deliver & install', 'Confirm packing, transport, site access and any installation requirements.'],
];
const finishes = ['Material specification', 'Metal thickness', 'Color & surface finish', 'Fittings & hardware', 'Weather exposure', 'Maintenance requirements'];
const nav = [['Services', '#services'], ['Interiors', '#interiors'], ['Gallery', '#gallery'], ['Process', '#process'], ['Contact', '#contact']];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('#hero');
  const [headerPinned, setHeaderPinned] = useState(false);
  const siteRef = useRef<HTMLDivElement>(null);
  useSiteMotion(siteRef);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const offset = document.querySelector('.header-inner')?.getBoundingClientRect().height ?? 80;
      let current = '#hero';
      for (const [, href] of nav) {
        const section = document.querySelector(href);
        if (section && section.getBoundingClientRect().top <= offset + window.innerHeight * .25) current = href;
      }
      setActiveSection(current);
      setHeaderPinned((document.getElementById('services')?.getBoundingClientRect().bottom ?? Infinity) <= 0);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const resize = () => { if (window.innerWidth > 900) setMenuOpen(false); schedule(); };
    if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', resize); };
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); }
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [menuOpen]);
  const projectWhatsAppUrl = buildWhatsAppUrl('Hello Wills Group of Company, I am viewing your website and would like to discuss a metalwork or interiors project.');
  return (
    <div ref={siteRef} className="wills-site" lang="en">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="landing-header-slot"><header className={`wills-header landing-header${headerPinned ? ' is-pinned' : ''}`}>
        <div className="wills-container header-inner">
          <nav className="desktop-nav" aria-label="Main navigation">{nav.map(([label, href]) => <a key={href} href={href} aria-current={activeSection === href ? 'location' : undefined}>{label}</a>)}</nav>
          <button ref={menuButton} type="button" className="menu-toggle" aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
          <a className="header-home" href="#hero" aria-label="Wills Group of Company home"><BrandLogo showText={false} markClassName="header-logo" /></a>
          <a href="#contact" className="header-quote">Start a project</a>
        </div>
        {menuOpen && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">{nav.map(([label, href]) => <a key={href} href={href} aria-current={activeSection === href ? 'location' : undefined} onClick={() => setMenuOpen(false)}>{label}</a>)}</nav>}
      </header></div>
      <SEO title="Doors, Gates, Metalwork & Interiors" description={brand.description} keywords="Wills Group of Company, doors, gates, metal fabrication, interiors, window grilles" noIndex={!brand.siteUrl} />
      <main id="main-content">
        <Hero />
        <section className="division-brands" aria-label="Wills Group divisions">
          <div className="wills-container">
            <div className="division-logos">
              <a href="#interiors" aria-label="Explore Wills Interior"><img src="/media/wills/logos/wills-interior.webp" alt="Wills Interior logo" width="640" height="640" loading="lazy" decoding="async" /></a>
              <a href="#gallery" aria-label="Explore Wills Foreign Doors"><img src="/media/wills/logos/wills-foreign-doors.webp" alt="Wills Foreign Doors logo" width="640" height="640" loading="lazy" decoding="async" /></a>
              <a href="#services" aria-label="Explore Wills Metal Works"><img src="/media/wills/logos/wills-metal-works.webp" alt="Wills Metal Works logo" width="640" height="640" loading="lazy" decoding="async" /></a>
            </div>
            <p>Doors, interiors and metalwork. One Wills Group.</p>
          </div>
        </section>
        <div className="offerings-strip" aria-label="Core offerings"><span>Doors & gates</span><span>Metalwork & fabrication</span><span>Interiors</span><a href="#contact">Made to your brief</a></div>
        <div id="about" className="about-wrapper">
          <HeroWithGreeting
            title={<>Crafted for the outside.<br /><span className="wills-emphasis">Considered for the inside.</span></>}
            subtitle="Wills Group of Company brings doors, gates, metalwork and interiors into one project conversation. Explore a design, share your space, and agree on the details that make it yours."
            stats={[]}
            images={['0039', '0064', '0023', '0046', '0018', '0054'].map((number) => mediaPath(number, true))}
            imageAlts={['Black entrance door with a curved warm-tone panel', 'Black entrance gate with gold detailing', 'Decorative metal window grille', 'Geometric black and silver metal door', 'Polished gold-tone decorative door', 'Structural steel framework beside a building']}
          />
        </div>
        <section id="services" className="wills-section service-section">
          <div className="wills-container">
            <div className="section-heading"><h2>One vision.<br /><em>Every detail.</em></h2><p>Choose your starting point. We use your brief to discuss the right design direction, project scope and specification.</p></div>
            <div className="service-list">{services.map((service) => {
              const Icon = service.icon;
              return <article key={service.title}><Icon size={29} strokeWidth={1.3} aria-hidden="true" /><div><h3>{service.title}</h3><p>{service.detail}</p><span>{service.spec}</span></div><a href="#contact" className="wills-button button-outline service-enquiry" aria-label={`Enquire about ${service.title}`}>Enquire</a></article>;
            })}</div>
          </div>
        </section>
        <section id="interiors" className="interiors-section">
          <span id="beds" className="anchor-alias" />
          <div className="interiors-image"><img src="/media/wills/interiors/living-room.webp" alt="Living room design concept with ivory seating and walnut wall panelling" loading="lazy" decoding="async" width="1440" height="810" /></div>
          <div className="interiors-copy"><h2>The space beyond<br /><em>the entrance.</em></h2><p>Interiors are a core part of Wills Group of Company. Bring your room plan, inspiration and the way you want the space to feel.</p><p>From living rooms and kitchens to fitted storage, explore a direction and discuss materials, layout and finishing details with us.</p><a className="wills-button button-primary" href="#contact">Discuss an interior project</a></div>
          <InteriorConcepts />
        </section>
        <HoverSliderDemo />
        <ProjectGallery />
        <section id="process" className="wills-section process-section"><div className="wills-container">
          <div className="section-heading"><h2>From an idea<br /><em>to an agreed plan.</em></h2><p>Good work starts with a clear brief. Agree on the important decisions before a project moves into production or installation.</p></div>
          <div className="process-grid">{steps.map(([number, title, detail]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{detail}</p></article>)}</div>
        </div></section>
        <section id="finishes" className="wills-section finishes-section"><div className="wills-container finishes-grid">
          <div><h2>Details that define<br /><em>the finished piece.</em></h2><p>Material, surface, proportion and hardware all shape the result. These are specification decisions, confirmed with your individual quote.</p><div className="finish-list">{finishes.map((finish) => <span key={finish}><Check size={16} aria-hidden="true" />{finish}</span>)}</div></div>
          <img src={mediaPath('0040')} alt="Metal entrance door with carefully arranged horizontal accent panels" loading="lazy" decoding="async" width="640" height="800" />
        </div></section>
        <section id="blog" className="wills-section considerations-section"><div className="wills-container"><h2>Plan with the full picture.</h2><div className="considerations-grid">
          {[['Your opening', 'Bring dimensions and photographs. Confirm clearances and access requirements.'], ['Your environment', 'Discuss exposure, finish options and a suitable maintenance plan.'], ['Your interior', 'Share the room layout, inspiration, priorities and the scope you want quoted.']].map(([title, detail]) => <article key={title}><h3>{title}</h3><p>{detail}</p></article>)}
        </div></div></section>
        <section id="shipping" className="wills-section shipping-section"><div className="wills-container section-heading"><h2>A local project.<br /><em>Or a distant destination.</em></h2><div><p>For a Nigerian project, include your town and any site or installation requirements. For an international enquiry, include your country, postcode and delivery expectations.</p><p>Transport, packing, availability, lead time and responsibility for customs or installation must be agreed in the quote.</p><a href="#contact" className="text-link">Prepare a delivery enquiry</a></div></div></section>
        <section id="faq" className="wills-section faq-section"><div className="wills-container faq-grid"><h2>Before you<br /><em>commission.</em></h2><div>{faqConfig.faqs.map((faq) => <details key={faq.id}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div></div></section>
        <section id="contact" className="wills-section contact-section"><div className="wills-container">
          <CtaCard title="Wills Group of Company" subtitle={<>Let’s shape<br />your next project.</>} description="A door, a gate, a room or a custom piece. Start with your idea and we will discuss the details." buttonText="Prepare a project brief" onButtonClick={() => document.getElementById('project-brief')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })} secondaryButtonText="Chat on WhatsApp" secondaryButtonHref={projectWhatsAppUrl} imageSrc={mediaPath('0038')} imageAlt="Black entrance door with vertical warm-tone panels and gold trim" className="wills-contact-card" />
          <ProjectBrief />
          <div className="contact-details"><a href={projectWhatsAppUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={20} />WhatsApp +234 705 745 0799</a>{brand.email && <a href={`mailto:${brand.email}`}>{brand.email}</a>}{brand.address && <p>{brand.address}</p>}</div>
        </div></section>
      </main>
      <LeafletMap />
      <Footer />
      <a href={projectWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="floating-whatsapp" aria-label="Chat with Wills Group of Company on WhatsApp"><MessageCircle size={25} /></a>
    </div>
  );
}
