import { Plane, ArrowRight, CheckCircle2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FlightData } from "@/lib/catalog.functions";
import {
  formatFlightDuration,
  formatFlightTime,
  formatPrice,
  getFlightThumbnail,
  getAirlineBrand,
} from "@/lib/flight-utils";

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
  const thumbnail = getFlightThumbnail(flight);
  const brand = getAirlineBrand(flight.airline);

  const travelClassLabel = flight.class.charAt(0).toUpperCase() + flight.class.slice(1);

  return (
    <article
      className={`card-lift card-edge-light group relative flex flex-col md:flex-row items-stretch md:items-center justify-between rounded-2xl border bg-card p-4 sm:p-5 transition-all duration-300 ${
        isSoldOut
          ? "border-border/50 opacity-70 grayscale-[25%]"
          : "border-border/80 hover:border-secondary/40 shadow-card hover:shadow-card-hover"
      }`}
    >
      {/* ============================================================ */}
      {/* 1. Image Thumbnail (Left)                                     */}
      {/* ============================================================ */}
      <div className="relative h-44 sm:h-48 md:h-36 w-full md:w-48 lg:w-56 shrink-0 overflow-hidden rounded-xl bg-muted">
        <img
          src={thumbnail}
          alt={`${flight.airline} flight ${flight.flight_number}`}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        {/* Ambient vignette scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Anchored Pill Badge: "⭐ Best Deal" or "⭐ Lowest Price" */}
        {dealBadge ? (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-secondary/20 text-secondary backdrop-blur-md px-2.5 py-0.5 text-xs font-semibold shadow-xs border border-secondary/30">
            {dealBadge}
          </span>
        ) : null}

        {/* Seat warning overlay for low availability */}
        {isLowSeats && !isSoldOut ? (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/60 text-white backdrop-blur-xs px-2 py-0.5 text-[10px] font-medium">
            <Users className="h-3 w-3 text-accent" />
            {flight.seats_available} seats left
          </span>
        ) : null}
      </div>

      {/* ============================================================ */}
      {/* Middle Content Grid: Departure -> Route -> Arrival           */}
      {/* ============================================================ */}
      <div className="my-4 md:my-0 flex-1 grid grid-cols-12 items-center gap-2 sm:gap-4 px-1 md:px-5">
        {/* 2. Departure Block */}
        <div className="col-span-3 text-left">
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground">
            {departureFormatted}
          </p>
          <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-0.5">
            {flight.origin_code}
          </p>
          <p className="text-xs text-muted-foreground truncate" title={flight.origin_city}>
            {flight.origin_city}
          </p>
        </div>

        {/* 3. Route Journey Indicator (Center) */}
        <div className="col-span-6 flex flex-col items-center justify-center text-center px-1">
          {/* Flight Number & Duration */}
          <p className="text-xs font-semibold text-foreground tracking-wide">
            {flight.flight_number}
          </p>

          {/* Route path line with plane */}
          <div className="relative flex w-full max-w-[190px] items-center justify-center my-1.5">
            <div className="h-[1.5px] w-full bg-border" />
            <div className="absolute flex h-6 w-6 items-center justify-center rounded-full bg-card border border-border text-muted-foreground shadow-xs">
              <Plane className="h-3 w-3 rotate-90 text-secondary" aria-hidden="true" />
            </div>
          </div>

          <p className="text-[11px] font-medium text-muted-foreground">{durationFormatted}</p>

          {/* Bottom metadata: Airline logo & name, class, non-stop */}
          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
            {/* Airline */}
            <div className="flex items-center gap-1.5">
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white shrink-0"
                style={{ backgroundColor: brand.color }}
              >
                {brand.shortName}
              </span>
              <span className="font-semibold text-foreground truncate max-w-[90px] sm:max-w-none">
                {flight.airline}
              </span>
            </div>

            <span className="text-border hidden sm:inline">•</span>

            {/* Cabin Class */}
            <span className="text-muted-foreground hidden xs:inline">{travelClassLabel} Class</span>

            <span className="text-border hidden sm:inline">•</span>

            {/* Non-stop Badge */}
            <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400 text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Non Stop
            </span>
          </div>
        </div>

        {/* 4. Arrival Block */}
        <div className="col-span-3 text-right">
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground">
            {arrivalFormatted}
          </p>
          <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-0.5">
            {flight.destination_code}
          </p>
          <p className="text-xs text-muted-foreground truncate" title={flight.destination_city}>
            {flight.destination_city}
          </p>
        </div>
      </div>

      {/* Vertical separation rule for desktop */}
      <div className="hidden md:block w-px self-stretch bg-border/60 mx-2" aria-hidden="true" />

      {/* ============================================================ */}
      {/* 5. Price & Booking CTA (Right)                                */}
      {/* ============================================================ */}
      <div className="pt-3 md:pt-0 border-t md:border-t-0 border-border/60 flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 min-w-[135px]">
        <div className="text-left md:text-right">
          <div className="font-display text-2xl sm:text-3xl font-bold text-foreground">
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
          className={`cta-shine relative rounded-full px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold shadow-md transition-all active:scale-[0.97] ${
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
    </article>
  );
}
