import { CalendarRange, LifeBuoy, Route, ShieldCheck } from "lucide-react";
import { SectionReveal } from "@/components/shared/SectionReveal";

const REASONS = [
  {
    icon: Route,
    title: "One trip, one place",
    body: "Tours, hotels and flights booked side by side — no more juggling six tabs.",
  },
  {
    icon: CalendarRange,
    title: "Day-by-day planning",
    body: "Build an itinerary with times, activities and notes, and edit it as plans shift.",
  },
  {
    icon: ShieldCheck,
    title: "Honest reviews",
    body: "Ratings come from travellers who actually booked, moderated by our team.",
  },
  {
    icon: LifeBuoy,
    title: "Real people on call",
    body: "Local operators and a support team that answers in hours, not days.",
  },
];

export function WhyUs() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <SectionReveal className="max-w-2xl">
        <p className="eyebrow text-secondary">Why Wanderlust</p>
        <h2 className="mt-2 text-3xl sm:text-4xl">Planning that stays out of your way</h2>
      </SectionReveal>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {REASONS.map(({ icon: Icon, title, body }, index) => (
          <SectionReveal key={title} delay={index * 0.08} className="h-full">
            <div className="h-full rounded-xl bg-card p-6 shadow-card border border-border/60 card-lift transition-all duration-200 hover:shadow-card-hover hover:border-border">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-lg">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          </SectionReveal>
        ))}
      </div>
    </section>
  );
}
