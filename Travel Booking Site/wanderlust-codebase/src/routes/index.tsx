import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Hero } from "@/components/home/Hero";
import { SearchWidget } from "@/components/home/SearchWidget";
import { ExploreIndia } from "@/components/home/ExploreIndia";
import { FeaturedDestinations } from "@/components/home/FeaturedDestinations";
import { FeaturedPackages } from "@/components/home/FeaturedPackages";
import { WhyUs } from "@/components/home/WhyUs";
import { Testimonials } from "@/components/home/Testimonials";
import { CtaBand } from "@/components/home/CtaBand";
import {
  listFeaturedDestinations,
  listFeaturedPackages,
  listIndianDestinations,
  fetchFilterDestinations,
  fetchFlightCities,
} from "@/lib/catalog.functions";

const featuredDestinationsQuery = queryOptions({
  queryKey: ["destinations", "featured"],
  queryFn: () => listFeaturedDestinations(),
});

const featuredPackagesQuery = queryOptions({
  queryKey: ["packages", "featured"],
  queryFn: () => listFeaturedPackages(),
});

const indianDestinationsQuery = queryOptions({
  queryKey: ["destinations", "india"],
  queryFn: () => listIndianDestinations(),
});

const filterDestinationsQuery = queryOptions({
  queryKey: ["destinations", "filter-options"],
  queryFn: () => fetchFilterDestinations(),
});

const flightCitiesQuery = queryOptions({
  queryKey: ["flights", "cities"],
  queryFn: () => fetchFlightCities(),
});

const title = "Wanderlust — Tours, Hotels & Flights in One Trip Planner";
const description =
  "Discover destinations, book tour packages, hotels and flights, and build a day-by-day itinerary — all in one travel platform.";

export const Route = createFileRoute("/")({
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
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(featuredDestinationsQuery),
      context.queryClient.ensureQueryData(featuredPackagesQuery),
      context.queryClient.ensureQueryData(indianDestinationsQuery),
      context.queryClient.ensureQueryData(filterDestinationsQuery),
      context.queryClient.ensureQueryData(flightCitiesQuery),
    ]);
  },
  component: Index,
});

function Index() {
  const destinations = useSuspenseQuery(featuredDestinationsQuery);
  const packages = useSuspenseQuery(featuredPackagesQuery);
  const indianDestinations = useSuspenseQuery(indianDestinationsQuery);
  const filterDestinations = useSuspenseQuery(filterDestinationsQuery);
  const flightCities = useSuspenseQuery(flightCitiesQuery);

  return (
    <SiteLayout transparentNav>
      <Hero />
      <SearchWidget destinations={filterDestinations.data} flightCities={flightCities.data} />
      <ExploreIndia
        destinations={indianDestinations.data}
        isLoading={indianDestinations.isPending}
      />
      <FeaturedDestinations destinations={destinations.data} isLoading={destinations.isPending} />
      <FeaturedPackages packages={packages.data} isLoading={packages.isPending} />
      <WhyUs />
      <Testimonials />
      <CtaBand />
    </SiteLayout>
  );
}
