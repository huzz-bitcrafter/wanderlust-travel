import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  MapPin,
  Clock,
  Users,
  Compass,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Award,
  Headphones,
  Calendar,
  Sparkles,
} from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Rating } from "@/components/shared/Rating";
import { ReviewSection } from "@/components/shared/ReviewSection";
import { BookingCTA } from "@/components/shared/BookingCTA";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { fetchPackageBySlug } from "@/lib/catalog.functions";

const packageDetailQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["packages", "detail", slug],
    queryFn: () => fetchPackageBySlug({ data: slug }),
  });

export const Route = createFileRoute("/packages/$slug")({
  loader: async ({ context, params }) => {
    const pkg = await context.queryClient.ensureQueryData(packageDetailQueryOptions(params.slug));
    if (!pkg) {
      throw notFound();
    }
    return pkg;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Tour Package Not Found — Wanderlust" }],
      };
    }
    const title = `${loaderData.title} — Wanderlust Tour Packages`;
    const description =
      loaderData.summary ||
      loaderData.description ||
      `Book the ${loaderData.title} tour package. ${loaderData.duration_days} days of curated adventure.`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        ...(loaderData.image_url ? [{ property: "og:image", content: loaderData.image_url }] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: PackageNotFound,
  component: PackageDetailPage,
});

function PackageNotFound() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 text-secondary">
          <Compass className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="mt-6 font-display text-3xl text-foreground">Tour Package Not Found</h1>
        <p className="mt-3 text-muted-foreground">
          The tour package you are looking for does not exist or has been retired. Explore our full
          catalog of guided journeys.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button
            asChild
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link to="/packages">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse all packages
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

