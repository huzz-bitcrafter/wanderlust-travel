import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Compass,
  Map,
  Ticket,
  Star,
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
  Plane,
  Hotel as HotelIcon,
  PlusCircle,
  UserCheck,
} from "lucide-react";
import { format, parseISO, differenceInCalendarDays, isAfter, startOfToday } from "date-fns";

const title = "Account Overview — Wanderlust";
const description = "View your travel metrics, upcoming trips, and recent activity.";

export const Route = createFileRoute("/account/overview")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AccountOverviewPage,
});

interface ActivityItem {
  id: string;
  type: "booking" | "review" | "itinerary";
  title: string;
  subtitle?: string;
  date: string;
  link: string;
}

interface BookingGuestDetails {
  itemSnapshot?: {
    title?: string;
    subtitle?: string;
    location?: string;
    rateLabel?: string;
  };
}

function AccountOverviewPage() {
  const { user } = useAuth();
  const today = useMemo(() => startOfToday(), []);

  // Fetch Bookings
  const { data: bookings = [], isLoading: isBookingsLoading } = useQuery({
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

  // Fetch Reviews
  const { data: reviews = [], isLoading: isReviewsLoading } = useQuery({
    queryKey: ["user-reviews", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch Itineraries
  const { data: itineraries = [], isLoading: isItinerariesLoading } = useQuery({
    queryKey: ["user-itineraries", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("itineraries")
        .select("*, destination:destinations(name, country)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const isLoading = isBookingsLoading || isReviewsLoading || isItinerariesLoading;

  // Upcoming Bookings Filter
  const upcomingBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        if (b.status === "cancelled" || !b.travel_date) return false;
        try {
          const travelDate = parseISO(b.travel_date);
          return (
            isAfter(travelDate, today) ||
            format(travelDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
          );
        } catch {
          return false;
        }
      })
      .sort((a, b) => {
        const dateA = a.travel_date ? parseISO(a.travel_date).getTime() : 0;
        const dateB = b.travel_date ? parseISO(b.travel_date).getTime() : 0;
        return dateA - dateB;
      });
  }, [bookings, today]);

  const nextTrip = upcomingBookings[0] || null;

  // Metrics
  const metrics = useMemo(() => {
    return {
      upcomingTrips: upcomingBookings.length,
      totalBookings: bookings.length,
      reviewsWritten: reviews.length,
      savedItineraries: itineraries.length,
    };
  }, [upcomingBookings.length, bookings.length, reviews.length, itineraries.length]);

  // Combined Activity Timeline (Top 5)
  const recentActivities = useMemo(() => {
    const combined: ActivityItem[] = [];

    bookings.forEach((b) => {
      const details = (b.guest_details as BookingGuestDetails) || {};
      const itemTitle = details.itemSnapshot?.title || `${b.booking_type.toUpperCase()} Booking`;
      combined.push({
        id: `booking-${b.id}`,
        type: "booking",
        title: `Reserved ${itemTitle}`,
        subtitle: `Ref: ${b.reference} • $${Number(b.total_price).toLocaleString()}`,
        date: b.created_at,
        link: `/checkout/confirmation?bookingId=${b.id}`,
      });
    });

    reviews.forEach((r) => {
      combined.push({
        id: `review-${r.id}`,
        type: "review",
        title: `Reviewed ${r.title || "Travel Experience"} (${r.rating}★)`,
        subtitle: r.is_approved ? "Approved & Public" : "Pending Moderation",
        date: r.created_at,
        link: `/account/reviews`,
      });
    });

    itineraries.forEach((it) => {
      combined.push({
        id: `itinerary-${it.id}`,
        type: "itinerary",
        title: `Created Itinerary "${it.title}"`,
        subtitle: it.destination
          ? `${it.destination.name}, ${it.destination.country}`
          : "Custom Trip",
        date: it.created_at,
        link: `/account/itineraries/${it.id}`,
      });
    });

    return combined
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [bookings, reviews, itineraries]);

  // Next trip countdown calculation
  const nextTripCountdown = useMemo(() => {
    if (!nextTrip?.travel_date) return null;
    try {
      const diff = differenceInCalendarDays(parseISO(nextTrip.travel_date), today);
      if (diff === 0) return "Departs Today!";
      if (diff === 1) return "Departs Tomorrow";
      return `In ${diff} Days`;
    } catch {
      return null;
    }
  }, [nextTrip, today]);

  const nextTripDetails = (nextTrip?.guest_details as BookingGuestDetails) || {};

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
          Welcome back, {user?.user_metadata?.full_name?.split(" ")[0] || "Traveler"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Here is a summary of your upcoming adventures, past journeys, and planning activities.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Upcoming
            </span>
            <Ticket className="h-4 w-4" />
          </div>
          {isLoading ? (
            <Skeleton className="mt-3 h-8 w-12" />
          ) : (
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold text-foreground">
                {metrics.upcomingTrips}
              </span>
              <span className="text-xs text-muted-foreground">trips</span>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Bookings
            </span>
            <Calendar className="h-4 w-4" />
          </div>
          {isLoading ? (
            <Skeleton className="mt-3 h-8 w-12" />
          ) : (
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold text-foreground">
                {metrics.totalBookings}
              </span>
              <span className="text-xs text-muted-foreground">orders</span>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Itineraries
            </span>
            <Map className="h-4 w-4" />
          </div>
          {isLoading ? (
            <Skeleton className="mt-3 h-8 w-12" />
          ) : (
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold text-foreground">
                {metrics.savedItineraries}
              </span>
              <span className="text-xs text-muted-foreground">saved</span>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reviews
            </span>
            <Star className="h-4 w-4" />
          </div>
          {isLoading ? (
            <Skeleton className="mt-3 h-8 w-12" />
          ) : (
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold text-foreground">
                {metrics.reviewsWritten}
              </span>
              <span className="text-xs text-muted-foreground">written</span>
            </div>
          )}
        </div>
      </div>

      {/* Spotlight Card: Next Upcoming Trip */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-2 text-secondary">
            <Sparkles className="h-5 w-5" />
            <h3 className="font-display text-lg font-bold text-foreground">
              Next Upcoming Adventure
            </h3>
          </div>
          {nextTripCountdown && (
            <Badge className="bg-secondary/15 text-secondary border-secondary/30 font-semibold text-xs px-3 py-1">
              <Clock className="mr-1.5 h-3 w-3" /> {nextTripCountdown}
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        ) : nextTrip ? (
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-xl bg-muted/30 p-5 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {nextTrip.booking_type === "flight" ? (
                  <Plane className="h-7 w-7" />
                ) : nextTrip.booking_type === "hotel" ? (
                  <HotelIcon className="h-7 w-7" />
                ) : (
                  <Compass className="h-7 w-7" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize text-xs font-semibold">
                    {nextTrip.booking_type}
                  </Badge>
                  <span className="font-mono text-xs font-bold text-secondary">
                    {nextTrip.reference}
                  </span>
                </div>

                <h4 className="font-display text-lg font-bold text-foreground">
                  {nextTripDetails.itemSnapshot?.title ||
                    `${nextTrip.booking_type.toUpperCase()} Booking`}
                </h4>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                  {nextTrip.travel_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-secondary" />
                      {format(parseISO(nextTrip.travel_date), "MMMM d, yyyy")}
                    </span>
                  )}
                  {nextTripDetails.itemSnapshot?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-secondary" />
                      {nextTripDetails.itemSnapshot.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
              <span className="font-display text-xl font-bold text-foreground">
                ${Number(nextTrip.total_price).toLocaleString()}
              </span>
              <Button
                asChild
                size="sm"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link to="/checkout/confirmation" search={{ bookingId: nextTrip.id }}>
                  View Confirmation <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Compass className="h-6 w-6" />
            </div>
            <h4 className="font-display text-base font-semibold text-foreground">
              No Upcoming Trips Planned
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              You don't have any future reservations confirmed yet. Explore our curated destinations
              or build a custom itinerary!
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Button asChild size="sm" className="rounded-full bg-primary text-primary-foreground">
                <Link to="/destinations">Explore Destinations</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link to="/account/itineraries">Create Itinerary</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Recent Activity Timeline & Quick Actions */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Recent Activity (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="font-display text-lg font-bold text-foreground">Recent Activity</h3>
            <span className="text-xs text-muted-foreground">Latest events</span>
          </div>

          {isLoading ? (
            <div className="space-y-4 py-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : recentActivities.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No recent activity found. Start by exploring destinations or booking a tour!
            </p>
          ) : (
            <div className="space-y-3 pt-2">
              {recentActivities.map((act) => (
                <Link
                  key={act.id}
                  to={act.link}
                  className="flex items-center justify-between gap-4 rounded-xl p-3 hover:bg-muted/40 transition-colors border border-transparent hover:border-border/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                      {act.type === "booking" ? (
                        <Ticket className="h-4 w-4" />
                      ) : act.type === "review" ? (
                        <Star className="h-4 w-4" />
                      ) : (
                        <Map className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground line-clamp-1">
                        {act.title}
                      </p>
                      {act.subtitle && (
                        <p className="text-xs text-muted-foreground">{act.subtitle}</p>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {format(new Date(act.date), "MMM d")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <div className="border-b border-border/60 pb-3">
            <h3 className="font-display text-lg font-bold text-foreground">Quick Actions</h3>
          </div>

          <div className="space-y-2.5 pt-1">
            <Button
              asChild
              variant="outline"
              className="w-full justify-start rounded-xl h-12 text-sm font-medium"
            >
              <Link to="/account/itineraries">
                <PlusCircle className="mr-3 h-4 w-4 text-secondary" />
                Build Custom Itinerary
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full justify-start rounded-xl h-12 text-sm font-medium"
            >
              <Link to="/destinations">
                <Compass className="mr-3 h-4 w-4 text-secondary" />
                Browse Curated Destinations
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full justify-start rounded-xl h-12 text-sm font-medium"
            >
              <Link to="/account/bookings">
                <Ticket className="mr-3 h-4 w-4 text-secondary" />
                Manage My Bookings
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full justify-start rounded-xl h-12 text-sm font-medium"
            >
              <Link to="/account/profile">
                <UserCheck className="mr-3 h-4 w-4 text-secondary" />
                Update Profile & Password
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
