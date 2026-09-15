import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { formatPrice } from "@/lib/flight-utils";

export interface FilterOptionWithCount {
  id: string;
  label: string;
  count: number;
}

export interface FlightFilterSidebarProps {
  // Price
  minPrice: number;
  maxPrice: number;
  selectedMaxPrice: number;
  onPriceChange: (val: number) => void;

  // Airlines
  airlines: FilterOptionWithCount[];
  selectedAirlines: string[];
  onToggleAirline: (airline: string) => void;

  // Stops
  stops: FilterOptionWithCount[];
  selectedStops: string[];
  onToggleStop: (stopId: string) => void;

  // Departure Time
  departureTimes: FilterOptionWithCount[];
  selectedDepartureTimes: string[];
  onToggleDepartureTime: (timeId: string) => void;

  // Reset
  onReset: () => void;
  hasActiveFilters: boolean;

  className?: string;
}

export function FlightFilterSidebar({
  minPrice,
  maxPrice,
  selectedMaxPrice,
  onPriceChange,
  airlines,
  selectedAirlines,
  onToggleAirline,
  stops,
  selectedStops,
  onToggleStop,
  departureTimes,
  selectedDepartureTimes,
  onToggleDepartureTime,
  onReset,
  hasActiveFilters,
  className = "",
}: FlightFilterSidebarProps) {
  return (
    <aside
      className={`rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-card transition-all ${className}`}
      aria-label="Flight search filters"
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-5">
        <div className="flex items-center gap-2 text-foreground font-bold text-base">
          <SlidersHorizontal className="h-4 w-4 text-secondary" aria-hidden="true" />
          <span>Filters</span>
        </div>

        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 px-2 text-xs font-semibold text-accent-text hover:text-accent hover:bg-muted/50 rounded-lg"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        ) : null}
      </div>

      <div className="space-y-6">
        {/* ========================================================== */}
        {/* 1. Price Range                                              */}
        {/* ========================================================== */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Price Range
            </span>
          </div>

          <div className="px-1 pt-2 pb-1">
            <Slider
              value={[selectedMaxPrice]}
              min={minPrice}
              max={maxPrice}
              step={5}
              onValueChange={([val]) => onPriceChange(val)}
              aria-label="Filter by maximum flight price"
            />
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mt-2.5">
            <span>{formatPrice(minPrice)}</span>
            <span className="text-foreground font-bold">{formatPrice(selectedMaxPrice)}</span>
          </div>
        </div>

        <div className="h-px w-full bg-border/60" aria-hidden="true" />

        {/* ========================================================== */}
        {/* 2. Airlines                                                 */}
        {/* ========================================================== */}
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-foreground mb-3">
            Airlines
          </span>

          <div className="space-y-2.5">
            {airlines.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No airlines available</p>
            ) : (
              airlines.map((item) => {
                const isChecked = selectedAirlines.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className="flex items-center justify-between text-xs text-foreground cursor-pointer group select-none hover:text-primary"
                  >
                    <div className="flex items-center gap-2.5">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => onToggleAirline(item.id)}
                        id={`airline-${item.id}`}
                        aria-label={`Filter by ${item.label}`}
                      />
                      <span className="font-medium text-xs group-hover:underline">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-medium text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-md">
                      {item.count}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>

        <div className="h-px w-full bg-border/60" aria-hidden="true" />

        {/* ========================================================== */}
        {/* 3. Stops                                                    */}
        {/* ========================================================== */}
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-foreground mb-3">
            Stops
          </span>

          <div className="space-y-2.5">
            {stops.map((item) => {
              const isChecked = selectedStops.includes(item.id);
              return (
                <label
                  key={item.id}
                  className="flex items-center justify-between text-xs text-foreground cursor-pointer group select-none hover:text-primary"
                >
                  <div className="flex items-center gap-2.5">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => onToggleStop(item.id)}
                      id={`stops-${item.id}`}
                      aria-label={`Filter by ${item.label}`}
                    />
                    <span className="font-medium text-xs group-hover:underline">{item.label}</span>
                  </div>
                  <span className="text-[11px] font-mono font-medium text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-md">
                    {item.count}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="h-px w-full bg-border/60" aria-hidden="true" />

        {/* ========================================================== */}
        {/* 4. Departure Time Blocks                                    */}
        {/* ========================================================== */}
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-foreground mb-3">
            Departure Time
          </span>

          <div className="space-y-2.5">
            {departureTimes.map((item) => {
              const isChecked = selectedDepartureTimes.includes(item.id);
              return (
                <label
                  key={item.id}
                  className="flex items-center justify-between text-xs text-foreground cursor-pointer group select-none hover:text-primary"
                >
                  <div className="flex items-center gap-2.5">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => onToggleDepartureTime(item.id)}
                      id={`time-${item.id}`}
                      aria-label={`Filter by ${item.label}`}
                    />
                    <span className="font-medium text-xs group-hover:underline">{item.label}</span>
                  </div>
                  <span className="text-[11px] font-mono font-medium text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-md">
                    {item.count}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
