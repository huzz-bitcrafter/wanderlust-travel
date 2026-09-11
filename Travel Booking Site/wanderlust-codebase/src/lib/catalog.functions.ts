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

function resolveDestinationHero<T extends { slug: string; hero_image: string | null }>(dest: T): T {
  if (dest.slug === "hampi" || dest.hero_image?.includes("photo-1600100397720-3331c26b9a89")) {
    return { ...dest, hero_image: "/images/destinations/hampi.jpg" };
  }
  if (dest.slug === "rishikesh" || dest.hero_image?.includes("photo-1600100397608-f010f443834a")) {
    return { ...dest, hero_image: "/images/destinations/rishikesh.jpg" };
  }
  return dest;
}

function resolvePackageImage(slug: string, imageUrl: string | null): string | null {
  if (slug === "hampi-boulder-realm-vijayanagara-ruins" || imageUrl?.includes("photo-1600100397720-3331c26b9a89")) {
    return "/images/destinations/hampi.jpg";
  }
  if (slug === "rishikesh-yoga-and-river-adventure" || imageUrl?.includes("photo-1600100397608-f010f443834a")) {
    return "/images/destinations/rishikesh.jpg";
  }
  return imageUrl;
}

function mapPackage(row: RawPackage): PackageCardData {
  const { destinations, price_per_person, ...rest } = row;
  const image_url = resolvePackageImage(rest.slug, rest.image_url);
  return { ...rest, image_url, price_per_person: Number(price_per_person), destination: destinations };
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
  return ((data ?? []) as DestinationCardData[]).map(resolveDestinationHero);
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
  country?: string;
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
  "Andaman & Nicobar",
  "Campania",
  "Cyclades",
  "Himachal Pradesh",
  "Kansai",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lesser Sunda",
  "Lisboa",
  "Magallanes",
  "Mara",
  "Marrakesh-Safi",
  "North India",
  "North Malé Atoll",
  "Otago",
  "Rajasthan",
  "Southern Region",
  "Uttarakhand",
  "West Bengal",
  "West India",
] as const;

export const fetchDestinations = createServerFn({ method: "GET" })
  .validator(
    (params?: {
      search?: string;
      continent?: string;
      region?: string;
      country?: string;
      page?: number;
      pageSize?: number;
    }) => params ?? {},
  )
  .handler(async ({ data }) => {
    const { search, continent, region, country, page = 1, pageSize = 9 } = data;
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

    if (country && country.toLowerCase() !== "all") {
      if (country === "India") {
        query = query.eq("country", "India");
      } else if (
        country === "!India" ||
        country === "country!=India" ||
        country.toLowerCase() === "international"
      ) {
        query = query.neq("country", "India");
      } else if (country.startsWith("!")) {
        query = query.neq("country", country.slice(1));
      } else {
        query = query.eq("country", country);
      }
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
      items: ((items ?? []) as DestinationCardData[]).map(resolveDestinationHero),
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
    return data ? resolveDestinationHero(data as DestinationDetailData) : null;
  });

export type ItineraryDay = {
  day: number;
  title: string;
  description: string;
};

export type PackageDetailData = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  destination_id: string | null;
  duration_days: number;
  price_per_person: number;
  difficulty: string;
  group_size_max: number;
  image_url: string | null;
  is_featured: boolean;
  status: string;
  includes: string[];
  excludes: string[];
  itinerary: ItineraryDay[];
  created_at: string;
  destination: { id: string; name: string; country: string; slug: string } | null;
};

export type PackagesFilterParams = {
  search?: string;
  destinationSlug?: string;
  difficulty?: string;
  minPrice?: number;
  maxPrice?: number;
  maxDuration?: number;
  page?: number;
  pageSize?: number;
  sort?: "price_asc" | "price_desc" | "duration_asc" | "duration_desc" | "featured" | "newest";
};

export type PackagesQueryResult = {
  items: PackageCardData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export const PACKAGE_DIFFICULTIES = ["All", "easy", "moderate", "challenging"] as const;

export type FilterDestinationOption = {
  id: string;
  name: string;
  slug: string;
  country: string;
};

export const fetchFilterDestinations = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicSupabase } = await import("./supabase-public.server");
  const { data, error } = await getPublicSupabase()
    .from("destinations")
    .select("id, name, slug, country")
    .order("name", { ascending: true });

  if (error) {
    console.error("fetchFilterDestinations", error);
    return [];
  }
  return (data ?? []) as FilterDestinationOption[];
});

