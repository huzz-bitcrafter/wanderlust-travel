import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Star,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
  Clock,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({
    meta: [
      { title: "Review Moderation — Wanderlust Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminReviewsPage,
});

type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusTab, setStatusTab] = useState<"pending" | "approved" | "all">("pending");
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>("all");

  const [deletingReview, setDeletingReview] = useState<ReviewRow | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Fetch all reviews
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as ReviewRow[];
    },
  });

  // Moderation Mutation (Approve / Unapprove)
  const moderateMutation = useMutation({
    mutationFn: async ({ id, isApproved }: { id: string; isApproved: boolean }) => {
      const { error } = await supabase
        .from("reviews")
        .update({ is_approved: isApproved })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success(
        variables.isApproved
          ? "Review approved and published to website."
          : "Review set back to pending moderation.",
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update review status.");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review deleted permanently.");
      setIsDeleteOpen(false);
      setDeletingReview(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete review.");
    },
  });

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const author = r.author_name || "";
      const title = r.title || "";
      const comment = r.comment || "";

      const matchesSearch =
        searchTerm === "" ||
        author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTab =
        statusTab === "all" ||
        (statusTab === "pending" && !r.is_approved) ||
        (statusTab === "approved" && r.is_approved);

      const matchesTarget = targetTypeFilter === "all" || r.target_type === targetTypeFilter;

      return matchesSearch && matchesTab && matchesTarget;
    });
  }, [reviews, searchTerm, statusTab, targetTypeFilter]);

  const pendingCount = useMemo(() => reviews.filter((r) => !r.is_approved).length, [reviews]);
  const approvedCount = useMemo(() => reviews.filter((r) => r.is_approved).length, [reviews]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Review Moderation Queue
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Audit customer feedback, approve ratings for public display, and moderate spam.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge
              variant="default"
              className="bg-amber-600 hover:bg-amber-600 text-white text-xs px-3 py-1"
            >
              {pendingCount} Pending Review{pendingCount === 1 ? "" : "s"}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs px-3 py-1 font-medium bg-card">
            {reviews.length} Total Submissions
          </Badge>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl">
            <button
              onClick={() => setStatusTab("pending")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusTab === "pending"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              <span>Pending Moderation</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-700 text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setStatusTab("approved")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusTab === "approved"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Approved & Live</span>
              <span className="text-[10px] text-muted-foreground">({approvedCount})</span>
            </button>

            <button
              onClick={() => setStatusTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusTab === "all"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({reviews.length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by author name, title, or keywords..."
              className="pl-10 h-10 text-sm"
            />
          </div>
        </div>

        {/* Target Type Filter */}
        <div className="flex items-center gap-2 border-t border-border pt-3">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Target Category:</span>
          {[
            { id: "all", label: "All Items" },
            { id: "destination", label: "Destinations" },
            { id: "package", label: "Tour Packages" },
            { id: "hotel", label: "Hotels" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTargetTypeFilter(t.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                targetTypeFilter === t.id
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-16 text-center rounded-2xl border border-border bg-card shadow-xs">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading reviews queue...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-16 text-center rounded-2xl border border-border bg-card shadow-xs">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground">No reviews in this queue</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {statusTab === "pending"
                ? "All customer reviews have been reviewed and approved!"
                : "No reviews match your current filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredReviews.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col md:flex-row justify-between gap-5 hover:border-primary/30 transition-all"
              >
                {/* Review Body */}
                <div className="flex-1 space-y-3">
                  {/* Top Bar: Author, Target, Rating */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-sm text-foreground">
                      {r.author_name || "Anonymous Traveler"}
                    </span>

                    <Badge variant="outline" className="text-[10px] capitalize font-medium">
                      {r.target_type}
                    </Badge>

                    {/* Star Rating */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= r.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-muted text-muted-foreground/30"
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-xs font-bold text-foreground">{r.rating}.0</span>
                    </div>

                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(r.created_at), "MMMM d, yyyy 'at' HH:mm")}
                    </span>
                  </div>

                  {/* Review Content */}
                  <div>
                    {r.title && (
                      <h4 className="font-bold text-sm text-foreground mb-1">"{r.title}"</h4>
                    )}
                    <p className="text-xs text-muted-foreground leading-relaxed">{r.comment}</p>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {r.is_approved ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3" /> Live & Public on Platform
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                        <Clock className="h-3 w-3" /> Pending Moderator Approval
                      </span>
                    )}
                  </div>
                </div>

                {/* Moderation Actions */}
                <div className="flex md:flex-col items-center justify-end md:justify-center gap-2 border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-5 shrink-0">
                  {!r.is_approved ? (
                    <Button
                      size="sm"
                      onClick={() => moderateMutation.mutate({ id: r.id, isApproved: true })}
                      disabled={moderateMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3.5 font-medium shadow-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                      Approve Review
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moderateMutation.mutate({ id: r.id, isApproved: false })}
                      disabled={moderateMutation.isPending}
                      className="text-xs h-8 px-3 font-medium text-amber-700 hover:bg-amber-500/10"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1.5" />
                      Unpublish
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeletingReview(r);
                      setIsDeleteOpen(true);
                    }}
                    disabled={deleteMutation.isPending}
                    className="text-xs h-8 px-3 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Customer Review
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the review by{" "}
              <strong>{deletingReview?.author_name || "Anonymous"}</strong>? This action cannot be
              reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingReview && deleteMutation.mutate(deletingReview.id)}
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
