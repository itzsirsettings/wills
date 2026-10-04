"use client"

import { DotPattern } from "@/components/ui/dot-pattern"

interface HeroWithGreetingProps {
  greeting?: string
  title: React.ReactNode
  subtitle?: React.ReactNode
  stats?: Array<{ value: string; label: string }>
  images?: string[]
  imageAlts?: string[]
}

export function HeroWithGreeting({
  greeting = "",
  title,
  subtitle,
  stats = [],
  images = [],
  imageAlts = [],
}: HeroWithGreetingProps) {

  return (
    <section id="subhero" className="relative w-full overflow-hidden bg-[var(--brand-paper)]">
      <div className="absolute inset-0">
        <DotPattern
          className="opacity-30"
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={0.8}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
        {greeting && <div>
          <div className="mb-4">
            <span className="inline-block rounded-full bg-[var(--brand-red-tint)] px-4 py-1.5 text-sm font-medium text-[var(--brand-red)]">
              {greeting}
            </span>
          </div>
        </div>}

        <div>
          <h2 className="mx-auto mb-6 text-center text-[1.575rem] font-bold tracking-tight text-[var(--brand-navy)] md:text-[2.625rem] lg:text-[3.15rem]">
            {title}
          </h2>
        </div>

        {subtitle && (
          <div>
            <p className="mx-auto max-w-2xl text-center text-lg leading-relaxed text-[var(--brand-muted)] md:text-xl">
              {subtitle}
            </p>
          </div>
        )}

        {stats.length > 0 && (
          <div>
            <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-[var(--brand-red)]">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-[var(--brand-muted)]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {images.length > 0 && (
          <div>
            <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {images.slice(0, 6).map((src, index) => (
                <div
                  key={index}
                  className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[var(--brand-surface)]"
                >
                  <img
                    src={src}
                    alt={imageAlts[index] || `Wills Group design reference ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                    width="640"
                    height="800"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
