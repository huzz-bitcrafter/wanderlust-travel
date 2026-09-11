import { useState, useTransition, useMemo } from "react";
import { createFileRoute, useNavigate, useChildMatches, Outlet } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQuery } from "@tanstack/react-query";
import {
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Compass,
} from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/layout/SiteLayout";
import { DestinationCard } from "@/components/shared/DestinationCard";
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
  fetchDestinations,
  CONTINENTS,
  REGIONS,
  type DestinationsFilterParams,
} from "@/lib/catalog.functions";
import { fetchReviewAggregates } from "@/lib/review.functions";

const title = "Explore Destinations — Wanderlust";
const description =
  "Browse handpicked destinations across six continents with photos, best seasons, travel guides and ratings.";

const destinationsQueryOptions = (params: DestinationsFilterParams) =>
  queryOptions({
    queryKey: [
      "destinations",
      "list",
      params.search ?? "",
      params.continent ?? "All",
      params.region ?? "All",
      params.country ?? "All",
      params.page ?? 1,
    ],
    queryFn: () =>
      fetchDestinations({
        data: {
          search: params.search,
          continent: params.continent,
          region: params.region,
          country: params.country,
          page: params.page,
          pageSize: 9,
        },
      }),
  });

export type DestinationsSearch = {
  q?: string;
  continent?: string;
  region?: string;
  country?: string;
  page?: number;
};

