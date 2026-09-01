import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { requireAuthGuard } from "@/lib/auth-guard";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Copy,
  Check,
  Printer,
  Calendar,
  Users,
  MapPin,
  CreditCard,
  ArrowRight,
  Sparkles,
  Compass,
  AlertCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

interface ConfirmationSearch {
  bookingId?: string;
}

const title = "Booking Confirmed — Wanderlust";
const description = "Your travel reservation has been confirmed.";

export const Route = createFileRoute("/checkout/confirmation")({
  validateSearch: (search: Record<string, unknown>): ConfirmationSearch => ({
    bookingId: typeof search.bookingId === "string" ? search.bookingId : undefined,
  }),
  beforeLoad: requireAuthGuard,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: CheckoutConfirmationPage,
});

interface GuestDetailsJson {
  primaryGuest?: {
    fullName?: string;
    email?: string;
    phone?: string;
    specialRequests?: string;
  };
  additionalGuests?: string[];
  payment?: {
    method?: string;
    last4?: string;
    cardholderName?: string;
  };
  itemSnapshot?: {
    title?: string;
    subtitle?: string;
    location?: string;
    rateLabel?: string;
  };
}

function CheckoutConfirmationPage() {
  const searchParams = Route.useSearch();
  const [copied, setCopied] = useState(false);

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking-confirmation", searchParams.bookingId],
    queryFn: async () => {
      if (!searchParams.bookingId) return null;
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", searchParams.bookingId)
        .single();

      if (error || !data) return null;
      return data;
    },
    enabled: !!searchParams.bookingId,
  });

  const guestDetails = (booking?.guest_details as GuestDetailsJson) || {};

  const handleCopyReference = () => {
    if (booking?.reference) {
      navigator.clipboard.writeText(booking.reference);
      setCopied(true);
      toast.success("Booking reference copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="space-y-6 text-center py-12">
            <Skeleton className="mx-auto h-16 w-16 rounded-full" />
            <Skeleton className="mx-auto h-8 w-64" />
            <Skeleton className="mx-auto h-32 w-full max-w-lg" />
          </div>
        ) : !booking ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 font-display text-2xl font-bold">Booking Not Found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We could not find the requested booking or you do not have permission to view it.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Button asChild className="rounded-full">
                <Link to="/account/itineraries">Go to My Itineraries</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Celebration Header */}
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h1 className="font-display text-3xl font-bold sm:text-4xl text-foreground">
                Your Booking is Confirmed!
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                A confirmation receipt and detailed itinerary has been sent to{" "}
                <span className="font-semibold text-foreground">
                  {guestDetails.primaryGuest?.email || "your registered email"}
                </span>
                .
              </p>
            </div>

            {/* Reference Box */}
            <div className="rounded-2xl border border-secondary/30 bg-secondary/5 p-6 text-center space-y-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Booking Reference Code
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-2xl sm:text-3xl font-bold tracking-widest text-secondary">
                  {booking.reference}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyReference}
                  className="rounded-full h-8 px-3 text-xs"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500 mr-1" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 mr-1" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Please save this reference code for your records or concierge inquiries.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Reservation Details
                  </span>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    {guestDetails.itemSnapshot?.title || "Wanderlust Travel Booking"}
                  </h2>
                  {guestDetails.itemSnapshot?.location && (
                    <p className="flex items-center text-xs text-muted-foreground mt-0.5">
                      <MapPin className="mr-1 h-3 w-3 text-secondary" />
                      {guestDetails.itemSnapshot.location}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 capitalize">
                    {booking.status}
                  </Badge>
                  <Badge className="bg-primary/10 text-primary border-primary/20 capitalize">
                    {booking.payment_status}
                  </Badge>
                </div>
              </div>

              {/* Grid with metadata */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                <div className="flex items-start gap-3 rounded-xl bg-muted/30 p-3.5 border border-border/40">
                  <Calendar className="h-4 w-4 text-secondary mt-0.5" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Travel Dates</span>
                    <span className="font-semibold text-foreground">
                      {booking.travel_date
                        ? format(parseISO(booking.travel_date), "MMM d, yyyy")
                        : "Confirmed"}
                      {booking.end_date &&
                        ` – ${format(parseISO(booking.end_date), "MMM d, yyyy")}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-muted/30 p-3.5 border border-border/40">
                  <Users className="h-4 w-4 text-secondary mt-0.5" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Guests</span>
                    <span className="font-semibold text-foreground">
                      {booking.guests} {booking.guests === 1 ? "Traveler" : "Travelers"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-muted/30 p-3.5 border border-border/40">
                  <CreditCard className="h-4 w-4 text-secondary mt-0.5" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Payment Method</span>
                    <span className="font-semibold text-foreground">
                      {guestDetails.payment?.method || "Card"} ••••{" "}
                      {guestDetails.payment?.last4 || "4242"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Primary Contact details */}
              <div className="rounded-xl border border-border/60 p-4 text-sm space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Guest Information
                </h3>
                <div className="grid gap-2 sm:grid-cols-2 text-foreground">
                  <div>
                    <span className="text-muted-foreground text-xs block">Lead Traveler:</span>
                    <span className="font-medium">
                      {guestDetails.primaryGuest?.fullName || "Guest"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block">Contact Phone:</span>
                    <span className="font-medium">{guestDetails.primaryGuest?.phone || "N/A"}</span>
                  </div>
                </div>

                {guestDetails.additionalGuests && guestDetails.additionalGuests.length > 0 && (
                  <div className="pt-2">
                    <span className="text-muted-foreground text-xs block">Additional Guests:</span>
                    <p className="font-medium">{guestDetails.additionalGuests.join(", ")}</p>
                  </div>
                )}
              </div>

              {/* Price total paid */}
              <div className="border-t border-dashed border-border/80 pt-4 flex justify-between items-center">
                <div>
                  <span className="text-xs text-muted-foreground block">Total Amount Paid</span>
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Fully settled in Demo Mode
                  </span>
                </div>
                <span className="font-display text-2xl sm:text-3xl font-bold text-primary">
                  ${Number(booking.total_price).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrint}
                className="w-full sm:w-auto rounded-full"
              >
                <Printer className="mr-2 h-4 w-4" /> Print Receipt
              </Button>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Button asChild variant="outline" className="w-full sm:w-auto rounded-full">
                  <Link to="/destinations">
                    <Compass className="mr-2 h-4 w-4" /> Explore More
                  </Link>
                </Button>

                <Button
                  asChild
                  className="w-full sm:w-auto rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link to="/account/itineraries">
                    View in Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
