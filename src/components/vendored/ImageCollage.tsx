import * as React from "react";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { Maximize2, MapPin } from "lucide-react";

export interface CollageImage {
  id?: string;
  src: string;
  x?: number;
  y?: number;
  rotate?: number;
  alt?: string;
  caption?: string | null;
  destinationName?: string | null;
  destinationCountry?: string | null;
}

export interface ImageCollageProps extends React.HTMLAttributes<HTMLDivElement> {
  images: CollageImage[];
  containerClassName?: string;
  imageClassName?: string;
  isOrganized?: boolean;
  onToggleLayout?: () => void;
  onImageClick?: (index: number) => void;
}

// Organic scatter offsets for collage view (simulates travel photos tossed across a table)
const SCATTER_VARIANTS = [
  { y: -24, rotate: -7, scale: 1.02 },
  { y: 22, rotate: 6, scale: 0.98 },
  { y: -18, rotate: -4, scale: 1.01 },
  { y: 26, rotate: 7, scale: 0.99 },
  { y: -22, rotate: -3, scale: 1.03 },
  { y: 20, rotate: 5, scale: 0.98 },
  { y: -26, rotate: -6, scale: 1.02 },
  { y: 24, rotate: 8, scale: 0.97 },
  { y: -20, rotate: -5, scale: 1.01 },
];

/**
 * ImageCollage — Ported from Vengeance UI (https://www.vengenceui.com/components/image-collage)
 *
 * Adaptations for Wanderlust v2:
 * - Removed Next.js "use client" directive (TanStack Start SSR compatible)
 * - Switched `framer-motion` to `motion/react` (motion.dev v13)
 * - Flex-based fanned deck with negative spacing so ALL images are visible across the stage
 * - Full prefers-reduced-motion override via useReducedMotion()
 * - Wired interactive photo click callback to trigger accessible fullscreen Lightbox
 * - Stylized with Wanderlust OKLCH tokens (bg-card, border-border, shadow-card-hover)
 */
export const ImageCollage = React.forwardRef<HTMLDivElement, ImageCollageProps>(
  (
    {
      images,
      className,
      containerClassName,
      imageClassName,
      isOrganized: controlledIsOrganized,
      onToggleLayout,
      onImageClick,
      ...props
    },
    ref,
  ) => {
    const shouldReduceMotion = useReducedMotion();
    const [internalIsOrganized, setInternalIsOrganized] = useState(false);

    const isOrganized =
      controlledIsOrganized !== undefined ? controlledIsOrganized : internalIsOrganized;

    const handleToggle = () => {
      if (onToggleLayout) {
        onToggleLayout();
      } else {
        setInternalIsOrganized((prev) => !prev);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex flex-col items-center justify-center w-full min-h-[440px] md:min-h-[480px] select-none py-10 px-4 overflow-hidden rounded-3xl bg-muted/30 border border-border/60",
          className,
        )}
        {...props}
      >
        {/* Ambient subtle warm glow behind collage */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
          style={{
            background:
              "radial-gradient(ellipse 65% 55% at 50% 50%, oklch(0.68 0.168 38 / 0.14) 0%, transparent 80%)",
          }}
          aria-hidden="true"
        />

        {/* Central Collage Stage: Fanned Flex Row */}
        <div
          className={cn(
            "relative flex items-center justify-center w-full max-w-6xl py-8 px-6 -space-x-10 sm:-space-x-14 md:-space-x-16 lg:-space-x-18",
            containerClassName,
          )}
        >
          {images.map((img, i) => {
            const hasLocation = Boolean(img.destinationName);
            const scatter = SCATTER_VARIANTS[i % SCATTER_VARIANTS.length];

            const currentY = isOrganized ? 0 : (img.y ?? scatter.y);
            const currentRotate = isOrganized ? 0 : (img.rotate ?? scatter.rotate);
            const currentScale = isOrganized ? 1 : scatter.scale;
            const currentZIndex = i + 1;

            return (
              <motion.div
                key={img.id || i}
                role="button"
                tabIndex={0}
                aria-label={
                  img.caption ||
                  img.alt ||
                  `View photo ${i + 1}${img.destinationName ? ` in ${img.destinationName}` : ""}`
                }
                onClick={(e) => {
                  e.stopPropagation();
                  if (onImageClick) {
                    onImageClick(i);
                  } else {
                    handleToggle();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onImageClick) {
                      onImageClick(i);
                    } else {
                      handleToggle();
                    }
                  }
                }}
                className={cn(
                  "group/item relative shrink-0 w-36 sm:w-44 md:w-50 lg:w-54 aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer bg-card border border-border/80 shadow-md transition-shadow duration-300 hover:shadow-2xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary",
                  imageClassName,
                )}
                initial={false}
                animate={
                  shouldReduceMotion
                    ? {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        rotate: 0,
                        zIndex: currentZIndex,
                      }
                    : {
                        opacity: 1,
                        scale: currentScale,
                        y: currentY,
                        rotate: currentRotate,
                        zIndex: currentZIndex,
                      }
                }
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: 1.12,
                        y: currentY - 24,
                        rotate: 0,
                        zIndex: 70,
                        transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
                      }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        type: "spring",
                        stiffness: 220,
                        damping: 24,
                        mass: 0.8,
                      }
                }
              >
                {/* Photo */}
                <img
                  src={img.src}
                  alt={img.alt || img.caption || `Collage image ${i + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/item:scale-105"
                />

                {/* Subtle vignette frame */}
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-2xl pointer-events-none" />

                {/* Hover Reveal Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-250 flex flex-col justify-between p-3 text-white pointer-events-none">
                  <div className="flex justify-end">
                    <div className="h-7 w-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90">
                      <Maximize2 className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    {hasLocation && (
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-white bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full w-fit">
                        <MapPin className="h-2.5 w-2.5" />
                        <span className="truncate max-w-[130px]">{img.destinationName}</span>
                      </div>
                    )}
                    {img.caption && (
                      <p className="text-[11px] font-medium text-white/95 line-clamp-2 leading-tight">
                        {img.caption}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  },
);

ImageCollage.displayName = "ImageCollage";
