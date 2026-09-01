import React, { useState, useMemo } from "react";
import {
  createFileRoute,
  useNavigate,
  useChildMatches,
  Outlet,
  Link,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { requireAuthGuard } from "@/lib/auth-guard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { insertBookingWithRetry } from "@/lib/booking-utils";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Check,
  ShieldCheck,
  CreditCard,
  User,
  Users,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles,
  Plane,
  Hotel as HotelIcon,
  Compass,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { format, parseISO, addDays, differenceInCalendarDays } from "date-fns";

export interface CheckoutSearch {
  itemType: "tour" | "hotel" | "flight";
  itemId: string;
  startDate?: string;
  endDate?: string;
  guests?: number;
  rooms?: number;
  cabinClass?: string;
}

const title = "Secure Checkout — Wanderlust";
const description = "Complete your booking with safe, instant checkout.";

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>): CheckoutSearch => {
    const validItemTypes = ["tour", "hotel", "flight"] as const;
    const rawType = typeof search.itemType === "string" ? search.itemType : "tour";
    const itemType = validItemTypes.includes(rawType as (typeof validItemTypes)[number])
      ? (rawType as "tour" | "hotel" | "flight")
      : "tour";

    const itemId = typeof search.itemId === "string" ? search.itemId : "";
    const startDate = typeof search.startDate === "string" ? search.startDate : undefined;
    const endDate = typeof search.endDate === "string" ? search.endDate : undefined;
    const rawGuests = Number(search.guests);
    const guests = !isNaN(rawGuests) && rawGuests > 0 ? rawGuests : 1;
    const rawRooms = Number(search.rooms);
    const rooms = !isNaN(rawRooms) && rawRooms > 0 ? rawRooms : 1;
    const cabinClass = typeof search.cabinClass === "string" ? search.cabinClass : undefined;

    return {
      itemType,
      itemId,
      startDate,
      endDate,
      guests,
      rooms,
      cabinClass,
    };
  },
  beforeLoad: requireAuthGuard,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: CheckoutRouteComponent,
});

function CheckoutRouteComponent() {
  const childMatches = useChildMatches();
  const hasChildRoute = childMatches.some(
    (m) => m.routeId !== Route.id && m.pathname !== "/checkout" && m.pathname !== "/checkout/",
  );
  if (hasChildRoute) {
    return <Outlet />;
  }
  return <CheckoutPage />;
}

// Validation schemas
const guestDetailsSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().min(6, "Please enter a valid phone number"),
  specialRequests: z.string().optional(),
  additionalGuests: z.array(z.string().trim().min(2, "Guest name is required")),
});

const paymentSchema = z.object({
  cardholderName: z.string().trim().min(2, "Cardholder name is required"),
  cardNumber: z
    .string()
    .trim()
    .transform((v) => v.replace(/\s+/g, ""))
    .refine((v) => /^\d{15,19}$/.test(v), "Card number must be 15 to 19 digits"),
  expiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "Expiration date must be in MM/YY format"),
  cvc: z
    .string()
    .trim()
    .regex(/^\d{3,4}$/, "CVC must be 3 or 4 digits"),
  zipCode: z.string().trim().optional(),
});

interface ItemData {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  location?: string;
  unitPrice: number;
  extraInfo?: string;
}

