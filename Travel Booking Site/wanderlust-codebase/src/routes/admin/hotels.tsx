import React, { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Loader2,
  Star,
  AlertTriangle,
  MapPin,
  DollarSign,
  Check,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Database, Json } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export const Route = createFileRoute("/admin/hotels")({
  head: () => ({
    meta: [
      { title: "Manage Hotels — Wanderlust Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminHotelsPage,
});

type HotelRow = Database["public"]["Tables"]["hotels"]["Row"];
type DestinationRow = Database["public"]["Tables"]["destinations"]["Row"];

interface HotelFormData {
  destination_id: string;
  name: string;
  address: string;
  description: string;
  star_rating: number;
  price_per_night: number;
  image_url: string;
  status: string;
  amenities: string[];
}

const COMMON_AMENITIES = [
  "Free Wi-Fi",
  "Pool",
  "Breakfast",
  "Air conditioning",
  "Spa",
  "Fitness Center",
  "Beachfront",
  "Restaurant",
  "Bar",
  "Room Service",
  "Airport Shuttle",
  "Ocean View",
];

const INITIAL_FORM: HotelFormData = {
  destination_id: "",
  name: "",
  address: "",
  description: "",
  star_rating: 4,
  price_per_night: 220,
  image_url:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  status: "published",
  amenities: ["Free Wi-Fi", "Pool", "Breakfast", "Air conditioning", "Spa"],
};

function AdminHotelsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [starFilter, setStarFilter] = useState("all");

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<HotelRow | null>(null);
  const [deletingHotel, setDeletingHotel] = useState<HotelRow | null>(null);
  const [formData, setFormData] = useState<HotelFormData>(INITIAL_FORM);

  // 1. Fetch destinations
  const { data: destinations = [] } = useQuery({
    queryKey: ["admin", "destinations-lookup"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("id, name, country")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data || []) as DestinationRow[];
    },
  });

  const destinationMap = useMemo(() => {
    return new Map(destinations.map((d) => [d.id, d]));
  }, [destinations]);

  // 2. Fetch all hotels
  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ["admin", "hotels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotels")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as HotelRow[];
    },
  });

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async (form: HotelFormData) => {
      const payload = {
        destination_id: form.destination_id || null,
        name: form.name,
        address: form.address,
        description: form.description,
        star_rating: Number(form.star_rating),
        price_per_night: Number(form.price_per_night),
        image_url: form.image_url,
        status: form.status,
        amenities: form.amenities as unknown as Json,
      };

      if (editingHotel) {
        const { error } = await supabase.from("hotels").update(payload).eq("id", editingHotel.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("hotels").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "hotels"] });
      queryClient.invalidateQueries({ queryKey: ["hotels"] });
      toast.success(editingHotel ? "Hotel updated successfully." : "New hotel created.");
      setIsFormOpen(false);
      setEditingHotel(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save hotel.");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hotels").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "hotels"] });
      queryClient.invalidateQueries({ queryKey: ["hotels"] });
      toast.success("Hotel deleted successfully.");
      setIsDeleteOpen(false);
      setDeletingHotel(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete hotel.");
    },
  });

  // Filtered hotels
  const filteredHotels = useMemo(() => {
    return hotels.filter((h) => {
      const dest = h.destination_id ? destinationMap.get(h.destination_id) : null;
      const matchesSearch =
        searchTerm === "" ||
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.address && h.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (dest && dest.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDest = destinationFilter === "all" || h.destination_id === destinationFilter;

      const matchesStar = starFilter === "all" || String(Math.round(h.star_rating)) === starFilter;

      return matchesSearch && matchesDest && matchesStar;
    });
  }, [hotels, searchTerm, destinationFilter, starFilter, destinationMap]);

  const openCreateDialog = () => {
    setEditingHotel(null);
    setFormData({
      ...INITIAL_FORM,
      destination_id: destinations[0]?.id || "",
    });
    setIsFormOpen(true);
  };

  const openEditDialog = (hotel: HotelRow) => {
    setEditingHotel(hotel);
    const amen = Array.isArray(hotel.amenities) ? (hotel.amenities as string[]) : [];
    setFormData({
      destination_id: hotel.destination_id || "",
      name: hotel.name,
      address: hotel.address || "",
      description: hotel.description || "",
      star_rating: Number(hotel.star_rating) || 4,
      price_per_night: Number(hotel.price_per_night),
      image_url: hotel.image_url || "",
      status: hotel.status || "published",
      amenities: amen,
    });
    setIsFormOpen(true);
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Hotel name is required.");
      return;
    }
    if (!formData.image_url.trim()) {
      toast.error("Hotel image URL is required.");
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
            Hotels & Accommodations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage resort properties, boutique hotels, star ratings, and guest amenities.
          </p>
        </div>

        <Button onClick={openCreateDialog} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Hotel Property
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search hotels by property name, address, or destination..."
            className="pl-10 h-10 text-sm"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
          <Select value={destinationFilter} onValueChange={setDestinationFilter}>
            <SelectTrigger className="w-[180px] h-10 text-xs">
              <SelectValue placeholder="Destination" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Destinations</SelectItem>
              {destinations.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}, {d.country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={starFilter} onValueChange={setStarFilter}>
            <SelectTrigger className="w-[130px] h-10 text-xs">
              <SelectValue placeholder="Star Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stars</SelectItem>
              <SelectItem value="5">5 Stars ★</SelectItem>
              <SelectItem value="4">4 Stars ★</SelectItem>
              <SelectItem value="3">3 Stars ★</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Hotels Data Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading hotel catalog...</p>
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="p-16 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground">No hotels found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your filters or add a new hotel property.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-3.5">Hotel Property</th>
                  <th className="px-6 py-3.5">Destination & Location</th>
                  <th className="px-6 py-3.5">Stars</th>
                  <th className="px-6 py-3.5">Rate / Night</th>
                  <th className="px-6 py-3.5">Amenities</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredHotels.map((h) => {
                  const dest = h.destination_id ? destinationMap.get(h.destination_id) : null;
                  const amenities = Array.isArray(h.amenities) ? (h.amenities as string[]) : [];

                  return (
                    <tr key={h.id} className="hover:bg-muted/25 transition-colors">
                      {/* Property Name & Photo */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              h.image_url ||
                              "https://images.unsplash.com/photo-1566073771259-6a8506099945"
                            }
                            alt={h.name}
                            className="h-12 w-16 rounded-lg object-cover border border-border shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-foreground text-sm">{h.name}</div>
                            <span className="text-[11px] text-muted-foreground line-clamp-1 max-w-[200px]">
                              {h.address}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Destination */}
                      <td className="px-6 py-4 text-xs text-foreground font-medium">
                        {dest ? `${dest.name}, ${dest.country}` : "Global"}
                      </td>

                      {/* Stars */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-amber-500 font-semibold text-xs">
                          <span>{h.star_rating}</span>
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 text-xs font-semibold text-foreground whitespace-nowrap">
                        ${Number(h.price_per_night).toLocaleString()}/night
                      </td>

                      {/* Amenities count */}
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">
                          {amenities.length} amenities
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={h.status === "published" ? "default" : "secondary"}
                          className="text-[10px] uppercase"
                        >
                          {h.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-muted-foreground"
                          >
                            <a
                              href={`/hotels/${h.id}`}
                              target="_blank"
                              rel="noreferrer"
                              title="View Public Page"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(h)}
                            className="h-8 px-2.5 text-xs"
                            title="Edit Hotel"
                          >
                            <Edit2 className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletingHotel(h);
                              setIsDeleteOpen(true);
                            }}
                            className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10"
                            title="Delete Hotel"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      {/* Create / Edit Hotel Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              {editingHotel ? `Edit Property: ${editingHotel.name}` : "Create Hotel Property"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure room rates, star tier, location address, and guest amenities.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Hotel / Resort Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Caldera Blue Suites"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Destination Target
                </label>
                <Select
                  value={formData.destination_id}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, destination_id: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}, {d.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Price Per Night ($) *
                </label>
                <Input
                  type="number"
                  min={1}
                  value={formData.price_per_night}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price_per_night: Number(e.target.value) }))
                  }
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Star Rating (1–5)
                </label>
                <Select
                  value={String(formData.star_rating)}
                  onValueChange={(val) =>
                    setFormData((prev) => ({ ...prev, star_rating: Number(val) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Stars ★★★★★</SelectItem>
                    <SelectItem value="4">4 Stars ★★★★</SelectItem>
                    <SelectItem value="3">3 Stars ★★★</SelectItem>
                    <SelectItem value="2">2 Stars ★★</SelectItem>
                    <SelectItem value="1">1 Star ★</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Publish Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published (Live)</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Street Address / Area
              </label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="e.g. Oia Cliffside Walk, Santorini"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Image URL *
              </label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Overview Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Atmosphere, views, architecture, and luxury features..."
                rows={3}
              />
            </div>

            {/* Amenities Grid */}
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-xs font-semibold text-foreground block">
                Amenities & Guest Features
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {COMMON_AMENITIES.map((amenity) => {
                  const isChecked = formData.amenities.includes(amenity);
                  return (
                    <button
                      type="button"
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium border text-left transition-all ${
                        isChecked
                          ? "bg-primary/10 border-primary text-primary font-semibold"
                          : "border-border bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <div
                        className={`h-3.5 w-3.5 rounded flex items-center justify-center border ${
                          isChecked
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/40"
                        }`}
                      >
                        {isChecked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                      <span className="truncate">{amenity}</span>
                    </button>
                  );
                })}
              </div>
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
                {editingHotel ? "Update Hotel" : "Create Hotel"}
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
              Delete Hotel Property
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingHotel?.name}</strong>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingHotel && deleteMutation.mutate(deletingHotel.id)}
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
