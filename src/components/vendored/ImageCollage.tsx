import * as React from "react";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { Maximize2, MapPin } from "lucide-react";

export interface CollageImage {
  id?: string;
  src: string;
  x: number;
  y: number;
  rotate: number;
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

/**
 * ImageCollage — Ported from Vengeance UI (https://www.vengenceui.com/components/image-collage)
 *
 * Adaptations for Wanderlust v2:
 * - Removed Next.js "use client" directive (TanStack Start SSR compatible)
 * - Switched `framer-motion` to `motion/react` (motion.dev v13)
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
          "relative flex flex-col items-center justify-center w-full min-h-[460px] md:min-h-[520px] select-none py-8 overflow-hidden rounded-3xl bg-muted/30 border border-border/60",
          className,
        )}
        {...props}
      >
        {/* Ambient subtle glow behind collage */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, oklch(0.68 0.168 38 / 0.12) 0%, transparent 80%)",
          }}
          aria-hidden="true"
        />

        {/* Central Collage Stage */}
        <motion.div
          className={cn(
            "relative flex items-center justify-center w-full max-w-5xl h-72 sm:h-80 md:h-96 my-auto",
            containerClassName,
          )}
        >
          {images.map((img, i) => {
            const hasLocation = Boolean(img.destinationName);

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
                  "group/item absolute w-36 sm:w-44 md:w-52 aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer bg-card border border-border/80 shadow-md transition-shadow duration-300 hover:shadow-2xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary",
                  imageClassName,
                )}
                initial={
                  shouldReduceMotion
                    ? { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }
                    : { opacity: 0, scale: 0.8 }
                }
                animate={
                  shouldReduceMotion
                    ? {
                        opacity: 1,
                        scale: 1,
                        x: isOrganized ? (i - (images.length - 1) / 2) * 44 : 0,
                        y: 0,
                        rotate: 0,
                        zIndex: i,
                      }
                    : {
                        opacity: 1,
                        scale: 1,
                        x: isOrganized ? (i - (images.length - 1) / 2) * 52 : img.x,
                        y: isOrganized ? 0 : img.y,
                        rotate: isOrganized ? 0 : img.rotate,
                        zIndex: isOrganized ? i + 1 : i,
                      }
                }
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: 1.08,
                        zIndex: 50,
                        transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
                      }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        type: "spring",
                        stiffness: 180,
                        damping: 22,
                        mass: 0.9,
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
        </motion.div>
      </div>
    );
  },
);

ImageCollage.displayName = "ImageCollage";
