import React, { useMemo, useState } from "react";
import { Play, Pause, Maximize2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CylinderImageItem {
  id?: string;
  src: string;
  alt?: string;
  caption?: string | null;
  destinationName?: string;
  destinationCountry?: string;
}

export interface CylinderCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  images: CylinderImageItem[];
  containerClassName?: string;
  cardClassName?: string;
  animationDuration?: number; // Duration in seconds for full 360 rotation (default 24)
  cardWidth?: number; // Width of cards in px (default 195)
  onImageClick?: (index: number) => void;
  autoPlay?: boolean;
}

export const CylinderCarousel = React.forwardRef<HTMLDivElement, CylinderCarouselProps>(
  (
    {
      images,
      className,
      containerClassName,
      cardClassName,
      animationDuration = 24,
      cardWidth = 195,
      onImageClick,
      autoPlay = true,
      ...props
    },
    ref,
  ) => {
    const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
    const N = images.length;

    // Base angle per card in degrees (360 / N)
    const baseAngleDeg = useMemo(() => (N > 0 ? 360 / N : 360), [N]);

    // Apothem / Radius calculation: R = (W/2 + 8) / tan(pi / N)
    const radiusPx = useMemo(() => {
      if (N <= 1) return 180;
      const rad = Math.PI / N;
      const w = cardWidth;
      return Math.max(160, Math.round((w / 2 + 8) / Math.tan(rad)));
    }, [N, cardWidth]);

    // CSS variables for cylinder 3D geometry
    const customStyle = useMemo(
      () =>
        ({
          "--n": N,
          "--w": `${cardWidth}px`,
          "--ba": `${baseAngleDeg}deg`,
          "--r": `${radiusPx}px`,
          "--anim-dur": `${animationDuration}s`,
        }) as React.CSSProperties,
      [N, cardWidth, baseAngleDeg, radiusPx, animationDuration],
    );

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full h-[320px] sm:h-[350px] grid place-items-center overflow-hidden select-none",
          className,
        )}
        style={{
          perspective: "32em",
          maskImage: "linear-gradient(90deg, transparent 0%, #000 12% 88%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 12% 88%, transparent 100%)",
        }}
        {...props}
      >
        {/* Floating Auto-Spin Toggle Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsPlaying((prev) => !prev);
          }}
          className="absolute top-2 right-3 z-30 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/85 hover:bg-background border border-border/80 text-[11px] font-medium text-foreground backdrop-blur-md shadow-xs transition-all"
          title={isPlaying ? "Pause auto-spinning" : "Resume auto-spinning"}
          aria-label={isPlaying ? "Pause auto-spinning" : "Resume auto-spinning"}
        >
          {isPlaying ? (
            <>
              <Pause className="h-3 w-3 text-primary" />
              <span className="hidden sm:inline">Pause</span>
            </>
          ) : (
            <>
              <Play className="h-3 w-3 text-primary" />
              <span className="hidden sm:inline">Auto-Spin</span>
            </>
          )}
        </button>

        {/* 3D Cylinder Ring with pure CSS animation */}
        <div
          className={cn(
            "grid place-items-center [transform-style:preserve-3d]",
            "hover:[animation-play-state:paused]",
            "motion-reduce:!animate-[ry_90s_linear_infinite]",
            containerClassName,
          )}
          style={{
            ...customStyle,
            animation: "ry var(--anim-dur) linear infinite",
            animationPlayState: isPlaying ? "running" : "paused",
          }}
        >
          <style>
            {`
              @keyframes ry {
                to {
                  transform: rotateY(1turn);
                }
              }
            `}
          </style>

          {images.map((img, i) => (
            <div
              key={img.id || i}
              role="button"
              tabIndex={0}
              onClick={() => onImageClick?.(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onImageClick?.(i);
                }
              }}
              className={cn(
                "group [grid-area:1/1] relative overflow-hidden rounded-2xl cursor-pointer select-none",
                "[backface-visibility:hidden]",
                "border border-white/20 shadow-xl shadow-black/50",
                "transition-all duration-300 transform-gpu",
                "hover:ring-2 hover:ring-primary/80 hover:scale-[1.03]",
                cardClassName,
              )}
              style={
                {
                  width: "var(--w)",
                  aspectRatio: "3/4",
                  "--i": i,
                  transform:
                    "rotateY(calc(var(--i) * var(--ba))) translateZ(calc(-1 * var(--r, calc((0.5 * var(--w) + 0.5em) / tan(0.5 * var(--ba))))))",
                } as React.CSSProperties
              }
              title={img.caption || img.destinationName || `Photo ${i + 1}`}
            >
              {/* Image */}
              <img
                src={img.src}
                alt={img.alt || img.caption || `Cylinder image ${i + 1}`}
                loading={i < 4 ? "eager" : "lazy"}
                draggable={false}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />

              {/* Gradient Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

              {/* Expand Icon Badge */}
              <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="h-7 w-7 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 shadow-xs">
                  <Maximize2 className="h-3 w-3" />
                </div>
              </div>

              {/* Destination & Caption Info */}
              <div className="absolute bottom-0 inset-x-0 p-3 text-white flex flex-col justify-end gap-1">
                {img.destinationName && (
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-primary-foreground/95 bg-white/20 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full w-fit max-w-[95%] truncate">
                    <MapPin className="h-2.5 w-2.5 shrink-0 text-white" />
                    <span className="truncate">
                      {img.destinationName}
                      {img.destinationCountry ? `, ${img.destinationCountry}` : ""}
                    </span>
                  </div>
                )}

                {img.caption && (
                  <p className="text-[11px] font-medium text-white/90 line-clamp-1 leading-snug drop-shadow-sm">
                    {img.caption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
);

CylinderCarousel.displayName = "CylinderCarousel";
