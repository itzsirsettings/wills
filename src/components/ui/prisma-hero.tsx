import { createContext, useContext, useEffect, useRef, useState, type ComponentPropsWithoutRef, type CSSProperties, type ReactNode } from 'react';
import { LazyMotion, useInView, useReducedMotion, type FeatureBundle } from 'motion/react';
import * as m from 'motion/react-m';
import { ArrowRight } from 'lucide-react';

const entranceEase = [0.16, 1, 0.3, 1] as const;
const EntranceContext = createContext({ ready: false, reduced: false, enabled: false });

interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  style?: CSSProperties;
}

interface Segment { text: string; className?: string }
interface WordsPullUpMultiStyleProps {
  segments: Segment[];
  className?: string;
  style?: CSSProperties;
}

export function WordsPullUp({ text, className = '', showAsterisk = false, style }: WordsPullUpProps) {
  return <WordsPullUpMultiStyle segments={[{ text }]} className={className} style={style} showAsterisk={showAsterisk} />;
}

export function WordsPullUpMultiStyle({ segments, className = '', style, showAsterisk = false }: WordsPullUpMultiStyleProps & { showAsterisk?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const { ready, reduced, enabled } = useContext(EntranceContext);
  const words = segments.flatMap(segment => segment.text.split(/\s+/).filter(Boolean).map(word => ({ word, className: segment.className })));
  return <span ref={ref} className={`prisma-words ${className}`} style={style}>
    {words.map(({ word, className: wordClass }, index) => {
      const content = <>{word}{index < words.length - 1 && ' '}{showAsterisk && index === words.length - 1 && <span className="prisma-asterisk" aria-hidden="true">*</span>}</>;
      const wordClasses = `prisma-word ${wordClass ?? ''}`;
      return enabled ? <m.span key={`${index}-${word}`} initial={false}
        animate={{ y: reduced || (ready && inView) ? 0 : 20 }}
        transition={{ duration: reduced ? 0 : .6, delay: reduced ? 0 : index * .08, ease: entranceEase }}
        className={wordClasses}>{content}</m.span>
        : <span key={`${index}-${word}`} className={wordClasses} style={{ transform: reduced ? 'none' : 'translateY(20px)' }}>{content}</span>;
    })}
  </span>;
}

interface HeroAction { label: string; href: string }

function HeroDescription({ children }: { children: string }) {
  const { ready, reduced, enabled } = useContext(EntranceContext);
  return enabled ? <m.p initial={false} animate={{ y: reduced || ready ? 0 : 20 }} transition={{ duration: reduced ? 0 : .6, delay: reduced ? 0 : .5, ease: entranceEase }}>{children}</m.p>
    : <p style={{ transform: reduced ? 'none' : 'translateY(20px)' }}>{children}</p>;
}
export interface PrismaHeroProps extends Omit<ComponentPropsWithoutRef<'section'>, 'children' | 'title'> {
  background: ReactNode;
  playbackControl: ReactNode;
  title: string;
  titleLabel: string;
  description: string;
  primaryAction: HeroAction;
  reduceMotion?: boolean;
}

export function PrismaHero({ background, playbackControl, title, titleLabel, description, primaryAction, reduceMotion = false, className = '', ...sectionProps }: PrismaHeroProps) {
  const preference = useReducedMotion();
  const reduced = reduceMotion || preference === true;
  const [ready, setReady] = useState(false);
  const [features, setFeatures] = useState<FeatureBundle>();
  useEffect(() => {
    if (reduced) return;
    let active = true;
    const frames: number[] = [];
    import('./prisma-motion-features').then(({ default: bundle }) => {
      if (!active) return;
      setFeatures(bundle);
      frames.push(requestAnimationFrame(() => {
        frames.push(requestAnimationFrame(() => { if (active) setReady(true); }));
      }));
    }).catch((error: unknown) => {
      if (active) console.warn('Hero animation unavailable; content remains visible.', error instanceof Error ? error.message : 'Animation feature loading failed.');
    });
    return () => { active = false; frames.forEach(cancelAnimationFrame); };
  }, [reduced]);
  const animatedCopy = (content: ReactNode) => <EntranceContext value={{ ready, reduced, enabled: Boolean(features) && !reduced }}>
    {features && !reduced ? <LazyMotion features={features} strict>{content}</LazyMotion> : content}
  </EntranceContext>;

  return <section {...sectionProps} className={`wills-hero prisma-hero ${className}`}>
    <div className="prisma-hero-frame">
      {background}
      <div className="hero-shade" aria-hidden="true" />
      <div className="prisma-grain" aria-hidden="true" />
      <div className="hero-content prisma-hero-content">
        <h1 aria-label={titleLabel}>{animatedCopy(<WordsPullUp text={title} showAsterisk />)}</h1>
        <div className="prisma-hero-details">
          {animatedCopy(<HeroDescription>{description}</HeroDescription>)}
          <div className="hero-actions prisma-hero-actions">
            <a className="wills-button prisma-primary-action" href={primaryAction.href}>{primaryAction.label}<span className="prisma-action-arrow" aria-hidden="true"><ArrowRight size={18} /></span></a>
          </div>
        </div>
      </div>
      {playbackControl}
    </div>
  </section>;
}
