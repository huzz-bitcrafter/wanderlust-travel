import { createServerFn } from "@tanstack/react-start";

export type DestinationCardData = {
  id: string;
  slug: string;
  name: string;
  country: string;
  region: string | null;
  continent: string | null;
  short_description: string | null;
  hero_image: string | null;
  best_season: string | null;
  is_featured: boolean;
};

export type PackageCardData = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  duration_days: number;
  price_per_person: number;
  difficulty: string;
  image_url: string | null;
  is_featured: boolean;
  destination: { name: string; country: string; slug: string } | null;
};

const DESTINATION_FIELDS =
  "id, slug, name, country, region, continent, short_description, hero_image, best_season, is_featured";

const PACKAGE_FIELDS =
  "id, slug, title, summary, duration_days, price_per_person, difficulty, image_url, is_featured, destinations(name, country, slug)";

type RawPackage = Omit<PackageCardData, "destination" | "price_per_person"> & {
  price_per_person: number | string;
  destinations: { name: string; country: string; slug: string } | null;
};

function mapPackage(row: RawPackage): PackageCardData {
  const { destinations, price_per_person, ...rest } = row;
  return { ...rest, price_per_person: Number(price_per_person), destination: destinations };
}

export const listFeaturedDestinations = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicSupabase } = await import("./supabase-public.server");
  const { data, error } = await getPublicSupabase()
    .from("destinations")
    .select(DESTINATION_FIELDS)
    .eq("is_featured", true)
    .order("name")
    .limit(6);

  if (error) {
    console.error("listFeaturedDestinations", error);
    throw new Error("Could not load destinations");
  }
  return (data ?? []) as DestinationCardData[];
});

export const listFeaturedPackages = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicSupabase } = await import("./supabase-public.server");
  const { data, error } = await getPublicSupabase()
    .from("tour_packages")
    .select(PACKAGE_FIELDS)
    .eq("is_featured", true)
    .eq("status", "published")
    .order("price_per_person")
    .limit(6);

  if (error) {
    console.error("listFeaturedPackages", error);
    throw new Error("Could not load tour packages");
  }
  return ((data ?? []) as unknown as RawPackage[]).map(mapPackage);
});

export type DestinationDetailData = {
  id: string;
  slug: string;
  name: string;
  country: string;
  region: string | null;
  continent: string | null;
  short_description: string | null;
  description: string | null;
  hero_image: string | null;
  best_season: string | null;
  is_featured: boolean;
  created_at: string;
};

export type DestinationsFilterParams = {
  search?: string;
  continent?: string;
  region?: string;
  page?: number;
  pageSize?: number;
};

export type DestinationsQueryResult = {
  items: DestinationCardData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export const CONTINENTS = [
  "All",
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "Oceania",
  "South America",
] as const;

export const REGIONS = [
  "All",
  "Alberta",
  "Campania",
  "Cyclades",
  "Kansai",
  "Lesser Sunda",
  "Lisboa",
  "Magallanes",
  "Mara",
  "Marrakesh-Safi",
  "North Malé Atoll",
  "Otago",
  "Southern Region",
] as const;

export const fetchDestinations = createServerFn({ method: "GET" })
  .validator(
    (params?: {
      search?: string;
      continent?: string;
      region?: string;
      page?: number;
      pageSize?: number;
    }) => params ?? {},
  )
  .handler(async ({ data }) => {
    const { search, continent, region, page = 1, pageSize = 9 } = data;
    const { getPublicSupabase } = await import("./supabase-public.server");
    const supabase = getPublicSupabase();

    let query = supabase.from("destinations").select(DESTINATION_FIELDS, { count: "exact" });

    if (search && search.trim()) {
      const sanitized = search.trim().replace(/[,()]/g, " ").trim();
      if (sanitized) {
        query = query.or(`name.ilike.%${sanitized}%,country.ilike.%${sanitized}%`);
      }
    }

    if (continent && continent.toLowerCase() !== "all") {
      query = query.eq("continent", continent);
    }

    if (region && region.toLowerCase() !== "all") {
      query = query.eq("region", region);
    }

    const p = Math.max(1, Number(page) || 1);
    const size = Math.max(1, Number(pageSize) || 9);
    const from = (p - 1) * size;
    const to = from + size - 1;

    query = query.order("name", { ascending: true }).range(from, to);

    const { data: items, error, count } = await query;

    if (error) {
      console.error("fetchDestinations", error);
      throw new Error("Could not load destinations");
    }

    const total = count ?? 0;
    return {
      items: (items ?? []) as DestinationCardData[],
      total,
      page: p,
      pageSize: size,
      totalPages: Math.max(1, Math.ceil(total / size)),
    };
  });

export const fetchDestinationBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const { getPublicSupabase } = await import("./supabase-public.server");
    const { data, error } = await getPublicSupabase()
      .from("destinations")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("fetchDestinationBySlug", error);
      throw new Error("Could not load destination");
    }
    return data as DestinationDetailData | null;
  });
