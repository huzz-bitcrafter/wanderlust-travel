import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { Star, Loader2, AlertCircle, MessageSquare, LogIn } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { fetchReviewsByTarget, fetchReviewAggregate } from "@/lib/review.functions";
import type { ReviewAggregate } from "@/lib/review.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/shared/Rating";
import { cn } from "@/lib/utils";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  title: z.string().trim().min(1, "Title is required").max(100, "Title too long"),
  comment: z
    .string()
    .trim()
    .min(10, "Comment must be at least 10 characters")
    .max(1000, "Comment too long"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewSectionProps {
  targetId: string;
  targetType: "destination" | "tour" | "hotel";
  className?: string;
}

function DistributionBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-6 text-right text-muted-foreground">{star}★</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs text-muted-foreground">{count}</span>
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          <Star
            className={cn(
              "h-6 w-6 transition-colors",
              (hovered || value) >= star ? "fill-accent text-accent" : "text-accent/30",
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewSection({ targetId, targetType, className }: ReviewSectionProps) {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  // Aggregate data
  const aggregateQuery = useQuery({
    queryKey: ["review-aggregate", targetType, targetId],
    queryFn: () => fetchReviewAggregate({ targetId, targetType }),
  });

  // Reviews list
  const reviewsQuery = useQuery({
    queryKey: ["reviews", targetType, targetId],
    queryFn: () => fetchReviewsByTarget({ targetId, targetType }),
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (values: ReviewFormValues) => {
      if (!user) throw new Error("Not authenticated");

      const authorName =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Anonymous";

      const { error } = await supabase.from("reviews").insert({
        target_id: targetId,
        target_type: targetType,
        user_id: user.id,
        rating: values.rating,
        title: values.title,
        comment: values.comment,
        author_name: authorName,
        is_approved: false,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review submitted! It will appear after approval.");
      setShowForm(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["reviews", targetType, targetId] });
      queryClient.invalidateQueries({ queryKey: ["review-aggregate", targetType, targetId] });
    },
    onError: (err) => {
      console.error("Submit review error:", err);
      toast.error("Failed to submit review. Please try again.");
    },
  });

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, title: "", comment: "" },
  });

  const aggregate: ReviewAggregate = aggregateQuery.data ?? {
    target_id: targetId,
    avg_rating: 0,
    review_count: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  };

  const reviews = reviewsQuery.data ?? [];

  return (
    <section className={cn("space-y-6", className)} id="reviews">
      <h2 className="text-2xl">Reviews & Ratings</h2>

      {/* Aggregate */}
      {aggregateQuery.isLoading ? (
        <div className="flex gap-6">
          <Skeleton className="h-24 w-32 rounded-xl" />
          <Skeleton className="h-24 flex-1 rounded-xl" />
        </div>
      ) : (
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Score */}
          <div className="flex flex-col items-center rounded-xl bg-card p-6 shadow-sm">
            <span className="text-4xl font-bold text-foreground">
              {aggregate.review_count > 0 ? aggregate.avg_rating.toFixed(1) : "—"}
            </span>
            <StarRating value={aggregate.avg_rating} className="mt-1" />
            <span className="mt-1 text-xs text-muted-foreground">
              {aggregate.review_count} {aggregate.review_count === 1 ? "review" : "reviews"}
            </span>
          </div>

          {/* Distribution */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => (
              <DistributionBar
                key={star}
                star={star}
                count={aggregate.distribution[star] ?? 0}
                total={aggregate.review_count}
              />
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Write Review */}
      {!user ? (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-4">
          <LogIn className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            <Link to="/login" className="font-medium text-secondary hover:underline">
              Sign in
            </Link>{" "}
            to write a review
          </p>
        </div>
      ) : showForm ? (
        <form
          onSubmit={form.handleSubmit((values) => submitMutation.mutate(values))}
          className="space-y-4 rounded-xl border border-border bg-card p-4"
        >
          <h3 className="text-lg font-semibold">Write a Review</h3>

          <div className="space-y-2">
            <Label>Rating</Label>
            <StarPicker
              value={form.watch("rating")}
              onChange={(v) => form.setValue("rating", v, { shouldValidate: true })}
            />
            {form.formState.errors.rating ? (
              <p className="text-xs text-destructive">{form.formState.errors.rating.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-title">Title</Label>
            <Input
              id="review-title"
              placeholder="Summarize your experience"
              {...form.register("title")}
            />
            {form.formState.errors.title ? (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-comment">Comment</Label>
            <Textarea
              id="review-comment"
              placeholder="Share the details of your experience..."
              rows={4}
              {...form.register("comment")}
            />
            {form.formState.errors.comment ? (
              <p className="text-xs text-destructive">{form.formState.errors.comment.message}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={submitMutation.isPending}
              className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {submitMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit Review
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="rounded-full"
              onClick={() => {
                setShowForm(false);
                form.reset();
              }}
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Your review will be visible after admin approval.
          </p>
        </form>
      ) : (
        <Button variant="outline" className="rounded-full" onClick={() => setShowForm(true)}>
          <MessageSquare className="mr-2 h-4 w-4" aria-hidden="true" />
          Write a Review
        </Button>
      )}

      {/* Reviews List */}
      {reviewsQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : reviewsQuery.isError ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-muted-foreground">Failed to load reviews.</p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => reviewsQuery.refetch()}
          >
            Try Again
          </Button>
        </div>
      ) : reviews.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No reviews yet. Be the first to share your experience!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <StarRating value={review.rating} />
                    {review.title ? (
                      <span className="text-sm font-semibold text-foreground">{review.title}</span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {review.author_name ?? "Anonymous"} ·{" "}
                    {format(new Date(review.created_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              {review.comment ? (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {review.comment}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
