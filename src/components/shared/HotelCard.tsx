import { Link } from "@tanstack/react-router";
import { MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { HotelCardData } from "@/lib/catalog.functions";

export function HotelCard({ hotel }: { hotel: HotelCardData }) {
  const destinationText = hotel.destination
    ? `${hotel.destination.name}, ${hotel.destination.country}`
    : "World Destination";

  return (
    <Link
      to="/hotels/$id"
      params={{ id: hotel.id }}
      className="card-lift group flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card transition-all"
      aria-label={`${hotel.name} — ${destinationText}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {hotel.image_url ? (
          <img
            src={hotel.image_url}
            alt={hotel.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
            No photo
          </div>
        )}

        {/* Star Rating Badge Overlay */}
        <div className="absolute left-3.5 top-3.5 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-0.5" aria-label={`${hotel.star_rating} stars`}>
            {Array.from({ length: hotel.star_rating }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-accent text-accent" />
            ))}
          </div>
          <span className="ml-1 text-[11px] font-medium text-white/90">{hotel.star_rating}.0</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="inline-flex items-center gap-1 text-xs font-medium text-secondary">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{destinationText}</span>
          </p>
          {hotel.address ? (
            <span className="truncate text-xs text-muted-foreground">{hotel.address}</span>
          ) : null}
        </div>

        <h3 className="mt-2 font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
          {hotel.name}
        </h3>

        {hotel.description ? (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{hotel.description}</p>
        ) : null}

        {/* Top Amenity Badges */}
        {hotel.amenities && hotel.amenities.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {hotel.amenities.slice(0, 3).map((amenity, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="rounded-full bg-muted text-muted-foreground text-[11px] font-normal"
              >
                {amenity}
              </Badge>
            ))}
            {hotel.amenities.length > 3 ? (
              <span className="text-[11px] text-muted-foreground font-medium">
                +{hotel.amenities.length - 3} more
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex items-baseline justify-between border-t border-border/60 pt-4 mt-5">
          <span className="text-xs text-muted-foreground">Price per night</span>
          <div>
            <span className="font-display text-2xl font-bold text-accent">
              ${hotel.price_per_night.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground ml-1">/ night</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
