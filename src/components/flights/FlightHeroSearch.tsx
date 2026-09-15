import { useState, useEffect } from "react";
import {
  PlaneTakeoff,
  PlaneLanding,
  Calendar as CalendarIcon,
  Users,
  Search,
  ArrowRightLeft,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { FlightCityOption } from "@/lib/catalog.functions";

export interface FlightHeroSearchProps {
  currentOrigin?: string;
  currentDestination?: string;
  currentDate?: string;
  currentPassengers?: number;
  origins: FlightCityOption[];
  destinations: FlightCityOption[];
  onSearch: (params: {
    origin?: string;
    destination?: string;
    date?: string;
    passengers?: number;
  }) => void;
}

export function FlightHeroSearch({
  currentOrigin = "All",
  currentDestination = "All",
  currentDate = "",
  currentPassengers = 1,
  origins,
  destinations,
  onSearch,
}: FlightHeroSearchProps) {
  const [origin, setOrigin] = useState(currentOrigin);
  const [destination, setDestination] = useState(currentDestination);
  const [date, setDate] = useState(currentDate);
  const [passengers, setPassengers] = useState(currentPassengers);

  const [openOrigin, setOpenOrigin] = useState(false);
  const [openDest, setOpenDest] = useState(false);
  const [openPassengers, setOpenPassengers] = useState(false);

  // Sync internal state when props change (e.g. browser back/forward)
  useEffect(() => {
    setOrigin(currentOrigin);
  }, [currentOrigin]);

  useEffect(() => {
    setDestination(currentDestination);
  }, [currentDestination]);

  useEffect(() => {
    setDate(currentDate);
  }, [currentDate]);

  useEffect(() => {
    setPassengers(currentPassengers);
  }, [currentPassengers]);

  const handleSwap = () => {
    if (origin === "All" && destination === "All") return;
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch({
      origin: origin === "All" ? undefined : origin,
      destination: destination === "All" ? undefined : destination,
      date: date ? date : undefined,
      passengers: passengers > 1 ? passengers : undefined,
    });
  };

  const getOriginLabel = () => {
    if (!origin || origin === "All") return "All Origins";
    const found = origins.find(
      (o) =>
        o.code.toLowerCase() === origin.toLowerCase() ||
        o.city.toLowerCase() === origin.toLowerCase(),
    );
    return found ? `${found.city} (${found.code})` : origin;
  };

  const getDestinationLabel = () => {
    if (!destination || destination === "All") return "All Destinations";
    const found = destinations.find(
      (d) =>
        d.code.toLowerCase() === destination.toLowerCase() ||
        d.city.toLowerCase() === destination.toLowerCase(),
    );
    return found ? `${found.city} (${found.code})` : destination;
  };

  const formatDisplayDate = (d: string) => {
    if (!d) return "Select Date";
    try {
      const parsed = new Date(d + "T00:00:00Z");
      return parsed.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });
    } catch {
      return d;
    }
  };

  return (
    <div className="relative w-full">
      {/* ============================================================ */}
      {/* 1. Full-Bleed Sky / Airplane Cinematic Hero Banner           */}
      {/* ============================================================ */}
      <div className="relative w-full h-[420px] sm:h-[460px] lg:h-[480px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2400&q=80"
          alt="Passenger jet airliner banking above sunset clouds"
          className="absolute inset-0 h-full w-full object-cover object-[right_35%]"
          loading="eager"
          // @ts-expect-error fetchpriority is a modern HTML attribute
          fetchpriority="high"
        />

        {/* Ambient multi-stage gradient scrim for AAA text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 via-45% to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />

        {/* Hero Copy Content */}
        <div className="relative mx-auto max-w-7xl h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center pt-16 sm:pt-20 pb-16 sm:pb-20">
          <div className="max-w-2xl text-white">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-3">
              <span className="h-[2px] w-6 bg-accent" />
              <span className="text-xs font-semibold tracking-widest uppercase text-white/90">
                FLY FURTHER, EXPLORE MORE
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-md">
              Find Your Next Flight
            </h1>

            {/* Subtitle */}
            <p className="mt-3 text-sm sm:text-base lg:text-lg text-white/85 leading-relaxed max-w-xl">
              Discover the best deals, flexible options, and unforgettable destinations across world
              capitals and scenic island getaways.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. Floating Search Bar (Straddling Hero & Content Area)       */}
      {/* ============================================================ */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-14 sm:-mt-16 z-20">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-border/80 bg-card/95 backdrop-blur-xl p-2 sm:p-2.5 shadow-xl ring-1 ring-black/5 dark:ring-white/10"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 p-1 sm:p-1.5 items-center">
            {/* Origin & Destination Combined Pair (6 cols on lg) with Floating Center Swap */}
            <div className="sm:col-span-2 lg:col-span-6 relative grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-1 items-center">
              {/* Origin (From) */}
              <div className="min-w-0 sm:pr-2 lg:pr-3">
                <Popover open={openOrigin} onOpenChange={setOpenOrigin}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-expanded={openOrigin}
                      className="flex w-full items-center gap-2.5 sm:gap-3 rounded-2xl p-2 sm:p-2.5 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary group min-w-0 overflow-hidden"
                    >
                      <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-muted/80 text-muted-foreground group-hover:bg-secondary/15 group-hover:text-secondary transition-colors">
                        <PlaneTakeoff className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <span className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide truncate">
                          From
                        </span>
                        <span className="block truncate text-xs sm:text-sm font-semibold text-foreground">
                          {getOriginLabel()}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 opacity-60 group-hover:opacity-100 ml-auto" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search origin airport or city..." />
                      <CommandList>
                        <CommandEmpty>No airport found.</CommandEmpty>
                        <CommandGroup heading="Available Origins">
                          <CommandItem
                            value="All Origins"
                            onSelect={() => {
                              setOrigin("All");
                              setOpenOrigin(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                origin === "All" ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            All Origins
                          </CommandItem>
                          {origins.map((opt) => (
                            <CommandItem
                              key={opt.code}
                              value={`${opt.city} ${opt.code}`}
                              onSelect={() => {
                                setOrigin(opt.code);
                                setOpenOrigin(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  origin.toLowerCase() === opt.code.toLowerCase()
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                              <span>{opt.city}</span>
                              <span className="ml-auto text-xs text-muted-foreground font-mono">
                                {opt.code}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Floating Center Swap Button */}
              <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleSwap}
                  title="Swap origin and destination"
                  aria-label="Swap origin and destination"
                  className="h-9 w-9 rounded-full border border-border/80 bg-background/95 hover:bg-muted text-muted-foreground hover:text-foreground shadow-sm hover:shadow transition-transform active:scale-90"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </Button>
              </div>

              {/* Destination (To) */}
              <div className="min-w-0 sm:pl-2 lg:pl-3">
                <Popover open={openDest} onOpenChange={setOpenDest}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-expanded={openDest}
                      className="flex w-full items-center gap-2.5 sm:gap-3 rounded-2xl p-2 sm:p-2.5 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary group min-w-0 overflow-hidden"
                    >
                      <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-muted/80 text-muted-foreground group-hover:bg-secondary/15 group-hover:text-secondary transition-colors">
                        <PlaneLanding className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <span className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide truncate">
                          To
                        </span>
                        <span className="block truncate text-xs sm:text-sm font-semibold text-foreground">
                          {getDestinationLabel()}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 opacity-60 group-hover:opacity-100 ml-auto" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search destination airport or city..." />
                      <CommandList>
                        <CommandEmpty>No airport found.</CommandEmpty>
                        <CommandGroup heading="Available Destinations">
                          <CommandItem
                            value="All Destinations"
                            onSelect={() => {
                              setDestination("All");
                              setOpenDest(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                destination === "All" ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            All Destinations
                          </CommandItem>
                          {destinations.map((opt) => (
                            <CommandItem
                              key={opt.code}
                              value={`${opt.city} ${opt.code}`}
                              onSelect={() => {
                                setDestination(opt.code);
                                setOpenDest(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  destination.toLowerCase() === opt.code.toLowerCase()
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                              <span>{opt.city}</span>
                              <span className="ml-auto text-xs text-muted-foreground font-mono">
                                {opt.code}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Departure Date (2 cols on lg) */}
            <div className="sm:col-span-1 lg:col-span-2 min-w-0">
              <div className="relative flex w-full items-center gap-2.5 sm:gap-3 rounded-2xl p-2 sm:p-2.5 text-left transition-colors hover:bg-muted/60 group min-w-0 overflow-hidden">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-muted/80 text-muted-foreground group-hover:bg-secondary/15 group-hover:text-secondary transition-colors">
                  <CalendarIcon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <span className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide truncate">
                    Departure
                  </span>
                  <span className="block truncate text-xs sm:text-sm font-semibold text-foreground">
                    {formatDisplayDate(date)}
                  </span>
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  aria-label="Select departure date"
                />
              </div>
            </div>

            {/* Passengers (2 cols on lg - ample room, zero truncation!) */}
            <div className="sm:col-span-1 lg:col-span-2 min-w-0">
              <Popover open={openPassengers} onOpenChange={setOpenPassengers}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-expanded={openPassengers}
                    className="flex w-full items-center gap-2.5 sm:gap-3 rounded-2xl p-2 sm:p-2.5 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary group min-w-0 overflow-hidden"
                  >
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-muted/80 text-muted-foreground group-hover:bg-secondary/15 group-hover:text-secondary transition-colors">
                      <Users className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <span className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide truncate">
                        Passengers
                      </span>
                      <span className="block truncate text-xs sm:text-sm font-semibold text-foreground">
                        {passengers} {passengers === 1 ? "Adult" : "Adults"}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 opacity-60 group-hover:opacity-100 ml-auto" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4" align="end">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Travellers</p>
                        <p className="text-xs text-muted-foreground">Age 12+</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                          disabled={passengers <= 1}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-xs font-bold text-foreground hover:bg-muted disabled:opacity-30"
                          aria-label="Decrease passengers"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-sm font-semibold text-foreground">
                          {passengers}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPassengers((p) => Math.min(9, p + 1))}
                          disabled={passengers >= 9}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-xs font-bold text-foreground hover:bg-muted disabled:opacity-30"
                          aria-label="Increase passengers"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground border-t border-border pt-2">
                      Maximum 9 passengers per reservation.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Search Flights CTA Button (2 cols on lg) */}
            <div className="sm:col-span-2 lg:col-span-2 w-full flex justify-end">
              <Button
                type="submit"
                className="cta-shine w-full h-11 sm:h-12 rounded-full font-semibold text-xs sm:text-sm bg-gradient-to-r from-accent to-accent/90 text-accent-foreground shadow-md hover:shadow-accent/25 hover:shadow-lg transition-all active:scale-[0.98] shrink-0"
              >
                <Search className="h-4 w-4 mr-2 shrink-0" aria-hidden="true" />
                <span className="truncate">Search Flights</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