export const fetchPackages = createServerFn({ method: "GET" })
  .validator((params?: PackagesFilterParams) => params ?? {})
  .handler(async ({ data }) => {
    const {
      search,
      destinationSlug,
      difficulty,
      minPrice,
      maxPrice,
      maxDuration,
      page = 1,
      pageSize = 9,
      sort = "featured",
    } = data;

    const { getPublicSupabase } = await import("./supabase-public.server");
    const supabase = getPublicSupabase();

    const selectFields =
      destinationSlug && destinationSlug !== "All"
        ? "id, slug, title, summary, duration_days, price_per_person, difficulty, image_url, is_featured, destinations!inner(name, country, slug)"
        : PACKAGE_FIELDS;

    let query = supabase
      .from("tour_packages")
      .select(selectFields, { count: "exact" })
      .eq("status", "published");

    if (destinationSlug && destinationSlug !== "All") {
      query = query.eq("destinations.slug", destinationSlug);
    }

    if (search && search.trim()) {
      const sanitized = search.trim().replace(/[,()]/g, " ").trim();
      if (sanitized) {
        query = query.or(`title.ilike.%${sanitized}%,summary.ilike.%${sanitized}%`);
      }
    }

    if (difficulty && difficulty !== "All") {
      query = query.eq("difficulty", difficulty.toLowerCase());
    }

    if (typeof minPrice === "number" && !isNaN(minPrice) && minPrice > 0) {
      query = query.gte("price_per_person", minPrice);
    }

    if (typeof maxPrice === "number" && !isNaN(maxPrice) && maxPrice > 0) {
      query = query.lte("price_per_person", maxPrice);
    }

    if (typeof maxDuration === "number" && !isNaN(maxDuration) && maxDuration > 0) {
      query = query.lte("duration_days", maxDuration);
    }

    switch (sort) {
      case "price_asc":
        query = query.order("price_per_person", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price_per_person", { ascending: false });
        break;
      case "duration_asc":
        query = query.order("duration_days", { ascending: true });
        break;
      case "duration_desc":
        query = query.order("duration_days", { ascending: false });
        break;
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "featured":
      default:
        query = query
          .order("is_featured", { ascending: false })
          .order("price_per_person", { ascending: true });
        break;
    }

    const p = Math.max(1, Number(page) || 1);
    const size = Math.max(1, Number(pageSize) || 9);
    const from = (p - 1) * size;
    const to = from + size - 1;

    query = query.range(from, to);

    const { data: items, error, count } = await query;

    if (error) {
      console.error("fetchPackages", error);
      throw new Error("Could not load packages");
    }

    const total = count ?? 0;
    const mapped = ((items ?? []) as unknown as RawPackage[]).map(mapPackage);

    return {
      items: mapped,
      total,
      page: p,
      pageSize: size,
      totalPages: Math.max(1, Math.ceil(total / size)),
    };
  });

export const fetchPackageBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const { getPublicSupabase } = await import("./supabase-public.server");
    const { data, error } = await getPublicSupabase()
      .from("tour_packages")
      .select("*, destinations(id, name, country, slug)")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("fetchPackageBySlug", error);
      throw new Error("Could not load tour package");
    }

    if (!data) return null;

    const raw = data as Record<string, unknown>;
    const destination = raw["destinations"] as {
      id: string;
      name: string;
      country: string;
      slug: string;
    } | null;

    let includes: string[] = [];
    if (Array.isArray(raw["includes"])) {
      includes = raw["includes"].filter((item): item is string => typeof item === "string");
    }

    let excludes: string[] = [];
    if (Array.isArray(raw["excludes"])) {
      excludes = raw["excludes"].filter((item): item is string => typeof item === "string");
    }

    let itinerary: ItineraryDay[] = [];
    if (Array.isArray(raw["itinerary"])) {
      itinerary = (raw["itinerary"] as Array<Record<string, unknown>>)
        .map((item, index) => ({
          day: typeof item["day"] === "number" ? item["day"] : index + 1,
          title: typeof item["title"] === "string" ? item["title"] : `Day ${index + 1}`,
          description: typeof item["description"] === "string" ? item["description"] : "",
        }))
        .sort((a, b) => a.day - b.day);
    }

    const detail: PackageDetailData = {
      id: String(raw["id"]),
      slug: String(raw["slug"]),
      title: String(raw["title"]),
      summary: raw["summary"] ? String(raw["summary"]) : null,
      description: raw["description"] ? String(raw["description"]) : null,
      destination_id: raw["destination_id"] ? String(raw["destination_id"]) : null,
      duration_days: Number(raw["duration_days"]) || 1,
      price_per_person: Number(raw["price_per_person"]) || 0,
      difficulty: String(raw["difficulty"] || "moderate"),
      group_size_max: Number(raw["group_size_max"]) || 12,
      image_url: resolvePackageImage(String(raw["slug"]), raw["image_url"] ? String(raw["image_url"]) : null),
      is_featured: Boolean(raw["is_featured"]),
      status: String(raw["status"] || "published"),
      includes,
      excludes,
      itinerary,
      created_at: String(raw["created_at"]),
      destination,
    };

    return detail;
  });

