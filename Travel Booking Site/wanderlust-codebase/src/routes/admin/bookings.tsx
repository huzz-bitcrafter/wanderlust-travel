import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  Building2,
  Plane,
  Edit2,
  Eye,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  Users,
  Calendar,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

export const Route = createFileRoute("/admin/bookings")({
  head: () => ({
    meta: [
      { title: "Manage Bookings — Wanderlust Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminBookingsPage,
});

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];

interface BookingGuestDetails {
  fullName?: string;
  email?: string;
  phone?: string;
  specialRequests?: string;
  additionalTravelers?: string[];
  itemSnapshot?: {
    title?: string;
    destinationName?: string;
    country?: string;
    durationDays?: number;
    roomType?: string;
    flightNumber?: string;
    airline?: string;
    route?: string;
    cabinClass?: string;
  };
  pricingBreakdown?: {
    basePrice?: number;
    taxesAndFees?: number;
    total?: number;
  };
}

function AdminBookingsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Modals state
  const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("confirmed");
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>("paid");

  // Fetch all bookings
  const {
    data: bookings = [],
    isLoading,
    isError,
    error,
  } = useQuery({
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

  // Mutation to update booking status
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      payment_status,
    }: {
      id: string;
      status: string;
      payment_status: string;
    }) => {
      const { error } = await supabase
        .from("bookings")
        .update({
          status,
          payment_status,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      toast.success("Booking status updated successfully.");
      setIsStatusModalOpen(false);
      setSelectedBooking(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update booking.");
    },
  });

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const details = (b.guest_details as BookingGuestDetails) || {};
      const title = details.itemSnapshot?.title || "";
      const name = details.fullName || "";
      const email = details.email || "";
      const ref = b.reference || "";

      // Search match
      const matchesSearch =
        searchTerm === "" ||
        ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase());

      // Status match
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;

      // Type match
      const matchesType = typeFilter === "all" || b.booking_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [bookings, searchTerm, statusFilter, typeFilter]);

  const handleCopyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2000);
    toast.success(`Reference ${ref} copied to clipboard.`);
  };

  const openStatusEditor = (booking: BookingRow) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setNewPaymentStatus(booking.payment_status);
    setIsStatusModalOpen(true);
  };

  const openDetailsViewer = (booking: BookingRow) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    updateMutation.mutate({
      id: selectedBooking.id,
      status: newStatus,
      payment_status: newPaymentStatus,
    });
  };

  const activeBookingDetails = (selectedBooking?.guest_details as BookingGuestDetails) || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Bookings Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search, inspect, and update customer reservations across tours, hotels, and flights.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs px-3 py-1 font-medium bg-card">
            {bookings.length} Total Platform Bookings
          </Badge>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by reference (e.g. WL-...), guest name, email, or item..."
              className="pl-10 h-10 text-sm"
            />
          </div>

          {/* Type filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "All Types" },
              { id: "tour", label: "Tours" },
              { id: "hotel", label: "Hotels" },
              { id: "flight", label: "Flights" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTypeFilter(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  typeFilter === t.id
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 border-t border-border pt-3 overflow-x-auto">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Status:</span>
          {[
            { id: "all", label: "All Statuses" },
            { id: "confirmed", label: "Confirmed" },
            { id: "pending", label: "Pending" },
            { id: "cancelled", label: "Cancelled" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s.id
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Data Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading reservations...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-foreground">Failed to load bookings</h3>
            <p className="text-xs text-muted-foreground mt-1">{(error as Error)?.message}</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-16 text-center">
            <CalendarCheck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground">No bookings found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                ? "Try clearing your filters or changing your search criteria."
                : "Customer bookings will appear here once submitted."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-3.5">Reference</th>
                  <th className="px-6 py-3.5">Item & Type</th>
                  <th className="px-6 py-3.5">Traveler / Contact</th>
                  <th className="px-6 py-3.5">Travel Date</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Payment</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredBookings.map((b) => {
                  const details = (b.guest_details as BookingGuestDetails) || {};
                  const itemTitle =
                    details.itemSnapshot?.title || `${b.booking_type.toUpperCase()} Booking`;
                  const guestName = details.fullName || "Guest Traveler";

                  return (
                    <tr key={b.id} className="hover:bg-muted/25 transition-colors">
                      {/* Reference Code */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-primary">
                            {b.reference}
                          </span>
                          <button
                            onClick={() => handleCopyRef(b.reference)}
                            className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                            title="Copy reference code"
                          >
                            {copiedRef === b.reference ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">
                          {format(parseISO(b.created_at), "MMM d, yyyy HH:mm")}
                        </span>
                      </td>

                      {/* Item & Type */}
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
                          <span
                            className="font-medium text-foreground truncate max-w-[180px]"
                            title={itemTitle}
                          >
                            {itemTitle}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground capitalize mt-0.5 block">
                          {b.booking_type} • {b.guests} {b.guests === 1 ? "guest" : "guests"}
                        </span>
                      </td>

                      {/* Traveler */}
                      <td className="px-6 py-4">
                        <div className="text-xs font-semibold text-foreground">{guestName}</div>
                        {details.email && (
                          <div className="text-[11px] text-muted-foreground">{details.email}</div>
                        )}
                        {details.phone && (
                          <div className="text-[10px] text-muted-foreground">{details.phone}</div>
                        )}
                      </td>

                      {/* Travel Date */}
                      <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                        {b.travel_date ? (
                          <>
                            <div className="font-medium text-foreground">
                              {format(parseISO(b.travel_date), "MMM d, yyyy")}
                            </div>
                            {b.end_date && (
                              <div className="text-[10px] text-muted-foreground">
                                to {format(parseISO(b.end_date), "MMM d, yyyy")}
                              </div>
                            )}
                          </>
                        ) : (
                          "Open Date"
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 text-xs font-semibold text-foreground whitespace-nowrap">
                        $
                        {Number(b.total_price).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>

                      {/* Booking Status */}
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

                      {/* Payment Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
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

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDetailsViewer(b)}
                            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                            title="View Full Booking Details"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openStatusEditor(b)}
                            className="h-8 px-2.5 text-xs font-medium text-primary hover:bg-primary/10 hover:border-primary/40"
                            title="Update Booking Status"
                          >
                            <Edit2 className="h-3.5 w-3.5 mr-1" />
                            Update
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 1. Status Update Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              Update Reservation Status
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Reference:{" "}
              <strong className="font-mono text-foreground">{selectedBooking?.reference}</strong>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveStatus} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Booking Status
              </label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select booking status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Payment Status
              </label>
              <Select value={newPaymentStatus} onValueChange={setNewPaymentStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid / Pending</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsStatusModalOpen(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Full Booking Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2">
              <Badge
                variant="outline"
                className="text-xs font-mono font-bold bg-primary/10 text-primary border-primary/20"
              >
                {selectedBooking?.reference}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {selectedBooking?.created_at &&
                  format(parseISO(selectedBooking.created_at), "MMMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
            <DialogTitle className="font-display text-xl font-bold mt-1">
              {activeBookingDetails.itemSnapshot?.title ||
                `${selectedBooking?.booking_type.toUpperCase()} Reservation`}
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6 py-2">
              {/* Status Banner */}
              <div className="rounded-xl bg-muted/40 border border-border p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] uppercase font-semibold text-muted-foreground block">
                    Reservation Status
                  </span>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="font-semibold text-sm capitalize text-foreground">
                      {selectedBooking.status}
                    </span>
                    <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                      Payment: {selectedBooking.payment_status}
                    </Badge>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    openStatusEditor(selectedBooking);
                  }}
                  className="text-xs"
                >
                  <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                  Edit Status
                </Button>
              </div>

              {/* Primary Traveler Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Primary Contact & Guest Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-border p-4 bg-card text-xs">
                  <div>
                    <span className="text-muted-foreground block">Full Name</span>
                    <span className="font-semibold text-foreground">
                      {activeBookingDetails.fullName || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Email Address</span>
                    <span className="font-semibold text-foreground">
                      {activeBookingDetails.email || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Phone Number</span>
                    <span className="font-semibold text-foreground">
                      {activeBookingDetails.phone || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Travelers if present */}
              {activeBookingDetails.additionalTravelers &&
                activeBookingDetails.additionalTravelers.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Additional Travelers ({activeBookingDetails.additionalTravelers.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeBookingDetails.additionalTravelers.map((travelerName, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs py-1 px-2.5">
                          Guest #{idx + 2}: {travelerName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {/* Travel & Schedule Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Travel Details & Schedule
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-border p-4 bg-card text-xs">
                  <div>
                    <span className="text-muted-foreground block">Travel Date</span>
                    <span className="font-semibold text-foreground">
                      {selectedBooking.travel_date
                        ? format(parseISO(selectedBooking.travel_date), "MMMM d, yyyy")
                        : "Open / Flexible"}
                      {selectedBooking.end_date &&
                        ` to ${format(parseISO(selectedBooking.end_date), "MMMM d, yyyy")}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Party Size</span>
                    <span className="font-semibold text-foreground">
                      {selectedBooking.guests}{" "}
                      {selectedBooking.guests === 1 ? "Traveler" : "Travelers"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" /> Financial & Pricing Breakdown
                </h4>
                <div className="rounded-xl border border-border p-4 bg-card space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Base Reservation Rate</span>
                    <span>${Number(selectedBooking.total_price * 0.9).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxes & Service Fees (10%)</span>
                    <span>${Number(selectedBooking.total_price * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-bold text-sm text-foreground">
                    <span>Total Amount Charged</span>
                    <span className="text-primary font-display font-bold">
                      $
                      {Number(selectedBooking.total_price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Special Requests if any */}
              {activeBookingDetails.specialRequests && (
                <div className="space-y-1.5 text-xs">
                  <span className="font-semibold text-foreground">Special Requests / Notes:</span>
                  <p className="p-3 rounded-xl bg-muted/40 text-muted-foreground text-xs italic">
                    "{activeBookingDetails.specialRequests}"
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="border-t border-border pt-4 flex sm:justify-between items-center">
            <Button asChild variant="outline" size="sm" className="text-xs">
              <a
                href={`/checkout/confirmation?bookingId=${selectedBooking?.id}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                View Customer Receipt
              </a>
            </Button>

            <Button variant="default" size="sm" onClick={() => setIsDetailsOpen(false)}>
              Close Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
