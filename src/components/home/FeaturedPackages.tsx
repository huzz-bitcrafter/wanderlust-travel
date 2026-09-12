import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PackageCard } from "@/components/shared/PackageCard";
import { SectionReveal } from "@/components/shared/SectionReveal";
import type { PackageCardData } from "@/lib/catalog.functions";

export function FeaturedPackages({
  packages,
  isLoading,
}: {
  packages: PackageCardData[];
  isLoading?: boolean;
}) {
  return (
    <section className="bg-muted/60 py-16 sm:py-24">
      <SectionReveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-secondary">Tour packages</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">Trips designed end to end</h2>
          </div>
          <Link
            to="/packages"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
          >
            See all packages
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl bg-card">
                <Skeleton className="aspect-[16/10] w-full" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : packages.length === 0 ? (
          <p className="mt-10 rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            No packages published yet.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </SectionReveal>
    </section>
  );
}
