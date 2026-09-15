import { useState } from "react";
import { Plane, ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FlightData } from "@/lib/catalog.functions";
import { formatFlightDuration, formatFlightTime, formatPrice } from "@/lib/flight-utils";
import { getAirlineLogo } from "@/lib/airline-logos";

export interface FlightCardProps {
  flight: FlightData;
  passengers?: number;
  dealBadge?: string | null;
  onSelect: (flight: FlightData) => void;
}

export function FlightCard({ flight, passengers = 1, dealBadge, onSelect }: FlightCardProps) {
  const isSoldOut = flight.seats_available <= 0;
  const isLowSeats = flight.seats_available > 0 && flight.seats_available <= 10;
  const departureFormatted = formatFlightTime(flight.departure_time);
  const arrivalFormatted = formatFlightTime(flight.arrival_time);
  const durationFormatted = formatFlightDuration(flight.duration_minutes);
  const airlineFirstLetter = (flight.airline || "").trim().charAt(0).toUpperCase();
  const travelClassLabel = flight.class.charAt(0).toUpperCase() + flight.class.slice(1);
  const stopsCount = (flight as { stops?: number }).stops ?? 0;
  const logo = getAirlineLogo(flight.airline);
  const [logoError, setLogoError] = useState(false);

  return (
    <article
      className={`card-lift card-edge-light group relative rounded-2xl border bg-card p-4 sm:p-5 shadow-card hover:shadow-card-hover transition-all duration-300 ${
        isSoldOut
          ? "border-border/50 opacity-70 grayscale-[25%]"
          : "border-border/60 hover:border-secondary/40"
      }`}
    >
      {/* ============================================================ */}
      {/* DESKTOP & TABLET LAYOUT (>=768px): Single Horizontal Row     */}
      {/* ============================================================ */}
      <div className="hidden md:flex md:items-center md:justify-between md:gap-3 lg:gap-5">
        {/* ZONE 1 — AIRLINE IDENTITY (~200px) */}
        <div className="w-[170px] lg:w-[200px] shrink-0 flex items-center gap-3">
          {/* Brand mark */}
          {logo && !logoError ? (
            <img
              src={logo}
              alt={flight.airline}
              loading="lazy"
              className="h-10 w-10 rounded-xl object-contain bg-white p-1.5 border border-border/60 select-none shrink-0"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-semibold text-primary text-base select-none border border-primary/10"
              aria-hidden="true"
            >
              {airlineFirstLetter || <Plane className="h-5 w-5 text-primary" aria-hidden="true" />}
            </div>
          )}

          {/* Airline metadata */}
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground text-sm truncate" title={flight.airline}>
              {flight.airline}
            </p>
            <p className="text-xs text-muted-foreground">{flight.flight_number}</p>
            <span className="hidden lg:inline-block text-[11px] bg-muted text-muted-foreground font-medium rounded-full px-2 py-0.5 mt-1">
              {travelClassLabel}
            </span>
          </div>
        </div>

        {/* Subtle Vertical Divider */}
        <div className="w-px h-12 bg-border/60 shrink-0" aria-hidden="true" />

        {/* ZONES 2, 3, 4 — ROUTE JOURNEY (Departure | Route Line | Arrival) */}
        <div className="flex-1 flex items-center justify-between px-2 lg:px-6 max-w-[480px] mx-auto">
          {/* ZONE 2 — DEPARTURE */}
          <div className="text-left">
            <p className="text-sm lg:text-base font-semibold text-foreground">
              {departureFormatted}
            </p>
            <p className="font-display text-xl lg:text-3xl font-bold tracking-tight text-foreground mt-0.5">
              {flight.origin_code}
            </p>
            <p
              className="text-xs text-muted-foreground truncate max-w-[90px] lg:max-w-[120px]"
              title={flight.origin_city}
            >
              {flight.origin_city}
            </p>
          </div>

          {/* ZONE 3 — ROUTE */}
          <div className="flex flex-col items-center justify-center text-center px-2 min-w-[110px] lg:min-w-[140px]">
            {/* Duration */}
            <span className="text-xs font-medium text-muted-foreground mb-1">
              {durationFormatted}
            </span>

            {/* Horizontal dashed line with centered plane icon */}
            <div className="relative flex w-full max-w-[110px] lg:max-w-[140px] items-center justify-center my-0.5">
              <div className="w-full border-t border-dashed border-border/80" />
              <div className="absolute flex h-5 w-5 items-center justify-center rounded-full bg-card border border-border/60 text-muted-foreground shadow-2xs">
                <Plane className="h-2.5 w-2.5 rotate-90 text-secondary" aria-hidden="true" />
              </div>
            </div>

            {/* Stops badge */}
            <div className="mt-1">
              {stopsCount === 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary shrink-0 animate-pulse" />
                  Non Stop
                </span>
              ) : stopsCount === 1 ? (
                <span className="text-[11px] font-medium text-muted-foreground">1 Stop</span>
              ) : (
                <span className="text-[11px] font-medium text-muted-foreground">
                  {stopsCount}+ Stops
                </span>
              )}
            </div>
          </div>

          {/* ZONE 4 — ARRIVAL */}
          <div className="text-right">
            <p className="text-sm lg:text-base font-semibold text-foreground">{arrivalFormatted}</p>
            <p className="font-display text-xl lg:text-3xl font-bold tracking-tight text-foreground mt-0.5">
              {flight.destination_code}
            </p>
            <p
              className="text-xs text-muted-foreground truncate max-w-[90px] lg:max-w-[120px] text-right ml-auto"
              title={flight.destination_city}
            >
              {flight.destination_city}
            </p>
          </div>
        </div>

        {/* Subtle Vertical Divider */}
        <div className="w-px h-12 bg-border/60 shrink-0" aria-hidden="true" />

        {/* ZONE 5 — FARE & CTA (~200px, right-aligned) */}
        <div className="w-[180px] lg:w-[210px] shrink-0 flex flex-col items-end justify-center gap-1.5">
          {/* Badge Pill or Low Seats notice */}
          {dealBadge ? (
            <span className="bg-secondary/10 text-secondary border border-secondary/20 text-[11px] font-semibold rounded-full px-2.5 py-0.5">
              {dealBadge}
            </span>
          ) : isLowSeats && !isSoldOut ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
              <Users className="h-3 w-3" />
              {flight.seats_available} seats left
            </span>
          ) : null}

          {/* Price */}
          <div className="text-right">
            <div className="font-display text-2xl lg:text-3xl font-bold text-foreground leading-none">
              {formatPrice(flight.price)}
            </div>
            <span className="text-xs text-muted-foreground block mt-0.5">per person</span>
            {passengers > 1 ? (
              <span className="text-[10px] text-muted-foreground block">
                Total: {formatPrice(flight.price * passengers)} ({passengers}p)
              </span>
            ) : null}
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => onSelect(flight)}
            disabled={isSoldOut}
            className={`cta-shine relative rounded-full px-5 sm:px-6 py-2 text-xs sm:text-sm font-semibold shadow-md transition-all active:scale-[0.97] ${
              isSoldOut
                ? "bg-muted text-muted-foreground cursor-not-allowed border border-border/50"
                : "bg-accent text-accent-foreground hover:bg-accent/90 shadow-accent/20 hover:shadow-lg"
            }`}
            aria-label={
              isSoldOut
                ? `Flight ${flight.flight_number} is sold out`
                : `Book flight ${flight.flight_number} from ${flight.origin_city} to ${flight.destination_city} for ${formatPrice(flight.price)} per person`
            }
          >
            {isSoldOut ? (
              "Sold Out"
            ) : (
              <span className="inline-flex items-center gap-1.5">
                Book Now
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE LAYOUT (<768px): Stacked 3 Rows                       */}
      {/* ============================================================ */}
      <div className="md:hidden space-y-3">
        {/* (a) Airline Header Row: mark + name + flight number, badge right */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {logo && !logoError ? (
              <img
                src={logo}
                alt={flight.airline}
                loading="lazy"
                className="h-10 w-10 rounded-xl object-contain bg-white p-1.5 border border-border/60 select-none shrink-0"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-semibold text-primary text-sm select-none border border-primary/10"
                aria-hidden="true"
              >
                {airlineFirstLetter || (
                  <Plane className="h-4 w-4 text-primary" aria-hidden="true" />
                )}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-foreground truncate">{flight.airline}</p>
                <span className="text-[10px] bg-muted text-muted-foreground font-medium rounded-full px-2 py-0.5 shrink-0">
                  {travelClassLabel}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{flight.flight_number}</p>
            </div>
          </div>

          {dealBadge ? (
            <span className="bg-secondary/10 text-secondary border border-secondary/20 text-[11px] font-semibold rounded-full px-2.5 py-1 shrink-0">
              {dealBadge}
            </span>
          ) : isLowSeats && !isSoldOut ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 shrink-0">
              <Users className="h-3 w-3" />
              {flight.seats_available} left
            </span>
          ) : null}
        </div>

        {/* (b) Times Row: departure | route line | arrival */}
        <div className="grid grid-cols-12 items-center gap-2 py-2.5 px-3 rounded-xl bg-muted/30 border border-border/40">
          {/* Departure */}
          <div className="col-span-4 text-left">
            <p className="text-xs font-semibold text-foreground">{departureFormatted}</p>
            <p className="font-display text-xl font-bold tracking-tight text-foreground mt-0.5">
              {flight.origin_code}
            </p>
            <p className="text-[11px] text-muted-foreground truncate" title={flight.origin_city}>
              {flight.origin_city}
            </p>
          </div>

          {/* Route line */}
          <div className="col-span-4 flex flex-col items-center justify-center text-center px-1">
            <span className="text-[10px] font-medium text-muted-foreground">
              {durationFormatted}
            </span>
            <div className="relative flex w-full max-w-[80px] items-center justify-center my-1">
              <div className="w-full border-t border-dashed border-border/80" />
              <div className="absolute flex h-4 w-4 items-center justify-center rounded-full bg-card border border-border/60 text-muted-foreground shadow-2xs">
                <Plane className="h-2 w-2 rotate-90 text-secondary" aria-hidden="true" />
              </div>
            </div>
            {stopsCount === 0 ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-secondary">
                <span className="h-1 w-1 rounded-full bg-secondary shrink-0 animate-pulse" />
                Non Stop
              </span>
            ) : (
              <span className="text-[10px] font-medium text-muted-foreground">
                {stopsCount} Stop
              </span>
            )}
          </div>

          {/* Arrival */}
          <div className="col-span-4 text-right">
            <p className="text-xs font-semibold text-foreground">{arrivalFormatted}</p>
            <p className="font-display text-xl font-bold tracking-tight text-foreground mt-0.5">
              {flight.destination_code}
            </p>
            <p
              className="text-[11px] text-muted-foreground truncate text-right ml-auto"
              title={flight.destination_city}
            >
              {flight.destination_city}
            </p>
          </div>
        </div>

        {/* (c) Footer: price left + Book Now right */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="text-left">
            <div className="font-display text-xl sm:text-2xl font-bold text-foreground leading-tight">
              {formatPrice(flight.price)}
            </div>
            <span className="text-xs text-muted-foreground block -mt-0.5">per person</span>
            {passengers > 1 ? (
              <span className="text-[10px] text-muted-foreground block">
                Total: {formatPrice(flight.price * passengers)} ({passengers}p)
              </span>
            ) : null}
          </div>

          <Button
            onClick={() => onSelect(flight)}
            disabled={isSoldOut}
            className={`cta-shine relative rounded-full px-5 py-2 text-xs font-semibold shadow-md transition-all active:scale-[0.97] ${
              isSoldOut
                ? "bg-muted text-muted-foreground cursor-not-allowed border border-border/50"
                : "bg-accent text-accent-foreground hover:bg-accent/90 shadow-accent/20 hover:shadow-lg"
            }`}
            aria-label={
              isSoldOut
                ? `Flight ${flight.flight_number} is sold out`
                : `Book flight ${flight.flight_number} from ${flight.origin_city} to ${flight.destination_city} for ${formatPrice(flight.price)} per person`
            }
          >
            {isSoldOut ? (
              "Sold Out"
            ) : (
              <span className="inline-flex items-center gap-1.5">
                Book Now
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
