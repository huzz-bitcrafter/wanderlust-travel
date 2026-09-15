import { useState, useTransition, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Plane, Sparkles, RotateCcw, SlidersHorizontal, Compass } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { SectionReveal } from "@/components/shared/SectionReveal";
import { FlightCard } from "@/components/shared/FlightCard";
import { FlightHeroSearch } from "@/components/flights/FlightHeroSearch";
import {
  FlightFilterSidebar,
  type FilterOptionWithCount,
} from "@/components/flights/FlightFilterSidebar";
import { BookingCTA } from "@/components/shared/BookingCTA";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  searchFlights,
  fetchFlightCities,
  type FlightData,
  type FlightsFilterParams,
} from "@/lib/catalog.functions";
import {
  formatFlightDuration,
  formatFlightTime,
  formatFlightDate,
  formatPrice,
} from "@/lib/flight-utils";

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
  maxPrice?: number;
  airlines?: string;
  stops?: string;
  departureTime?: string;
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

    const maxPrice =
      typeof search.maxPrice === "number" && search.maxPrice > 0
        ? search.maxPrice
        : typeof search.maxPrice === "string" && Number(search.maxPrice) > 0
          ? Number(search.maxPrice)
          : undefined;

    const airlines =
      typeof search.airlines === "string" && search.airlines.trim()
        ? search.airlines.trim()
        : undefined;

    const stops =
      typeof search.stops === "string" && search.stops.trim() ? search.stops.trim() : undefined;

    const departureTime =
      typeof search.departureTime === "string" && search.departureTime.trim()
        ? search.departureTime.trim()
        : undefined;

    return {
      ...(origin ? { origin } : {}),
      ...(destination ? { destination } : {}),
      ...(date ? { date } : {}),
      ...(travelClass && travelClass !== "all" ? { travelClass } : {}),
      ...(passengers > 1 ? { passengers } : {}),
      ...(sort && sort !== "price_asc" ? { sort } : {}),
      ...(maxPrice ? { maxPrice } : {}),
      ...(airlines ? { airlines } : {}),
      ...(stops ? { stops } : {}),
      ...(departureTime ? { departureTime } : {}),
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

  // Selected Flight for Step 3 Summary Dialog
  const [selectedFlight, setSelectedFlight] = useState<FlightData | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // SSR-prefetched queries
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
  const rawFlights = query.data;

  // Derive min/max price bounds from the raw fetched flights
  const { minPriceBound, maxPriceBound } = useMemo(() => {
    if (!rawFlights.length) return { minPriceBound: 0, maxPriceBound: 1000 };
    const prices = rawFlights.map((f) => f.price);
    return {
      minPriceBound: Math.min(...prices),
      maxPriceBound: Math.max(...prices),
    };
  }, [rawFlights]);

  // Active filter states from URL search params
  const activeMaxPrice = searchParams.maxPrice ?? maxPriceBound;
  const activeAirlines = useMemo(
    () => (searchParams.airlines ? searchParams.airlines.split(",") : []),
    [searchParams.airlines],
  );
  const activeStops = useMemo(
    () => (searchParams.stops ? searchParams.stops.split(",") : []),
    [searchParams.stops],
  );
  const activeDepartureTimes = useMemo(
    () => (searchParams.departureTime ? searchParams.departureTime.split(",") : []),
    [searchParams.departureTime],
  );

  // Filter options with dynamic counts
  const { airlineOptions, stopOptions, departureTimeOptions } = useMemo(() => {
    const airlineCountMap = new Map<string, number>();
    let nonStopCount = 0;
    let morningCount = 0;
    let afternoonCount = 0;
    let eveningCount = 0;

    rawFlights.forEach((flight) => {
      // Airline count
      airlineCountMap.set(flight.airline, (airlineCountMap.get(flight.airline) || 0) + 1);

      // Stops count (all scheduled flights in DB are direct non-stop)
      nonStopCount++;

      // Departure time count
      try {
        const hour = new Date(flight.departure_time).getUTCHours();
        if (hour >= 6 && hour < 12) {
          morningCount++;
        } else if (hour >= 12 && hour < 18) {
          afternoonCount++;
        } else {
          eveningCount++;
        }
      } catch {
        // fallback
      }
    });

    const airlines: FilterOptionWithCount[] = Array.from(airlineCountMap.entries())
      .map(([name, count]) => ({ id: name, label: name, count }))
      .sort((a, b) => b.count - a.count);

    const stops: FilterOptionWithCount[] = [
      { id: "non_stop", label: "Non Stop", count: nonStopCount },
      { id: "1_stop", label: "1 Stop", count: 0 },
      { id: "2_plus_stops", label: "2+ Stops", count: 0 },
    ];

    const departureTimes: FilterOptionWithCount[] = [
      { id: "morning", label: "Morning (6AM – 12PM)", count: morningCount },
      { id: "afternoon", label: "Afternoon (12PM – 6PM)", count: afternoonCount },
      { id: "evening", label: "Evening (6PM – 12AM)", count: eveningCount },
    ];

    return {
      airlineOptions: airlines,
      stopOptions: stops,
      departureTimeOptions: departureTimes,
    };
  }, [rawFlights]);

  // Apply filters to flights
  const filteredFlights = useMemo(() => {
    return rawFlights.filter((flight) => {
      // Price range
      if (searchParams.maxPrice !== undefined && flight.price > searchParams.maxPrice) {
        return false;
      }

      // Airlines
      if (activeAirlines.length > 0 && !activeAirlines.includes(flight.airline)) {
        return false;
      }

      // Stops (if non_stop is unchecked while other stop types are selected)
      if (activeStops.length > 0 && !activeStops.includes("non_stop")) {
        return false;
      }

      // Departure Time
      if (activeDepartureTimes.length > 0) {
        try {
          const hour = new Date(flight.departure_time).getUTCHours();
          let timeBucket = "evening";
          if (hour >= 6 && hour < 12) timeBucket = "morning";
          else if (hour >= 12 && hour < 18) timeBucket = "afternoon";

          if (!activeDepartureTimes.includes(timeBucket)) {
            return false;
          }
        } catch {
          // keep
        }
      }

      return true;
    });
  }, [rawFlights, searchParams.maxPrice, activeAirlines, activeStops, activeDepartureTimes]);

  // Lowest and Second-Lowest Price flight IDs for "⭐ Lowest Price" & "⭐ Best Deal" badges
  const { lowestPriceId, secondLowestPriceId } = useMemo(() => {
    if (!filteredFlights.length) return { lowestPriceId: null, secondLowestPriceId: null };
    const sorted = [...filteredFlights].sort((a, b) => a.price - b.price);
    return {
      lowestPriceId: sorted[0]?.id ?? null,
      secondLowestPriceId: sorted[1]?.id ?? null,
    };
  }, [filteredFlights]);

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
          if (
            merged["maxPrice"] === undefined ||
            merged["maxPrice"] === null ||
            merged["maxPrice"] === maxPriceBound
          ) {
            delete merged["maxPrice"];
          }
          if (!merged["airlines"]) delete merged["airlines"];
          if (!merged["stops"]) delete merged["stops"];
          if (!merged["departureTime"]) delete merged["departureTime"];

          return merged as FlightsSearch;
        },
      });
    });
  };

  const handleHeroSearch = (params: {
    origin?: string;
    destination?: string;
    date?: string;
    passengers?: number;
  }) => {
    updateSearch(params);
  };

  const handlePriceFilterChange = (val: number) => {
    updateSearch({ maxPrice: val });
  };

  const handleToggleAirline = (airline: string) => {
    const next = activeAirlines.includes(airline)
      ? activeAirlines.filter((a) => a !== airline)
      : [...activeAirlines, airline];
    updateSearch({ airlines: next.length > 0 ? next.join(",") : undefined });
  };

  const handleToggleStop = (stopId: string) => {
    const next = activeStops.includes(stopId)
      ? activeStops.filter((s) => s !== stopId)
      : [...activeStops, stopId];
    updateSearch({ stops: next.length > 0 ? next.join(",") : undefined });
  };

  const handleToggleDepartureTime = (timeId: string) => {
    const next = activeDepartureTimes.includes(timeId)
      ? activeDepartureTimes.filter((t) => t !== timeId)
      : [...activeDepartureTimes, timeId];
    updateSearch({ departureTime: next.length > 0 ? next.join(",") : undefined });
  };

  const handleResetAllFilters = () => {
    startTransition(() => {
      navigate({
        search: (prev) => ({
          origin: prev.origin,
          destination: prev.destination,
          date: prev.date,
          passengers: prev.passengers,
          travelClass: prev.travelClass,
          sort: prev.sort,
        }),
      });
    });
  };

  const hasActiveSidebarFilters = Boolean(
    (searchParams.maxPrice !== undefined && searchParams.maxPrice < maxPriceBound) ||
    activeAirlines.length > 0 ||
    activeStops.length > 0 ||
    activeDepartureTimes.length > 0,
  );

  // Flight Summary Pricing
  const totalSummaryPrice = selectedFlight ? selectedFlight.price * currentPassengers : 0;

  return (
    <SiteLayout transparentNav>
      {/* ============================================================ */}
      {/* 1. Hero & Floating Search Bar                                */}
      {/* ============================================================ */}
      <FlightHeroSearch
        currentOrigin={currentOrigin}
        currentDestination={currentDestination}
        currentDate={currentDate}
        currentPassengers={currentPassengers}
        origins={origins}
        destinations={destinations}
        onSearch={handleHeroSearch}
      />

      {/* ============================================================ */}
      {/* 2. Main Page Layout (2-Column Architecture)                   */}
      {/* ============================================================ */}
      <SectionReveal as="div" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Results Header: "✦ Best Flights" + Metadata count */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Best Flights
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Handpicked verified routes & airline connections
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full border border-border/50">
              {filteredFlights.length} {filteredFlights.length === 1 ? "flight" : "flights"} found
            </span>

            {/* Mobile / Tablet Filter Sheet Trigger */}
            <div className="lg:hidden">
              <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-full border-border/80 text-xs font-semibold gap-1.5"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filters
                    {hasActiveSidebarFilters ? (
                      <span className="h-2 w-2 rounded-full bg-accent" />
                    ) : null}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[310px] sm:w-[360px] p-4 overflow-y-auto">
                  <SheetHeader className="text-left pb-2">
                    <SheetTitle className="font-display text-xl">Filter Flights</SheetTitle>
                  </SheetHeader>
                  <FlightFilterSidebar
                    minPrice={minPriceBound}
                    maxPrice={maxPriceBound}
                    selectedMaxPrice={activeMaxPrice}
                    onPriceChange={handlePriceFilterChange}
                    airlines={airlineOptions}
                    selectedAirlines={activeAirlines}
                    onToggleAirline={handleToggleAirline}
                    stops={stopOptions}
                    selectedStops={activeStops}
                    onToggleStop={handleToggleStop}
                    departureTimes={departureTimeOptions}
                    selectedDepartureTimes={activeDepartureTimes}
                    onReset={handleResetAllFilters}
                    hasActiveFilters={hasActiveSidebarFilters}
                    className="border-0 shadow-none p-0"
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Left Sidebar (w-72 / w-80) + Right Flights Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Filter Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1.5 scrollbar-thin">
            <FlightFilterSidebar
              minPrice={minPriceBound}
              maxPrice={maxPriceBound}
              selectedMaxPrice={activeMaxPrice}
              onPriceChange={handlePriceFilterChange}
              airlines={airlineOptions}
              selectedAirlines={activeAirlines}
              onToggleAirline={handleToggleAirline}
              stops={stopOptions}
              selectedStops={activeStops}
              onToggleStop={handleToggleStop}
              departureTimes={departureTimeOptions}
              selectedDepartureTimes={activeDepartureTimes}
              onReset={handleResetAllFilters}
              hasActiveFilters={hasActiveSidebarFilters}
            />
          </div>

          {/* Right Column: Flight Results Feed */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            {isPending ? (
              /* Loading Skeletons */
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 shadow-card"
                  >
                    {/* Desktop skeleton */}
                    <div className="hidden md:flex items-center justify-between gap-4">
                      {/* Zone 1: Airline */}
                      <div className="w-[180px] lg:w-[200px] shrink-0 flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="w-px h-10 bg-border/40 shrink-0" />

                      {/* Zones 2, 3, 4: Times & Route */}
                      <div className="flex-1 flex items-center justify-between px-2 lg:px-4 max-w-[460px]">
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-12" />
                          <Skeleton className="h-7 w-16" />
                          <Skeleton className="h-3 w-14" />
                        </div>
                        <div className="flex flex-col items-center space-y-1.5">
                          <Skeleton className="h-3 w-12" />
                          <Skeleton className="h-1.5 w-24 rounded-full" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <div className="space-y-1 items-end flex flex-col">
                          <Skeleton className="h-3 w-12" />
                          <Skeleton className="h-7 w-16" />
                          <Skeleton className="h-3 w-14" />
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="w-px h-10 bg-border/40 shrink-0" />

                      {/* Zone 5: Price & CTA */}
                      <div className="w-[180px] lg:w-[210px] shrink-0 flex flex-col items-end gap-2">
                        <Skeleton className="h-7 w-24" />
                        <Skeleton className="h-9 w-28 rounded-full" />
                      </div>
                    </div>

                    {/* Mobile skeleton */}
                    <div className="md:hidden space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Skeleton className="h-9 w-9 rounded-xl" />
                          <div className="space-y-1">
                            <Skeleton className="h-3.5 w-20" />
                            <Skeleton className="h-3 w-14" />
                          </div>
                        </div>
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                      <div className="flex items-center justify-between py-2 px-1">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredFlights.length === 0 ? (
              /* Empty State */
              <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center shadow-xs">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                  <Compass className="h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-xl text-foreground">
                  No flights match your filter criteria
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
                  We couldn't find any scheduled flights for this route and filter combination. Try
                  expanding your price range, resetting airline filters, or searching popular hubs
                  like Delhi (DEL), Bengaluru (BLR), or Goa (GOI).
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button
                    onClick={handleResetAllFilters}
                    className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-semibold text-xs"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Reset all filters
                  </Button>
                </div>
              </div>
            ) : (
              /* Vertically Stacked Flight Cards */
              <div className="space-y-4">
                {filteredFlights.map((flight) => {
                  let dealBadge: string | null = null;
                  if (flight.id === lowestPriceId) {
                    dealBadge = "⭐ Lowest Price";
                  } else if (flight.id === secondLowestPriceId) {
                    dealBadge = "⭐ Best Deal";
                  }

                  return (
                    <FlightCard
                      key={flight.id}
                      flight={flight}
                      passengers={currentPassengers}
                      dealBadge={dealBadge}
                      onSelect={(f) => setSelectedFlight(f)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </SectionReveal>

      {/* ============================================================ */}
      {/* 3. Step 3: Flight Booking Summary Dialog (Phase 10 Checkout) */}
      {/* ============================================================ */}
      <Dialog
        open={Boolean(selectedFlight)}
        onOpenChange={(open) => !open && setSelectedFlight(null)}
      >
        <DialogContent className="max-w-md rounded-3xl p-6 sm:p-7 bg-card text-card-foreground border-border/80 shadow-modal">
          <DialogHeader>
            <div className="flex items-center gap-2 text-secondary">
              <Plane className="h-5 w-5" aria-hidden="true" />
              <span className="eyebrow text-secondary">Flight Summary</span>
            </div>
            <DialogTitle className="font-display text-2xl text-foreground">
              Confirm Reservation
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review your flight schedule and fare breakdown before proceeding to passenger
              checkout.
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
                    {formatPrice(selectedFlight.price)}
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
                    {formatPrice(totalSummaryPrice)}
                  </span>
                </div>
              </div>

              {/* Live Booking CTA (Wired to Phase 10 /checkout) */}
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
