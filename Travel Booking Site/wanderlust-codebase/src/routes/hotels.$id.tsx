import { useState, useMemo } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  format,
  parseISO,
  differenceInCalendarDays,
  isBefore,
  startOfToday,
  addDays,
} from "date-fns";
import {
  MapPin,
  Star,
  Compass,
  ArrowLeft,
  Wifi,
  Waves,
  Coffee,
  Sparkles,
  Wind,
  UtensilsCrossed,
  Wine,
  Car,
  Tv,
  Dumbbell,
  ShieldCheck,
  Award,
  Headphones,
  CheckCircle2,
  Calendar,
  Users,
  Building,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { BookingCTA } from "@/components/shared/BookingCTA";
import { ReviewSection } from "@/components/shared/ReviewSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { fetchHotelById } from "@/lib/catalog.functions";

const hotelDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["hotels", "detail", id],
    queryFn: () => fetchHotelById({ data: id }),
  });

export const Route = createFileRoute("/hotels/$id")({
  loader: async ({ context, params }) => {
    const hotel = await context.queryClient.ensureQueryData(hotelDetailQueryOptions(params.id));
    if (!hotel) {
      throw notFound();
    }
    return hotel;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Hotel Not Found — Wanderlust" }],
      };
    }
    const title = `${loaderData.name} — Wanderlust Stays`;
    const description =
      loaderData.description ||
      `Book your stay at ${loaderData.name}. ${loaderData.star_rating}-star luxury hotel with prime location and top amenities.`;

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
  notFoundComponent: HotelNotFound,
  component: HotelDetailPage,
});

function HotelNotFound() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 text-secondary">
          <Compass className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="mt-6 font-display text-3xl text-foreground">Hotel Not Found</h1>
        <p className="mt-3 text-muted-foreground">
          The hotel accommodation you are looking for does not exist or is no longer listed.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button
            asChild
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link to="/hotels">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse all hotels
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

function getAmenityIcon(name: string) {
  const normalized = name.toLowerCase();
  if (
    normalized.includes("wi-fi") ||
    normalized.includes("wifi") ||
    normalized.includes("internet")
  ) {
    return Wifi;
  }
  if (normalized.includes("pool") || normalized.includes("swim") || normalized.includes("beach")) {
    return Waves;
  }
  if (normalized.includes("breakfast") || normalized.includes("coffee")) {
    return Coffee;
  }
  if (
    normalized.includes("spa") ||
    normalized.includes("wellness") ||
    normalized.includes("massage")
  ) {
    return Sparkles;
  }
  if (normalized.includes("air") || normalized.includes("ac") || normalized.includes("cooling")) {
    return Wind;
  }
  if (
    normalized.includes("restaurant") ||
    normalized.includes("dining") ||
    normalized.includes("food")
  ) {
    return UtensilsCrossed;
  }
  if (normalized.includes("bar") || normalized.includes("lounge") || normalized.includes("wine")) {
    return Wine;
  }
  if (normalized.includes("parking") || normalized.includes("valet")) {
    return Car;
  }
  if (normalized.includes("gym") || normalized.includes("fitness")) {
    return Dumbbell;
  }
  if (normalized.includes("tv") || normalized.includes("entertainment")) {
    return Tv;
  }
  return CheckCircle2;
}

const bookingFormSchema = z
  .object({
    checkIn: z.string().min(1, "Please select a check-in date"),
    checkOut: z.string().min(1, "Please select a check-out date"),
    guests: z.number().min(1, "At least 1 guest required").max(6, "Maximum 6 guests"),
    rooms: z.number().min(1, "At least 1 room required").max(4, "Maximum 4 rooms"),
  })
  .refine(
    (data) => {
      try {
        const inDate = parseISO(data.checkIn);
        return !isBefore(inDate, startOfToday());
      } catch {
        return false;
      }
    },
    {
      message: "Check-in date must be today or in the future",
      path: ["checkIn"],
    },
  )
  .refine(
    (data) => {
      try {
        const inDate = parseISO(data.checkIn);
        const outDate = parseISO(data.checkOut);
        return differenceInCalendarDays(outDate, inDate) >= 1;
      } catch {
        return false;
      }
    },
    {
      message: "Check-out must be at least 1 night after check-in",
      path: ["checkOut"],
    },
  );