function PackageDetailPage() {
  const { slug } = Route.useParams();
  const query = useSuspenseQuery(packageDetailQueryOptions(slug));
  const pkg = query.data;

  if (!pkg) {
    return <PackageNotFound />;
  }

  const destinationText = pkg.destination
    ? `${pkg.destination.name}, ${pkg.destination.country}`
    : "Multi-destination";

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
                  <Link to="/packages" className="text-muted-foreground hover:text-foreground">
                    Tour Packages
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                  {pkg.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Hero Banner with Cinematic Overlay */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="relative h-[380px] sm:h-[460px] lg:h-[520px] w-full">
          {pkg.image_url ? (
            <img src={pkg.image_url} alt={pkg.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-primary/90" />
          )}

          {/* Deep gradient overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/75 to-primary/25" />

          {/* Hero Content Container */}
          <div className="absolute inset-0 flex flex-col justify-end">
            <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
              {/* Badges / Meta Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {pkg.destination ? (
                  <Link
                    to="/destinations/$slug"
                    params={{ slug: pkg.destination.slug }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 font-semibold text-secondary-foreground shadow-sm hover:opacity-90 transition-opacity"
                  >
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {pkg.destination.name}, {pkg.destination.country}
                  </Link>
                ) : null}

                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 font-medium capitalize text-white backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  {pkg.difficulty} pace
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 font-medium text-white backdrop-blur-md">
                  <Clock className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
                  {pkg.duration_days} {pkg.duration_days === 1 ? "day" : "days"}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 font-medium text-white backdrop-blur-md">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  Max {pkg.group_size_max} guests
                </span>
              </div>

              {/* Title & Rating */}
              <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-3xl">
                  <h1 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl text-white tracking-tight">
                    {pkg.title}
                  </h1>
                  {pkg.summary ? (
                    <p className="mt-2 text-base sm:text-lg text-white/90 font-sans leading-relaxed">
                      {pkg.summary}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-black/40 px-4 py-2 backdrop-blur-md border border-white/10">
                  <Rating value={4.8} count={86} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Sticky Booking Card Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Main Itinerary & Overview Column (2 cols) */}
          <div className="lg:col-span-2 space-y-10">
            {/* Overview & Story */}
            <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 text-secondary">
                <Compass className="h-5 w-5" aria-hidden="true" />
                <span className="eyebrow text-secondary">Experience Details</span>
              </div>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl text-foreground">
                Trip Overview
              </h2>
              <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
                <p>{pkg.description || pkg.summary}</p>
                <p>
                  Every detail of this itinerary is handled from arrival to departure: private
                  transport, handpicked boutique lodgings, authentic culinary experiences, and
                  knowledgeable local specialists guiding each day.
                </p>
              </div>

              {/* Trip Highlights Specs */}
              <div className="mt-8 grid gap-4 sm:grid-cols-3 pt-6 border-t border-border/60">
                <div className="rounded-xl bg-muted/50 p-3.5">
                  <p className="text-xs text-muted-foreground font-medium">Duration</p>
                  <p className="mt-1 font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-secondary" />
                    {pkg.duration_days} Days / {Math.max(1, pkg.duration_days - 1)} Nights
                  </p>
                </div>

                <div className="rounded-xl bg-muted/50 p-3.5">
                  <p className="text-xs text-muted-foreground font-medium">Group Size</p>
                  <p className="mt-1 font-semibold text-foreground flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-secondary" />
                    Up to {pkg.group_size_max} people
                  </p>
                </div>

                <div className="rounded-xl bg-muted/50 p-3.5">
                  <p className="text-xs text-muted-foreground font-medium">Activity Level</p>
                  <p className="mt-1 font-semibold text-foreground capitalize flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-accent" />
                    {pkg.difficulty}
                  </p>
                </div>
              </div>
            </div>

            {/* Day-by-Day Itinerary Accordion */}
            <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="eyebrow text-secondary">Day by Day</span>
                  <h2 className="mt-1 font-display text-2xl sm:text-3xl text-foreground">
                    Full Itinerary
                  </h2>
                </div>
                <Badge variant="secondary" className="rounded-full bg-secondary/10 text-secondary">
                  {pkg.itinerary.length} {pkg.itinerary.length === 1 ? "Day" : "Days"} Planned
                </Badge>
              </div>

              {pkg.itinerary.length > 0 ? (
                <div className="mt-6">
                  <Accordion type="multiple" defaultValue={["day-1"]} className="w-full">
                    {pkg.itinerary.map((item) => (
                      <AccordionItem
                        key={item.day}
                        value={`day-${item.day}`}
                        className="border-border/60"
                      >
                        <AccordionTrigger className="hover:no-underline py-4 text-left">
                          <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                              {item.day}
                            </span>
                            <span className="font-display text-lg font-semibold text-foreground">
                              Day {item.day}: {item.title}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-10 text-muted-foreground text-sm leading-relaxed pb-4">
                          {item.description}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ) : (
                <p className="mt-6 text-sm text-muted-foreground">
                  Detailed day-by-day schedule will be provided upon booking confirmation.
                </p>
              )}
            </div>

            {/* Includes & Excludes Comparison */}
            <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 shadow-sm">
              <div>
                <span className="eyebrow text-secondary">What's Covered</span>
                <h2 className="mt-1 font-display text-2xl sm:text-3xl text-foreground">
                  Includes & Excludes
                </h2>
              </div>

              <div className="mt-6 grid gap-8 sm:grid-cols-2">
                {/* What's Included */}
                <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-5">
                  <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-secondary">
                    <CheckCircle2 className="h-5 w-5 text-secondary" />
                    What's Included
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {pkg.includes.length > 0 ? (
                      pkg.includes.map((inc, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <CheckCircle2 className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                          <span>{inc}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-muted-foreground">
                        All accommodations, transfers, and daily activities as specified.
                      </li>
                    )}
                  </ul>
                </div>

                {/* What's Excluded */}
                <div className="rounded-xl border border-border/60 bg-muted/30 p-5">
                  <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-muted-foreground">
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                    Not Included
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {pkg.excludes.length > 0 ? (
                      pkg.excludes.map((exc, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <XCircle className="h-4 w-4 text-destructive/70 shrink-0 mt-0.5" />
                          <span>{exc}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-muted-foreground">
                        International airfare, visa fees, and personal travel insurance.
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Reviews Section */}
              <ReviewSection targetId={pkg.id} targetType="tour" className="mt-12" />
            </div>
          </div>

          {/* Sticky Booking & Details Sidebar (1 col) */}
          <div className="space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Pricing & Booking Card */}
              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-md">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground font-medium">
                    Price per person
                  </span>
                  <div className="text-right">
                    <span className="font-display text-3xl font-bold text-accent">
                      ${pkg.price_per_person.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      Taxes & fees included
                    </span>
                  </div>
                </div>

                <div className="mt-6 divide-y divide-border/60 border-y border-border/60 text-sm">
                  <div className="flex justify-between py-3">
                    <span className="text-muted-foreground">Destination</span>
                    <span className="font-semibold text-foreground truncate max-w-[160px]">
                      {destinationText}
                    </span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-semibold text-foreground">
                      {pkg.duration_days} Days / {Math.max(1, pkg.duration_days - 1)} Nights
                    </span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-muted-foreground">Difficulty</span>
                    <span className="font-semibold text-foreground capitalize">
                      {pkg.difficulty}
                    </span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-muted-foreground">Max Group</span>
                    <span className="font-semibold text-foreground">
                      {pkg.group_size_max} Guests
                    </span>
                  </div>
                </div>

                {/* Live BookingCTA */}
                <div className="mt-6">
                  <BookingCTA label="Book This Tour" itemType="tour" itemId={pkg.id} guests={1} />
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Secure 256-bit encrypted reservation
                  </p>
                </div>

                {/* Trust & Guarantee Badges */}
                <div className="mt-6 space-y-3 pt-6 border-t border-border/60 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-secondary shrink-0" />
                    <span>Free cancellation up to 30 days before departure</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Award className="h-4 w-4 text-secondary shrink-0" />
                    <span>Expert English-speaking certified local guides</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Headphones className="h-4 w-4 text-secondary shrink-0" />
                    <span>24/7 on-trip concierge and emergency support</span>
                  </div>
                </div>
              </div>

              {/* Need Help Card */}
              <div className="rounded-2xl border border-border/70 bg-muted/40 p-6">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Customizing this trip?
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Want private departure dates or custom itinerary modifications for your group?
                  Speak to one of our destination designers.
                </p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full rounded-full border-border/80 text-xs font-medium"
                >
                  <Link to="/contact">Contact a specialist</Link>
                </Button>
              </div>

              {/* Back to Packages Button */}
              <Button
                asChild
                variant="ghost"
                className="w-full rounded-full text-muted-foreground hover:text-foreground"
              >
                <Link to="/packages">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to all packages
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
