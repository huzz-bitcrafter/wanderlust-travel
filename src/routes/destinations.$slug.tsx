import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  MapPin,
  Calendar,
  Compass,
  ArrowLeft,
  Hotel,
  Package,
  MessageSquare,
  Globe2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Rating } from "@/components/shared/Rating";
import { ReviewSection } from "@/components/shared/ReviewSection";
import { PackageCard } from "@/components/shared/PackageCard";
import { HotelCard } from "@/components/shared/HotelCard";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  fetchDestinationBySlug,
  fetchPackagesByDestination,
  fetchHotelsByDestination,
} from "@/lib/catalog.functions";

const destinationDetailQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["destinations", "detail", slug],
    queryFn: () => fetchDestinationBySlug({ data: slug }),
  });

const destinationPackagesQueryOptions = (destinationId: string) =>
  queryOptions({
    queryKey: ["packages", "by-destination", destinationId],
    queryFn: () => fetchPackagesByDestination({ data: destinationId }),
  });

const destinationHotelsQueryOptions = (destinationId: string) =>
  queryOptions({
    queryKey: ["hotels", "by-destination", destinationId],
    queryFn: () => fetchHotelsByDestination({ data: destinationId }),
  });

export const Route = createFileRoute("/destinations/$slug")({
  loader: async ({ context, params }) => {
    const destination = await context.queryClient.ensureQueryData(
      destinationDetailQueryOptions(params.slug),
    );
    if (!destination) {
      throw notFound();
    }
    await Promise.all([
      context.queryClient.ensureQueryData(destinationPackagesQueryOptions(destination.id)),
      context.queryClient.ensureQueryData(destinationHotelsQueryOptions(destination.id)),
    ]);
    return destination;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Destination Not Found — Wanderlust" }],
      };
    }
    const title = `${loaderData.name}, ${loaderData.country} — Wanderlust`;
    const description =
      loaderData.short_description ||
      `Explore ${loaderData.name} in ${loaderData.country}. Discover the best season to visit, sights, and tour itineraries.`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        ...(loaderData.hero_image
          ? [{ property: "og:image", content: loaderData.hero_image }]
          : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: DestinationNotFound,
  component: DestinationDetailPage,
});

function DestinationNotFound() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 text-secondary">
          <Compass className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="mt-6 font-display text-3xl text-foreground">Destination Not Found</h1>
        <p className="mt-3 text-muted-foreground">
          The destination you are looking for does not exist or has been moved. Explore our catalog
          of handpicked destinations across the globe.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button
            asChild
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link to="/destinations">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse all destinations
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}

