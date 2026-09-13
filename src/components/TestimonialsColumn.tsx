import * as React from "react";
import { useReducedMotion } from "motion/react";
import { Rating } from "@/components/shared/Rating";
import { cn } from "@/lib/utils";
import type { HomeTestimonial } from "@/lib/home-content";

export interface TestimonialsColumnProps {
  testimonials: HomeTestimonial[];
  duration?: number;
  className?: string;
}

export function TestimonialsColumn({
  testimonials,
  duration = 15,
  className,
}: TestimonialsColumnProps) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const animRef = React.useRef<Animation | null>(null);

  React.useEffect(() => {
    if (shouldReduceMotion || !innerRef.current) return;

    // WAAPI hardware-accelerated continuous translateY marquee
    const anim = innerRef.current.animate(
      [{ transform: "translateY(0%)" }, { transform: "translateY(-50%)" }],
      {
        duration: (duration || 10) * 1000,
        iterations: Infinity,
        easing: "linear",
      },
    );
    animRef.current = anim;

    const container = containerRef.current;
    if (container) {
      const onEnter = () => {
        if (anim.playState === "running") anim.pause();
      };
      const onLeave = () => {
        if (anim.playState === "paused") anim.play();
      };

      container.addEventListener("mouseenter", onEnter);
      container.addEventListener("mouseleave", onLeave);
      container.addEventListener("focusin", onEnter);
      container.addEventListener("focusout", onLeave);

      return () => {
        container.removeEventListener("mouseenter", onEnter);
        container.removeEventListener("mouseleave", onLeave);
        container.removeEventListener("focusin", onEnter);
        container.removeEventListener("focusout", onLeave);
        anim.cancel();
        animRef.current = null;
      };
    }

    return () => {
      anim.cancel();
      animRef.current = null;
    };
  }, [duration, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        {testimonials.map((item) => (
          <TestimonialCard key={item.id} testimonial={item} />
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("overflow-hidden", className)}>
      <div ref={innerRef} style={{ willChange: "transform" }} className="flex flex-col gap-6 pb-6">
        {[...new Array(2)].fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {testimonials.map((testimonial, i) => (
              <TestimonialCard key={`${index}-${testimonial.id || i}`} testimonial={testimonial} />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export function TestimonialCard({
  testimonial,
  className,
}: {
  testimonial: HomeTestimonial;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "rounded-xl bg-card p-6 shadow-card border border-border/60 card-lift transition-all duration-200 hover:shadow-card-hover hover:border-border",
        className,
      )}
    >
      <Rating value={testimonial.rating} />
      <blockquote className="mt-3.5 text-sm leading-relaxed text-foreground">
        “{testimonial.quote}”
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-border/60 pt-4">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          width={40}
          height={40}
          loading="lazy"
          className="h-10 w-10 rounded-full object-cover border border-border/60"
        />
        <div className="flex flex-col min-w-0">
          <span className="truncate text-sm font-semibold text-foreground">{testimonial.name}</span>
          <span className="truncate text-xs text-muted-foreground">{testimonial.trip}</span>
        </div>
      </figcaption>
    </figure>
  );
}
