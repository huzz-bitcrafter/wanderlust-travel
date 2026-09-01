import { Plane, Clock, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FlightData } from "@/lib/catalog.functions";

export function formatFlightDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

export function formatFlightTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC", // Display UTC as stored in DB timestamps for consistent rendering
    });
  } catch {
    return isoString;
  }
}

export function formatFlightDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return isoString;
  }
}

export function FlightCard({
  flight,
  passengers = 1,
  onSelect,
}: {
  flight: FlightData;
  passengers?: number;
  onSelect: (flight: FlightData) => void;
}) {
  const isSoldOut = flight.seats_available <= 0;
  const isLowSeats = flight.seats_available > 0 && flight.seats_available <= 15;
  const departureFormatted = formatFlightTime(flight.departure_time);
  const arrivalFormatted = formatFlightTime(flight.arrival_time);
  const dateFormatted = formatFlightDate(flight.departure_time);
  const durationFormatted = formatFlightDuration(flight.duration_minutes);

  const travelClassLabel = flight.class.charAt(0).toUpperCase() + flight.class.slice(1);

  return (
    <div
      className={`card-lift group relative flex flex-col justify-between rounded-2xl border bg-card p-5 sm:p-6 transition-all ${
        isSoldOut
          ? "border-border/40 opacity-75 grayscale-[20%]"
          : "border-border/70 hover:border-secondary/50 shadow-sm hover:shadow-md"
      }`}
    >
      {/* Top Meta: Airline, Flight Number & Class Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary font-bold text-xs">
            <Plane className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground">{flight.airline}</h4>
            <p className="text-xs text-muted-foreground font-mono">{flight.flight_number}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="rounded-full border-border/80 text-[11px] font-medium capitalize"
          >
            {travelClassLabel} Class
          </Badge>
          <span className="text-xs text-muted-foreground hidden sm:inline">{dateFormatted}</span>
        </div>
      </div>

      {/* Middle Grid: Departure ➔ Flight Path ➔ Arrival */}
      <div className="my-5 grid grid-cols-12 items-center gap-2 sm:gap-4">
        {/* Origin */}
        <div className="col-span-4 text-left">
          <p className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            {flight.origin_code}
          </p>
          <p className="text-sm font-semibold text-foreground/90">{departureFormatted}</p>
          <p className="text-xs text-muted-foreground truncate">{flight.origin_city}</p>
        </div>

        {/* Flight Route Indicator / Duration */}
        <div className="col-span-4 flex flex-col items-center justify-center px-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Clock className="h-3 w-3" />
            <span>{durationFormatted}</span>
          </div>

          <div className="relative flex w-full items-center justify-center">
            <div className="h-[2px] w-full bg-border/80" />
            <div className="absolute flex h-6 w-6 items-center justify-center rounded-full bg-secondary/10 text-secondary border border-border">
              <Plane className="h-3 w-3 rotate-90" aria-hidden="true" />
            </div>
          </div>

          <span className="mt-1 text-[11px] font-medium text-secondary">Non-stop Direct</span>
        </div>

        {/* Destination */}
        <div className="col-span-4 text-right">
          <p className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            {flight.destination_code}
          </p>
          <p className="text-sm font-semibold text-foreground/90">{arrivalFormatted}</p>
          <p className="text-xs text-muted-foreground truncate">{flight.destination_city}</p>
        </div>
      </div>

      {/* Bottom Row: Availability, Price & CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/50 pt-4 mt-auto">
        {/* Seats left indicator */}
        <div>
          {isSoldOut ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
              Sold Out
            </span>
          ) : isLowSeats ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
              <Users className="h-3.5 w-3.5" />
              Only {flight.seats_available} seats left!
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
              {flight.seats_available} seats available
            </span>
          )}
        </div>

        {/* Price & Action */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="font-display text-2xl sm:text-3xl font-bold text-accent">
              ${flight.price.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground block">
              / passenger{passengers > 1 ? ` (×${passengers})` : ""}
            </span>
          </div>

          <Button
            onClick={() => onSelect(flight)}
            disabled={isSoldOut}
            className={`rounded-full px-5 text-xs font-semibold shadow-sm transition-all ${
              isSoldOut
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
            aria-label={
              isSoldOut
                ? `Flight ${flight.flight_number} is sold out`
                : `Select flight ${flight.flight_number} from ${flight.origin_city} to ${flight.destination_city}`
            }
          >
            {isSoldOut ? "Sold Out" : "Select Flight"}
          </Button>
        </div>
      </div>
    </div>
  );
}
