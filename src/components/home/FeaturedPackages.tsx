import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { PackageCardData } from "@/lib/catalog.functions";

export function PackageCard({ pkg }: { pkg: PackageCardData }) {
  return (
    <Link to="/packages" className="card-lift group block overflow-hidden rounded-xl bg-card">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {pkg.image_url ? (
          <img
            src={pkg.image_url}
            alt={pkg.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <span className="absolute left-4 top-4 rounded-full bg-secondary px-3 py-1 text-xs font-semibold capitalize text-secondary-foreground">
          {pkg.difficulty}
        </span>
      </div>
      <div className="p-5">
        <p className="text-xs text-muted-foreground">
          {pkg.destination
            ? `${pkg.destination.name}, ${pkg.destination.country}`
            : "Multi-country"}
        </p>
        <h3 className="mt-2 font-display text-xl">{pkg.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{pkg.summary}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full bg-muted text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" aria-hidden="true" />
            {pkg.duration_days} days
          </Badge>
          <Badge variant="secondary" className="rounded-full bg-muted text-muted-foreground">
            <Users className="mr-1 h-3 w-3" aria-hidden="true" />
            Small group
          </Badge>
        </div>
        <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">from</span>
          <span className="font-display text-2xl text-accent">
            ${pkg.price_per_person.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function FeaturedPackages({
  packages,
  isLoading,
}: {
  packages: PackageCardData[];
  isLoading?: boolean;
}) {
  return (
    <section className="bg-muted/60 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
      </div>
    </section>
  );
}
