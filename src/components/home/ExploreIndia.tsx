import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DestinationCard } from "@/components/shared/DestinationCard";
import { SectionReveal } from "@/components/shared/SectionReveal";
import type { DestinationCardData } from "@/lib/catalog.functions";

export function ExploreIndia({
  destinations,
  isLoading,
}: {
  destinations: DestinationCardData[];
  isLoading?: boolean;
}) {
  return (
    <section className="bg-muted/40 py-16 sm:py-24">
      <SectionReveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-secondary">Discover India</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">From the Himalayas to the backwaters</h2>
          </div>
          <Link
            to="/destinations"
            search={{ country: "India" }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
          >
            Browse all India destinations
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl bg-card">
                <Skeleton className="aspect-[16/10] w-full" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <p className="mt-10 rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            No Indian destinations found — check back soon.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        )}
      </SectionReveal>
    </section>
  );
}
