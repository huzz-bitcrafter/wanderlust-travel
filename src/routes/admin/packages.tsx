import React, { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Loader2,
  Sparkles,
  AlertTriangle,
  Calendar,
  DollarSign,
  Users,
  Clock,
  ListPlus,
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

export const Route = createFileRoute("/admin/packages")({
  head: () => ({
    meta: [
      { title: "Manage Tour Packages — Wanderlust Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPackagesPage,
});

type PackageRow = Database["public"]["Tables"]["tour_packages"]["Row"];
type DestinationRow = Database["public"]["Tables"]["destinations"]["Row"];

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

interface PackageFormData {
  destination_id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  duration_days: number;
  price_per_person: number;
  difficulty: string;
  group_size_max: number;
  image_url: string;
  status: string;
  is_featured: boolean;
  includesString: string;
  excludesString: string;
  itinerary: ItineraryDay[];
}

const INITIAL_FORM: PackageFormData = {
  destination_id: "",
  title: "",
  slug: "",
  summary: "",
  description: "",
  duration_days: 5,
  price_per_person: 1200,
  difficulty: "easy",
  group_size_max: 12,
  image_url:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  status: "published",
  is_featured: false,
  includesString: "Accommodation, Daily breakfast, Local guide, Airport transfers",
  excludesString: "International flights, Travel insurance, Personal expenses",
  itinerary: [
    {
      day: 1,
      title: "Arrival & Welcome",
      description: "Transfer to accommodation, welcome briefing and dinner.",
    },
    {
      day: 2,
      title: "Guided Exploration",
      description: "Full day excursion and cultural immersion.",
    },
  ],
};

function AdminPackagesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageRow | null>(null);
  const [deletingPackage, setDeletingPackage] = useState<PackageRow | null>(null);
  const [formData, setFormData] = useState<PackageFormData>(INITIAL_FORM);

  // 1. Fetch destinations for relation and dropdown
  const { data: destinations = [] } = useQuery({
    queryKey: ["admin", "destinations-lookup"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("id, name, country, slug")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data || []) as DestinationRow[];
    },
  });

  const destinationMap = useMemo(() => {
    return new Map(destinations.map((d) => [d.id, d]));
  }, [destinations]);

  // 2. Fetch all tour packages
  const { data: packages = [], isLoading } = useQuery({
    queryKey: ["admin", "tour_packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tour_packages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as PackageRow[];
    },
  });

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async (form: PackageFormData) => {
      const includes = form.includesString
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const excludes = form.excludesString
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        destination_id: form.destination_id || null,
        title: form.title,
        slug: form.slug,
        summary: form.summary,
        description: form.description,
        duration_days: Number(form.duration_days),
        price_per_person: Number(form.price_per_person),
        difficulty: form.difficulty,
        group_size_max: Number(form.group_size_max),
        image_url: form.image_url,
        status: form.status,
        is_featured: form.is_featured,
        includes: includes as unknown as Json,
        excludes: excludes as unknown as Json,
        itinerary: form.itinerary as unknown as Json,
      };

      if (editingPackage) {
        const { error } = await supabase
          .from("tour_packages")
          .update(payload)
          .eq("id", editingPackage.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tour_packages").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tour_packages"] });
      queryClient.invalidateQueries({ queryKey: ["tour_packages"] });
      toast.success(editingPackage ? "Tour package updated." : "New tour package created.");
      setIsFormOpen(false);
      setEditingPackage(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save tour package.");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tour_packages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tour_packages"] });
      queryClient.invalidateQueries({ queryKey: ["tour_packages"] });
      toast.success("Tour package deleted.");
      setIsDeleteOpen(false);
      setDeletingPackage(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete package.");
    },
  });

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return packages.filter((p) => {
      const dest = p.destination_id ? destinationMap.get(p.destination_id) : null;
      const matchesSearch =
        searchTerm === "" ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dest && dest.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDest = destinationFilter === "all" || p.destination_id === destinationFilter;

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;

      return matchesSearch && matchesDest && matchesStatus;
    });
  }, [packages, searchTerm, destinationFilter, statusFilter, destinationMap]);

  const openCreateDialog = () => {
    setEditingPackage(null);
    setFormData({
      ...INITIAL_FORM,
      destination_id: destinations[0]?.id || "",
    });
    setIsFormOpen(true);
  };

  const openEditDialog = (pkg: PackageRow) => {
    setEditingPackage(pkg);
    const inc = Array.isArray(pkg.includes) ? (pkg.includes as string[]).join(", ") : "";
    const exc = Array.isArray(pkg.excludes) ? (pkg.excludes as string[]).join(", ") : "";
    const itin = Array.isArray(pkg.itinerary) ? (pkg.itinerary as unknown as ItineraryDay[]) : [];

    setFormData({
      destination_id: pkg.destination_id || "",
      title: pkg.title,
      slug: pkg.slug,
      summary: pkg.summary || "",
      description: pkg.description || "",
      duration_days: pkg.duration_days,
      price_per_person: Number(pkg.price_per_person),
      difficulty: pkg.difficulty || "easy",
      group_size_max: pkg.group_size_max || 12,
      image_url: pkg.image_url || "",
      status: pkg.status || "published",
      is_featured: pkg.is_featured ?? false,
      includesString: inc,
      excludesString: exc,
      itinerary: itin.length > 0 ? itin : INITIAL_FORM.itinerary,
    });
    setIsFormOpen(true);
  };

  const handleTitleChange = (title: string) => {
    const slug = editingPackage
      ? formData.slug
      : title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
    setFormData((prev) => ({ ...prev, title, slug }));
  };

  const addItineraryDay = () => {
    setFormData((prev) => {
      const nextDayNum = prev.itinerary.length + 1;
      return {
        ...prev,
        itinerary: [
          ...prev.itinerary,
          {
            day: nextDayNum,
            title: `Day ${nextDayNum} Itinerary`,
            description: "Scheduled activities and experiences.",
          },
        ],
      };
    });
  };

  const removeItineraryDay = (index: number) => {
    setFormData((prev) => {
      const updated = prev.itinerary
        .filter((_, idx) => idx !== index)
        .map((item, idx) => ({ ...item, day: idx + 1 }));
      return { ...prev, itinerary: updated };
    });
  };

  const updateItineraryField = (index: number, field: "title" | "description", val: string) => {
    setFormData((prev) => {
      const updated = [...prev.itinerary];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, itinerary: updated };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Package title is required.");
      return;
    }
    if (!formData.slug.trim()) {
      toast.error("Package slug is required.");
      return;
    }
    if (!formData.image_url.trim()) {
      toast.error("Image URL is required.");
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
            Tour Packages Catalog
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage multi-day curated itineraries, pricing, inclusions, and difficulty tiers.
          </p>
        </div>

        <Button onClick={openCreateDialog} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Tour Package
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search packages by title, destination, or slug..."
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

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-10 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Packages Data Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading tour packages...</p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="p-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground">No tour packages found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search criteria or create a new package.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-3.5">Tour Package</th>
                  <th className="px-6 py-3.5">Destination</th>
                  <th className="px-6 py-3.5">Duration</th>
                  <th className="px-6 py-3.5">Price</th>
                  <th className="px-6 py-3.5">Difficulty</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPackages.map((p) => {
                  const dest = p.destination_id ? destinationMap.get(p.destination_id) : null;

                  return (
                    <tr key={p.id} className="hover:bg-muted/25 transition-colors">
                      {/* Package Name & Thumbnail */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              p.image_url ||
                              "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1"
                            }
                            alt={p.title}
                            className="h-12 w-16 rounded-lg object-cover border border-border shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                              <span>{p.title}</span>
                              {p.is_featured && (
                                <Sparkles className="h-3 w-3 text-amber-600" title="Featured" />
                              )}
                            </div>
                            <span className="font-mono text-[11px] text-muted-foreground">
                              /{p.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Destination */}
                      <td className="px-6 py-4 text-xs font-medium text-foreground">
                        {dest ? `${dest.name}, ${dest.country}` : "Global"}
                      </td>

                      {/* Duration */}
                      <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{p.duration_days} Days</span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 text-xs font-semibold text-foreground whitespace-nowrap">
                        ${Number(p.price_per_person).toLocaleString()}/person
                      </td>

                      {/* Difficulty */}
                      <td className="px-6 py-4 text-xs capitalize">
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase font-semibold ${
                            p.difficulty === "challenging"
                              ? "border-amber-500/30 text-amber-700 bg-amber-500/5"
                              : p.difficulty === "moderate"
                                ? "border-blue-500/30 text-blue-700 bg-blue-500/5"
                                : "border-emerald-500/30 text-emerald-700 bg-emerald-500/5"
                          }`}
                        >
                          {p.difficulty || "easy"}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={p.status === "published" ? "default" : "secondary"}
                          className="text-[10px] uppercase"
                        >
                          {p.status}
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
                              href={`/packages/${p.slug}`}
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
                            onClick={() => openEditDialog(p)}
                            className="h-8 px-2.5 text-xs"
                            title="Edit Package"
                          >
                            <Edit2 className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletingPackage(p);
                              setIsDeleteOpen(true);
                            }}
                            className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10"
                            title="Delete Package"
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

      {/* Create / Edit Package Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              {editingPackage
                ? `Edit Tour Package: ${editingPackage.title}`
                : "Create New Tour Package"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define the multi-day schedule, inclusions, pricing, and destination linkage.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 py-2">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Package Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Santorini Caldera Escape"
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
                  placeholder="e.g. santorini-caldera-escape"
                  required
                />
              </div>
            </div>

            {/* Destination & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Difficulty Level
                </label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, difficulty: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="challenging">Challenging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Numerical specs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Duration (Days) *
                </label>
                <Input
                  type="number"
                  min={1}
                  value={formData.duration_days}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, duration_days: Number(e.target.value) }))
                  }
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Price Per Person ($) *
                </label>
                <Input
                  type="number"
                  min={0}
                  value={formData.price_per_person}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price_per_person: Number(e.target.value) }))
                  }
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Max Group Size
                </label>
                <Input
                  type="number"
                  min={1}
                  value={formData.group_size_max}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, group_size_max: Number(e.target.value) }))
                  }
                />
              </div>
            </div>

            {/* Image & Featured */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Cover Image URL *
                </label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-4 sm:pt-6">
                <input
                  type="checkbox"
                  id="package_featured"
                  checked={formData.is_featured}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, is_featured: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label
                  htmlFor="package_featured"
                  className="text-xs font-semibold text-foreground cursor-pointer"
                >
                  Feature on Home Featured Packages
                </label>
              </div>
            </div>

            {/* Summary & Description */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Summary Catchphrase
              </label>
              <Input
                value={formData.summary}
                onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="e.g. Five slow days of cliff villages, catamaran sunsets and volcanic wine."
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Full Tour Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Comprehensive tour details..."
                rows={3}
              />
            </div>

            {/* Includes & Excludes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Includes (Comma-separated)
                </label>
                <Input
                  value={formData.includesString}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, includesString: e.target.value }))
                  }
                  placeholder="Accommodation, Daily breakfast, Local guide"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Excludes (Comma-separated)
                </label>
                <Input
                  value={formData.excludesString}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, excludesString: e.target.value }))
                  }
                  placeholder="International flights, Insurance, Drinks"
                />
              </div>
            </div>

            {/* Day-by-Day Itinerary Schedule Builder */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ListPlus className="h-4 w-4 text-primary" /> Day-by-Day Itinerary Schedule
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItineraryDay}
                  className="h-7 text-xs"
                >
                  <Plus className="mr-1 h-3 w-3" /> Add Day
                </Button>
              </div>

              <div className="space-y-3">
                {formData.itinerary.map((dayItem, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border p-3.5 bg-muted/20 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <Badge variant="outline" className="text-xs font-bold bg-card shrink-0">
                          Day {dayItem.day}
                        </Badge>
                        <Input
                          value={dayItem.title}
                          onChange={(e) => updateItineraryField(idx, "title", e.target.value)}
                          placeholder="Day Title (e.g. Arrival & Sunset Catamaran)"
                          className="h-8 text-xs font-medium"
                          required
                        />
                      </div>
                      {formData.itinerary.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItineraryDay(idx)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded"
                          title="Remove day"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <Textarea
                      value={dayItem.description}
                      onChange={(e) => updateItineraryField(idx, "description", e.target.value)}
                      placeholder="Detailed schedule and activities for this day..."
                      rows={2}
                      className="text-xs"
                      required
                    />
                  </div>
                ))}
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
                {editingPackage ? "Update Package" : "Create Package"}
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
              Delete Tour Package
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingPackage?.title}</strong>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPackage && deleteMutation.mutate(deletingPackage.id)}
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
