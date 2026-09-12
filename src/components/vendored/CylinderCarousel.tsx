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
  animationDuration?: number; // Duration in seconds for full 360 rotation (default 40)
  cardWidth?: number; // Width of cards in px (default 200)
  stageHeight?: string; // Viewport height class (default "h-[420px] sm:h-[480px]")
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
      animationDuration = 40,
      cardWidth = 200,
      stageHeight = "h-[420px] sm:h-[480px]",
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
    const [dragOffsetAngle, setDragOffsetAngle] = useState<number>(0);

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
      return Math.max(240, Math.round((w / 2 + 8) / Math.tan(rad)));
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

    // Interactive Drag Handlers
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

      const dragFactor = 0.28;
      setDragOffsetAngle((prev) => prev + deltaX * dragFactor);
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
        setDragOffsetAngle((prev) => prev + step);
      },
      [baseAngleDeg],
    );

    const resetRotation = useCallback(() => {
      setDragOffsetAngle(0);
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
        className={cn("w-full flex flex-col items-center select-none", className)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label="3D Cylinder Interactive Carousel"
        {...props}
      >
        {/* Interactive Controls & Status Bar */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 px-3 py-1.5 mb-2 max-w-5xl">
          {/* Status badge & hint */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-foreground text-xs font-semibold">
              <MoveHorizontal className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span>3D Cylinder Sphere</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-primary">{N} Captures</span>
            </span>
            <span className="hidden sm:inline text-xs text-muted-foreground">
              Auto-spinning 360° • Drag to rotate • Click photograph to expand
            </span>
          </div>

          {/* Interactive Navigation Controls */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-card/90 border border-border/80 backdrop-blur-md shadow-xs">
            <button
              type="button"
              onClick={() => rotateStep("prev")}
              className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              title="Rotate Left (ArrowLeft)"
              aria-label="Rotate Left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsPlaying((prev) => !prev)}
              className={cn(
                "h-7 px-2.5 rounded-full flex items-center gap-1 text-xs font-medium transition-colors",
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
              className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              title="Rotate Right (ArrowRight)"
              aria-label="Rotate Right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={resetRotation}
              className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              title="Reset Alignment"
              aria-label="Reset Rotation"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 3D Cylinder Stage Viewport with Vignette Gradient Masks */}
        <div
          className={cn(
            "relative w-full grid place-items-center overflow-hidden touch-none",
            stageHeight,
            isDragging ? "cursor-grabbing" : "cursor-grab",
          )}
          style={{
            perspective: "38em",
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
          {/* Cylinder Ring Container — Native Vengeance UI 3D CSS Animation Engine */}
          <div
            className={cn(
              "grid place-items-center [transform-style:preserve-3d] animate-cylinder",
              containerClassName,
            )}
            style={{
              ...customStyle,
              animation:
                isPlaying && !isDragging ? `ry ${animationDuration}s linear infinite` : "none",
              animationPlayState: isPlaying && !isDragging ? "running" : "paused",
              transform:
                isDragging || dragOffsetAngle !== 0 ? `rotateY(${dragOffsetAngle}deg)` : undefined,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Inline keyframe definition ensuring 100% universal rendering */}
            <style>
              {`
                @keyframes ry {
                  0% {
                    transform: rotateY(0deg);
                  }
                  100% {
                    transform: rotateY(360deg);
                  }
                }
              `}
            </style>

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
                  "hover:scale-105 hover:ring-2 hover:ring-white/90",
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
                  <div className="h-7 w-7 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 shadow-md">
                    <Maximize2 className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Bottom Caption & Destination Info */}
                <div className="absolute bottom-0 inset-x-0 p-3 text-white flex flex-col justify-end gap-1">
                  {img.destinationName && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-primary-foreground/95 bg-white/20 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full w-fit max-w-[95%] truncate">
                      <MapPin className="h-3 w-3 shrink-0 text-white" />
                      <span className="truncate">{img.destinationName}</span>
                    </div>
                  )}

                  {img.caption && (
                    <p className="text-[11px] font-medium text-white/90 line-clamp-2 leading-snug drop-shadow-sm">
                      {img.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom subtle indicator */}
        <div className="mt-2 text-center">
          <span className="text-[11px] text-muted-foreground/70 font-mono">
            {N} captures • 3D infinite auto-spin • Drag or swipe horizontally to rotate
          </span>
        </div>
      </div>
    );
  },
);

CylinderCarousel.displayName = "CylinderCarousel";
