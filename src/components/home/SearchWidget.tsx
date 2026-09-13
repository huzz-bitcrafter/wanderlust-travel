import { useState, useRef, useCallback, useId, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Plane,
  Hotel,
  Package,
  MapPin,
  Search,
  ArrowRightLeft,
  Calendar,
  Users,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FilterDestinationOption, FlightCityOption } from "@/lib/catalog.functions";
import { SectionReveal } from "@/components/shared/SectionReveal";
import { BorderBeamPanel } from "@/components/ui/border-beam-panel";

/* ------------------------------------------------------------------ */
/*  Lightweight Destination Autocomplete                               */
/* ------------------------------------------------------------------ */

function DestinationAutocomplete({
  destinations,
  value,
  onChange,
  placeholder = "Where to?",
  label,
}: {
  destinations: FilterDestinationOption[];
  value: string;
  onChange: (slug: string, name: string) => void;
  placeholder?: string;
  label: string;
}) {
  const id = useId();
  const [inputText, setInputText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Derive display text from value
  const selectedDest = destinations.find((d) => d.slug === value);

  const filtered = inputText.trim()
    ? destinations
        .filter(
          (d) =>
            d.name.toLowerCase().includes(inputText.toLowerCase()) ||
            d.country.toLowerCase().includes(inputText.toLowerCase()),
        )
        .slice(0, 6)
    : destinations.slice(0, 6);

  const handleSelect = useCallback(
    (dest: FilterDestinationOption) => {
      onChange(dest.slug, dest.name);
      setInputText("");
      setIsOpen(false);
      setActiveIndex(-1);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen && e.key === "ArrowDown") {
        setIsOpen(true);
        setActiveIndex(0);
        e.preventDefault();
        return;
      }
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
          break;
        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < filtered.length) {
            handleSelect(filtered[activeIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setActiveIndex(-1);
          break;
      }
    },
    [isOpen, filtered, activeIndex, handleSelect],
  );

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const listboxId = `${id}-listbox`;

  return (
    <div className="relative">
      <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
      <div className="relative mt-1.5">
        <MapPin
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          type="text"
          value={
            isOpen
              ? inputText
              : selectedDest
                ? `${selectedDest.name}, ${selectedDest.country}`
                : inputText
          }
          onChange={(e) => {
            setInputText(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
            if (!e.target.value.trim()) {
              onChange("", "");
            }
          }}
          onFocus={() => {
            setIsOpen(true);
            if (selectedDest) setInputText("");
          }}
          onBlur={() => {
            // Delay to allow click on option
            setTimeout(() => setIsOpen(false), 150);
          }}
          placeholder={placeholder}
          className="h-11 rounded-2xl bg-background border-border/80 text-sm pl-9"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
          aria-label={label}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
      </div>
      {isOpen && filtered.length > 0 ? (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border/80 bg-card shadow-card-hover"
        >
          {filtered.map((dest, index) => (
            <li
              key={dest.id}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={`flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                index === activeIndex
                  ? "bg-secondary/10 text-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(dest);
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <MapPin className="h-3.5 w-3.5 text-secondary shrink-0" aria-hidden="true" />
              <span className="font-medium">{dest.name}</span>
              <span className="text-xs text-muted-foreground">{dest.country}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Search Widget                                                 */
/* ------------------------------------------------------------------ */

const TABS = [
  { value: "flights", label: "Flights", icon: Plane },
  { value: "hotels", label: "Hotels", icon: Hotel },
  { value: "packages", label: "Packages", icon: Package },
  { value: "destinations", label: "Destinations", icon: MapPin },
] as const;

export function SearchWidget({
  destinations,
  flightCities,
}: {
  destinations: FilterDestinationOption[];
  flightCities: { origins: FlightCityOption[]; destinations: FlightCityOption[] };
}) {
  const navigate = useNavigate();

  // Flights state
  const [flightOrigin, setFlightOrigin] = useState("All");
  const [flightDest, setFlightDest] = useState("All");
  const [flightDate, setFlightDate] = useState("");
  const [flightClass, setFlightClass] = useState("all");
  const [flightPassengers, setFlightPassengers] = useState(1);

  // Hotels state
  const [hotelDest, setHotelDest] = useState({ slug: "", name: "" });
  const [hotelSearch, setHotelSearch] = useState("");

  // Packages state
  const [pkgDest, setPkgDest] = useState({ slug: "", name: "" });
  const [pkgSearch, setPkgSearch] = useState("");

  // Destinations state
  const [destSearch, setDestSearch] = useState("");
  const [destCountry, setDestCountry] = useState("All");

  /* ---- Flights ---- */
  const handleFlightSearch = () => {
    const search: Record<string, unknown> = {};
    if (flightOrigin !== "All") search.origin = flightOrigin;
    if (flightDest !== "All") search.destination = flightDest;
    if (flightDate) search.date = flightDate;
    if (flightClass !== "all") search.travelClass = flightClass;
    if (flightPassengers > 1) search.passengers = flightPassengers;
    navigate({ to: "/flights", search });
  };

  const handleSwapAirports = () => {
    const tmp = flightOrigin;
    setFlightOrigin(flightDest);
    setFlightDest(tmp);
  };

  /* ---- Hotels ---- */
  const handleHotelSearch = () => {
    const search: Record<string, unknown> = {};
    if (hotelDest.slug) search.destination = hotelDest.slug;
    if (hotelSearch.trim()) search.q = hotelSearch.trim();
    navigate({ to: "/hotels", search });
  };

  /* ---- Packages ---- */
  const handlePackageSearch = () => {
    const search: Record<string, unknown> = {};
    if (pkgDest.slug) search.destination = pkgDest.slug;
    if (pkgSearch.trim()) search.q = pkgSearch.trim();
    navigate({ to: "/packages", search });
  };

  /* ---- Destinations ---- */
  const handleDestSearch = () => {
    const search: Record<string, unknown> = {};
    if (destSearch.trim()) search.q = destSearch.trim();
    if (destCountry === "India") search.country = "India";
    else if (destCountry === "International") search.country = "!India";
    navigate({ to: "/destinations", search });
  };

  return (
    <SectionReveal as="div" className="relative z-20 mx-auto -mt-16 max-w-5xl px-4 sm:px-6 lg:px-8">
      <BorderBeamPanel
        className="p-0 border-0 bg-transparent shadow-none"
        radius={24}
        thickness={2.5}
        beams={2}
        idleSpeed={22}
        hoverSpeed={48}
        spring={{ stiffness: 18, damping: 12 }}
        glow
        reducedMotion={false}
      >
        <div className="glass-search rounded-3xl p-1 sm:p-2">
          <Tabs defaultValue="flights" className="w-full">
          {/* Tab triggers */}
          <TabsList className="flex h-auto w-full justify-start gap-1 rounded-2xl bg-muted/50 dark:bg-white/[0.04] p-1 overflow-x-auto scrollbar-none">
            {TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="relative flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-white/20 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-white/10 dark:data-[state=inactive]:hover:bg-white/5 overflow-hidden group/tab active:scale-[0.98]"
              >
                {/* Active light top beam */}
                <span className="absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-data-[state=active]/tab:opacity-100 transition-opacity duration-300 pointer-events-none" />
                {/* Active light sheen effect */}
                <span className="absolute inset-0 -translate-x-full group-data-[state=active]/tab:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
                <Icon className="h-4 w-4 transition-transform duration-200 group-hover/tab:scale-110" aria-hidden="true" />
                <span>{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* =============== FLIGHTS TAB =============== */}
          <TabsContent value="flights" className="mt-0 p-4 sm:p-6">
            <div className="grid gap-4 md:grid-cols-12 md:items-end">
              {/* Origin */}
              <div className="md:col-span-3">
                <Label className="text-xs font-semibold text-muted-foreground">From</Label>
                <Select value={flightOrigin} onValueChange={setFlightOrigin}>
                  <SelectTrigger
                    className="mt-1.5 h-11 w-full rounded-2xl bg-background border-border/80 text-sm"
                    aria-label="Select origin airport"
                  >
                    <SelectValue placeholder="All Origins" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem value="All">All Origins</SelectItem>
                    {flightCities.origins.map((opt) => (
                      <SelectItem key={opt.code} value={opt.code}>
                        {opt.city} ({opt.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Swap */}
              <div className="hidden md:flex md:col-span-1 items-center justify-center pb-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleSwapAirports}
                  className="h-10 w-10 rounded-full border border-border/80 hover:border-accent/40 bg-background/80 hover:bg-accent/10 text-muted-foreground hover:text-accent transition-all duration-300 hover:rotate-180 hover:scale-105 active:scale-95 shadow-xs"
                  aria-label="Swap origin and destination"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </Button>
              </div>

              {/* Destination */}
              <div className="md:col-span-3">
                <Label className="text-xs font-semibold text-muted-foreground">To</Label>
                <Select value={flightDest} onValueChange={setFlightDest}>
                  <SelectTrigger
                    className="mt-1.5 h-11 w-full rounded-2xl bg-background border-border/80 text-sm"
                    aria-label="Select destination airport"
                  >
                    <SelectValue placeholder="All Destinations" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem value="All">All Destinations</SelectItem>
                    {flightCities.destinations.map((opt) => (
                      <SelectItem key={opt.code} value={opt.code}>
                        {opt.city} ({opt.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="md:col-span-2">
                <Label className="text-xs font-semibold text-muted-foreground">Date</Label>
                <div className="relative mt-1.5">
                  <Input
                    type="date"
                    value={flightDate}
                    onChange={(e) => setFlightDate(e.target.value)}
                    className="h-11 rounded-2xl bg-background border-border/80 text-sm"
                    aria-label="Departure date"
                  />
                </div>
              </div>

              {/* Class */}
              <div className="md:col-span-3">
                <Label className="text-xs font-semibold text-muted-foreground">Cabin</Label>
                <Select value={flightClass} onValueChange={setFlightClass}>
                  <SelectTrigger
                    className="mt-1.5 h-11 w-full rounded-2xl bg-background border-border/80 text-sm"
                    aria-label="Cabin class"
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

            {/* Row 2: Passengers + Search */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border/30 pt-4">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <div className="flex items-center rounded-full border border-border/80 bg-background px-3 h-9 gap-2">
                  <button
                    type="button"
                    onClick={() => setFlightPassengers((p) => Math.max(1, p - 1))}
                    disabled={flightPassengers <= 1}
                    className="h-5 w-5 rounded-full text-xs font-bold text-muted-foreground hover:bg-muted disabled:opacity-30 flex items-center justify-center"
                    aria-label="Decrease passengers"
                  >
                    −
                  </button>
                  <span className="text-xs font-semibold text-foreground min-w-[3.5rem] text-center">
                    {flightPassengers} {flightPassengers === 1 ? "Traveller" : "Travellers"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFlightPassengers((p) => Math.min(9, p + 1))}
                    disabled={flightPassengers >= 9}
                    className="h-5 w-5 rounded-full text-xs font-bold text-muted-foreground hover:bg-muted disabled:opacity-30 flex items-center justify-center"
                    aria-label="Increase passengers"
                  >
                    +
                  </button>
                </div>
              </div>

              <Button
                onClick={handleFlightSearch}
                className="relative overflow-hidden group/btn h-11 rounded-full bg-accent px-8 text-base font-semibold text-accent-foreground shadow-md hover:shadow-lg hover:shadow-accent/25 hover:bg-accent/95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                <span
                  className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                  aria-hidden="true"
                />
                <Search className="h-4 w-4 mr-2 transition-transform duration-200 group-hover/btn:scale-110" aria-hidden="true" />
                Search Flights
              </Button>
            </div>
          </TabsContent>

          {/* =============== HOTELS TAB =============== */}
          <TabsContent value="hotels" className="mt-0 p-4 sm:p-6">
            <div className="grid gap-4 md:grid-cols-12 md:items-end">
              <div className="md:col-span-5">
                <DestinationAutocomplete
                  destinations={destinations}
                  value={hotelDest.slug}
                  onChange={(slug, name) => setHotelDest({ slug, name })}
                  placeholder="Search by destination..."
                  label="Destination"
                />
              </div>
              <div className="md:col-span-5">
                <Label className="text-xs font-semibold text-muted-foreground">Search</Label>
                <div className="relative mt-1.5">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    type="text"
                    value={hotelSearch}
                    onChange={(e) => setHotelSearch(e.target.value)}
                    placeholder="Hotel name or keyword..."
                    className="h-11 rounded-2xl bg-background border-border/80 text-sm pl-9"
                    aria-label="Search hotels by name"
                    onKeyDown={(e) => e.key === "Enter" && handleHotelSearch()}
                  />
                </div>
              </div>
              <div className="md:col-span-2 flex items-end">
                <Button
                  onClick={handleHotelSearch}
                  className="relative overflow-hidden group/btn h-11 w-full rounded-full bg-accent text-base font-semibold text-accent-foreground shadow-md hover:shadow-lg hover:shadow-accent/25 hover:bg-accent/95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  <span
                    className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                    aria-hidden="true"
                  />
                  <Search className="h-4 w-4 mr-2 transition-transform duration-200 group-hover/btn:scale-110" aria-hidden="true" />
                  Search
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* =============== PACKAGES TAB =============== */}
          <TabsContent value="packages" className="mt-0 p-4 sm:p-6">
            <div className="grid gap-4 md:grid-cols-12 md:items-end">
              <div className="md:col-span-5">
                <DestinationAutocomplete
                  destinations={destinations}
                  value={pkgDest.slug}
                  onChange={(slug, name) => setPkgDest({ slug, name })}
                  placeholder="Search by destination..."
                  label="Destination"
                />
              </div>
              <div className="md:col-span-5">
                <Label className="text-xs font-semibold text-muted-foreground">Search</Label>
                <div className="relative mt-1.5">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    type="text"
                    value={pkgSearch}
                    onChange={(e) => setPkgSearch(e.target.value)}
                    placeholder="Tour name or keyword..."
                    className="h-11 rounded-2xl bg-background border-border/80 text-sm pl-9"
                    aria-label="Search packages by name"
                    onKeyDown={(e) => e.key === "Enter" && handlePackageSearch()}
                  />
                </div>
              </div>
              <div className="md:col-span-2 flex items-end">
                <Button
                  onClick={handlePackageSearch}
                  className="relative overflow-hidden group/btn h-11 w-full rounded-full bg-accent text-base font-semibold text-accent-foreground shadow-md hover:shadow-lg hover:shadow-accent/25 hover:bg-accent/95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  <span
                    className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                    aria-hidden="true"
                  />
                  <Search className="h-4 w-4 mr-2 transition-transform duration-200 group-hover/btn:scale-110" aria-hidden="true" />
                  Search
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* =============== DESTINATIONS TAB =============== */}
          <TabsContent value="destinations" className="mt-0 p-4 sm:p-6">
            <div className="grid gap-4 md:grid-cols-12 md:items-end">
              <div className="md:col-span-6">
                <Label className="text-xs font-semibold text-muted-foreground">Search</Label>
                <div className="relative mt-1.5">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    type="text"
                    value={destSearch}
                    onChange={(e) => setDestSearch(e.target.value)}
                    placeholder="Search destinations..."
                    className="h-11 rounded-2xl bg-background border-border/80 text-sm pl-9"
                    aria-label="Search destinations"
                    onKeyDown={(e) => e.key === "Enter" && handleDestSearch()}
                  />
                </div>
              </div>
              <div className="md:col-span-4">
                <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                  Region
                </Label>
                <div className="flex items-center gap-1.5">
                  {(["All", "India", "International"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setDestCountry(option)}
                      className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-medium transition-all ${
                        destCountry === option
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
                      }`}
                      aria-pressed={destCountry === option}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 flex items-end">
                <Button
                  onClick={handleDestSearch}
                  className="relative overflow-hidden group/btn h-11 w-full rounded-full bg-accent text-base font-semibold text-accent-foreground shadow-md hover:shadow-lg hover:shadow-accent/25 hover:bg-accent/95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  <span
                    className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                    aria-hidden="true"
                  />
                  <Search className="h-4 w-4 mr-2 transition-transform duration-200 group-hover/btn:scale-110" aria-hidden="true" />
                  Explore
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </BorderBeamPanel>
  </SectionReveal>
  );
}
