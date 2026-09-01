import React, { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Ticket,
  MapPin,
  Clock,
  ArrowRight,
  Plane,
  Hotel as HotelIcon,
  Compass,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Ban,
} from "lucide-react";
import { format, parseISO, isAfter, differenceInCalendarDays, startOfToday } from "date-fns";
import { toast } from "sonner";

const title = "My Bookings — Wanderlust";
const description = "View and manage your tour packages, accommodations, and flight reservations.";

export const Route = createFileRoute("/account/bookings")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AccountBookingsPage,
});

type TabType = "upcoming" | "past" | "cancelled";

interface GuestDetailsJson {
  primaryGuest?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  additionalGuests?: string[];
  itemSnapshot?: {
    title?: string;
    subtitle?: string;
    location?: string;
    rateLabel?: string;
  };
}

function AccountBookingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = useMemo(() => startOfToday(), []);

  const [activeTab, setActiveTab] = useState<TabType>("upcoming");

  // Cancel Modal State
  const [cancellingBooking, setCancellingBooking] = useState<{
    id: string;
    title: string;
    reference: string;
  } | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Query User Bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["user-bookings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Cancel Mutation
  const cancelMutation = useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: string; reason: string }) => {
      const { error } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
        })
        .eq("id", bookingId);

      if (error) throw error;
      return { bookingId, reason };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-bookings", user?.id] });
      toast.success("Booking cancelled successfully.");
      setCancellingBooking(null);
      setCancelReason("");
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to cancel booking";
      toast.error(message);
    },
  });

  // Filter Bookings by Tab
  const { upcomingList, pastList, cancelledList } = useMemo(() => {
    const upcoming: typeof bookings = [];
    const past: typeof bookings = [];
    const cancelled: typeof bookings = [];

    bookings.forEach((b) => {
      if (b.status === "cancelled") {
        cancelled.push(b);
        return;
      }

      if (!b.travel_date) {
        upcoming.push(b);
        return;
      }

      try {
        const tDate = parseISO(b.travel_date);
        if (isAfter(tDate, today) || format(tDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
          upcoming.push(b);
        } else {
          past.push(b);
        }
      } catch {
        upcoming.push(b);
      }
    });

    return {
      upcomingList: upcoming,
      pastList: past,
      cancelledList: cancelled,
    };
  }, [bookings, today]);

  const currentList =
    activeTab === "upcoming" ? upcomingList : activeTab === "past" ? pastList : cancelledList;

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingBooking) return;
    cancelMutation.mutate({
      bookingId: cancellingBooking.id,
      reason: cancelReason,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">My Bookings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Track upcoming departures, view receipts, and manage your travel reservations.
        </p>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-2 border-b border-border/80 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("upcoming")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "upcoming"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Ticket className="h-3.5 w-3.5" />
          <span>Upcoming ({upcomingList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("past")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "past"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Past ({pastList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("cancelled")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "cancelled"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <XCircle className="h-3.5 w-3.5" />
          <span>Cancelled ({cancelledList.length})</span>
        </button>
      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Ticket className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            {activeTab === "upcoming"
              ? "No Upcoming Bookings"
              : activeTab === "past"
                ? "No Past Bookings"
                : "No Cancelled Bookings"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {activeTab === "upcoming"
              ? "You do not have any active upcoming reservations. Browse our curated travel catalog to book your next trip!"
              : activeTab === "past"
                ? "You have not completed any trips with us yet."
                : "You have no cancelled reservations on file."}
          </p>
          <div className="pt-2">
            <Button asChild size="sm" className="rounded-full bg-primary text-primary-foreground">
              <Link to="/destinations">Explore Destinations</Link>
            </Button>
          </div>
        </div>
      ) : (
        /* Bookings Grid */
        <div className="space-y-4">
          {currentList.map((booking) => {
            const guestDetails = (booking.guest_details as GuestDetailsJson) || {};
            const title =
              guestDetails.itemSnapshot?.title ||
              `${booking.booking_type.toUpperCase()} Reservation`;

            const canCancel =
              activeTab === "upcoming" &&
              booking.status !== "cancelled" &&
              booking.travel_date &&
              differenceInCalendarDays(parseISO(booking.travel_date), today) >= 2;

            return (
              <div
                key={booking.id}
                className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm transition-all hover:border-secondary/40 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize text-xs font-semibold">
                      {booking.booking_type}
                    </Badge>
                    <span className="font-mono text-xs font-bold text-secondary">
                      {booking.reference}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {booking.status === "cancelled" ? (
                      <Badge variant="destructive" className="text-xs font-semibold">
                        Cancelled
                      </Badge>
                    ) : booking.status === "confirmed" ? (
                      <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/20 text-xs font-semibold">
                        Confirmed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs capitalize">
                        {booking.status}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Booked {format(new Date(booking.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {booking.booking_type === "flight" ? (
                        <Plane className="h-6 w-6" />
                      ) : booking.booking_type === "hotel" ? (
                        <HotelIcon className="h-6 w-6" />
                      ) : (
                        <Compass className="h-6 w-6" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-display text-base sm:text-lg font-bold text-foreground">
                        {title}
                      </h4>
                      {guestDetails.itemSnapshot?.location && (
                        <p className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="mr-1 h-3 w-3 text-secondary" />
                          {guestDetails.itemSnapshot.location}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                        {booking.travel_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-secondary" />
                            {format(parseISO(booking.travel_date), "MMM d, yyyy")}
                            {booking.end_date &&
                              ` – ${format(parseISO(booking.end_date), "MMM d, yyyy")}`}
                          </span>
                        )}
                        <span>
                          • {booking.guests} {booking.guests === 1 ? "Guest" : "Guests"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto pt-2 sm:pt-0">
                    <span className="font-display text-xl font-bold text-foreground">
                      ${Number(booking.total_price).toLocaleString()}
                    </span>

                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="outline" className="rounded-full text-xs">
                        <Link to="/checkout/confirmation" search={{ bookingId: booking.id }}>
                          <FileText className="mr-1.5 h-3.5 w-3.5" /> View Receipt
                        </Link>
                      </Button>

                      {canCancel && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setCancellingBooking({
                              id: booking.id,
                              title,
                              reference: booking.reference,
                            })
                          }
                          className="rounded-full text-xs text-destructive hover:bg-destructive/10"
                        >
                          <Ban className="mr-1 h-3.5 w-3.5" /> Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Dialog */}
      <Dialog
        open={!!cancellingBooking}
        onOpenChange={(open) => {
          if (!open) setCancellingBooking(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleConfirmCancel} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Cancel Reservation</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Are you sure you want to cancel your reservation for{" "}
                <span className="font-semibold text-foreground">{cancellingBooking?.title}</span>{" "}
                (Ref: {cancellingBooking?.reference})?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="cancelReason" className="text-xs font-semibold">
                Reason for cancellation (optional)
              </Label>
              <Textarea
                id="cancelReason"
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Schedule conflict, family emergency..."
              />
              <p className="text-[11px] text-muted-foreground">
                This trip is eligible for free cancellation under our 48-hour traveler guarantee.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCancellingBooking(null)}
                disabled={cancelMutation.isPending}
                className="rounded-full"
              >
                Keep Booking
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={cancelMutation.isPending}
                className="rounded-full"
              >
                {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