export const Route = createFileRoute("/destinations")({
  validateSearch: (search: Record<string, unknown>): DestinationsSearch => {
    const q = typeof search.q === "string" ? search.q.trim().slice(0, 80) : undefined;
    const continent =
      typeof search.continent === "string" && search.continent !== "All"
        ? search.continent
        : undefined;
    const region =
      typeof search.region === "string" && search.region !== "All" ? search.region : undefined;

    let country: string | undefined = undefined;
    if (typeof search.country === "string" && search.country !== "All") {
      const trimmed = search.country.trim();
      if (trimmed === "India") {
        country = "India";
      } else if (
        trimmed === "!India" ||
        trimmed === "country!=India" ||
        trimmed.toLowerCase() === "international"
      ) {
        country = "!India";
      } else {
        country = trimmed;
      }
    }

    const page = Number(search.page) > 0 ? Number(search.page) : 1;

    return {
      ...(q ? { q } : {}),
      ...(continent ? { continent } : {}),
      ...(region ? { region } : {}),
      ...(country ? { country } : {}),
      ...(page > 1 ? { page } : {}),
    };
  },
  loaderDeps: ({ search }) => ({
    search: search.q,
    continent: search.continent,
    region: search.region,
    country: search.country,
    page: search.page ?? 1,
  }),
  loader: async ({ context, deps, location }) => {
    // Only prefetch listing if we are on the listing route (/destinations)
    if (location.pathname === "/destinations" || location.pathname === "/destinations/") {
      await context.queryClient.ensureQueryData(destinationsQueryOptions(deps));
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
  component: DestinationsRouteComponent,
});

function DestinationsRouteComponent() {
  const childMatches = useChildMatches();
  const hasChildRoute = childMatches.some(
    (m) =>
      m.routeId !== Route.id && m.pathname !== "/destinations" && m.pathname !== "/destinations/",
  );
  if (hasChildRoute) {
    return <Outlet />;
  }
  return <DestinationsPage />;
}

function DestinationsPage() {
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.q ?? "";
  const currentContinent = searchParams.continent ?? "All";
  const currentRegion = searchParams.region ?? "All";
  const currentCountry = searchParams.country ?? "All";
  const currentPage = searchParams.page ?? 1;

  const [searchInput, setSearchInput] = useState(currentSearch);

  const query = useSuspenseQuery(
    destinationsQueryOptions({
      search: currentSearch,
      continent: currentContinent,
      region: currentRegion,
      country: currentCountry,
      page: currentPage,
    }),
  );

  const { items, total, totalPages } = query.data;

  const destinationIds = useMemo(() => items.map((d) => d.id), [items]);
  const { data: reviewAggregates } = useQuery({
    queryKey: ["review-aggregates", "destination", destinationIds],
    queryFn: () =>
      fetchReviewAggregates({
        data: { targetIds: destinationIds, targetType: "destination" },
      }),
    enabled: destinationIds.length > 0,
  });

  const updateSearch = (newParams: Partial<DestinationsSearch>) => {
    startTransition(() => {
      navigate({
        search: (prev) => {
          const merged: Record<string, unknown> = {
            ...prev,
            ...newParams,
          };
          // Reset page when filters change unless page is explicitly updated
          if (!("page" in newParams)) {
            delete merged["page"];
          }
          // Remove empty keys
          if (!merged["q"]) delete merged["q"];
          if (merged["continent"] === "All") delete merged["continent"];
          if (merged["region"] === "All") delete merged["region"];
          if (merged["country"] === "All" || !merged["country"]) delete merged["country"];
          if (merged["page"] === 1) delete merged["page"];

          return merged as DestinationsSearch;
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
      currentContinent !== "All" ||
      currentRegion !== "All" ||
      (currentCountry && currentCountry !== "All"),
  );

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Explore the World"
        title="Destinations"
        description="Discover awe-inspiring places across all six continents. Filter by continent, region, or keyword to find your next unforgettable journey."
      />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters & Search Controls */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-6 shadow-sm">
          {/* Search bar & Region Select */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Input Form */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1" role="search">
              <Search
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by destination or country (e.g. Greece, Kyoto)..."
                className="h-11 rounded-full pl-10 pr-20 bg-background border-border/80 text-sm focus-visible:ring-2 focus-visible:ring-secondary"
                aria-label="Search destinations"
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

            {/* Region Dropdown Filter */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Region:
              </span>
              <Select value={currentRegion} onValueChange={(val) => updateSearch({ region: val })}>
                <SelectTrigger
                  className="h-11 w-full md:w-56 rounded-full bg-background border-border/80 text-sm"
                  aria-label="Filter by region"
                >
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region === "All" ? "All Regions" : region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetAll}
                  className="h-11 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                  title="Reset all filters"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Reset
                </Button>
              ) : null}
            </div>
          </div>

          {/* Quick Filter Scope: All | India | International */}
          <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap items-center gap-2">
            <span className="shrink-0 text-xs font-semibold text-muted-foreground mr-1">
              Scope:
            </span>
            {[
              { label: "All", value: undefined, id: "scope-all" },
              { label: "India", value: "India", id: "scope-india" },
              { label: "International", value: "!India", id: "scope-intl" },
            ].map((pill) => {
              const isActive =
                pill.value === undefined
                  ? !currentCountry || currentCountry === "All"
                  : currentCountry === pill.value;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => updateSearch({ country: pill.value })}
                  className={`inline-flex shrink-0 items-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
                  }`}
                  aria-pressed={isActive}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* Continent Filter Pills */}
          <div className="mt-3 pt-3 border-t border-border/30">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="shrink-0 text-xs font-medium text-muted-foreground mr-1 hidden sm:inline">
                Continent:
              </span>
              {CONTINENTS.map((continent) => {
                const isActive = currentContinent === continent;
                return (
                  <button
                    key={continent}
                    type="button"
                    onClick={() => updateSearch({ continent })}
                    className={`inline-flex shrink-0 items-center rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
                    }`}
                    aria-pressed={isActive}
                  >
                    {continent}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Metadata Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-secondary" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">
              Showing <span className="font-semibold text-primary">{items.length}</span> of{" "}
              <span className="font-semibold text-primary">{total}</span>{" "}
              {total === 1 ? "destination" : "destinations"}
              {currentCountry === "India"
                ? " in India"
                : currentCountry === "!India"
                  ? " (International)"
                  : ""}
              {currentContinent !== "All" ? ` in ${currentContinent}` : ""}
              {currentRegion !== "All" ? ` (${currentRegion})` : ""}
            </p>
          </div>

          {hasActiveFilters ? (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {currentCountry && currentCountry !== "All" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 text-secondary font-medium">
                  Scope: {currentCountry === "India" ? "India" : "International"}
                  <button
                    type="button"
                    onClick={() => updateSearch({ country: undefined })}
                    aria-label="Remove country scope filter"
                    className="hover:opacity-75"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null}
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
              {currentContinent !== "All" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 text-secondary font-medium">
                  {currentContinent}
                  <button
                    type="button"
                    onClick={() => updateSearch({ continent: "All" })}
                    aria-label="Remove continent filter"
                    className="hover:opacity-75"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null}
              {currentRegion !== "All" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 text-secondary font-medium">
                  {currentRegion}
                  <button
                    type="button"
                    onClick={() => updateSearch({ region: "All" })}
                    aria-label="Remove region filter"
                    className="hover:opacity-75"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Destination Cards Grid */}
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
              No destinations match your criteria
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              We couldn't find any destinations matching your current search and filter settings.
              Try broadening your criteria or resetting filters.
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
            {items.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                rating={reviewAggregates?.[destination.id]}
              />
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
