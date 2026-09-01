import React, { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plane,
  Search,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  DollarSign,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

export const Route = createFileRoute("/admin/flights")({
  head: () => ({
    meta: [
      { title: "Manage Flights — Wanderlust Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminFlightsPage,
});

type FlightRow = Database["public"]["Tables"]["flights"]["Row"];

interface FlightFormData {
  airline: string;
  flight_number: string;
  origin_city: string;
  origin_code: string;
  destination_city: string;
  destination_code: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
  price: number;
  class: string;
  seats_total: number;
  seats_available: number;
  status: string;
}

const INITIAL_FORM: FlightFormData = {
  airline: "Emirates",
  flight_number: "EK 201",
  origin_city: "London",
  origin_code: "LHR",
  destination_city: "Santorini",
  destination_code: "JTR",
  departure_time: "2026-09-10T09:00",
  arrival_time: "2026-09-10T12:45",
  duration_minutes: 225,
  price: 280,
  class: "economy",
  seats_total: 180,
  seats_available: 140,
  status: "scheduled",
};

function AdminFlightsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<FlightRow | null>(null);
  const [deletingFlight, setDeletingFlight] = useState<FlightRow | null>(null);
  const [formData, setFormData] = useState<FlightFormData>(INITIAL_FORM);

  // Fetch all flights
  const { data: flights = [], isLoading } = useQuery({
    queryKey: ["admin", "flights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flights")
        .select("*")
        .order("departure_time", { ascending: true });
      if (error) throw error;
      return (data || []) as FlightRow[];
    },
  });

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async (form: FlightFormData) => {
      const depIso = new Date(form.departure_time).toISOString();
      const arrIso = new Date(form.arrival_time).toISOString();

      const payload = {
        airline: form.airline,
        flight_number: form.flight_number,
        origin_city: form.origin_city,
        origin_code: form.origin_code.toUpperCase(),
        destination_city: form.destination_city,
        destination_code: form.destination_code.toUpperCase(),
        departure_time: depIso,
        arrival_time: arrIso,
        duration_minutes: Number(form.duration_minutes),
        price: Number(form.price),
        class: form.class,
        seats_total: Number(form.seats_total),
        seats_available: Number(form.seats_available),
        status: form.status,
      };

      if (editingFlight) {
        const { error } = await supabase.from("flights").update(payload).eq("id", editingFlight.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("flights").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "flights"] });
      queryClient.invalidateQueries({ queryKey: ["flights"] });
      toast.success(editingFlight ? "Flight schedule updated." : "New flight route added.");
      setIsFormOpen(false);
      setEditingFlight(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save flight.");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("flights").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "flights"] });
      queryClient.invalidateQueries({ queryKey: ["flights"] });
      toast.success("Flight schedule deleted.");
      setIsDeleteOpen(false);
      setDeletingFlight(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete flight.");
    },
  });

  // Filtered flights
  const filteredFlights = useMemo(() => {
    return flights.filter((f) => {
      const matchesSearch =
        searchTerm === "" ||
        f.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.flight_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.origin_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.destination_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.origin_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.destination_code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClass = classFilter === "all" || f.class === classFilter;
      const matchesStatus = statusFilter === "all" || f.status === statusFilter;

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [flights, searchTerm, classFilter, statusFilter]);

  const openCreateDialog = () => {
    setEditingFlight(null);
    setFormData(INITIAL_FORM);
    setIsFormOpen(true);
  };

  const openEditDialog = (flight: FlightRow) => {
    setEditingFlight(flight);
    const depLocal = flight.departure_time ? flight.departure_time.slice(0, 16) : "";
    const arrLocal = flight.arrival_time ? flight.arrival_time.slice(0, 16) : "";

    setFormData({
      airline: flight.airline,
      flight_number: flight.flight_number,
      origin_city: flight.origin_city,
      origin_code: flight.origin_code,
      destination_city: flight.destination_city,
      destination_code: flight.destination_code,
      departure_time: depLocal,
      arrival_time: arrLocal,
      duration_minutes: flight.duration_minutes,
      price: Number(flight.price),
      class: flight.class || "economy",
      seats_total: flight.seats_total,
      seats_available: flight.seats_available,
      status: flight.status || "scheduled",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.airline.trim() || !formData.flight_number.trim()) {
      toast.error("Airline and flight number are required.");
      return;
    }
    if (!formData.origin_code.trim() || !formData.destination_code.trim()) {
      toast.error("Origin and Destination airport codes are required.");
      return;
    }

    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Flight Schedules & Inventory
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage commercial airline schedules, seat capacities, cabin classes, and pricing.
          </p>
        </div>

        <Button onClick={openCreateDialog} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Flight Schedule
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by flight number, airline, city, or airport code..."
            className="pl-10 h-10 text-sm"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[140px] h-10 text-xs">
              <SelectValue placeholder="Cabin Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="economy">Economy</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="first">First Class</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-10 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Flights Data Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading flight schedules...</p>
          </div>
        ) : filteredFlights.length === 0 ? (
          <div className="p-16 text-center">
            <Plane className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground">No flights found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search criteria or schedule a new flight route.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-3.5">Flight & Airline</th>
                  <th className="px-6 py-3.5">Route</th>
                  <th className="px-6 py-3.5">Schedule</th>
                  <th className="px-6 py-3.5">Cabin</th>
                  <th className="px-6 py-3.5">Price</th>
                  <th className="px-6 py-3.5">Seats Left</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredFlights.map((f) => (
                  <tr key={f.id} className="hover:bg-muted/25 transition-colors">
                    {/* Airline & Flight Number */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent font-bold text-xs shrink-0">
                          <Plane className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                            <span>{f.airline}</span>
                          </div>
                          <span className="font-mono text-xs font-bold text-primary">
                            {f.flight_number}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Route */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-xs text-foreground">
                        {f.origin_code} → {f.destination_code}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {f.origin_city} to {f.destination_city}
                      </div>
                    </td>

                    {/* Schedule */}
                    <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      <div className="font-medium text-foreground">
                        {format(parseISO(f.departure_time), "MMM d, HH:mm")}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {Math.floor(f.duration_minutes / 60)}h {f.duration_minutes % 60}m
                      </div>
                    </td>

                    {/* Cabin Class */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                        {f.class}
                      </Badge>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 text-xs font-semibold text-foreground whitespace-nowrap">
                      ${Number(f.price).toLocaleString()}
                    </td>

                    {/* Seats */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span
                          className={`font-semibold ${
                            f.seats_available <= 5 ? "text-destructive" : "text-foreground"
                          }`}
                        >
                          {f.seats_available}
                        </span>
                        <span className="text-muted-foreground">/ {f.seats_total}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {f.status === "scheduled" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> Scheduled
                        </span>
                      )}
                      {f.status === "delayed" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                          <Clock className="h-3 w-3" /> Delayed
                        </span>
                      )}
                      {f.status === "cancelled" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                          <XCircle className="h-3 w-3" /> Cancelled
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(f)}
                          className="h-8 px-2.5 text-xs"
                          title="Edit Flight"
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeletingFlight(f);
                            setIsDeleteOpen(true);
                          }}
                          className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10"
                          title="Delete Flight"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Flight Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              {editingFlight
                ? `Edit Flight: ${editingFlight.flight_number}`
                : "Schedule New Flight"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure route, departure and arrival timestamps, seat inventory, and ticket pricing.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Airline Carrier *
                </label>
                <Input
                  value={formData.airline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, airline: e.target.value }))}
                  placeholder="e.g. Aegean Airlines"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Flight Number *
                </label>
                <Input
                  value={formData.flight_number}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, flight_number: e.target.value }))
                  }
                  placeholder="e.g. A3 361"
                  required
                />
              </div>
            </div>

            {/* Origin & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-border bg-muted/20">
              <div className="space-y-2">
                <span className="text-xs font-bold text-foreground">Origin Airport</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={formData.origin_city}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, origin_city: e.target.value }))
                    }
                    placeholder="City (e.g. London)"
                    required
                  />
                  <Input
                    value={formData.origin_code}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        origin_code: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="IATA (e.g. LHR)"
                    maxLength={3}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-foreground">Destination Airport</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={formData.destination_city}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, destination_city: e.target.value }))
                    }
                    placeholder="City (e.g. Santorini)"
                    required
                  />
                  <Input
                    value={formData.destination_code}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        destination_code: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="IATA (e.g. JTR)"
                    maxLength={3}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Departure Time *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.departure_time}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, departure_time: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Arrival Time *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.arrival_time}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, arrival_time: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Duration (Minutes)
                </label>
                <Input
                  type="number"
                  min={1}
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, duration_minutes: Number(e.target.value) }))
                  }
                  required
                />
              </div>
            </div>

            {/* Pricing, Class, Seats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Ticket Price ($) *
                </label>
                <Input
                  type="number"
                  min={1}
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))
                  }
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Cabin Class
                </label>
                <Select
                  value={formData.class}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, class: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="first">First Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Total Seats
                </label>
                <Input
                  type="number"
                  min={1}
                  value={formData.seats_total}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, seats_total: Number(e.target.value) }))
                  }
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Available Seats
                </label>
                <Input
                  type="number"
                  min={0}
                  value={formData.seats_available}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, seats_available: Number(e.target.value) }))
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Flight Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled (On Time)</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={saveMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingFlight ? "Update Flight" : "Schedule Flight"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Flight Route
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete flight{" "}
              <strong>{deletingFlight?.flight_number}</strong> ({deletingFlight?.airline})?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingFlight && deleteMutation.mutate(deletingFlight.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
