import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Star, Edit3, Trash2, Clock, CheckCircle2, AlertCircle, Compass } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { z } from "zod";

const title = "My Reviews — Wanderlust";
const description = "Manage and track the travel reviews and ratings you have submitted.";

export const Route = createFileRoute("/account/reviews")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AccountReviewsPage,
});

interface ReviewItem {
  id: string;
  user_id: string;
  author_name: string | null;
  target_type: string;
  target_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
}

const editReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  comment: z.string().trim().min(10, "Comment must be at least 10 characters"),
});

function AccountReviewsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Edit Modal State
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editTitle, setEditTitle] = useState("");
  const [editComment, setEditComment] = useState("");
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Delete Alert State
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  // Query User Reviews
  const { data: reviews = [], isLoading } = useQuery<ReviewItem[]>({
    queryKey: ["user-reviews", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as ReviewItem[]) || [];
    },
    enabled: !!user,
  });

  // Edit Mutation
  const editMutation = useMutation({
    mutationFn: async ({
      id,
      rating,
      title,
      comment,
    }: {
      id: string;
      rating: number;
      title: string;
      comment: string;
    }) => {
      const { error } = await supabase
        .from("reviews")
        .update({
          rating,
          title,
          comment,
          is_approved: false, // Reset to false for re-moderation
        })
        .eq("id", id);

      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-reviews", user?.id] });
      toast.success("Review updated! It will be reviewed by moderation shortly.");
      setEditingReview(null);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to update review";
      toast.error(message);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-reviews", user?.id] });
      toast.success("Review deleted.");
      setDeletingReviewId(null);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to delete review";
      toast.error(message);
    },
  });

  const handleOpenEdit = (review: ReviewItem) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditTitle(review.title || "");
    setEditComment(review.comment || "");
    setEditErrors({});
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;

    const result = editReviewSchema.safeParse({
      rating: editRating,
      title: editTitle,
      comment: editComment,
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        errors[issue.path.join(".")] = issue.message;
      });
      setEditErrors(errors);
      return;
    }

    setEditErrors({});
    editMutation.mutate({
      id: editingReview.id,
      rating: editRating,
      title: editTitle,
      comment: editComment,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">My Reviews</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          View all reviews and ratings you have shared for Wanderlust destinations, packages, and
          hotels.
        </p>
      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Star className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            No Reviews Written Yet
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Share your experiences! Leave feedback on destinations, guided tours, and hotel stays
            you have enjoyed.
          </p>
          <div className="pt-2">
            <Button asChild size="sm" className="rounded-full bg-primary text-primary-foreground">
              <Link to="/destinations">Explore Destinations</Link>
            </Button>
          </div>
        </div>
      ) : (
        /* Reviews Stream */
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm transition-all hover:border-secondary/40 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize text-xs font-semibold">
                    {rev.target_type}
                  </Badge>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < rev.rating
                            ? "fill-accent text-accent"
                            : "fill-muted text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {rev.is_approved ? (
                    <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/20 text-xs font-semibold">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Approved & Public
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/20 text-xs font-semibold">
                      <Clock className="mr-1 h-3 w-3" /> Pending Moderation
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(rev.created_at), "MMM d, yyyy")}
                  </span>
                </div>
              </div>

              {/* Review Content */}
              <div className="space-y-1.5">
                {rev.title && (
                  <h4 className="font-display text-base sm:text-lg font-bold text-foreground">
                    {rev.title}
                  </h4>
                )}
                {rev.comment && (
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans">
                    {rev.comment}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenEdit(rev)}
                  className="rounded-full text-xs h-8 px-3"
                >
                  <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeletingReviewId(rev.id)}
                  className="rounded-full text-xs h-8 px-3 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Review Dialog */}
      <Dialog
        open={!!editingReview}
        onOpenChange={(open) => {
          if (!open) setEditingReview(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Edit Review</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Updating your review will resubmit it for moderation.
              </DialogDescription>
            </DialogHeader>

            {/* Star Picker */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Your Rating (1–5 Stars)</Label>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditRating(star)}
                    className="p-1 text-muted-foreground/30 hover:scale-110 transition-transform focus:outline-none"
                    aria-label={`Rate ${star} star`}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= editRating
                          ? "fill-accent text-accent"
                          : "fill-transparent text-muted-foreground/40"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-semibold text-foreground">
                  {editRating} out of 5
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <Label htmlFor="editReviewTitle" className="text-xs font-semibold">
                Headline / Title
              </Label>
              <Input
                id="editReviewTitle"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="e.g. Unforgettable experience!"
              />
              {editErrors.title && <p className="text-xs text-destructive">{editErrors.title}</p>}
            </div>

            {/* Comment */}
            <div className="space-y-1">
              <Label htmlFor="editReviewComment" className="text-xs font-semibold">
                Your Feedback
              </Label>
              <Textarea
                id="editReviewComment"
                rows={4}
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                placeholder="Share helpful tips and highlights from your trip..."
              />
              {editErrors.comment && (
                <p className="text-xs text-destructive">{editErrors.comment}</p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingReview(null)}
                disabled={editMutation.isPending}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editMutation.isPending}
                className="rounded-full bg-primary text-primary-foreground"
              >
                {editMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={!!deletingReviewId}
        onOpenChange={(open) => {
          if (!open) setDeletingReviewId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl">Delete Review</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to permanently delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending} className="rounded-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deletingReviewId) {
                  deleteMutation.mutate(deletingReviewId);
                }
              }}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Review"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
