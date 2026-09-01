import { Link } from "@tanstack/react-router";
import { Clock, Users, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/shared/Rating";
import type { PackageCardData } from "@/lib/catalog.functions";

export function PackageCard({ pkg }: { pkg: PackageCardData }) {
  const destinationText = pkg.destination
    ? `${pkg.destination.name}, ${pkg.destination.country}`
    : "Multi-destination";

  return (
    <Link
      to="/packages/$slug"
      params={{ slug: pkg.slug }}
      className="card-lift group flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card transition-all"
      aria-label={`${pkg.title} — ${destinationText}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {pkg.image_url ? (
          <img
            src={pkg.image_url}
            alt={pkg.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
            No photo
          </div>
        )}
        <span className="absolute left-3.5 top-3.5 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold capitalize text-secondary-foreground shadow-sm">
          {pkg.difficulty}
        </span>
        {pkg.is_featured ? (
          <span className="absolute right-3.5 top-3.5 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground shadow-sm">
            Featured
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="inline-flex items-center gap-1 text-xs font-medium text-secondary">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{destinationText}</span>
          </p>
          <Rating value={4.8} />
        </div>

        <h3 className="mt-2 font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
          {pkg.title}
        </h3>

        {pkg.summary ? (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{pkg.summary}</p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-full bg-muted text-muted-foreground font-normal"
          >
            <Clock className="mr-1 h-3 w-3" aria-hidden="true" />
            {pkg.duration_days} {pkg.duration_days === 1 ? "day" : "days"}
          </Badge>
          <Badge
            variant="secondary"
            className="rounded-full bg-muted text-muted-foreground font-normal"
          >
            <Users className="mr-1 h-3 w-3" aria-hidden="true" />
            Small group
          </Badge>
        </div>

        <div className="mt-auto flex items-baseline justify-between border-t border-border/60 pt-4 mt-5">
          <span className="text-xs text-muted-foreground">From per person</span>
          <span className="font-display text-2xl font-bold text-accent">
            ${pkg.price_per_person.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
