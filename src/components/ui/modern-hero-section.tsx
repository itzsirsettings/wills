import React from 'react';
import { cn } from '@/lib/utils';

interface HeroCollageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  heroTitle: React.ReactNode;
  title?: React.ReactNode;
  subtitle: string;
  stats: { value: string; label: string }[];
  images: string[];
}

const animationStyle = `
  @keyframes float-up {
    0% { transform: translateY(0px); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
    50% { transform: translateY(-15px); box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3); }
    100% { transform: translateY(0px); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
  }
  .animate-float-up {
    animation: float-up 6s ease-in-out infinite;
  }
`;

const HeroCollage = React.forwardRef<HTMLDivElement, HeroCollageProps>(
  ({ className, heroTitle, title, subtitle, stats, images, ...props }, ref) => {
    const displayImages = images.slice(0, 7);

    return (
      <>
        <style>{animationStyle}</style>
        <section
          ref={ref}
          className={cn(
            'relative w-full bg-white font-sans py-20 sm:py-28 lg:py-32 overflow-hidden',
            className
          )}
          {...props}
        >
          <div className="container relative z-10 mx-auto px-4 text-center">
            <h1 className="font-heading text-[1.575rem] md:text-[2.1rem] lg:text-[2.625rem] tracking-tight text-black">
              {title || heroTitle}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg text-[var(--chevron-muted)]">
              {subtitle}
            </p>
          </div>

          <div className="relative z-0 mt-16 h-[500px] sm:h-[560px] lg:h-[630px] flex items-center justify-center">
            <div className="relative h-full w-full max-w-6xl">
              {/* Center - Main image */}
              {displayImages[0] && (
                <img
                  src={displayImages[0]}
                  alt="Main feature"
                  className="absolute left-1/2 top-1/2 h-[240px] sm:h-[300px] lg:h-[340px] w-auto -translate-x-1/2 -translate-y-1/2 rounded-xl shadow-2xl z-20 animate-float-up object-cover"
                  style={{ animationDelay: '0s' }}
                />
              )}
              {/* Top-Left */}
              {displayImages[1] && (
                <img
                  src={displayImages[1]}
                  alt="Feature 2"
                  className="absolute left-[5%] sm:left-[8%] top-[8%] h-[140px] sm:h-[180px] lg:h-[200px] w-auto rounded-xl shadow-lg z-10 animate-float-up object-cover"
                  style={{ animationDelay: '-1.2s' }}
                />
              )}
              {/* Top-Right */}
              {displayImages[2] && (
                <img
                  src={displayImages[2]}
                  alt="Feature 3"
                  className="absolute right-[5%] sm:right-[8%] top-[8%] h-[140px] sm:h-[180px] lg:h-[200px] w-auto rounded-xl shadow-lg z-10 animate-float-up object-cover"
                  style={{ animationDelay: '-2.5s' }}
                />
              )}
              {/* Middle-Right */}
              {displayImages[3] && (
                <img
                  src={displayImages[3]}
                  alt="Feature 4"
                  className="absolute right-[12%] sm:right-[18%] top-1/2 -translate-y-1/2 h-[120px] sm:h-[150px] lg:h-[170px] w-auto rounded-xl shadow-lg z-10 animate-float-up object-cover"
                  style={{ animationDelay: '-3.5s' }}
                />
              )}
              {/* Bottom-Center */}
              {displayImages[4] && (
                <img
                  src={displayImages[4]}
                  alt="Feature 5"
                  className="absolute left-1/2 bottom-[8%] -translate-x-1/2 h-[120px] sm:h-[150px] lg:h-[170px] w-auto rounded-xl shadow-lg z-10 animate-float-up object-cover"
                   style={{ animationDelay: '-4.8s' }}
                />
              )}
              {/* Bottom-Left */}
              {displayImages[5] && (
                <img
                  src={displayImages[5]}
                  alt="Feature 6"
                  className="absolute left-[5%] sm:left-[8%] bottom-[8%] h-[120px] sm:h-[150px] lg:h-[170px] w-auto rounded-xl shadow-lg z-10 animate-float-up object-cover"
                   style={{ animationDelay: '-5.2s' }}
                />
              )}
              {/* Bottom-Right */}
              {displayImages[6] && (
                <img
                  src={displayImages[6]}
                  alt="Feature 7"
                  className="absolute right-[5%] sm:right-[8%] bottom-[8%] h-[120px] sm:h-[150px] lg:h-[170px] w-auto rounded-xl shadow-lg z-10 animate-float-up object-cover"
                   style={{ animationDelay: '-6s' }}
                />
              )}
            </div>
          </div>

          <div className="container relative z-10 mx-auto mt-12 px-4">
            <div className="flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-12 lg:gap-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--chevron-blue)]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[var(--chevron-muted)]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  }
);

HeroCollage.displayName = 'HeroCollage';

export { HeroCollage };
