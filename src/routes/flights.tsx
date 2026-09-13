import { useState, useTransition } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  Plane,
  Search,
  X,
  RotateCcw,
  ArrowRightLeft,
  Calendar,
  Users,
  ArrowUpDown,
  Compass,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/layout/SiteLayout";
import { SectionReveal } from "@/components/shared/SectionReveal";
import {
  FlightCard,
  formatFlightDuration,
  formatFlightTime,
  formatFlightDate,
} from "@/components/shared/FlightCard";
import { BookingCTA } from "@/components/shared/BookingCTA";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  searchFlights,
  fetchFlightCities,
  type FlightData,
  type FlightsFilterParams,
} from "@/lib/catalog.functions";

const title = "Flight Search & Booking — Wanderlust";
const description =
  "Search direct and connected flights across world capitals and scenic island getaways. Book verified economy, business, and first-class fares.";

const flightsQueryOptions = (params: FlightsFilterParams) =>
  queryOptions({
    queryKey: [
      "flights",
      "search",
      params.origin ?? "All",
      params.destination ?? "All",
      params.date ?? "",
      params.travelClass ?? "all",
      params.sort ?? "price_asc",
    ],
    queryFn: () =>
      searchFlights({
        data: {
          origin: params.origin,
          destination: params.destination,
          date: params.date,
          travelClass: params.travelClass,
          sort: params.sort,
        },
      }),
  });

const flightCitiesQueryOptions = () =>
  queryOptions({
    queryKey: ["flights", "cities"],
    queryFn: () => fetchFlightCities(),
  });

export type FlightsSearch = {
  origin?: string;
  destination?: string;
  date?: string;
  travelClass?: "all" | "economy" | "business" | "first";
  passengers?: number;
  sort?: "price_asc" | "price_desc" | "duration_asc" | "departure_asc";
};

export const Route = createFileRoute("/flights")({
  validateSearch: (search: Record<string, unknown>): FlightsSearch => {
    const origin =
      typeof search.origin === "string" && search.origin !== "All" && search.origin.trim()
        ? search.origin.trim()
        : undefined;

    const destination =
      typeof search.destination === "string" &&
      search.destination !== "All" &&
      search.destination.trim()
        ? search.destination.trim()
        : undefined;

    const date =
      typeof search.date === "string" && search.date.trim() ? search.date.trim() : undefined;

    const validClasses = ["all", "economy", "business", "first"] as const;
    const travelClass =
      typeof search.travelClass === "string" &&
      validClasses.includes(search.travelClass as (typeof validClasses)[number])
        ? (search.travelClass as FlightsSearch["travelClass"])
        : undefined;

    const passengers = Number(search.passengers) > 0 ? Number(search.passengers) : 1;

    const validSorts = ["price_asc", "price_desc", "duration_asc", "departure_asc"] as const;
    const sort =
      typeof search.sort === "string" &&
      validSorts.includes(search.sort as (typeof validSorts)[number])
        ? (search.sort as FlightsSearch["sort"])
        : undefined;

    return {
      ...(origin ? { origin } : {}),
      ...(destination ? { destination } : {}),
      ...(date ? { date } : {}),
      ...(travelClass && travelClass !== "all" ? { travelClass } : {}),
      ...(passengers > 1 ? { passengers } : {}),
      ...(sort && sort !== "price_asc" ? { sort } : {}),
    };
  },
  loaderDeps: ({ search }) => ({
    origin: search.origin,
    destination: search.destination,
    date: search.date,
    travelClass: search.travelClass,
    sort: search.sort,
  }),
  loader: async ({ context, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(flightsQueryOptions(deps)),
      context.queryClient.ensureQueryData(flightCitiesQueryOptions()),
    ]);
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FlightsPage,
});

