import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CtaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageSrc: string;
  imageAlt: string;
  title: string;
  subtitle: React.ReactNode;
  description: string;
  buttonText: string;
  onButtonClick?: () => void;
  secondaryButtonText?: string;
  onSecondaryButtonClick?: () => void;
  secondaryButtonHref?: string;
}

const CtaCard = React.forwardRef<HTMLDivElement, CtaCardProps>(
  (
    {
      className,
      imageSrc,
      imageAlt,
      title,
      subtitle,
      description,
      buttonText,
      onButtonClick,
      secondaryButtonText,
      onSecondaryButtonClick,
      secondaryButtonHref,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "live-card overflow-hidden rounded-xl border bg-card text-card-foreground shadow",
          "flex flex-col md:flex-row",
          className
        )}
        {...props}
      >
        <div className="md:w-1/3 w-full">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="h-56 w-full object-cover md:h-full"
            loading="lazy"
            decoding="async"
            width="640"
            height="800"
          />
        </div>

        <div className="md:w-2/3 w-full p-6 md:p-8 flex flex-col justify-center">
          <div>

            <h2 className="mt-1 text-[1.05rem] md:text-[1.3125rem] font-bold tracking-tight">
              {subtitle}
            </h2>
            <p className="mt-3 text-base">{title}</p>
            <p className="mt-4 text-muted-foreground">
              {description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" onClick={onButtonClick}>
                {buttonText}
              </Button>
              {secondaryButtonText ? (
                <Button
                  asChild={Boolean(secondaryButtonHref)}
                  size="lg"
                  variant="outline"
                  onClick={secondaryButtonHref ? undefined : onSecondaryButtonClick}
                >
                  {secondaryButtonHref ? (
                    <a
                      href={secondaryButtonHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {secondaryButtonText}
                    </a>
                  ) : (
                    secondaryButtonText
                  )}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CtaCard.displayName = "CtaCard";

export { CtaCard };
