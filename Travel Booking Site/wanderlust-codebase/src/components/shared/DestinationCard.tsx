import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { Rating } from "@/components/shared/Rating";
import type { DestinationCardData } from "@/lib/catalog.functions";

export function DestinationCard({ destination }: { destination: DestinationCardData }) {
  return (
    <Link
      to="/destinations/$slug"
      params={{ slug: destination.slug }}
      className="card-lift group block overflow-hidden rounded-xl bg-card border border-border/50"
      aria-label={`${destination.name}, ${destination.country}`}
    >
      <div className="aspect-[16/10] overflow-hidden bg-muted">
        {destination.hero_image ? (
          <img
            src={destination.hero_image}
            alt={`${destination.name}, ${destination.country}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary">
            <MapPin className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
            {destination.country}
          </p>
          {destination.continent ? (
            <span className="text-xs text-muted-foreground">{destination.continent}</span>
          ) : null}
        </div>
        <div className="mt-2 flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {destination.name}
          </h3>
          <Rating value={4.8} />
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {destination.short_description}
        </p>
      </div>
    </Link>
  );
}