function FlightsPage() {
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [isPending, startTransition] = useTransition();

  const currentOrigin = searchParams.origin ?? "All";
  const currentDestination = searchParams.destination ?? "All";
  const currentDate = searchParams.date ?? "";
  const currentTravelClass = searchParams.travelClass ?? "all";
  const currentPassengers = searchParams.passengers ?? 1;
  const currentSort = searchParams.sort ?? "price_asc";

  // Selected Flight for Summary Dialog (Step 3)
  const [selectedFlight, setSelectedFlight] = useState<FlightData | null>(null);

  const query = useSuspenseQuery(
    flightsQueryOptions({
      origin: searchParams.origin,
      destination: searchParams.destination,
      date: searchParams.date,
      travelClass: searchParams.travelClass,
      sort: searchParams.sort,
    }),
  );

  const citiesQuery = useSuspenseQuery(flightCitiesQueryOptions());
  const { origins, destinations } = citiesQuery.data;
  const flights = query.data;

  const updateSearch = (newParams: Partial<FlightsSearch>) => {
    startTransition(() => {
      navigate({
        search: (prev) => {
          const merged: Record<string, unknown> = {
            ...prev,
            ...newParams,
          };

          if (merged["origin"] === "All" || !merged["origin"]) delete merged["origin"];
          if (merged["destination"] === "All" || !merged["destination"])
            delete merged["destination"];
          if (!merged["date"]) delete merged["date"];
          if (merged["travelClass"] === "all" || !merged["travelClass"])
            delete merged["travelClass"];
          if (merged["passengers"] === 1 || !merged["passengers"]) delete merged["passengers"];
          if (merged["sort"] === "price_asc" || !merged["sort"]) delete merged["sort"];

          return merged as FlightsSearch;
        },
      });
    });
  };

  const handleSwapAirports = () => {
    if (currentOrigin === "All" && currentDestination === "All") return;
    updateSearch({
      origin: currentDestination === "All" ? undefined : currentDestination,
      destination: currentOrigin === "All" ? undefined : currentOrigin,
    });
  };

  const handleResetFilters = () => {
    startTransition(() => {
      navigate({ search: {} });
    });
  };

  const hasActiveFilters = Boolean(
    currentOrigin !== "All" ||
    currentDestination !== "All" ||
    currentDate ||
    currentTravelClass !== "all" ||
    currentPassengers > 1 ||
    currentSort !== "price_asc",
  );

  // Flight Summary Pricing
  const totalSummaryPrice = selectedFlight ? selectedFlight.price * currentPassengers : 0;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Air Travel & Fares"
        title="Find & Book Flights"
        description="Explore direct flights and seamless airline connections to iconic worldwide destinations with verified schedules and transparent fares."
      />

      <SectionReveal as="section" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Flight Search Console Card */}
        <div className="rounded-3xl border border-border/70 bg-card p-5 sm:p-7 shadow-sm">
          <div className="grid gap-4 md:grid-cols-12 md:items-end">
            {/* Origin Select */}
            <div className="md:col-span-3">
              <Label className="text-xs font-semibold text-muted-foreground">From (Origin)</Label>
              <Select
                value={currentOrigin}
                onValueChange={(val) => updateSearch({ origin: val === "All" ? undefined : val })}
              >
                <SelectTrigger
                  className="mt-1.5 h-11 w-full rounded-2xl bg-background border-border/80 text-sm"
                  aria-label="Select origin airport or city"
                >
                  <SelectValue placeholder="All Origins" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="All">All Origins</SelectItem>
                  {origins.map((opt) => (
                    <SelectItem key={opt.code} value={opt.code}>
                      {opt.city} ({opt.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Swap Airports Button */}
            <div className="hidden md:flex md:col-span-1 items-center justify-center pb-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleSwapAirports}
                className="h-10 w-10 rounded-full border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Swap origin and destination"
                aria-label="Swap origin and destination"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* Destination Select */}
            <div className="md:col-span-3">
              <Label className="text-xs font-semibold text-muted-foreground">
                To (Destination)
              </Label>
              <Select
                value={currentDestination}
                onValueChange={(val) =>
                  updateSearch({ destination: val === "All" ? undefined : val })
                }
              >
                <SelectTrigger
                  className="mt-1.5 h-11 w-full rounded-2xl bg-background border-border/80 text-sm"
                  aria-label="Select destination airport or city"
                >
                  <SelectValue placeholder="All Destinations" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="All">All Destinations</SelectItem>
                  {destinations.map((opt) => (
                    <SelectItem key={opt.code} value={opt.code}>
                      {opt.city} ({opt.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Input */}
            <div className="md:col-span-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Departure Date
                </Label>
                {currentDate ? (
                  <button
                    type="button"
                    onClick={() => updateSearch({ date: undefined })}
                    className="text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    Clear date
                  </button>
                ) : null}
              </div>
              <div className="relative mt-1.5">
                <Input
                  type="date"
                  value={currentDate}
                  onChange={(e) => updateSearch({ date: e.target.value || undefined })}
                  className="h-11 rounded-2xl bg-background border-border/80 text-sm pl-3 pr-3"
                  aria-label="Select flight departure date"
                />
              </div>
            </div>

            {/* Travel Class Select */}
            <div className="md:col-span-2">
              <Label className="text-xs font-semibold text-muted-foreground">Cabin Class</Label>
              <Select
                value={currentTravelClass}
                onValueChange={(val) =>
                  updateSearch({ travelClass: val as FlightsSearch["travelClass"] })
                }
              >
                <SelectTrigger
                  className="mt-1.5 h-11 w-full rounded-2xl bg-background border-border/80 text-sm"
                  aria-label="Select cabin class"
                >
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="first">First Class</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Passengers Stepper & Quick Actions */}
          <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-4">
            {/* Passengers Stepper */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground">Passengers:</span>
              <div className="flex items-center rounded-full border border-border/80 bg-background px-3 h-9 gap-3 shadow-xs">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">
                  {currentPassengers} {currentPassengers === 1 ? "Traveller" : "Travellers"}
                </span>
                <div className="flex items-center gap-1 pl-1">
                  <button
                    type="button"
                    onClick={() => updateSearch({ passengers: Math.max(1, currentPassengers - 1) })}
                    disabled={currentPassengers <= 1}
                    className="h-5 w-5 rounded-full text-xs font-bold text-muted-foreground hover:bg-muted disabled:opacity-30 flex items-center justify-center"
                    aria-label="Decrease passengers"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSearch({ passengers: Math.min(9, currentPassengers + 1) })}
                    disabled={currentPassengers >= 9}
                    className="h-5 w-5 rounded-full text-xs font-bold text-muted-foreground hover:bg-muted disabled:opacity-30 flex items-center justify-center"
                    aria-label="Increase passengers"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Filter Reset */}
            {hasActiveFilters ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-9 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Reset all filters"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Reset filters
              </Button>
            ) : null}
          </div>
        </div>

        {/* Results Metadata Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Plane className="h-4 w-4 text-secondary" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">
              Found <span className="font-semibold text-primary">{flights.length}</span>{" "}
              {flights.length === 1 ? "flight" : "flights"}
              {currentOrigin !== "All" ? ` from ${currentOrigin}` : ""}
              {currentDestination !== "All" ? ` to ${currentDestination}` : ""}
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">Sort:</span>
            <Select
              value={currentSort}
              onValueChange={(val) => updateSearch({ sort: val as FlightsSearch["sort"] })}
            >
              <SelectTrigger
                className="h-9 w-48 rounded-full bg-card border-border/80 text-xs"
                aria-label="Sort flight results"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Sort By" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="duration_asc">Shortest Flight Duration</SelectItem>
                <SelectItem value="departure_asc">Earliest Departure Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters ? (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            {currentOrigin !== "All" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 text-secondary font-medium">
                Origin: {currentOrigin}
                <button
                  type="button"
                  onClick={() => updateSearch({ origin: undefined })}
                  aria-label="Remove origin filter"
                  className="hover:opacity-75"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ) : null}

            {currentDestination !== "All" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 text-secondary font-medium">
                Destination: {currentDestination}
                <button
                  type="button"
                  onClick={() => updateSearch({ destination: undefined })}
                  aria-label="Remove destination filter"
                  className="hover:opacity-75"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ) : null}

            {currentDate ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 text-secondary font-medium">
                Date: {currentDate}
                <button
                  type="button"
                  onClick={() => updateSearch({ date: undefined })}
                  aria-label="Remove date filter"
                  className="hover:opacity-75"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ) : null}

            {currentTravelClass !== "all" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 text-secondary font-medium capitalize">
                Class: {currentTravelClass}
                <button
                  type="button"
                  onClick={() => updateSearch({ travelClass: undefined })}
                  aria-label="Remove travel class filter"
                  className="hover:opacity-75"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ) : null}

            {currentPassengers > 1 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 text-secondary font-medium">
                {currentPassengers} Travellers
                <button
                  type="button"
                  onClick={() => updateSearch({ passengers: undefined })}
                  aria-label="Reset passengers count"
                  className="hover:opacity-75"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ) : null}
          </div>
        ) : null}

        {/* Flight Cards Grid / List */}
        {isPending ? (
          <div className="mt-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-36 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="grid grid-cols-12 gap-4 items-center py-2">
                  <div className="col-span-4 space-y-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="col-span-4 flex flex-col items-center gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-1 w-full" />
                  </div>
                  <div className="col-span-4 space-y-2 text-right">
                    <Skeleton className="h-8 w-16 ml-auto" />
                    <Skeleton className="h-4 w-24 ml-auto" />
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-border/50 pt-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-9 w-28 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : flights.length === 0 ? (
          /* Empty State */
          <div className="mt-10 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 text-secondary">
              <Compass className="h-7 w-7" aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-display text-xl text-foreground">
              No flights found for this route or date
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
              We couldn't find flights matching your exact criteria. Try clearing the departure date
              to explore all available schedules, or select popular hubs like London (LHR), New York
              (JFK), or Dubai (DXB).
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                onClick={handleResetFilters}
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset all search filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {flights.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                passengers={currentPassengers}
                onSelect={(f) => setSelectedFlight(f)}
              />
            ))}
          </div>
        )}
      </SectionReveal>

      {/* Step 3: Flight Booking Summary Dialog */}
      <Dialog
        open={Boolean(selectedFlight)}
        onOpenChange={(open) => !open && setSelectedFlight(null)}
      >
        <DialogContent className="max-w-md rounded-3xl p-6 sm:p-7">
          <DialogHeader>
            <div className="flex items-center gap-2 text-secondary">
              <Plane className="h-5 w-5" aria-hidden="true" />
              <span className="eyebrow text-secondary">Flight Summary</span>
            </div>
            <DialogTitle className="font-display text-2xl text-foreground">
              Confirm Reservation
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review your flight schedule and fare breakdown before confirming.
            </DialogDescription>
          </DialogHeader>

          {selectedFlight ? (
            <div className="mt-4 space-y-5">
              {/* Flight Details Card */}
              <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">
                      {selectedFlight.airline}
                    </h4>
                    <p className="text-xs text-muted-foreground font-mono">
                      {selectedFlight.flight_number}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize text-xs font-semibold">
                    {selectedFlight.class} Class
                  </Badge>
                </div>

                {/* Route */}
                <div className="flex items-center justify-between text-sm py-1">
                  <div>
                    <p className="font-display font-bold text-lg text-foreground">
                      {selectedFlight.origin_code}
                    </p>
                    <p className="text-xs text-muted-foreground">{selectedFlight.origin_city}</p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">
                      {formatFlightTime(selectedFlight.departure_time)}
                    </p>
                  </div>

                  <div className="flex flex-col items-center px-3">
                    <span className="text-[11px] text-muted-foreground mb-1">
                      {formatFlightDuration(selectedFlight.duration_minutes)}
                    </span>
                    <div className="flex items-center gap-1 text-secondary">
                      <div className="h-0.5 w-6 bg-secondary/40" />
                      <Plane className="h-3 w-3 rotate-90" />
                      <div className="h-0.5 w-6 bg-secondary/40" />
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">Non-stop</span>
                  </div>

                  <div className="text-right">
                    <p className="font-display font-bold text-lg text-foreground">
                      {selectedFlight.destination_code}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedFlight.destination_city}
                    </p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">
                      {formatFlightTime(selectedFlight.arrival_time)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-2 text-xs text-muted-foreground flex items-center justify-between">
                  <span>Departure Date:</span>
                  <span className="font-medium text-foreground">
                    {formatFlightDate(selectedFlight.departure_time)}
                  </span>
                </div>
              </div>

              {/* Price Calculation Breakdown */}
              <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Fare per passenger</span>
                  <span className="font-medium text-foreground">
                    ${selectedFlight.price.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Passengers</span>
                  <span className="font-medium text-foreground">
                    × {currentPassengers} {currentPassengers === 1 ? "passenger" : "passengers"}
                  </span>
                </div>

                <div className="flex justify-between border-t border-border/60 pt-2 font-semibold text-foreground text-sm">
                  <span>Total Amount</span>
                  <span className="text-accent-text font-display text-lg font-bold">
                    ${totalSummaryPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Live Booking CTA */}
              <div className="pt-2">
                <BookingCTA
                  label="Proceed to Booking"
                  itemType="flight"
                  itemId={selectedFlight.id}
                  startDate={
                    selectedFlight.departure_time
                      ? selectedFlight.departure_time.split("T")[0]
                      : undefined
                  }
                  guests={currentPassengers}
                  cabinClass={selectedFlight.class}
                />
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Instant e-ticket confirmation • 256-bit secure checkout
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}
