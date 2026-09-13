import { useEffect, useRef, useState, useMemo } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface TypingAnimationProps {
  children?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Total reveal duration in ms (default: 2800ms) */
  duration?: number;
  /** Initial delay before typing starts in ms (default: 400ms) */
  delay?: number;
  /** HTML element type (default: "p") */
  as?: "p" | "span" | "div" | "h1" | "h2" | "h3";
  /** Whether to show blinking cursor while typing */
  showCursor?: boolean;
  /** Font family requirement to wait for before starting typing */
  fontFamily?: string;
}

export function TypingAnimation({
  children = "",
  className,
  style,
  duration = 2800,
  delay = 400,
  as: Component = "p",
  showCursor = true,
  fontFamily = "Alga",
}: TypingAnimationProps) {
  const prefersReducedMotion = useReducedMotion();
  const text = useMemo(() => children || "", [children]);

  // SSR initializes with full text for SEO & no-JS
  const [displayedText, setDisplayedText] = useState<string>(text);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  // References to keep animation state stable across re-renders
  const animStateRef = useRef<{
    hasStarted: boolean;
    timer: ReturnType<typeof setTimeout> | null;
    isUnmounted: boolean;
  }>({
    hasStarted: false,
    timer: null,
    isUnmounted: false,
  });

  useEffect(() => {
    const state = animStateRef.current;
    state.isUnmounted = false;

    if (prefersReducedMotion) {
      if (state.timer) clearTimeout(state.timer);
      setDisplayedText(text);
      setIsTyping(false);
      setIsComplete(true);
      return;
    }

    if (!text || state.hasStarted) return;
    state.hasStarted = true;

    // Reset displayed text on client mount to start typing cleanly
    setDisplayedText("");
    setIsTyping(true);
    setIsComplete(false);

    let charIndex = 0;
    const charDelay = Math.max(16, Math.round(duration / text.length));

    const step = () => {
      if (state.isUnmounted) return;

      charIndex++;
      if (charIndex <= text.length) {
        setDisplayedText(text.slice(0, charIndex));
        if (charIndex === text.length) {
          setIsComplete(true);
          setIsTyping(false);
        } else {
          state.timer = setTimeout(step, charDelay);
        }
      }
    };

    const runAnimation = async () => {
      try {
        if (typeof document !== "undefined" && document.fonts) {
          // Race document.fonts.ready with 2000ms safety timeout so a stalled font load can't kill animation
          await Promise.race([
            document.fonts.ready,
            new Promise((resolve) => setTimeout(resolve, 2000)),
          ]);

          if (fontFamily && !document.fonts.check(`italic 16px "${fontFamily}"`)) {
            // Small extra buffer for font face readiness
            await new Promise((resolve) => setTimeout(resolve, 60));
          }
        }
      } catch {
        // Fallback gracefully
      }

      if (!state.isUnmounted) {
        state.timer = setTimeout(step, delay);
      }
    };

    runAnimation();
  }, [text, duration, delay, prefersReducedMotion, fontFamily]);

  useEffect(() => {
    const state = animStateRef.current;
    return () => {
      // Component unmount cleanup
      state.isUnmounted = true;
      if (state.timer) {
        clearTimeout(state.timer);
      }
    };
  }, []);

  return (
    <Component className={cn("inline-block", className)} style={style} suppressHydrationWarning>
      {displayedText}
      {showCursor && isTyping && !isComplete && (
        <span
          className="inline-block animate-pulse font-normal ml-0.5 text-accent opacity-80 select-none"
          aria-hidden="true"
        >
          |
        </span>
      )}
    </Component>
  );
}
