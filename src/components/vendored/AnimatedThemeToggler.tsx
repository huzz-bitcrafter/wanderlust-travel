import { useCallback, useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Document {
    startViewTransition?: (callback: () => Promise<void> | void) => {
      ready: Promise<void>;
      finished: Promise<void>;
      updateCallbackDone: Promise<void>;
    };
  }
}

interface AnimatedThemeTogglerProps {
  className?: string;
}

export function AnimatedThemeToggler({ className }: AnimatedThemeTogglerProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = useCallback(async () => {
    const nextIsDark = !document.documentElement.classList.contains("dark");

    const applyTheme = () => {
      if (nextIsDark) {
        document.documentElement.classList.add("dark");
        try {
          localStorage.setItem("theme", "dark");
        } catch {
          // Ignore storage exceptions in sandboxed or private contexts
        }
      } else {
        document.documentElement.classList.remove("dark");
        try {
          localStorage.setItem("theme", "light");
        } catch {
          // Ignore storage exceptions in sandboxed or private contexts
        }
      }
      setIsDark(nextIsDark);
    };

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!document.startViewTransition || prefersReducedMotion) {
      applyTheme();
      return;
    }

    const button = buttonRef.current;
    if (!button) {
      applyTheme();
      return;
    }

    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = document.startViewTransition(() => {
      applyTheme();
    });

    try {
      await transition.ready;

      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
        },
        {
          duration: 450,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    } catch {
      // Graceful fallback if view transition execution is interrupted
    }
  }, []);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggleTheme}
      aria-label={
        mounted ? (isDark ? "Switch to light theme" : "Switch to dark theme") : "Toggle theme"
      }
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      <Sun
        className={cn(
          "h-4 w-4 transition-all duration-300",
          isDark ? "scale-0 rotate-90 opacity-0 absolute" : "scale-100 rotate-0 opacity-100",
        )}
      />
      <Moon
        className={cn(
          "h-4 w-4 transition-all duration-300",
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0 absolute",
        )}
      />
    </button>
  );
}
