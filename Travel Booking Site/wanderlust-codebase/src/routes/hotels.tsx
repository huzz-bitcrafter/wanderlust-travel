import { useState, useTransition } from "react";
import { createFileRoute, useNavigate, useChildMatches, Outlet } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  Search,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Hotel as HotelIcon,
  Compass,
  ArrowUpDown,
  Star,
} from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/layout/SiteLayout";
import { HotelCard } from "@/components/shared/HotelCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchHotels,
  fetchFilterDestinations,
  type HotelsFilterParams,
} from "@/lib/catalog.functions";

const title = "Hotels & Resorts — Wanderlust";
const description =
  "Find and book handpicked stays from clifftop suites to desert riads, boutique hotels and luxury safari lodges.";

const hotelsQueryOptions = (params: HotelsFilterParams) =>
  queryOptions({
    queryKey: [
      "hotels",
      "list",
      params.search ?? "",
      params.destinationSlug ?? "All",
      params.minStars ?? 0,
      params.maxPrice ?? 0,
      params.sort ?? "recommended",
      params.page ?? 1,
    ],
    queryFn: () =>
      fetchHotels({
        data: {
          search: params.search,
          destinationSlug: params.destinationSlug,
          minStars: params.minStars,
          maxPrice: params.maxPrice,
          sort: params.sort,
          page: params.page,
          pageSize: 9,
        },
      }),
  });

const destinationsFilterQueryOptions = () =>
  queryOptions({
    queryKey: ["filter", "destinations"],
    queryFn: () => fetchFilterDestinations(),
  });

export type HotelsSearch = {
  q?: string;
  destination?: string;
  minStars?: number;
  maxPrice?: number;
  sort?: "recommended" | "price_asc" | "price_desc" | "stars_desc" | "name_asc";
  page?: number;
};

