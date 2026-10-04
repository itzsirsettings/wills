"use client"

import {
  HoverSlider,
  HoverSliderImage,
  HoverSliderImageWrap,
  TextStaggerHover,
} from "@/components/ui/animated-slideshow"

const SLIDES = [
  {
    id: "slide-1",
    title: "Decorative gates",
    imageUrl: "/media/wills/IMG-20261003-WA0067.webp",
  },
  {
    id: "slide-2",
    title: "Statement doors",
    imageUrl: "/media/wills/IMG-20261003-WA0018.webp",
  },
  {
    id: "slide-3",
    title: "Modern entrances",
    imageUrl: "/media/wills/IMG-20261003-WA0039.webp",
  },
  {
    id: "slide-4",
    title: "Metal detailing",
    imageUrl: "/media/wills/IMG-20261003-WA0023.webp",
  },
  {
    id: "slide-5",
    title: "Custom fabrication",
    imageUrl: "/media/wills/IMG-20261003-WA0054.webp",
  },
  {
    id: "slide-6",
    title: "Interiors",
    imageUrl: "/media/wills/IMG-20261003-WA0036.webp",
  },
]

export function HoverSliderDemo() {
  return (
    <HoverSlider className="brand-dot-surface wills-slideshow min-h-[60vh] py-20 w-full flex flex-col justify-center px-6 md:px-12 bg-[var(--brand-navy)] text-[var(--brand-lavender)]">
      <div className="flex flex-wrap items-center justify-evenly gap-6 md:gap-12">
        <div className="flex flex-col space-y-2 md:space-y-4">
          {SLIDES.map((slide, index) => (
            <TextStaggerHover
              key={slide.title}
              index={index}
              className="cursor-pointer text-2xl md:text-4xl font-bold uppercase tracking-tighter"
              text={slide.title}
            />
          ))}
        </div>
        <HoverSliderImageWrap>
          {SLIDES.map((slide, index) => (
            <div key={slide.id}>
              <HoverSliderImage
                index={index}
                imageUrl={slide.imageUrl}
                src={slide.imageUrl}
                alt={slide.title}
                className="size-full max-h-96 w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </HoverSliderImageWrap>
      </div>
    </HoverSlider>
  )
}
