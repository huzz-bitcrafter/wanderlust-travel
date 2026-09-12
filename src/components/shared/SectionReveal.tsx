import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section";
  id?: string;
}

export function SectionReveal({
  children,
  className,
  delay = 0,
  as = "div",
  id,
}: SectionRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const Component = as === "section" ? motion.section : motion.div;

  return (
    <Component
      id={id}
      className={className}
      data-reveal="true"
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "-20px" }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : {
              duration: 0.45,
              delay,
              ease: [0.16, 1, 0.3, 1], // critically damped, no overshoot
            }
      }
    >
      {children}
    </Component>
  );
}
