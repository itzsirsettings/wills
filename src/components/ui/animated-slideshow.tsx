"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TextStaggerHoverProps {
  text: string
  index: number
}

interface HoverSliderImageProps {
  index: number
  imageUrl: string
}

interface HoverSliderProps {
  className?: string
  children?: React.ReactNode
}

interface HoverSliderContextValue {
  activeSlide: number
  changeSlide: (index: number) => void
}

function splitText(text: string) {
  const words = text.split(" ").map((word) => word.concat(" "))
  const characters = words.map((word) => word.split("")).flat(1)
  return {
    words,
    characters,
  }
}

const HoverSliderContext = React.createContext<HoverSliderContextValue | undefined>(undefined)

function useHoverSliderContext() {
  const context = React.useContext(HoverSliderContext)
  if (context === undefined) {
    throw new Error("useHoverSliderContext must be used within a HoverSliderProvider")
  }
  return context
}

export const HoverSlider = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & HoverSliderProps>(
  ({ children, className, ...props }, ref) => {
    const [activeSlide, setActiveSlide] = React.useState<number>(0)
    const changeSlide = React.useCallback((index: number) => setActiveSlide(index), [])
    return (
      <HoverSliderContext.Provider value={{ activeSlide, changeSlide }}>
        <div className={cn(className)} ref={ref} {...props}>
          {children}
        </div>
      </HoverSliderContext.Provider>
    )
  }
)
HoverSlider.displayName = "HoverSlider"

export const WordStaggerHover = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <span ref={ref} className={cn("relative inline-block origin-bottom overflow-hidden", className)} {...props}>
        {children}
      </span>
    )
  }
)
WordStaggerHover.displayName = "WordStaggerHover"

export const TextStaggerHover = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement> & TextStaggerHoverProps>(
  ({ text, index, className, ...props }, ref) => {
    const { activeSlide, changeSlide } = useHoverSliderContext()
    const { characters } = splitText(text)
    const isActive = activeSlide === index
    const handleMouse = () => changeSlide(index)
    return (
      <span
        ref={ref}
        className={cn("relative inline-block origin-bottom overflow-hidden cursor-pointer", className)}
        onMouseEnter={handleMouse}
        onFocus={handleMouse}
        onClick={handleMouse}
        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); changeSlide(index); } }}
        role="button"
        tabIndex={0}
        aria-label={text}
        aria-pressed={isActive}
        {...props}
      >
        <span className="sr-only">{text}</span>
        {characters.map((char, i) => (
          <span key={`${char}-${i}`} aria-hidden="true" className="relative inline-block overflow-hidden">
              <span
                className="inline-block opacity-20"
                style={{ transform: `translateY(${isActive ? '-110%' : '0%'})`, transition: `transform .3s ${i * .025}s cubic-bezier(.25,.46,.45,.94)` }}
              >
                {char}
                {char === " " && i < characters.length - 1 && <>&nbsp;</>}
              </span>
              <span
                className="absolute left-0 top-0 inline-block opacity-100"
                style={{ transform: `translateY(${isActive ? '0%' : '110%'})`, transition: `transform .3s ${i * .025}s cubic-bezier(.25,.46,.45,.94)` }}
              >
                {char}
              </span>
          </span>
        ))}
      </span>
    )
  }
)
TextStaggerHover.displayName = "TextStaggerHover"

export const HoverSliderImageWrap = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "grid overflow-hidden [&>*]:col-start-1 [&>*]:col-end-1 [&>*]:row-start-1 [&>*]:row-end-1 [&>*]:size-full",
          className
        )}
        {...props}
      />
    )
  }
)
HoverSliderImageWrap.displayName = "HoverSliderImageWrap"

export const HoverSliderImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement> & HoverSliderImageProps>(
  ({ index, imageUrl, className, style, ...props }, ref) => {
    const { activeSlide } = useHoverSliderContext()
    return (
      <img
        src={imageUrl}
        className={cn("inline-block align-middle", className)}
        style={{ ...style, clipPath: activeSlide === index ? 'inset(0)' : 'inset(0 0 100% 0)', transition: 'clip-path .3s cubic-bezier(.33,1,.68,1)' }}
        ref={ref}
        {...props}
      />
    )
  }
)
HoverSliderImage.displayName = "HoverSliderImage"
