import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import "./theme-switch.css";

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
  id?: string;
}

export function AnimatedThemeToggler({
  className,
  id = "theme-toggle-switch",
}: AnimatedThemeTogglerProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const labelRef = useRef<HTMLLabelElement>(null);

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

    const label = labelRef.current;
    if (!label) {
      applyTheme();
      return;
    }

    const rect = label.getBoundingClientRect();
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
    <label
      ref={labelRef}
      htmlFor={id}
      className={cn("uiverse-switch", className)}
      title={mounted ? (isDark ? "Switch to light theme" : "Switch to dark theme") : "Toggle theme"}
    >
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={mounted ? !isDark : true}
        onChange={toggleTheme}
        aria-checked={!isDark}
        aria-label={
          mounted ? (isDark ? "Switch to light theme" : "Switch to dark theme") : "Toggle theme"
        }
      />
      <span className="slider">
        <span className="star star_1" aria-hidden="true" />
        <span className="star star_2" aria-hidden="true" />
        <span className="star star_3" aria-hidden="true" />
        <svg viewBox="0 0 16 16" className="cloud_1 cloud" aria-hidden="true">
          <path
            transform="matrix(0.77976 0 0 0.78395 -299.99 -418.63)"
            fill="#fff"
            d="m391.84 540.91c-.421-.329-.949-.524-1.523-.524-1.351 0-2.451 1.084-2.485 2.435-1.395.526-2.388 1.88-2.388 3.466 0 1.874 1.385 3.423 3.182 3.667v.034h12.73v-.006c1.775-.104 3.182-1.584 3.182-3.395 0-1.747-1.309-3.186-2.994-3.379.007-.106.011-.214.011-.322 0-2.707-2.271-4.901-5.072-4.901-2.073 0-3.856 1.202-4.643 2.925"
          />
        </svg>
      </span>
    </label>
  );
}

export { AnimatedThemeToggler as ThemeSwitch };