export const Route = createFileRoute("/hotels")({
  validateSearch: (search: Record<string, unknown>): HotelsSearch => {
    const q = typeof search.q === "string" ? search.q.trim().slice(0, 80) : undefined;
    const destination =
      typeof search.destination === "string" && search.destination !== "All"
        ? search.destination
        : undefined;
    const minStars = Number(search.minStars) > 0 ? Number(search.minStars) : undefined;
    const maxPrice = Number(search.maxPrice) > 0 ? Number(search.maxPrice) : undefined;

    const validSorts = [
      "recommended",
      "price_asc",
      "price_desc",
      "stars_desc",
      "name_asc",
    ] as const;
    const sort =
      typeof search.sort === "string" &&
      validSorts.includes(search.sort as (typeof validSorts)[number])
        ? (search.sort as HotelsSearch["sort"])
        : undefined;

    const page = Number(search.page) > 0 ? Number(search.page) : 1;

    return {
      ...(q ? { q } : {}),
      ...(destination ? { destination } : {}),
      ...(minStars ? { minStars } : {}),
      ...(maxPrice ? { maxPrice } : {}),
      ...(sort && sort !== "recommended" ? { sort } : {}),
      ...(page > 1 ? { page } : {}),
    };
  },
  loaderDeps: ({ search }) => ({
    search: search.q,
    destinationSlug: search.destination,
    minStars: search.minStars,
    maxPrice: search.maxPrice,
    sort: search.sort,
    page: search.page ?? 1,
  }),
  loader: async ({ context, deps, location }) => {
    if (location.pathname === "/hotels" || location.pathname === "/hotels/") {
      await Promise.all([
        context.queryClient.ensureQueryData(hotelsQueryOptions(deps)),
        context.queryClient.ensureQueryData(destinationsFilterQueryOptions()),
      ]);
    }
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
  component: HotelsRouteComponent,
});

function HotelsRouteComponent() {
  const childMatches = useChildMatches();
  const hasChildRoute = childMatches.some(
    (m) => m.routeId !== Route.id && m.pathname !== "/hotels" && m.pathname !== "/hotels/",
  );
  if (hasChildRoute) {
    return <Outlet />;
  }
  return <HotelsPage />;
}

function HotelsPage() {
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.q ?? "";
  const currentDestination = searchParams.destination ?? "All";
  const currentMinStars = searchParams.minStars ? String(searchParams.minStars) : "All";
  const currentMaxPrice = searchParams.maxPrice ? String(searchParams.maxPrice) : "All";
  const currentSort = searchParams.sort ?? "recommended";
  const currentPage = searchParams.page ?? 1;

  const [searchInput, setSearchInput] = useState(currentSearch);

  const query = useSuspenseQuery(
    hotelsQueryOptions({
      search: currentSearch,
      destinationSlug: currentDestination,
      minStars: searchParams.minStars,
      maxPrice: searchParams.maxPrice,
      sort: searchParams.sort,
      page: currentPage,
    }),
  );

  const destinationsQuery = useSuspenseQuery(destinationsFilterQueryOptions());
  const destinations = destinationsQuery.data ?? [];

  const { items, total, totalPages } = query.data;

  const updateSearch = (newParams: Partial<HotelsSearch>) => {
    startTransition(() => {
      navigate({
        search: (prev) => {
          const merged: Record<string, unknown> = {
            ...prev,
            ...newParams,
          };

          // Reset page when any filter changes unless page is explicitly updated
          if (!("page" in newParams)) {
            delete merged["page"];
          }

          // Clean empty / default parameters
          if (!merged["q"]) delete merged["q"];
          if (merged["destination"] === "All") delete merged["destination"];
          if (merged["minStars"] === "All" || !merged["minStars"]) delete merged["minStars"];
          if (merged["maxPrice"] === "All" || !merged["maxPrice"]) delete merged["maxPrice"];
          if (merged["sort"] === "recommended" || !merged["sort"]) delete merged["sort"];
          if (merged["page"] === 1) delete merged["page"];

          return merged as HotelsSearch;
        },
      });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearch({ q: searchInput.trim() || undefined });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    updateSearch({ q: undefined });
  };

  const handleResetAll = () => {
    setSearchInput("");
    startTransition(() => {
      navigate({
        search: {},
      });
    });
  };

  const hasActiveFilters = Boolean(
    currentSearch ||
    currentDestination !== "All" ||
    currentMinStars !== "All" ||
    currentMaxPrice !== "All" ||
    currentSort !== "recommended",
  );

  const selectedDestinationObj = destinations.find((d) => d.slug === currentDestination);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Sanctuaries & Stays"
        title="Hotels & Resorts"
        description="Browse luxury boutique retreats, clifftop suites, historic riads, and serene villas curated for comfort and unforgettable views."
      />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filter Controls Card */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-6 shadow-sm">
          {/* Row 1: Search, Destination, and Sort */}
          <div className="grid gap-4 md:grid-cols-12 md:items-center">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative md:col-span-6" role="search">
              <Search
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search hotels by name or description..."
                className="h-11 rounded-full pl-10 pr-20 bg-background border-border/80 text-sm focus-visible:ring-2 focus-visible:ring-secondary"
                aria-label="Search hotels"
              />
              {searchInput ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search text"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
              <Button
                type="submit"
                size="sm"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Search
              </Button>
            </form>

            {/* Destination Select Dropdown */}
            <div className="md:col-span-3">
              <Select
                value={currentDestination}
                onValueChange={(val) => updateSearch({ destination: val })}
              >
                <SelectTrigger
                  className="h-11 w-full rounded-full bg-background border-border/80 text-sm"
                  aria-label="Filter by destination"
                >
                  <SelectValue placeholder="All Destinations" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="All">All Destinations</SelectItem>
                  {destinations.map((dest) => (
                    <SelectItem key={dest.id} value={dest.slug}>
                      {dest.name}, {dest.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-3">
              <Select
                value={currentSort}
                onValueChange={(val) => updateSearch({ sort: val as HotelsSearch["sort"] })}
              >
                <SelectTrigger
                  className="h-11 w-full rounded-full bg-background border-border/80 text-sm"
                  aria-label="Sort hotels"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Sort By" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="stars_desc">Highest Star Rating</SelectItem>
                  <SelectItem value="name_asc">Alphabetical (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Star Rating & Price Filter Selectors */}
          <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-4">
            {/* Star Rating Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="shrink-0 text-xs font-medium text-muted-foreground mr-1 hidden sm:inline">
                Rating:
              </span>
              {[
                { label: "All Stars", value: "All" },
                { label: "3+ Stars", value: "3" },
                { label: "4+ Stars", value: "4" },
                { label: "5 Stars", value: "5" },
              ].map((tier) => {
                const isActive = currentMinStars === tier.value;
                return (
                  <button
                    key={tier.value}
                    type="button"
                    onClick={() =>
                      updateSearch({
                        minStars: tier.value === "All" ? undefined : Number(tier.value),
                      })
                    }
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
                    }`}
                    aria-pressed={isActive}
                  >
                    {tier.value !== "All" ? (
                      <Star className="h-3 w-3 fill-accent text-accent" />
                    ) : null}
                    {tier.label}
                  </button>
                );
              })}
            </div>

            {/* Price Filter Selector & Reset */}
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={currentMaxPrice}
                onValueChange={(val) =>
                  updateSearch({ maxPrice: val === "All" ? undefined : Number(val) })
                }
              >
                <SelectTrigger
                  className="h-9 w-40 rounded-full bg-background border-border/80 text-xs"
                  aria-label="Filter by max price per night"
                >
                  <SelectValue placeholder="Max Price / Night" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">Any Price</SelectItem>
                  <SelectItem value="150">Up to $150/night</SelectItem>
                  <SelectItem value="250">Up to $250/night</SelectItem>
                  <SelectItem value="400">Up to $400/night</SelectItem>
                  <SelectItem value="600">Up to $600/night</SelectItem>
                  <SelectItem value="1000">Up to $1,000/night</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetAll}
                  className="h-9 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                  title="Reset all filters"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Reset
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Results Metadata Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HotelIcon className="h-4 w-4 text-secondary" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">
              Showing <span className="font-semibold text-primary">{items.length}</span> of{" "}
              <span className="font-semibold text-primary">{total}</span>{" "}
              {total === 1 ? "hotel" : "hotels"}
              {selectedDestinationObj ? ` in ${selectedDestinationObj.name}` : ""}
              {currentMinStars !== "All" ? ` (${currentMinStars}★+)` : ""}
            </p>
          </div>

          {hasActiveFilters ? (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {currentSearch ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 text-secondary font-medium">
                  Keyword: "{currentSearch}"
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    aria-label="Remove search keyword filter"
                    className="hover:opacity-75"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null}

              {currentDestination !== "All" && selectedDestinationObj ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 text-secondary font-medium">
                  Destination: {selectedDestinationObj.name}
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

              {currentMinStars !== "All" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 text-secondary font-medium">
                  {currentMinStars}★ and above
                  <button
                    type="button"
                    onClick={() => updateSearch({ minStars: undefined })}
                    aria-label="Remove star rating filter"
                    className="hover:opacity-75"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null}

              {currentMaxPrice !== "All" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 text-secondary font-medium">
                  Max ${Number(currentMaxPrice).toLocaleString()}/night
                  <button
                    type="button"
                    onClick={() => updateSearch({ maxPrice: undefined })}
                    aria-label="Remove max price filter"
                    className="hover:opacity-75"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Hotels Grid */}
        {isPending ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-border/50 bg-card">
                <Skeleton className="aspect-[16/10] w-full" />
                <div className="space-y-3 p-5">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 text-secondary">
              <Compass className="h-7 w-7" aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-display text-xl text-foreground">
              No hotels match your criteria
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              We couldn't find any stays matching your current search and filter settings. Try
              adjusting your price or star rating filters.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button
                onClick={handleResetAll}
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset all filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 ? (
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60 pt-6">
            <p className="text-xs text-muted-foreground">
              Page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
              <span className="font-semibold text-foreground">{totalPages}</span>
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => updateSearch({ page: currentPage - 1 })}
                className="rounded-full border-border/80 text-xs"
                aria-label="Go to previous page"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNum = index + 1;
                  const isCurrent = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => updateSearch({ page: pageNum })}
                      className={`h-8 w-8 rounded-full text-xs font-semibold transition-colors ${
                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                      aria-current={isCurrent ? "page" : undefined}
                      aria-label={`Page ${pageNum}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => updateSearch({ page: currentPage + 1 })}
                className="rounded-full border-border/80 text-xs"
                aria-label="Go to next page"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </SiteLayout>
  );
}