export const fetchPackagesByDestination = createServerFn({ method: "GET" })
  .validator((destinationId: string) => destinationId)
  .handler(async ({ data: destinationId }) => {
    const { getPublicSupabase } = await import("./supabase-public.server");
    const { data, error } = await getPublicSupabase()
      .from("tour_packages")
      .select(PACKAGE_FIELDS)
      .eq("destination_id", destinationId)
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .order("price_per_person", { ascending: true });

    if (error) {
      console.error("fetchPackagesByDestination", error);
      return [];
    }

    return ((data ?? []) as unknown as RawPackage[]).map(mapPackage);
  });

export type HotelCardData = {
  id: string;
  name: string;
  star_rating: number;
  price_per_night: number;
  image_url: string | null;
  address: string | null;
  description: string | null;
  amenities: string[];
  status: string;
  destination: { name: string; country: string; slug: string } | null;
};

export type HotelDetailData = {
  id: string;
  name: string;
  star_rating: number;
  price_per_night: number;
  image_url: string | null;
  address: string | null;
  description: string | null;
  amenities: string[];
  destination_id: string | null;
  status: string;
  created_at: string;
  destination: { id: string; name: string; country: string; slug: string } | null;
};

export type HotelsFilterParams = {
  search?: string;
  destinationSlug?: string;
  minStars?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
  sort?: "price_asc" | "price_desc" | "stars_desc" | "name_asc" | "recommended";
};

export type HotelsQueryResult = {
  items: HotelCardData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const HOTEL_FIELDS =
  "id, name, star_rating, price_per_night, image_url, address, description, amenities, status, destination_id, destinations(name, country, slug)";

type RawHotel = {
  id: string;
  name: string;
  star_rating: number;
  price_per_night: number | string;
  image_url: string | null;
  address: string | null;
  description: string | null;
  amenities: unknown;
  status: string;
  destination_id: string | null;
  destinations: { name: string; country: string; slug: string } | null;
};

function mapHotel(row: RawHotel): HotelCardData {
  let amenities: string[] = [];
  if (Array.isArray(row.amenities)) {
    amenities = row.amenities.filter((a): a is string => typeof a === "string");
  }
  return {
    id: String(row.id),
    name: String(row.name),
    star_rating: Number(row.star_rating) || 0,
    price_per_night: Number(row.price_per_night) || 0,
    image_url: row.image_url ? String(row.image_url) : null,
    address: row.address ? String(row.address) : null,
    description: row.description ? String(row.description) : null,
    amenities,
    status: String(row.status || "published"),
    destination: row.destinations,
  };
}

export const fetchHotels = createServerFn({ method: "GET" })
  .validator((params?: HotelsFilterParams) => params ?? {})
  .handler(async ({ data }) => {
    const {
      search,
      destinationSlug,
      minStars,
      maxPrice,
      page = 1,
      pageSize = 9,
      sort = "recommended",
    } = data;

    const { getPublicSupabase } = await import("./supabase-public.server");
    const supabase = getPublicSupabase();

    const selectFields =
      destinationSlug && destinationSlug !== "All"
        ? "id, name, star_rating, price_per_night, image_url, address, description, amenities, status, destination_id, destinations!inner(name, country, slug)"
        : HOTEL_FIELDS;

    let query = supabase
      .from("hotels")
      .select(selectFields, { count: "exact" })
      .eq("status", "published");

    if (destinationSlug && destinationSlug !== "All") {
      query = query.eq("destinations.slug", destinationSlug);
    }

    if (search && search.trim()) {
      const sanitized = search.trim().replace(/[,()]/g, " ").trim();
      if (sanitized) {
        query = query.or(`name.ilike.%${sanitized}%,description.ilike.%${sanitized}%`);
      }
    }

    if (typeof minStars === "number" && !isNaN(minStars) && minStars > 0) {
      query = query.gte("star_rating", minStars);
    }

    if (typeof maxPrice === "number" && !isNaN(maxPrice) && maxPrice > 0) {
      query = query.lte("price_per_night", maxPrice);
    }

    switch (sort) {
      case "price_asc":
        query = query.order("price_per_night", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price_per_night", { ascending: false });
        break;
      case "stars_desc":
        query = query
          .order("star_rating", { ascending: false })
          .order("price_per_night", { ascending: true });
        break;
      case "name_asc":
        query = query.order("name", { ascending: true });
        break;
      case "recommended":
      default:
        query = query
          .order("star_rating", { ascending: false })
          .order("price_per_night", { ascending: true });
        break;
    }

    const p = Math.max(1, Number(page) || 1);
    const size = Math.max(1, Number(pageSize) || 9);
    const from = (p - 1) * size;
    const to = from + size - 1;

    query = query.range(from, to);

    const { data: items, error, count } = await query;

    if (error) {
      console.error("fetchHotels", error);
      throw new Error("Could not load hotels");
    }

    const total = count ?? 0;
    const mapped = ((items ?? []) as unknown as RawHotel[]).map(mapHotel);

    return {
      items: mapped,
      total,
      page: p,
      pageSize: size,
      totalPages: Math.max(1, Math.ceil(total / size)),
    };
  });

export const fetchHotelById = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const { getPublicSupabase } = await import("./supabase-public.server");
    const { data, error } = await getPublicSupabase()
      .from("hotels")
      .select("*, destinations(id, name, country, slug)")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("fetchHotelById", error);
      throw new Error("Could not load hotel");
    }

    if (!data) return null;

    const raw = data as Record<string, unknown>;
    const destination = raw["destinations"] as {
      id: string;
      name: string;
      country: string;
      slug: string;
    } | null;

    let amenities: string[] = [];
    if (Array.isArray(raw["amenities"])) {
      amenities = raw["amenities"].filter((item): item is string => typeof item === "string");
    }

    const detail: HotelDetailData = {
      id: String(raw["id"]),
      name: String(raw["name"]),
      star_rating: Number(raw["star_rating"]) || 0,
      price_per_night: Number(raw["price_per_night"]) || 0,
      image_url: raw["image_url"] ? String(raw["image_url"]) : null,
      address: raw["address"] ? String(raw["address"]) : null,
      description: raw["description"] ? String(raw["description"]) : null,
      amenities,
      destination_id: raw["destination_id"] ? String(raw["destination_id"]) : null,
      status: String(raw["status"] || "published"),
      created_at: String(raw["created_at"]),
      destination,
    };

    return detail;
  });

