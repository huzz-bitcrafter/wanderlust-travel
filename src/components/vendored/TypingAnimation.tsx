import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

// Isomorphic layout effect to prevent SSR warnings
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
  const hasStartedRef = useRef<boolean>(false);

  // Isomorphic layout effect: prepare client typing state before first paint
  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    if (!hasStartedRef.current) {
      // Clear displayed text on client mount to begin typing
      setDisplayedText("");
      setIsTyping(true);
      setIsComplete(false);
    }
  }, [prefersReducedMotion, text]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    if (!text || hasStartedRef.current) return;
    hasStartedRef.current = true;

    let isCancelled = false;
    let typeTimer: ReturnType<typeof setTimeout> | null = null;
    let charIndex = 0;

    const startTyping = () => {
      if (isCancelled) return;

      // Calculate per-character interval to match target total duration
      // For ~128 chars over 2800ms, each char is ~22ms
      const charDelay = Math.max(16, Math.round(duration / text.length));

      const typeNextChar = () => {
        if (isCancelled) return;
        if (charIndex <= text.length) {
          setDisplayedText(text.slice(0, charIndex));
          charIndex++;
          if (charIndex <= text.length) {
            typeTimer = setTimeout(typeNextChar, charDelay);
          } else {
            setIsComplete(true);
            setIsTyping(false);
          }
        }
      };

      typeTimer = setTimeout(typeNextChar, charDelay);
    };

    // Font safety: wait until fonts are ready (specifically Alga)
    const waitForFontAndDelay = async () => {
      try {
        if (typeof document !== "undefined" && document.fonts) {
          await document.fonts.ready;
          // Check if specific font is ready, or proceed after ready
          if (fontFamily && !document.fonts.check(`italic 16px "${fontFamily}"`)) {
            // Small extra buffer for font face readiness
            await new Promise((r) => setTimeout(r, 60));
          }
        }
      } catch {
        // Fallback gracefully if document.fonts is not supported
      }

      if (!isCancelled) {
        typeTimer = setTimeout(startTyping, delay);
      }
    };

    waitForFontAndDelay();

    return () => {
      isCancelled = true;
      if (typeTimer) clearTimeout(typeTimer);
    };
  }, [text, duration, delay, prefersReducedMotion, fontFamily]);

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