function HotelDetailPage() {
  const { id } = Route.useParams();
  const query = useSuspenseQuery(hotelDetailQueryOptions(id));
  const hotel = query.data;

  // Form State for Booking Card
  const today = useMemo(() => new Date(), []);
  const [checkIn, setCheckIn] = useState<string>(format(addDays(today, 7), "yyyy-MM-dd"));
  const [checkOut, setCheckOut] = useState<string>(format(addDays(today, 10), "yyyy-MM-dd"));
  const [guests, setGuests] = useState<number>(2);
  const [rooms, setRooms] = useState<number>(1);

  if (!hotel) {
    return <HotelNotFound />;
  }

  const destinationText = hotel.destination
    ? `${hotel.destination.name}, ${hotel.destination.country}`
    : "World Destination";

  // Validation
  const validationResult = bookingFormSchema.safeParse({
    checkIn,
    checkOut,
    guests,
    rooms,
  });

  const errors = validationResult.success ? {} : validationResult.error.format();

  // Nights calculation
  let nights = 0;
  try {
    const inDate = parseISO(checkIn);
    const outDate = parseISO(checkOut);
    nights = Math.max(0, differenceInCalendarDays(outDate, inDate));
  } catch {
    nights = 0;
  }

  const isValidBooking = validationResult.success && nights > 0;
  const subtotal = isValidBooking ? nights * hotel.price_per_night * rooms : 0;
  const serviceFee = isValidBooking ? Math.round(subtotal * 0.08) : 0;
  const total = subtotal + serviceFee;

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
                  <Link to="/hotels" className="text-muted-foreground hover:text-foreground">
                    Hotels
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                  {hotel.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Hero Banner with Cinematic Overlay */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="relative h-[380px] sm:h-[460px] lg:h-[500px] w-full">
          {hotel.image_url ? (
            <img src={hotel.image_url} alt={hotel.name} className="h-full w-full object-cover" />
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
                {hotel.destination ? (
                  <Link
                    to="/destinations/$slug"
                    params={{ slug: hotel.destination.slug }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 font-semibold text-secondary-foreground shadow-sm hover:opacity-90 transition-opacity"
                  >
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {hotel.destination.name}, {hotel.destination.country}
                  </Link>
                ) : null}

                <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-3 py-1 font-semibold text-white backdrop-blur-md">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: hotel.star_rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                    ))}
                  </div>
                  <span className="ml-1 text-white">{hotel.star_rating}-Star Accommodation</span>
                </span>
              </div>

              {/* Title & Location */}
              <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-3xl">
                  <h1 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl text-white tracking-tight">
                    {hotel.name}
                  </h1>
                  {hotel.address ? (
                    <p className="mt-2 text-base sm:text-lg text-white/90 font-sans flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-accent shrink-0" />
                      {hotel.address}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-black/40 px-4 py-2 backdrop-blur-md border border-white/10">
                  <div className="text-right">
                    <span className="font-display text-2xl font-bold text-accent">
                      ${hotel.price_per_night.toLocaleString()}
                    </span>
                    <span className="text-xs text-white/80 block">per night</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Sticky Booking Card Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Main Details & Amenities Column (2 cols) */}
          <div className="lg:col-span-2 space-y-10">
            {/* About & Description */}
            <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 text-secondary">
                <Compass className="h-5 w-5" aria-hidden="true" />
                <span className="eyebrow text-secondary">About the Property</span>
              </div>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl text-foreground">
                Overview & Architecture
              </h2>
              <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
                <p>{hotel.description}</p>
                <p>
                  Designed with luxury, privacy, and serene relaxation in mind, {hotel.name} offers
                  impeccable hospitality, authentic regional gastronomy, and premium comfort in{" "}
                  {destinationText}.
                </p>
              </div>

              {/* Property Snapshot */}
              <div className="mt-8 grid gap-4 sm:grid-cols-3 pt-6 border-t border-border/60">
                <div className="rounded-xl bg-muted/50 p-3.5">
                  <p className="text-xs text-muted-foreground font-medium">Rating Tier</p>
                  <p className="mt-1 font-semibold text-foreground flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    {hotel.star_rating}-Star Luxury
                  </p>
                </div>

                <div className="rounded-xl bg-muted/50 p-3.5">
                  <p className="text-xs text-muted-foreground font-medium">Destination</p>
                  <p className="mt-1 font-semibold text-foreground truncate flex items-center gap-1.5">
                    <Building className="h-4 w-4 text-secondary shrink-0" />
                    <span className="truncate">{destinationText}</span>
                  </p>
                </div>

                <div className="rounded-xl bg-muted/50 p-3.5">
                  <p className="text-xs text-muted-foreground font-medium">Service Standard</p>
                  <p className="mt-1 font-semibold text-foreground flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-secondary" />
                    Verified Stay
                  </p>
                </div>
              </div>
            </div>

            {/* Amenities Grid with Lucide Icons */}
            <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="eyebrow text-secondary">Property Comforts</span>
                  <h2 className="mt-1 font-display text-2xl sm:text-3xl text-foreground">
                    Featured Amenities
                  </h2>
                </div>
                <Badge variant="secondary" className="rounded-full bg-secondary/10 text-secondary">
                  {hotel.amenities.length} Amenities
                </Badge>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {hotel.amenities.map((amenity, idx) => {
                  const Icon = getAmenityIcon(amenity);
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3.5 transition-colors hover:bg-muted/60"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews Section */}
            <ReviewSection targetId={hotel.id} targetType="hotel" className="mt-12" />
          </div>

          {/* Sticky Interactive Booking Card (1 col) */}
          <div className="space-y-6">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-md">
                {/* Header Price */}
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground font-medium">Nightly Rate</span>
                  <div className="text-right">
                    <span className="font-display text-3xl font-bold text-accent">
                      ${hotel.price_per_night.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">/ night</span>
                  </div>
                </div>

                {/* Form Controls */}
                <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
                  {/* Date Range Inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label
                        htmlFor="checkIn"
                        className="text-xs text-muted-foreground font-medium"
                      >
                        Check-in
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="checkIn"
                          type="date"
                          value={checkIn}
                          min={format(today, "yyyy-MM-dd")}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="h-10 text-xs rounded-xl bg-background border-border/80"
                        />
                      </div>
                      {errors.checkIn?._errors?.[0] ? (
                        <p className="mt-1 text-[11px] text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {errors.checkIn._errors[0]}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <Label
                        htmlFor="checkOut"
                        className="text-xs text-muted-foreground font-medium"
                      >
                        Check-out
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="checkOut"
                          type="date"
                          value={checkOut}
                          min={checkIn || format(today, "yyyy-MM-dd")}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="h-10 text-xs rounded-xl bg-background border-border/80"
                        />
                      </div>
                      {errors.checkOut?._errors?.[0] ? (
                        <p className="mt-1 text-[11px] text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {errors.checkOut._errors[0]}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Steppers: Guests & Rooms */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <Label htmlFor="guests" className="text-xs text-muted-foreground font-medium">
                        Guests
                      </Label>
                      <div className="mt-1 flex items-center rounded-xl border border-border/80 bg-background px-3 h-10 justify-between">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold text-foreground">
                          {guests} Guests
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setGuests(Math.max(1, guests - 1))}
                            disabled={guests <= 1}
                            className="h-6 w-6 rounded text-xs font-bold text-muted-foreground hover:bg-muted disabled:opacity-30"
                            aria-label="Decrease guests"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => setGuests(Math.min(6, guests + 1))}
                            disabled={guests >= 6}
                            className="h-6 w-6 rounded text-xs font-bold text-muted-foreground hover:bg-muted disabled:opacity-30"
                            aria-label="Increase guests"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="rooms" className="text-xs text-muted-foreground font-medium">
                        Rooms
                      </Label>
                      <div className="mt-1 flex items-center rounded-xl border border-border/80 bg-background px-3 h-10 justify-between">
                        <Building className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold text-foreground">
                          {rooms} {rooms === 1 ? "Room" : "Rooms"}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setRooms(Math.max(1, rooms - 1))}
                            disabled={rooms <= 1}
                            className="h-6 w-6 rounded text-xs font-bold text-muted-foreground hover:bg-muted disabled:opacity-30"
                            aria-label="Decrease rooms"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => setRooms(Math.min(4, rooms + 1))}
                            disabled={rooms >= 4}
                            className="h-6 w-6 rounded text-xs font-bold text-muted-foreground hover:bg-muted disabled:opacity-30"
                            aria-label="Increase rooms"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Price Breakdown Calculation */}
                  {isValidBooking ? (
                    <div className="rounded-xl bg-muted/40 p-3.5 space-y-2 text-xs border border-border/50 mt-4">
                      <div className="flex justify-between text-muted-foreground">
                        <span>
                          ${hotel.price_per_night} × {nights} {nights === 1 ? "night" : "nights"}
                          {rooms > 1 ? ` × ${rooms} rooms` : ""}
                        </span>
                        <span className="font-medium text-foreground">
                          ${subtotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Taxes & Service fees (8%)</span>
                        <span className="font-medium text-foreground">
                          ${serviceFee.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-border/60 pt-2 font-semibold text-foreground text-sm">
                        <span>Total (Live estimate)</span>
                        <span className="text-accent font-display text-base font-bold">
                          ${total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2 mt-4">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>
                        Please select valid future dates (min 1 night stay) to see totals.
                      </span>
                    </div>
                  )}

                  {/* Live BookingCTA */}
                  <div className="pt-2">
                    <BookingCTA
                      label="Reserve This Stay"
                      itemType="hotel"
                      itemId={hotel.id}
                      startDate={checkIn}
                      endDate={checkOut}
                      guests={guests}
                      rooms={rooms}
                      disabled={!validationResult.success}
                    />
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      Instant confirmation • 256-bit encrypted checkout
                    </p>
                  </div>
                </form>

                {/* Trust Badges */}
                <div className="mt-6 space-y-3 pt-6 border-t border-border/60 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-secondary shrink-0" />
                    <span>Free cancellation up to 48 hours before check-in</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Award className="h-4 w-4 text-secondary shrink-0" />
                    <span>Best rate guarantee with verified booking</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Headphones className="h-4 w-4 text-secondary shrink-0" />
                    <span>24/7 dedicated hotel front-desk concierge</span>
                  </div>
                </div>
              </div>

              {/* Back to Hotels Link */}
              <Button
                asChild
                variant="ghost"
                className="w-full rounded-full text-muted-foreground hover:text-foreground"
              >
                <Link to="/hotels">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to all hotels
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