function CheckoutPage() {
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.user_metadata?.phone || "");
  const [specialRequests, setSpecialRequests] = useState("");
  const [additionalGuests, setAdditionalGuests] = useState<string[]>(() =>
    searchParams.guests && searchParams.guests > 1
      ? Array.from({ length: searchParams.guests - 1 }, () => "")
      : [],
  );

  // Payment Form State
  const [cardholderName, setCardholderName] = useState(
    user?.user_metadata?.full_name || "Jane Doe",
  );
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("123");
  const [zipCode, setZipCode] = useState("90210");
  const [isProcessing, setIsProcessing] = useState(false);

  // Form Errors
  const [guestErrors, setGuestErrors] = useState<Record<string, string>>({});
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});

  // Query item details from database
  const { data: itemData, isLoading: isItemLoading } = useQuery<ItemData | null>({
    queryKey: ["checkout-item", searchParams.itemType, searchParams.itemId],
    queryFn: async () => {
      if (!searchParams.itemId) return null;

      if (searchParams.itemType === "tour") {
        const { data, error } = await supabase
          .from("tour_packages")
          .select(
            "id, title, summary, price_per_person, duration_days, image_url, destination:destinations(name, country)",
          )
          .eq("id", searchParams.itemId)
          .single();

        if (error || !data) return null;

        return {
          id: data.id,
          title: data.title,
          subtitle: `${data.duration_days} Days Guided Tour`,
          image: data.image_url || undefined,
          location: data.destination
            ? `${data.destination.name}, ${data.destination.country}`
            : undefined,
          unitPrice: Number(data.price_per_person),
          extraInfo: `${data.duration_days} Days Tour`,
        };
      }

      if (searchParams.itemType === "hotel") {
        const { data, error } = await supabase
          .from("hotels")
          .select(
            "id, name, address, price_per_night, star_rating, image_url, destination:destinations(name, country)",
          )
          .eq("id", searchParams.itemId)
          .single();

        if (error || !data) return null;

        return {
          id: data.id,
          title: data.name,
          subtitle: `${data.star_rating}-Star Accommodation`,
          image: data.image_url || undefined,
          location: data.destination
            ? `${data.destination.name}, ${data.destination.country}`
            : data.address || undefined,
          unitPrice: Number(data.price_per_night),
          extraInfo: `${data.star_rating} Stars`,
        };
      }

      if (searchParams.itemType === "flight") {
        const { data, error } = await supabase
          .from("flights")
          .select(
            "id, airline, flight_number, origin_city, origin_code, destination_city, destination_code, departure_time, arrival_time, class, price",
          )
          .eq("id", searchParams.itemId)
          .single();

        if (error || !data) return null;

        return {
          id: data.id,
          title: `${data.airline} (${data.flight_number})`,
          subtitle: `${data.origin_code} → ${data.destination_code} • ${data.class.toUpperCase()}`,
          location: `${data.origin_city} to ${data.destination_city}`,
          unitPrice: Number(data.price),
          extraInfo: `Departing ${format(parseISO(data.departure_time), "MMM d, yyyy h:mm a")}`,
        };
      }

      return null;
    },
    enabled: !!searchParams.itemId,
  });

  // Calculate pricing
  const pricing = useMemo(() => {
    const guests = searchParams.guests || 1;
    const rooms = searchParams.rooms || 1;
    const baseRate = itemData?.unitPrice || 0;

    let baseAmount = 0;
    let rateLabel = "";

    if (searchParams.itemType === "tour") {
      baseAmount = baseRate * guests;
      rateLabel = `$${baseRate.toLocaleString()} × ${guests} ${guests === 1 ? "guest" : "guests"}`;
    } else if (searchParams.itemType === "hotel") {
      let nights = 1;
      if (searchParams.startDate && searchParams.endDate) {
        try {
          const inDate = parseISO(searchParams.startDate);
          const outDate = parseISO(searchParams.endDate);
          nights = Math.max(1, differenceInCalendarDays(outDate, inDate));
        } catch {
          nights = 1;
        }
      }
      baseAmount = baseRate * nights * rooms;
      rateLabel = `$${baseRate.toLocaleString()} × ${nights} ${nights === 1 ? "night" : "nights"}${rooms > 1 ? ` × ${rooms} rooms` : ""}`;
    } else if (searchParams.itemType === "flight") {
      baseAmount = baseRate * guests;
      rateLabel = `$${baseRate.toLocaleString()} × ${guests} ${guests === 1 ? "passenger" : "passengers"}`;
    }

    const taxesAndFees = Math.round(baseAmount * 0.1);
    const totalAmount = baseAmount + taxesAndFees;

    return {
      baseAmount,
      rateLabel,
      taxesAndFees,
      totalAmount,
    };
  }, [itemData, searchParams]);

  // Sync additional guests length if searchParams.guests changes
  React.useEffect(() => {
    const count = (searchParams.guests || 1) - 1;
    setAdditionalGuests((prev) => {
      if (count <= 0) return [];
      if (prev.length === count) return prev;
      return Array.from({ length: count }, (_, i) => prev[i] || "");
    });
  }, [searchParams.guests]);

  // Step 2 validation
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const result = guestDetailsSchema.safeParse({
      fullName,
      email,
      phone,
      specialRequests,
      additionalGuests,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        fieldErrors[path] = issue.message;
      });
      setGuestErrors(fieldErrors);
      toast.error("Please fill in all required guest information.");
      return;
    }

    setGuestErrors({});
    setCurrentStep(3);
  };

  // Step 3 submission
  const handleCompleteBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to complete a booking.");
      return;
    }

    const paymentResult = paymentSchema.safeParse({
      cardholderName,
      cardNumber,
      expiry,
      cvc,
      zipCode,
    });

    if (!paymentResult.success) {
      const fieldErrors: Record<string, string> = {};
      paymentResult.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        fieldErrors[path] = issue.message;
      });
      setPaymentErrors(fieldErrors);
      toast.error("Please correct the card details.");
      return;
    }

    setPaymentErrors({});
    setIsProcessing(true);

    try {
      // Simulate secure processing latency
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const last4 = cardNumber.replace(/\s+/g, "").slice(-4) || "4242";

      const bookingPayload = {
        user_id: user.id,
        booking_type: searchParams.itemType,
        item_id: searchParams.itemId,
        travel_date: searchParams.startDate || format(addDays(new Date(), 7), "yyyy-MM-dd"),
        end_date: searchParams.endDate || null,
        guests: searchParams.guests || 1,
        total_price: pricing.totalAmount,
        status: "confirmed",
        payment_status: "paid",
        guest_details: {
          primaryGuest: {
            fullName,
            email,
            phone,
            specialRequests,
          },
          additionalGuests,
          payment: {
            method: "Credit Card",
            last4,
            cardholderName,
          },
          itemSnapshot: {
            title: itemData?.title || "Wanderlust Experience",
            subtitle: itemData?.subtitle,
            location: itemData?.location,
            rateLabel: pricing.rateLabel,
          },
        },
      };

      const booking = await insertBookingWithRetry(bookingPayload);

      toast.success("Booking confirmed successfully!");
      navigate({
        to: "/checkout/confirmation",
        search: { bookingId: booking.id },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to process booking";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFillDemoCard = () => {
    setCardholderName(user?.user_metadata?.full_name || "Jane Explorer");
    setCardNumber("4242 4242 4242 4242");
    setExpiry("12/28");
    setCvc("888");
    setZipCode("90210");
    setPaymentErrors({});
    toast.info("Demo card details filled!");
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header and Step Indicator */}
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <Badge
            variant="outline"
            className="mb-3 border-secondary/30 bg-secondary/5 text-secondary font-medium"
          >
            <Lock className="mr-1.5 h-3.5 w-3.5" /> 256-Bit Encrypted Checkout
          </Badge>
          <h1 className="font-display text-3xl font-bold sm:text-4xl text-foreground">
            Complete Your Reservation
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Fast, transparent, and protected by our Wanderlust guarantee.
          </p>

          {/* Stepper */}
          <div className="mt-8 flex items-center justify-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                currentStep === 1
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : currentStep > 1
                    ? "bg-secondary/20 text-secondary hover:bg-secondary/30"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/20 text-xs">
                {currentStep > 1 ? <Check className="h-3 w-3" /> : "1"}
              </span>
              <span>1. Trip Summary</span>
            </button>

            <div className="h-0.5 w-6 sm:w-10 bg-border" />

            <button
              type="button"
              onClick={() => {
                if (currentStep > 2) setCurrentStep(2);
              }}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                currentStep === 2
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : currentStep > 2
                    ? "bg-secondary/20 text-secondary hover:bg-secondary/30"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/20 text-xs">
                {currentStep > 2 ? <Check className="h-3 w-3" /> : "2"}
              </span>
              <span>2. Guest Details</span>
            </button>

            <div className="h-0.5 w-6 sm:w-10 bg-border" />

            <div
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                currentStep === 3
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/20 text-xs">
                3
              </span>
              <span>3. Payment</span>
            </div>
          </div>
        </div>

        {/* Main Grid: 2 cols (Form / Details on Left, Summary Card on Right) */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Current Step Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* STEP 1: Trip Summary Review */}
            {currentStep === 1 && (
              <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border/60 pb-4">
                  <Compass className="h-5 w-5 text-secondary" />
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Review Reservation Details
                  </h2>
                </div>

                {isItemLoading ? (
                  <div className="space-y-4 py-6">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : !itemData ? (
                  <div className="py-8 text-center">
                    <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" />
                    <h3 className="mt-3 font-semibold">Item Not Found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Could not load the requested package or accommodation.
                    </p>
                    <Button asChild className="mt-4 rounded-full">
                      <Link to="/destinations">Browse Destinations</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="mt-6 space-y-6">
                    {/* Item Card Overview */}
                    <div className="flex flex-col sm:flex-row gap-4 rounded-xl border border-border/60 bg-muted/30 p-4">
                      {itemData.image ? (
                        <img
                          src={itemData.image}
                          alt={itemData.title}
                          className="h-28 w-full sm:w-36 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-28 w-full sm:w-36 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {searchParams.itemType === "flight" ? (
                            <Plane className="h-8 w-8" />
                          ) : (
                            <HotelIcon className="h-8 w-8" />
                          )}
                        </div>
                      )}

                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="capitalize text-xs font-semibold">
                            {searchParams.itemType}
                          </Badge>
                          {itemData.location && (
                            <span className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="mr-1 h-3 w-3 text-secondary" />
                              {itemData.location}
                            </span>
                          )}
                        </div>

                        <h3 className="font-display text-lg font-bold text-foreground">
                          {itemData.title}
                        </h3>

                        {itemData.subtitle && (
                          <p className="text-xs text-muted-foreground">{itemData.subtitle}</p>
                        )}
                      </div>
                    </div>

                    {/* Booking Parameters Summary */}
                    <div className="grid gap-4 sm:grid-cols-2 rounded-xl border border-border/60 p-4 text-sm">
                      <div className="flex items-start gap-3">
                        <Calendar className="mt-0.5 h-4 w-4 text-secondary" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Dates</span>
                          <span className="font-medium text-foreground">
                            {searchParams.startDate
                              ? format(parseISO(searchParams.startDate), "MMM d, yyyy")
                              : "Next Available Departure"}
                            {searchParams.endDate &&
                              ` – ${format(parseISO(searchParams.endDate), "MMM d, yyyy")}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Users className="mt-0.5 h-4 w-4 text-secondary" />
                        <div>
                          <span className="text-xs text-muted-foreground block">Guests</span>
                          <span className="font-medium text-foreground">
                            {searchParams.guests || 1}{" "}
                            {searchParams.guests === 1 ? "Traveler" : "Travelers"}
                            {searchParams.itemType === "hotel" &&
                              searchParams.rooms &&
                              ` (${searchParams.rooms} Room)`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Inclusions Guarantee */}
                    <div className="rounded-xl bg-accent/10 border border-accent/20 p-4 text-xs text-foreground space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-accent-foreground">
                        <Sparkles className="h-4 w-4 text-accent" />
                        <span>Included in your booking</span>
                      </div>
                      <p className="text-muted-foreground">
                        Instant booking confirmation, 24/7 dedicated concierge assistance, and free
                        cancellation up to 48 hours prior to start date.
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      <Button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-sm font-semibold shadow-md"
                      >
                        Continue to Guest Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Guest Details Form */}
            {currentStep === 2 && (
              <form
                onSubmit={handleProceedToPayment}
                className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-secondary" />
                    <h2 className="font-display text-xl font-bold text-foreground">
                      Primary Contact & Traveler Information
                    </h2>
                  </div>
                  <span className="text-xs text-muted-foreground">Step 2 of 3</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName" className="text-xs font-semibold">
                      Primary Traveler Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="mt-1"
                    />
                    {guestErrors.fullName && (
                      <p className="mt-1 text-xs text-destructive">{guestErrors.fullName}</p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="email" className="text-xs font-semibold">
                        Email Address (for confirmation) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@example.com"
                        className="mt-1"
                      />
                      {guestErrors.email && (
                        <p className="mt-1 text-xs text-destructive">{guestErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-xs font-semibold">
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="mt-1"
                      />
                      {guestErrors.phone && (
                        <p className="mt-1 text-xs text-destructive">{guestErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Additional Guests names */}
                  {additionalGuests.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <Label className="text-xs font-semibold block text-foreground">
                        Additional Travelers Names ({additionalGuests.length})
                      </Label>
                      {additionalGuests.map((name, idx) => (
                        <div key={idx}>
                          <Input
                            value={name}
                            onChange={(e) => {
                              const updated = [...additionalGuests];
                              updated[idx] = e.target.value;
                              setAdditionalGuests(updated);
                            }}
                            placeholder={`Guest ${idx + 2} Full Name`}
                          />
                          {guestErrors[`additionalGuests.${idx}`] && (
                            <p className="mt-1 text-xs text-destructive">
                              {guestErrors[`additionalGuests.${idx}`]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Special Requests */}
                  <div>
                    <Label htmlFor="specialRequests" className="text-xs font-semibold">
                      Special Requests / Dietary Notes (Optional)
                    </Label>
                    <Textarea
                      id="specialRequests"
                      rows={3}
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="e.g. Vegetarian meals, high floor, quiet room, late check-in..."
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/60">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="rounded-full sm:w-1/3"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-2/3 h-11 font-semibold"
                  >
                    Proceed to Payment <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 3: Payment Form */}
            {currentStep === 3 && (
              <form
                onSubmit={handleCompleteBooking}
                className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-secondary" />
                    <h2 className="font-display text-xl font-bold text-foreground">
                      Payment Details
                    </h2>
                  </div>
                  <span className="text-xs text-muted-foreground">Step 3 of 3</span>
                </div>

                {/* Demo Notice Banner */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="font-semibold flex items-center gap-1 text-primary">
                      <ShieldCheck className="h-4 w-4" /> Demo Mode Enabled
                    </span>
                    <p className="text-muted-foreground">
                      No real financial charge will occur. You can test freely.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleFillDemoCard}
                    className="rounded-full text-xs font-semibold shrink-0"
                  >
                    Quick Fill Test Card
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardholderName" className="text-xs font-semibold">
                      Name on Card <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="cardholderName"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder="Jane Doe"
                      className="mt-1"
                    />
                    {paymentErrors.cardholderName && (
                      <p className="mt-1 text-xs text-destructive">
                        {paymentErrors.cardholderName}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cardNumber" className="text-xs font-semibold">
                      Card Number <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="cardNumber"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        className="pr-10"
                      />
                      <CreditCard className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                    {paymentErrors.cardNumber && (
                      <p className="mt-1 text-xs text-destructive">{paymentErrors.cardNumber}</p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="expiry" className="text-xs font-semibold">
                        Expires (MM/YY) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="expiry"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="12/28"
                        className="mt-1"
                      />
                      {paymentErrors.expiry && (
                        <p className="mt-1 text-xs text-destructive">{paymentErrors.expiry}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="cvc" className="text-xs font-semibold">
                        CVC / CVV <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="cvc"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        placeholder="123"
                        className="mt-1"
                      />
                      {paymentErrors.cvc && (
                        <p className="mt-1 text-xs text-destructive">{paymentErrors.cvc}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="zipCode" className="text-xs font-semibold">
                        Postal / ZIP
                      </Label>
                      <Input
                        id="zipCode"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="90210"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/60">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    disabled={isProcessing}
                    className="rounded-full sm:w-1/3"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-2/3 h-12 font-bold text-base shadow-lg transition-all"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 animate-spin" /> Processing Payment...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Lock className="h-4 w-4" /> Pay ${pricing.totalAmount.toLocaleString()} &
                        Confirm
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Sticky Price Breakdown & Trip Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
              <h3 className="font-display text-lg font-bold text-foreground border-b border-border/60 pb-3">
                Price Breakdown
              </h3>

              {isItemLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>{pricing.rateLabel || "Base Experience"}</span>
                    <span className="font-medium text-foreground">
                      ${pricing.baseAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Taxes & Service Fees (10%)</span>
                    <span className="font-medium text-foreground">
                      ${pricing.taxesAndFees.toLocaleString()}
                    </span>
                  </div>

                  <div className="border-t border-dashed border-border/80 pt-3 flex justify-between items-center text-base">
                    <span className="font-bold text-foreground">Total Due (USD)</span>
                    <span className="font-display text-2xl font-bold text-primary">
                      ${pricing.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Security Badge */}
              <div className="rounded-xl bg-muted/40 p-3.5 text-xs text-muted-foreground space-y-2 border border-border/50">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Wanderlust Buyer Protection</span>
                </div>
                <p>
                  Your payment is securely processed and backed by our comprehensive traveler
                  guarantee with 24/7 emergency support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
