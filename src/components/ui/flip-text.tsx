import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface FlipTextProps {
  children: string;
  className?: string;
  duration?: number;
  delay?: number;
}

export function FlipText({
  children,
  className,
  duration = 1.2,
  delay = 0,
}: FlipTextProps) {
  const [isReady, setIsReady] = useState(false);
  const words = children.trim().split(/\s+/);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [children]);

  return (
    <span
      aria-label={children}
      className={cn(
        "inline-flex flex-wrap items-baseline justify-center gap-x-[0.22em] gap-y-[0.08em] text-balance",
        className,
      )}
    >
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="overflow-hidden pb-[0.08em]">
          <span
            className={cn(
              "inline-block will-change-transform transition-[transform,opacity,filter] [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:blur-none motion-reduce:transition-none",
              isReady
                ? "translate-y-0 opacity-100 blur-0"
                : "translate-y-[118%] opacity-0 blur-[6px]",
            )}
            style={{
              transitionDuration: `${duration}s`,
              transitionDelay: `${delay + index * 0.08}s`,
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}
