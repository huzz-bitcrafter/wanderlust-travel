import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
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
  cardWidth?: number; // Width of cards in px (default 240)
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
      cardWidth = 240,
      onImageClick,
      autoPlay = true,
      ...props
    },
    forwardedRef,
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const cylinderRef = useRef<HTMLDivElement>(null);

    const N = images.length;

    // Interactive State
    const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [activeCardIndex, setActiveCardIndex] = useState<number>(0);

    // Physics / Motion Refs for 60/120fps GPU smooth rendering without re-renders
    const angleRef = useRef<number>(0); // Current displayed angle
    const targetAngleRef = useRef<number>(0); // Target angle for lerping
    const velocityRef = useRef<number>(0); // Drag momentum velocity
    const isPointerDownRef = useRef<boolean>(false);
    const startXRef = useRef<number>(0);
    const lastXRef = useRef<number>(0);
    const hasDraggedRef = useRef<boolean>(false);
    const lastTimeRef = useRef<number>(0);
    const rafIdRef = useRef<number | null>(null);

    // Base angle per card in degrees
    const baseAngleDeg = useMemo(() => (N > 0 ? 360 / N : 360), [N]);

    // Apothem / Radius calculation: R = (W/2 + 8) / tan(pi / N)
    const radiusPx = useMemo(() => {
      if (N <= 1) return 200;
      const rad = Math.PI / N;
      const w = cardWidth;
      return Math.max(220, Math.round((w / 2 + 10) / Math.tan(rad)));
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

    // Check prefers-reduced-motion
    const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
    useEffect(() => {
      if (typeof window === "undefined") return;
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }, []);

    // Main 60fps physics & rotation loop
    useEffect(() => {
      let isRunning = true;

      const animate = (timestamp: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = timestamp;
        const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
        lastTimeRef.current = timestamp;

        if (cylinderRef.current && N > 0) {
          // If auto-play is enabled and user is not actively dragging or hovering
          if (isPlaying && !isPointerDownRef.current && !isHovered && !prefersReducedMotion) {
            // Speed in degrees per second: 360 / duration
            const autoSpeed = 360 / animationDuration;
            targetAngleRef.current -= autoSpeed * dt;
          }

          // Apply velocity friction decay when released from drag
          if (!isPointerDownRef.current && Math.abs(velocityRef.current) > 0.05) {
            targetAngleRef.current += velocityRef.current;
            velocityRef.current *= 0.92; // Inertia damping
          }

          // Smooth lerp towards target angle
          const lerpFactor = isPointerDownRef.current ? 0.35 : 0.15;
          angleRef.current += (targetAngleRef.current - angleRef.current) * lerpFactor;

          // Apply 3D rotation transform directly to DOM for optimal GPU performance
          cylinderRef.current.style.transform = `rotateY(${angleRef.current}deg)`;

          // Track which card is facing front for accessibility / indicator
          // Normalize angle to [0, 360)
          const normalized = ((-angleRef.current % 360) + 360) % 360;
          const frontIndex = Math.round(normalized / baseAngleDeg) % N;
          setActiveCardIndex((prev) => (prev !== frontIndex ? frontIndex : prev));
        }

        if (isRunning) {
          rafIdRef.current = requestAnimationFrame(animate);
        }
      };

      rafIdRef.current = requestAnimationFrame(animate);

      return () => {
        isRunning = false;
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      };
    }, [isPlaying, isHovered, prefersReducedMotion, animationDuration, baseAngleDeg, N]);

    // Interactive Drag / Swipe Handlers
    const handlePointerDown = (e: React.PointerEvent) => {
      isPointerDownRef.current = true;
      startXRef.current = e.clientX;
      lastXRef.current = e.clientX;
      hasDraggedRef.current = false;
      velocityRef.current = 0;
      setIsDragging(true);

      // Capture pointer on container so drag continues outside bounds
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

      // Distance from start to distinguish click from swipe
      if (Math.abs(e.clientX - startXRef.current) > 6) {
        hasDraggedRef.current = true;
      }

      // Drag sensitivity factor (degrees per pixel)
      const dragFactor = 0.28;
      const angleDelta = deltaX * dragFactor;

      targetAngleRef.current += angleDelta;
      velocityRef.current = angleDelta * 0.8; // Store recent velocity
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

    // Card click handler (only triggers if not dragging)
    const handleCardClick = (index: number, e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      if (hasDraggedRef.current) return;
      onImageClick?.(index);
    };

    // Step navigation (Previous / Next card buttons)
    const rotateStep = useCallback(
      (direction: "prev" | "next") => {
        velocityRef.current = 0;
        const step = direction === "prev" ? baseAngleDeg : -baseAngleDeg;
        // Snap target to nearest clean card angle
        const snappedTarget =
          Math.round((targetAngleRef.current + step) / baseAngleDeg) * baseAngleDeg;
        targetAngleRef.current = snappedTarget;
      },
      [baseAngleDeg],
    );

    const resetRotation = useCallback(() => {
      velocityRef.current = 0;
      targetAngleRef.current = 0;
    }, []);

    // Keyboard navigation (ArrowLeft / ArrowRight)
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        rotateStep("prev");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        rotateStep("next");
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onImageClick?.(activeCardIndex);
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
        <div className="w-full flex flex-wrap items-center justify-between gap-3 px-3 py-2 mb-2 max-w-5xl">
          {/* Status badge & drag hint */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-foreground text-xs font-semibold">
              <MoveHorizontal className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span>3D Cylinder Sphere</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-primary">{N} Captures</span>
            </span>
            <span className="hidden sm:inline text-xs text-muted-foreground">
              Drag to spin • Click photograph to expand
            </span>
          </div>

          {/* Interactive Navigation Controls */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-card/80 border border-border/80 backdrop-blur-md shadow-xs">
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
            "relative w-full h-[520px] sm:h-[560px] grid place-items-center overflow-hidden touch-none",
            isDragging ? "cursor-grabbing" : "cursor-grab",
          )}
          style={{
            perspective: "45em",
            maskImage:
              "linear-gradient(90deg, transparent 0%, #000 15%, #000 85%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0%, #000 15%, #000 85%, transparent 100%)",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Cylinder Ring Container */}
          <div
            ref={cylinderRef}
            className={cn(
              "grid place-items-center [transform-style:preserve-3d] will-change-transform",
              containerClassName,
            )}
            style={{
              ...customStyle,
            }}
          >
            {images.map((img, i) => {
              const isCurrentFront = i === activeCardIndex;

              return (
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
                    "border border-white/20 shadow-2xl shadow-black/70",
                    "transition-all duration-300 transform-gpu",
                    isCurrentFront
                      ? "ring-2 ring-primary/80 ring-offset-2 ring-offset-background/40"
                      : "opacity-95 hover:opacity-100 hover:ring-1 hover:ring-white/60",
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
                    loading={i < 8 ? "eager" : "lazy"}
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
                  <div className="absolute bottom-0 inset-x-0 p-3.5 text-white flex flex-col justify-end gap-1">
                    {img.destinationName && (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-primary-foreground/95 bg-white/20 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full w-fit max-w-[90%] truncate">
                        <MapPin className="h-3 w-3 shrink-0 text-white" />
                        <span className="truncate">
                          {img.destinationName}
                          {img.destinationCountry ? `, ${img.destinationCountry}` : ""}
                        </span>
                      </div>
                    )}

                    {img.caption && (
                      <p className="text-[11px] font-medium text-white/90 line-clamp-2 leading-snug drop-shadow-sm">
                        {img.caption}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom subtle indicator */}
        <div className="mt-2 text-center">
          <span className="text-[11px] text-muted-foreground/70 font-mono">
            {activeCardIndex + 1} of {N} captures • Focus and use Arrow keys to rotate
          </span>
        </div>
      </div>
    );
  },
);

CylinderCarousel.displayName = "CylinderCarousel";
