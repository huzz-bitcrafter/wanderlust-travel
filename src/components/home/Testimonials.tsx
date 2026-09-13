import * as React from "react";
import { useReducedMotion } from "motion/react";
import { SectionReveal } from "@/components/shared/SectionReveal";
import { TestimonialsColumn, TestimonialCard } from "@/components/TestimonialsColumn";
import { HOME_TESTIMONIALS } from "@/lib/home-content";

export function Testimonials() {
  const shouldReduceMotion = useReducedMotion();

  const firstColumn = HOME_TESTIMONIALS.slice(0, 3);
  const secondColumn = HOME_TESTIMONIALS.slice(3, 6);
  const thirdColumn = HOME_TESTIMONIALS.slice(6, 9);

  return (
    <section className="bg-muted/60 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionReveal className="max-w-2xl">
          <p className="eyebrow text-secondary">Traveller stories</p>
          <h2 className="mt-2 text-3xl sm:text-4xl">Trips people came back raving about</h2>
        </SectionReveal>

        {shouldReduceMotion ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {HOME_TESTIMONIALS.map((item) => (
              <TestimonialCard key={item.id} testimonial={item} />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex justify-center gap-6 overflow-hidden max-h-[740px] [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]">
            <TestimonialsColumn
              testimonials={firstColumn}
              duration={15}
              className="w-full max-w-sm"
            />
            <TestimonialsColumn
              testimonials={secondColumn}
              duration={19}
              className="hidden md:block w-full max-w-sm"
            />
            <TestimonialsColumn
              testimonials={thirdColumn}
              duration={17}
              className="hidden lg:block w-full max-w-sm"
            />
          </div>
        )}
      </div>
    </section>
  );
}
