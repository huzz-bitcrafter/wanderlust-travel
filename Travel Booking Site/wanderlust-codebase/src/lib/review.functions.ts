import { createServerFn } from "@tanstack/react-start";

export type ReviewData = {
  id: string;
  user_id: string;
  target_id: string;
  target_type: string;
  rating: number;
  title: string | null;
  comment: string | null;
  author_name: string | null;
  is_approved: boolean;
  created_at: string;
};

export type ReviewAggregate = {
  target_id: string;
  avg_rating: number;
  review_count: number;
  distribution: Record<number, number>;
};

/**
 * Fetch approved reviews for a specific target (detail pages).
 */
export const fetchReviewsByTarget = createServerFn({ method: "GET" })
  .validator((params: { targetId: string; targetType: string }) => params)
  .handler(async ({ data }) => {
    const { getPublicSupabase } = await import("./supabase-public.server");
    const supabase = getPublicSupabase();

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("target_id", data.targetId)
      .eq("target_type", data.targetType)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchReviewsByTarget", error);
      throw new Error("Could not load reviews");
    }

    return (reviews ?? []) as ReviewData[];
  });

/**
 * Fetch review aggregates for a list of target IDs (listing pages).
 * Returns a map of target_id -> { avg_rating, review_count }.
 * Uses a single query grouped on the client side.
 */
export const fetchReviewAggregates = createServerFn({ method: "GET" })
  .validator((params: { targetIds: string[]; targetType: string }) => params)
  .handler(async ({ data }) => {
    if (!data.targetIds.length)
      return {} as Record<string, { avg_rating: number; review_count: number }>;

    const { getPublicSupabase } = await import("./supabase-public.server");
    const supabase = getPublicSupabase();

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("target_id, rating")
      .eq("target_type", data.targetType)
      .eq("is_approved", true)
      .in("target_id", data.targetIds);

    if (error) {
      console.error("fetchReviewAggregates", error);
      return {} as Record<string, { avg_rating: number; review_count: number }>;
    }

    const aggregates: Record<string, { sum: number; count: number }> = {};
    for (const review of reviews ?? []) {
      if (!aggregates[review.target_id]) {
        aggregates[review.target_id] = { sum: 0, count: 0 };
      }
      aggregates[review.target_id].sum += review.rating;
      aggregates[review.target_id].count += 1;
    }

    const result: Record<string, { avg_rating: number; review_count: number }> = {};
    for (const [targetId, agg] of Object.entries(aggregates)) {
      result[targetId] = {
        avg_rating: agg.count > 0 ? agg.sum / agg.count : 0,
        review_count: agg.count,
      };
    }
    return result;
  });

/**
 * Fetch aggregate for a single target (detail pages).
 */
export const fetchReviewAggregate = createServerFn({ method: "GET" })
  .validator((params: { targetId: string; targetType: string }) => params)
  .handler(async ({ data }) => {
    const { getPublicSupabase } = await import("./supabase-public.server");
    const supabase = getPublicSupabase();

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("rating")
      .eq("target_id", data.targetId)
      .eq("target_type", data.targetType)
      .eq("is_approved", true);

    if (error) {
      console.error("fetchReviewAggregate", error);
      return { avg_rating: 0, review_count: 0, distribution: {} } as ReviewAggregate;
    }

    const items = reviews ?? [];
    const count = items.length;
    const sum = items.reduce((s, r) => s + r.rating, 0);
    const avg = count > 0 ? sum / count : 0;

    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of items) {
      const star = Math.max(1, Math.min(5, Math.round(r.rating)));
      distribution[star] = (distribution[star] ?? 0) + 1;
    }

    return {
      target_id: data.targetId,
      avg_rating: avg,
      review_count: count,
      distribution,
    } as ReviewAggregate;
  });

/**
 * Fetch gallery images for the gallery page.
 */
export const fetchGalleryImages = createServerFn({ method: "GET" })
  .validator((params?: { destinationId?: string }) => params ?? {})
  .handler(async ({ data }) => {
    const { getPublicSupabase } = await import("./supabase-public.server");
    const supabase = getPublicSupabase();

    let query = supabase
      .from("gallery_images")
      .select("*, destinations(id, name, slug)")
      .order("created_at", { ascending: false });

    if (data.destinationId && data.destinationId !== "all") {
      query = query.eq("destination_id", data.destinationId);
    }

    const { data: images, error } = await query;

    if (error) {
      console.error("fetchGalleryImages", error);
      throw new Error("Could not load gallery images");
    }

    return (images ?? []).map((img) => {
      const raw = img as Record<string, unknown>;
      const dest = raw["destinations"] as { id: string; name: string; slug: string } | null;
      return {
        id: String(raw["id"]),
        url: String(raw["url"]),
        caption: raw["caption"] ? String(raw["caption"]) : null,
        destination_id: raw["destination_id"] ? String(raw["destination_id"]) : null,
        destination_name: dest?.name ?? null,
        destination_slug: dest?.slug ?? null,
        created_at: String(raw["created_at"]),
      };
    });
  });