export const fetchHotelsByDestination = createServerFn({ method: "GET" })
  .validator((destinationId: string) => destinationId)
  .handler(async ({ data: destinationId }) => {
    const { getPublicSupabase } = await import("./supabase-public.server");
    const { data, error } = await getPublicSupabase()
      .from("hotels")
      .select(HOTEL_FIELDS)
      .eq("destination_id", destinationId)
      .eq("status", "published")
      .order("star_rating", { ascending: false })
      .order("price_per_night", { ascending: true })
      .limit(3);

    if (error) {
      console.error("fetchHotelsByDestination", error);
      return [];
    }

    return ((data ?? []) as unknown as RawHotel[]).map(mapHotel);
  });

export type FlightData = {
  id: string;
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
  class: "economy" | "business" | "first" | string;
  seats_total: number;
  seats_available: number;
  status: string;
  created_at: string;
};

export type FlightsFilterParams = {
  origin?: string;
  destination?: string;
  date?: string;
  travelClass?: "all" | "economy" | "business" | "first";
  sort?: "price_asc" | "price_desc" | "duration_asc" | "departure_asc";
};

export type FlightCityOption = {
  city: string;
  code: string;
};

export const fetchFlightCities = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicSupabase } = await import("./supabase-public.server");
  const supabase = getPublicSupabase();
  const { data, error } = await supabase
    .from("flights")
    .select("origin_city, origin_code, destination_city, destination_code");

  if (error) {
    console.error("fetchFlightCities", error);
    return { origins: [], destinations: [] };
  }

  const originsMap = new Map<string, string>();
  const destinationsMap = new Map<string, string>();

  (data || []).forEach((row) => {
    if (row.origin_city && row.origin_code) {
      originsMap.set(row.origin_code, row.origin_city);
    }
    if (row.destination_city && row.destination_code) {
      destinationsMap.set(row.destination_code, row.destination_city);
    }
  });

  const origins: FlightCityOption[] = Array.from(originsMap.entries())
    .map(([code, city]) => ({ code, city }))
    .sort((a, b) => a.city.localeCompare(b.city));

  const destinations: FlightCityOption[] = Array.from(destinationsMap.entries())
    .map(([code, city]) => ({ code, city }))
    .sort((a, b) => a.city.localeCompare(b.city));

  return { origins, destinations };
});

