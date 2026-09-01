import React, { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
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

export const Route = createFileRoute("/admin/destinations")({
  head: () => ({
    meta: [
      { title: "Manage Destinations — Wanderlust Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDestinationsPage,
});

type DestinationRow = Database["public"]["Tables"]["destinations"]["Row"];

interface DestinationFormData {
  name: string;
  slug: string;
  country: string;
  region: string;
  continent: string;
  short_description: string;
  description: string;
  hero_image: string;
  best_season: string;
  is_featured: boolean;
}

const CONTINENTS = [
  "Europe",
  "Asia",
  "Africa",
  "North America",
  "South America",
  "Oceania",
  "Antarctica",
];

const INITIAL_FORM: DestinationFormData = {
  name: "",
  slug: "",
  country: "",
  region: "",
  continent: "Europe",
  short_description: "",
  description: "",
  hero_image:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  best_season: "May – September",
  is_featured: false,
};

function AdminDestinationsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [continentFilter, setContinentFilter] = useState("all");

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<DestinationRow | null>(null);
  const [deletingDestination, setDeletingDestination] = useState<DestinationRow | null>(null);
  const [formData, setFormData] = useState<DestinationFormData>(INITIAL_FORM);

  // Fetch all destinations
  const { data: destinations = [], isLoading } = useQuery({
    queryKey: ["admin", "destinations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data || []) as DestinationRow[];
    },
  });

  // Create / Update Mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: DestinationFormData) => {
      if (editingDestination) {
        const { error } = await supabase
          .from("destinations")
          .update(payload)
          .eq("id", editingDestination.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("destinations").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "destinations"] });
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      toast.success(
        editingDestination
          ? "Destination updated successfully."
          : "New destination published successfully.",
      );
      setIsFormOpen(false);
      setEditingDestination(null);
      setFormData(INITIAL_FORM);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save destination.");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("destinations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "destinations"] });
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      toast.success("Destination deleted successfully.");
      setIsDeleteOpen(false);
      setDeletingDestination(null);
    },
    onError: (err: Error) => {
      toast.error(
        err.message || "Failed to delete destination. Check for linked tour packages or hotels.",
      );
    },
  });

  // Filtered List
  const filteredDestinations = useMemo(() => {
    return destinations.filter((d) => {
      const matchesSearch =
        searchTerm === "" ||
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.slug.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesContinent = continentFilter === "all" || d.continent === continentFilter;

      return matchesSearch && matchesContinent;
    });
  }, [destinations, searchTerm, continentFilter]);

  const openCreateDialog = () => {
    setEditingDestination(null);
    setFormData(INITIAL_FORM);
    setIsFormOpen(true);
  };

  const openEditDialog = (destination: DestinationRow) => {
    setEditingDestination(destination);
    setFormData({
      name: destination.name,
      slug: destination.slug,
      country: destination.country,
      region: destination.region || "",
      continent: destination.continent || "Europe",
      short_description: destination.short_description || "",
      description: destination.description || "",
      hero_image: destination.hero_image,
      best_season: destination.best_season || "",
      is_featured: destination.is_featured ?? false,
    });
    setIsFormOpen(true);
  };

  const handleNameChange = (name: string) => {
    const slug = editingDestination
      ? formData.slug
      : name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

    setFormData((prev) => ({ ...prev, name, slug }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Destination name is required.");
      return;
    }
    if (!formData.slug.trim()) {
      toast.error("URL slug is required.");
      return;
    }
    if (!formData.country.trim()) {
      toast.error("Country is required.");
      return;
    }
    if (!formData.hero_image.trim()) {
      toast.error("Hero image URL is required.");
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
            Destinations Catalog
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, edit, and publish destination guides displayed across the platform.
          </p>
        </div>

        <Button onClick={openCreateDialog} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Destination
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search destination name, country, or slug..."
            className="pl-10 h-10 text-sm"
          />
        </div>

        <div className="w-full sm:w-56">
          <Select value={continentFilter} onValueChange={setContinentFilter}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Filter by continent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Continents</SelectItem>
              {CONTINENTS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Destinations Data Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading destinations...</p>
          </div>
        ) : filteredDestinations.length === 0 ? (
          <div className="p-16 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground">No destinations found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search criteria or create a new destination.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-3.5">Destination</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Continent</th>
                  <th className="px-6 py-3.5">Best Season</th>
                  <th className="px-6 py-3.5">Featured</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDestinations.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/25 transition-colors">
                    {/* Destination Name & Image */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={d.hero_image}
                          alt={d.name}
                          className="h-12 w-16 rounded-lg object-cover border border-border shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-foreground text-sm">{d.name}</div>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            /{d.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Country & Region */}
                    <td className="px-6 py-4 text-xs text-foreground font-medium">
                      {d.region ? `${d.region}, ` : ""}
                      {d.country}
                    </td>

                    {/* Continent */}
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {d.continent}
                      </Badge>
                    </td>

                    {/* Best Season */}
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {d.best_season || "Year-round"}
                    </td>

                    {/* Featured */}
                    <td className="px-6 py-4">
                      {d.is_featured ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                          <Sparkles className="h-3 w-3" /> Featured
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
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
                            href={`/destinations/${d.slug}`}
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
                          onClick={() => openEditDialog(d)}
                          className="h-8 px-2.5 text-xs"
                          title="Edit Destination"
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeletingDestination(d);
                            setIsDeleteOpen(true);
                          }}
                          className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10"
                          title="Delete Destination"
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

      {/* Create / Edit Destination Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              {editingDestination
                ? `Edit Destination: ${editingDestination.name}`
                : "Create New Destination"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Fill in all the details for the destination guide. Slugs are used for public routing.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Destination Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Santorini"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  URL Slug *
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g. santorini"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Country *
                </label>
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                  placeholder="e.g. Greece"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Region</label>
                <Input
                  value={formData.region}
                  onChange={(e) => setFormData((prev) => ({ ...prev, region: e.target.value }))}
                  placeholder="e.g. Cyclades"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Continent *
                </label>
                <Select
                  value={formData.continent}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, continent: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Continent" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTINENTS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Hero Image URL *
              </label>
              <div className="flex gap-2">
                <Input
                  value={formData.hero_image}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hero_image: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  required
                />
              </div>
              {formData.hero_image && (
                <div className="mt-2 relative h-28 w-full rounded-xl overflow-hidden border border-border bg-muted/40">
                  <img
                    src={formData.hero_image}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Best Season to Visit
                </label>
                <Input
                  value={formData.best_season}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, best_season: e.target.value }))
                  }
                  placeholder="e.g. April – October"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, is_featured: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label
                  htmlFor="is_featured"
                  className="text-xs font-semibold text-foreground cursor-pointer"
                >
                  Feature on Homepage Hero & Showcase
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Short Tagline Summary
              </label>
              <Input
                value={formData.short_description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, short_description: e.target.value }))
                }
                placeholder="e.g. Whitewashed cliffs above a sunken volcano."
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Full Description Story
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Full background and travel guide description..."
                rows={4}
              />
            </div>

            <DialogFooter className="pt-3">
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
                {editingDestination ? "Update Destination" : "Create Destination"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Destination
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingDestination?.name}</strong>? This
              will permanently remove the destination and its associated gallery images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingDestination && deleteMutation.mutate(deletingDestination.id)}
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
