import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PageHeroBannerProps {
  eyebrow?: string;
  title: string;
  description?: string;
  imageUrl: string;
  imageAlt?: string;
  focalPosition?: string;
  ctaText?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  className?: string;
  children?: ReactNode;
}

export function PageHeroBanner({
  eyebrow,
  title,
  description,
  imageUrl,
  imageAlt = "",
  focalPosition = "object-[right_center]",
  ctaText,
  ctaHref,
  onCtaClick,
  className,
  children,
}: PageHeroBannerProps) {
  const handleScrollToContent = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onCtaClick) {
      e.preventDefault();
      onCtaClick();
      return;
    }
    if (ctaHref && ctaHref.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(ctaHref);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* ============================================================ */}
      {/* 1. Cinematic Photographic Hero Container                     */}
      {/* ============================================================ */}
      <div className="relative w-full h-[380px] sm:h-[440px] lg:h-[480px] overflow-hidden">
        <img
          src={imageUrl}
          alt={imageAlt || title}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out",
            focalPosition,
          )}
          loading="eager"
          // @ts-expect-error fetchpriority is a modern HTML attribute supported in React 19 / modern browsers
          fetchpriority="high"
        />

        {/* Ambient Multi-Stage Gradient Scrims for AAA Legibility */}
        {/* Horizontal reading scrim (protects typography without deadening right photo vibrancy) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 via-45% to-transparent pointer-events-none" />

        {/* Top ambient vignette (guarantees floating transparent navbar links pop crisp) */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

        {/* Bottom stage scrim (smoothly blends into page background below) */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />

        {/* ============================================================ */}
        {/* 2. Left-Aligned Typography Lockup                            */}
        {/* ============================================================ */}
        <div className="relative mx-auto max-w-7xl h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center pt-16 sm:pt-20 pb-8">
          <div className="max-w-2xl text-white">
            {/* Eyebrow Accent */}
            {eyebrow ? (
              <div className="flex items-center gap-2 mb-3">
                <span className="h-[2px] w-6 bg-accent" />
                <span className="text-xs font-semibold tracking-widest uppercase text-white/90">
                  {eyebrow}
                </span>
              </div>
            ) : null}

            {/* Display Title */}
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-sm">
              {title}
            </h1>

            {/* Subtitle / Editorial Narrative */}
            {description ? (
              <p className="mt-3 text-sm sm:text-base lg:text-lg text-white/85 leading-relaxed max-w-xl">
                {description}
              </p>
            ) : null}

            {/* Optional Call to Action Pill Button */}
            {ctaText ? (
              <div className="mt-6">
                <a
                  href={ctaHref || "#"}
                  onClick={handleScrollToContent}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-md shadow-lg transition-all active:scale-[0.98] w-fit group"
                >
                  <span>{ctaText}</span>
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Optional Children Slot (e.g. Floating Search Bar) */}
      {children}
    </div>
  );
}