export const searchFlights = createServerFn({ method: "GET" })
  .validator((params?: FlightsFilterParams) => params ?? {})
  .handler(async ({ data }) => {
    const { origin, destination, date, travelClass, sort = "price_asc" } = data;

    const { getPublicSupabase } = await import("./supabase-public.server");
    const supabase = getPublicSupabase();

    let query = supabase.from("flights").select("*");

    if (origin && origin !== "All") {
      const sanitizedOrigin = origin.trim();
      query = query.or(
        `origin_code.ilike.%${sanitizedOrigin}%,origin_city.ilike.%${sanitizedOrigin}%`,
      );
    }

    if (destination && destination !== "All") {
      const sanitizedDest = destination.trim();
      query = query.or(
        `destination_code.ilike.%${sanitizedDest}%,destination_city.ilike.%${sanitizedDest}%`,
      );
    }

    if (travelClass && travelClass !== "all") {
      query = query.eq("class", travelClass.toLowerCase());
    }

    if (date && date.trim()) {
      const startOfDay = `${date.trim()}T00:00:00+00:00`;
      const endOfDay = `${date.trim()}T23:59:59+00:00`;
      query = query.gte("departure_time", startOfDay).lte("departure_time", endOfDay);
    }

    switch (sort) {
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      case "duration_asc":
        query = query.order("duration_minutes", { ascending: true });
        break;
      case "departure_asc":
        query = query.order("departure_time", { ascending: true });
        break;
      case "price_asc":
      default:
        query = query.order("price", { ascending: true });
        break;
    }

    const { data: flights, error } = await query;

    if (error) {
      console.error("searchFlights", error);
      throw new Error("Could not load flights");
    }

    return (flights || []).map((f) => ({
      id: String(f.id),
      airline: String(f.airline),
      flight_number: String(f.flight_number),
      origin_city: String(f.origin_city),
      origin_code: String(f.origin_code),
      destination_city: String(f.destination_city),
      destination_code: String(f.destination_code),
      departure_time: String(f.departure_time),
      arrival_time: String(f.arrival_time),
      duration_minutes: Number(f.duration_minutes) || 0,
      price: Number(f.price) || 0,
      class: String(f.class || "economy"),
      seats_total: Number(f.seats_total) || 0,
      seats_available: Number(f.seats_available) || 0,
      status: String(f.status || "scheduled"),
      created_at: String(f.created_at),
    })) as FlightData[];
  });

export type GalleryImageData = {
  id: string;
  url: string;
  caption: string | null;
  created_at: string;
  destination_id: string | null;
  destination: {
    id: string;
    name: string;
    country: string;
    slug: string;
  } | null;
};

export const fetchGalleryImages = createServerFn({ method: "GET" })
  .validator((params: { destinationSlug?: string } | undefined) => params)
  .handler(async ({ data: params }) => {
    const { getPublicSupabase } = await import("./supabase-public.server");
    const supabase = getPublicSupabase();

    let query = supabase
      .from("gallery_images")
      .select("id, url, caption, created_at, destination_id, destinations(id, name, country, slug)")
      .order("created_at", { ascending: false });

    if (params?.destinationSlug && params.destinationSlug !== "all") {
      // Look up destination ID by slug first
      const { data: dest } = await supabase
        .from("destinations")
        .select("id")
        .eq("slug", params.destinationSlug)
        .maybeSingle();

      if (dest) {
        query = query.eq("destination_id", dest.id);
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error("fetchGalleryImages", error);
      throw new Error("Could not load gallery images");
    }

    type RawGalleryRow = {
      id: string;
      url: string;
      caption: string | null;
      created_at: string;
      destination_id: string | null;
      destinations: { id: string; name: string; country: string; slug: string } | null;
    };

    return ((data || []) as unknown as RawGalleryRow[]).map((row) => ({
      id: String(row.id),
      url: String(row.url),
      caption: row.caption ? String(row.caption) : null,
      created_at: String(row.created_at),
      destination_id: row.destination_id ? String(row.destination_id) : null,
      destination: row.destinations
        ? {
            id: String(row.destinations.id),
            name: String(row.destinations.name),
            country: String(row.destinations.country),
            slug: String(row.destinations.slug),
          }
        : null,
    })) as GalleryImageData[];
  });

export const fetchGalleryDestinations = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicSupabase } = await import("./supabase-public.server");
  const { data, error } = await getPublicSupabase()
    .from("destinations")
    .select("id, name, country, slug")
    .order("name", { ascending: true });

  if (error) {
    console.error("fetchGalleryDestinations", error);
    throw new Error("Could not load gallery destinations");
  }

  return (data || []).map((d) => ({
    id: String(d.id),
    name: String(d.name),
    country: String(d.country),
    slug: String(d.slug),
  }));
});
