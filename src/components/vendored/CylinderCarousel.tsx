import React, { useRef, useState, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  MapPin,
  MoveHorizontal,
} from "lucide-react";
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
  animationDuration?: number; // Duration in seconds for full 360 rotation (default 45)
  cardWidth?: number; // Width of cards in px (default 340)
  stageHeight?: string; // Viewport height class (default "h-[70vh] sm:h-[76vh] min-h-[520px] max-h-[780px]")
  perspective?: string; // 3D camera perspective (default "120em")
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
      animationDuration = 45,
      cardWidth = 340,
      stageHeight = "h-[70vh] sm:h-[76vh] min-h-[520px] max-h-[780px]",
      perspective = "120em",
      onImageClick,
      autoPlay = true,
      ...props
    },
    forwardedRef,
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);

    const N = images.length;

    // Interactive State
    const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragAngle, setDragAngle] = useState<number>(0);

    // Pointer Tracking Refs
    const isPointerDownRef = useRef<boolean>(false);
    const startXRef = useRef<number>(0);
    const lastXRef = useRef<number>(0);
    const hasDraggedRef = useRef<boolean>(false);

    // Base angle per card in degrees
    const baseAngleDeg = useMemo(() => (N > 0 ? 360 / N : 360), [N]);

    // Apothem / Radius calculation: R = (W/2 + 8) / tan(pi / N)
    const radiusPx = useMemo(() => {
      if (N <= 1) return 220;
      const rad = Math.PI / N;
      const w = cardWidth;
      return Math.max(260, Math.round((w / 2 + 8) / Math.tan(rad)));
    }, [N, cardWidth]);

    // CSS Variables for cylinder geometry
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

    // Interactive Drag / Swipe Handlers
    const handlePointerDown = (e: React.PointerEvent) => {
      isPointerDownRef.current = true;
      startXRef.current = e.clientX;
      lastXRef.current = e.clientX;
      hasDraggedRef.current = false;
      setIsDragging(true);

      if (e.currentTarget instanceof HTMLElement) {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // ignore if not supported
        }
      }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
      if (!isPointerDownRef.current) return;

      const deltaX = e.clientX - lastXRef.current;
      lastXRef.current = e.clientX;

      if (Math.abs(e.clientX - startXRef.current) > 5) {
        hasDraggedRef.current = true;
      }

      // Drag sensitivity factor (degrees per pixel)
      const dragFactor = 0.25;
      setDragAngle((prev) => prev + deltaX * dragFactor);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
      isPointerDownRef.current = false;
      setIsDragging(false);

      if (e.currentTarget instanceof HTMLElement) {
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }
    };

    // Card click handler (only triggers if not dragged)
    const handleCardClick = (index: number, e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      if (hasDraggedRef.current) return;
      onImageClick?.(index);
    };

    // Step navigation buttons
    const rotateStep = useCallback(
      (direction: "prev" | "next") => {
        const step = direction === "prev" ? baseAngleDeg : -baseAngleDeg;
        setDragAngle((prev) => prev + step);
      },
      [baseAngleDeg],
    );

    const resetRotation = useCallback(() => {
      setDragAngle(0);
    }, []);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        rotateStep("prev");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        rotateStep("next");
      }
    };

    return (
      <div
        ref={forwardedRef || internalRef}
        className={cn("relative w-full flex flex-col items-center select-none", className)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label="3D Cylinder Interactive Carousel"
        {...props}
      >
        {/* Scoped CSS keyframes definition */}
        <style>
          {`
            @keyframes cylinder-spin {
              0% { transform: rotateY(0deg); }
              100% { transform: rotateY(360deg); }
            }
          `}
        </style>

        {/* Floating Glass Overlay Control Bar */}
        <div className="absolute top-3 sm:top-5 inset-x-0 z-20 flex items-center justify-between gap-2 px-3 sm:px-6 pointer-events-none max-w-6xl mx-auto">
          {/* Status pill (pointer-events-auto) */}
          <div className="pointer-events-auto">
            <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-card/90 border border-border/80 backdrop-blur-md shadow-xs text-foreground text-[11px] sm:text-xs font-semibold whitespace-nowrap">
              <MoveHorizontal className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary animate-pulse shrink-0" />
              <span>3D Cylinder Showcase</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-primary font-semibold">{N} Captures</span>
            </span>
          </div>

          {/* Interactive Navigation Controls (pointer-events-auto) */}
          <div className="pointer-events-auto flex items-center gap-1 p-0.5 sm:p-1 rounded-full bg-card/90 border border-border/80 backdrop-blur-md shadow-xs shrink-0">
            <button
              type="button"
              onClick={() => rotateStep("prev")}
              className="h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              title="Rotate Left (ArrowLeft)"
              aria-label="Rotate Left"
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsPlaying((prev) => !prev)}
              className={cn(
                "h-6 px-2 sm:h-7 sm:px-2.5 rounded-full flex items-center gap-1 text-[11px] sm:text-xs font-medium transition-colors",
                isPlaying
                  ? "text-primary bg-primary/10 hover:bg-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
              )}
              title={isPlaying ? "Pause Auto-Spin" : "Resume Auto-Spin"}
              aria-label={isPlaying ? "Pause Auto-Spin" : "Resume Auto-Spin"}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3 w-3" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  <span>Spin</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => rotateStep("next")}
              className="h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              title="Rotate Right (ArrowRight)"
              aria-label="Rotate Right"
            >
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>

            <button
              type="button"
              onClick={resetRotation}
              className="hidden xs:flex h-6 w-6 sm:h-7 sm:w-7 rounded-full items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              title="Reset Alignment"
              aria-label="Reset Rotation"
            >
              <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>
          </div>
        </div>

        {/* High-Impact 3D Cylinder Stage Viewport with Edge Vignette Gradient Masks */}
        <div
          className={cn(
            "relative w-full grid place-items-center overflow-hidden touch-none",
            stageHeight,
            isDragging ? "cursor-grabbing" : "cursor-grab",
          )}
          style={{
            perspective,
            maskImage:
              "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Layer 1: Drag & Step Rotation Controller */}
          <div
            className="w-full h-full grid place-items-center [transform-style:preserve-3d] will-change-transform"
            style={{
              transform: `rotateY(${dragAngle}deg)`,
              transformStyle: "preserve-3d",
              transition: isDragging ? "none" : "transform 0.4s ease-out",
            }}
          >
            {/* Layer 2: Pure CSS Infinite 3D Auto-Spin Cylinder (Vengeance UI Engine) */}
            <div
              className={cn(
                "w-full h-full grid place-items-center [transform-style:preserve-3d] cylinder-spin-infinite",
                (!isPlaying || isDragging) && "cylinder-spin-paused",
                containerClassName,
              )}
              style={{
                ...customStyle,
                animation: "cylinder-spin var(--anim-dur) linear infinite",
                animationPlayState: isPlaying && !isDragging ? "running" : "paused",
                transformStyle: "preserve-3d",
              }}
            >
              {images.map((img, i) => (
                <div
                  key={img.id || i}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => handleCardClick(i, e)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleCardClick(i, e);
                    }
                  }}
                  className={cn(
                    "group [grid-area:1/1] relative overflow-hidden rounded-2xl cursor-pointer select-none",
                    "[backface-visibility:hidden] will-change-transform",
                    "border border-white/25 shadow-2xl shadow-black/80",
                    "transition-transform duration-300 transform-gpu",
                    "hover:scale-106 hover:ring-2 hover:ring-white/90",
                    cardClassName,
                  )}
                  style={
                    {
                      width: "var(--w)",
                      aspectRatio: "7/10",
                      "--i": i,
                      // Modern CSS tan() transform with precomputed --r fallback for universal browser compatibility
                      transform:
                        "rotateY(calc(var(--i) * var(--ba))) translateZ(calc(-1 * var(--r, calc((0.5 * var(--w) + 0.5em) / tan(0.5 * var(--ba))))))",
                    } as React.CSSProperties
                  }
                  title={img.caption || img.destinationName || `Capture ${i + 1}`}
                >
                  {/* Image */}
                  <img
                    src={img.src}
                    alt={img.alt || img.caption || `Cylinder capture ${i + 1}`}
                    loading={i < 12 ? "eager" : "lazy"}
                    draggable={false}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

                  {/* Top Bar with Expand Badge on Hover */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 shadow-md transform group-hover:scale-110 transition-transform">
                      <Maximize2 className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* Bottom Caption & Destination Info */}
                  <div className="absolute bottom-0 inset-x-0 p-3 text-white flex flex-col justify-end gap-1">
                    {img.destinationName && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-primary-foreground/95 bg-white/25 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full w-fit max-w-[95%] truncate">
                        <MapPin className="h-3 w-3 shrink-0 text-white" />
                        <span className="truncate">{img.destinationName}</span>
                      </div>
                    )}

                    {img.caption && (
                      <p className="text-xs font-medium text-white/90 line-clamp-2 leading-snug drop-shadow-sm">
                        {img.caption}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

CylinderCarousel.displayName = "CylinderCarousel";
