import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  CalendarCheck,
  Users,
  Star,
  Mail,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Package,
  Building2,
  Plane,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";

export const Route = createFileRoute("/admin/overview")({
  head: () => ({
    meta: [
      { title: "Admin Overview & Metrics — Wanderlust" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminOverviewPage,
});

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
type ContactRow = Database["public"]["Tables"]["contact_messages"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

interface GuestSnapshot {
  fullName?: string;
  email?: string;
  itemSnapshot?: {
    title?: string;
    destinationName?: string;
  };
}

function AdminOverviewPage() {
  // 1. Fetch all bookings
  const bookingsQuery = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as BookingRow[];
    },
  });

  // 2. Fetch all profiles count
  const profilesQuery = useQuery({
    queryKey: ["admin", "profiles-count"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      return (data || []) as ProfileRow[];
    },
  });

  // 3. Fetch reviews count
  const reviewsQuery = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*");
      if (error) throw error;
      return (data || []) as ReviewRow[];
    },
  });

  // 4. Fetch contact messages count
  const messagesQuery = useQuery({
    queryKey: ["admin", "messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_messages").select("*");
      if (error) throw error;
      return (data || []) as ContactRow[];
    },
  });

  const isLoading =
    bookingsQuery.isLoading ||
    profilesQuery.isLoading ||
    reviewsQuery.isLoading ||
    messagesQuery.isLoading;

  // Metrics Calculations
  const metrics = useMemo(() => {
    const bookings = bookingsQuery.data || [];
    const profiles = profilesQuery.data || [];
    const reviews = reviewsQuery.data || [];
    const messages = messagesQuery.data || [];

    const totalRevenue = bookings
      .filter((b) => b.status !== "cancelled" && b.payment_status === "paid")
      .reduce((sum, b) => sum + Number(b.total_price || 0), 0);

    const pendingBookings = bookings.filter((b) => b.status === "pending").length;
    const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
    const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length;

    const pendingReviews = reviews.filter((r) => !r.is_approved).length;
    const newMessages = messages.filter((m) => m.status === "new").length;

    return {
      totalRevenue,
      totalBookings: bookings.length,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      totalUsers: profiles.length,
      pendingReviews,
      newMessages,
    };
  }, [bookingsQuery.data, profilesQuery.data, reviewsQuery.data, messagesQuery.data]);

  const recentBookings = useMemo(() => {
    return (bookingsQuery.data || []).slice(0, 6);
  }, [bookingsQuery.data]);

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Platform Metrics & Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time business performance, customer reservations, and operational queue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              bookingsQuery.refetch();
              profilesQuery.refetch();
              reviewsQuery.refetch();
              messagesQuery.refetch();
            }}
            className="text-xs"
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Metrics
          </Button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Revenue
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold font-display text-foreground">
              $
              {metrics.totalRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              <span>From confirmed & paid bookings</span>
            </p>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Bookings
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold font-display text-foreground">
              {metrics.totalBookings}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="text-emerald-600 font-medium">
                {metrics.confirmedBookings} confirmed
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-amber-600 font-medium">{metrics.pendingBookings} pending</span>
            </div>
          </div>
        </div>

        {/* Registered Users */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Registered Users
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold font-display text-foreground">
              {metrics.totalUsers}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Profiles with active travel accounts
            </p>
          </div>
        </div>

        {/* Pending Moderation Queue */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Action Queue
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold font-display text-foreground">
              {metrics.pendingReviews + metrics.newMessages}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-amber-600 font-medium">{metrics.pendingReviews} reviews</span>
              <span>•</span>
              <span className="text-blue-600 font-medium">{metrics.newMessages} inquiries</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/admin/bookings"
          className="group rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Manage All Bookings</h3>
              <p className="text-xs text-muted-foreground">
                Review, filter, and change booking status
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          to="/admin/users"
          className="group rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Users & Role Management</h3>
              <p className="text-xs text-muted-foreground">
                View travelers, grant or revoke admin access
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          to="/admin/reviews"
          className="group rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-foreground">Review Moderation</h3>
                {metrics.pendingReviews > 0 && (
                  <Badge variant="default" className="text-[10px] py-0 bg-amber-600">
                    {metrics.pendingReviews} Pending
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Audit feedback and approve traveler ratings
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* Recent Bookings Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Recent Platform Bookings
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Latest reservation activities across tours, hotels, and flights.
            </p>
          </div>

          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link to="/admin/bookings">
              View All {metrics.totalBookings} Bookings
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading recent bookings...</p>
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarCheck className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No bookings recorded yet</h3>
            <p className="text-xs text-muted-foreground mt-1">
              When customers complete bookings on the website, they will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-3.5">Reference</th>
                  <th className="px-6 py-3.5">Type & Item</th>
                  <th className="px-6 py-3.5">Traveler</th>
                  <th className="px-6 py-3.5">Travel Date</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentBookings.map((b) => {
                  const guestDetails = (b.guest_details as GuestSnapshot) || {};
                  const itemTitle =
                    guestDetails.itemSnapshot?.title || `${b.booking_type.toUpperCase()} Booking`;
                  const guestName = guestDetails.fullName || "Guest Traveler";

                  return (
                    <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                      {/* Reference */}
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-primary">
                        {b.reference}
                      </td>

                      {/* Type & Item */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {b.booking_type === "tour" && (
                            <Package className="h-4 w-4 text-primary shrink-0" />
                          )}
                          {b.booking_type === "hotel" && (
                            <Building2 className="h-4 w-4 text-secondary shrink-0" />
                          )}
                          {b.booking_type === "flight" && (
                            <Plane className="h-4 w-4 text-accent shrink-0" />
                          )}
                          <span className="font-medium text-foreground truncate max-w-[200px]">
                            {itemTitle}
                          </span>
                        </div>
                      </td>

                      {/* Traveler */}
                      <td className="px-6 py-4">
                        <div className="text-xs text-foreground font-medium">{guestName}</div>
                        {guestDetails.email && (
                          <div className="text-[11px] text-muted-foreground">
                            {guestDetails.email}
                          </div>
                        )}
                      </td>

                      {/* Travel Date */}
                      <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                        {b.travel_date
                          ? format(parseISO(b.travel_date), "MMM d, yyyy")
                          : "Flexible"}
                      </td>

                      {/* Total Amount */}
                      <td className="px-6 py-4 text-xs font-semibold text-foreground whitespace-nowrap">
                        $
                        {Number(b.total_price).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {b.status === "confirmed" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" /> Confirmed
                          </span>
                        )}
                        {b.status === "pending" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                            <Clock className="h-3 w-3" /> Pending
                          </span>
                        )}
                        {b.status === "cancelled" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                            <XCircle className="h-3 w-3" /> Cancelled
                          </span>
                        )}
                      </td>

                      {/* Payment */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Badge
                          variant={b.payment_status === "paid" ? "default" : "outline"}
                          className={`text-[10px] uppercase font-semibold ${
                            b.payment_status === "paid"
                              ? "bg-emerald-600 text-white border-transparent"
                              : b.payment_status === "refunded"
                                ? "bg-muted text-muted-foreground"
                                : "border-amber-500/30 text-amber-700"
                          }`}
                        >
                          {b.payment_status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
