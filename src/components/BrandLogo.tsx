import { cn } from '@/lib/utils';
import { brand } from '@/lib/brand';

export const THEWWORKS_LOGO_SRC = brand.logo;

interface BrandLogoProps {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  taglineClassName?: string;
  showText?: boolean;
  showTagline?: boolean;
  textTone?: 'light' | 'dark' | 'brand';
}

const textToneClassNames = {
  light: 'text-white',
  dark: 'text-[var(--brand-ink)]',
  brand: 'text-[var(--admin-burgundy)]',
};

const taglineToneClassNames = {
  light: 'text-white/68',
  dark: 'text-[var(--brand-muted)]',
  brand: 'text-[var(--admin-muted)]',
};

const BrandLogo = ({
  className,
  markClassName,
  textClassName,
  taglineClassName,
  showText = true,
  showTagline = false,
  textTone = 'dark',
}: BrandLogoProps) => (
  <span className={cn('inline-flex min-w-0 items-center gap-3', className)}>
    <span
      className={cn(
        'flex h-14 w-14 shrink-0 items-center justify-center overflow-visible',
        markClassName,
      )}
    >
      <img
        src={THEWWORKS_LOGO_SRC}
        alt={showText ? '' : `${brand.name} logo`}
        aria-hidden={showText ? 'true' : undefined}
        className="h-full w-full object-contain"
      />
    </span>
    {showText ? (
      <span className="min-w-0 leading-none">
        <span
          className={cn(
            'block text-sm font-bold tracking-[-0.03em]',
            textToneClassNames[textTone],
            textClassName,
          )}
        >
          {brand.name}
        </span>
        {showTagline ? (
          <span
            className={cn(
              'mt-1 block truncate text-[10px] font-semibold uppercase tracking-[0.2em]',
              taglineToneClassNames[textTone],
              taglineClassName,
            )}
          >
            Metalwork & Interiors
          </span>
        ) : null}
      </span>
    ) : null}
  </span>
);

export default BrandLogo;