function DestinationDetailPage() {
  const { slug } = Route.useParams();
  const query = useSuspenseQuery(destinationDetailQueryOptions(slug));
  const destination = query.data;

  const packagesQuery = useSuspenseQuery(destinationPackagesQueryOptions(destination?.id ?? ""));
  const destinationPackages = packagesQuery.data ?? [];

  const hotelsQuery = useSuspenseQuery(destinationHotelsQueryOptions(destination?.id ?? ""));
  const destinationHotels = hotelsQuery.data ?? [];

  if (!destination) {
    return <DestinationNotFound />;
  }

  return (
    <SiteLayout>
      {/* Breadcrumb Bar */}
      <div className="border-b border-border/60 bg-card/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="text-muted-foreground hover:text-foreground">
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/destinations" className="text-muted-foreground hover:text-foreground">
                    Destinations
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-foreground">
                  {destination.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Hero Banner with Cinematic Overlay */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="relative h-[380px] sm:h-[440px] lg:h-[500px] w-full">
          {destination.hero_image ? (
            <img
              src={destination.hero_image}
              alt={`${destination.name}, ${destination.country}`}
              onError={(e) => {
                if (destination.slug === "hampi") {
                  e.currentTarget.src = "/images/destinations/hampi.jpg";
                } else if (destination.slug === "rishikesh") {
                  e.currentTarget.src = "/images/destinations/rishikesh.jpg";
                }
              }}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-primary/90" />
          )}

          {/* Deep gradient overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/20" />

          {/* Hero Content Container */}
          <div className="absolute inset-0 flex flex-col justify-end">
            <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
              {/* Badges / Meta Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 font-semibold text-secondary-foreground shadow-sm">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {destination.country}
                </span>

                {destination.continent ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 font-medium text-white backdrop-blur-md">
                    <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {destination.continent}
                  </span>
                ) : null}

                {destination.best_season ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/90 px-3 py-1 font-semibold text-accent-foreground shadow-sm">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    Best: {destination.best_season}
                  </span>
                ) : null}
              </div>

              {/* Title & Rating */}
              <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="font-display text-4xl font-bold sm:text-5xl lg:text-6xl text-white tracking-tight">
                    {destination.name}
                  </h1>
                  {destination.short_description ? (
                    <p className="mt-2 max-w-2xl text-base sm:text-lg text-white/90 font-sans">
                      {destination.short_description}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-black/40 px-4 py-2 backdrop-blur-md border border-white/10">
                  <Rating value={4.8} count={124} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Details & Highlights Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Main Overview Column (2 cols) */}
          <div className="lg:col-span-2 space-y-10">
            {/* Overview & Story */}
            <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 text-secondary">
                <Compass className="h-5 w-5" aria-hidden="true" />
                <span className="eyebrow text-secondary">Overview & History</span>
              </div>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl text-foreground">
                About {destination.name}
              </h2>
              <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
                <p>{destination.description || destination.short_description}</p>
                <p>
                  Whether you are seeking iconic landmarks, immersive local culture, or scenic
                  natural beauty, {destination.name} offers memorable experiences for every type of
                  traveler.
                </p>
              </div>

              {/* Key Highlights */}
              <div className="mt-8 grid gap-3 sm:grid-cols-2 pt-6 border-t border-border/60">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">
                      Curated Guided Itineraries
                    </h4>
                    <p className="text-xs text-muted-foreground">Verified multi-day experiences</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">Best Time to Visit</h4>
                    <p className="text-xs text-muted-foreground">
                      {destination.best_season || "Year-round"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">Handpicked Stays</h4>
                    <p className="text-xs text-muted-foreground">Top-rated hotels and villas</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">Local Expertise</h4>
                    <p className="text-xs text-muted-foreground">Dedicated travel specialists</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tour Packages Section (Live in Phase 5) */}
            <div className="space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="eyebrow text-secondary">Guided Experiences</span>
                  <h3 className="mt-1 font-display text-2xl text-foreground">
                    Tour Packages in {destination.name}
                  </h3>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-full border-border/80 text-xs"
                >
                  <Link to="/packages" search={{ destination: destination.slug }}>
                    View all {destination.name} tours
                  </Link>
                </Button>
              </div>

              {destinationPackages.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {destinationPackages.map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                  <Package className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
                  <p className="mt-3 font-medium text-sm text-foreground">
                    No dedicated packages listed for {destination.name} yet.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Explore our other worldwide tour itineraries or create a custom inquiry.
                  </p>
                  <Button asChild size="sm" className="mt-4 rounded-full bg-primary text-xs">
                    <Link to="/packages">Browse all packages</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Top Hotels Section (Live in Phase 6) */}
            <div className="space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="eyebrow text-secondary">Accommodations</span>
                  <h3 className="mt-1 font-display text-2xl text-foreground">
                    Top Stays & Hotels in {destination.name}
                  </h3>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-full border-border/80 text-xs"
                >
                  <Link to="/hotels" search={{ destination: destination.slug }}>
                    View all {destination.name} hotels
                  </Link>
                </Button>
              </div>

              {destinationHotels.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {destinationHotels.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                  <Hotel className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
                  <p className="mt-3 font-medium text-sm text-foreground">
                    No hotels listed for {destination.name} yet.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Browse our full catalog of stays worldwide.
                  </p>
                  <Button asChild size="sm" className="mt-4 rounded-full bg-primary text-xs">
                    <Link to="/hotels">Browse all hotels</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <ReviewSection targetId={destination.id} targetType="destination" className="mt-12" />
          </div>

          {/* Quick Facts & Booking Sidebar (1 col) */}
          <div className="space-y-6">
            {/* Fast Facts Card */}
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
              <h3 className="font-display text-xl text-foreground">Quick Facts</h3>

              <dl className="mt-4 divide-y divide-border/60 text-sm">
                <div className="flex justify-between py-3">
                  <dt className="text-muted-foreground">Country</dt>
                  <dd className="font-semibold text-foreground">{destination.country}</dd>
                </div>
                {destination.region ? (
                  <div className="flex justify-between py-3">
                    <dt className="text-muted-foreground">Region</dt>
                    <dd className="font-semibold text-foreground">{destination.region}</dd>
                  </div>
                ) : null}
                {destination.continent ? (
                  <div className="flex justify-between py-3">
                    <dt className="text-muted-foreground">Continent</dt>
                    <dd className="font-semibold text-foreground">{destination.continent}</dd>
                  </div>
                ) : null}
                {destination.best_season ? (
                  <div className="flex justify-between py-3">
                    <dt className="text-muted-foreground">Best Season</dt>
                    <dd className="font-semibold text-foreground">{destination.best_season}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between py-3">
                  <dt className="text-muted-foreground">Traveller Rating</dt>
                  <dd className="font-semibold text-foreground">4.8 / 5.0 (124)</dd>
                </div>
              </dl>
            </div>

            {/* Plan Your Journey CTA Card */}
            <div className="rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/95 p-6 text-primary-foreground shadow-elegant">
              <div className="flex items-center gap-2 text-accent">
                <Sparkles className="h-5 w-5" />
                <span className="eyebrow text-accent">Trip Inspiration</span>
              </div>
              <h3 className="mt-2 font-display text-2xl text-white">
                Ready to visit {destination.name}?
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-primary-foreground/80">
                Explore our full catalog of world destinations and sign up to receive alerts when
                exclusive tour packages open for booking.
              </p>
              <div className="mt-6 flex flex-col gap-2.5">
                <Button
                  asChild
                  className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-sm"
                >
                  <Link to="/destinations">Explore other destinations</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Link to="/contact">Ask a travel specialist</Link>
                </Button>
              </div>
            </div>

            {/* Back to catalog button */}
            <Button
              asChild
              variant="ghost"
              className="w-full rounded-full text-muted-foreground hover:text-foreground"
            >
              <Link to="/destinations">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to all destinations
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
