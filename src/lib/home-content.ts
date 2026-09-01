/**
 * Phase 2 placeholder content for the Home page.
 * Replaced by live catalog data from Lovable Cloud in Phase 3.
 */

export type FeaturedDestination = {
  id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  rating: number;
};

export type FeaturedPackage = {
  id: string;
  title: string;
  destination: string;
  summary: string;
  durationDays: number;
  price: number;
  image: string;
};

export type HomeTestimonial = {
  id: string;
  name: string;
  location: string;
  quote: string;
  initials: string;
};

const unsplash = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const FEATURED_DESTINATIONS: FeaturedDestination[] = [
  {
    id: "santorini",
    name: "Santorini",
    country: "Greece",
    description: "Whitewashed cliffs, caldera sunsets and slow blue-hour dinners above the sea.",
    image: unsplash("1585208798174-6cedd86e019a"),
    rating: 4.9,
  },
  {
    id: "kyoto",
    name: "Kyoto",
    country: "Japan",
    description: "Temple gardens, tea houses and lantern-lit lanes through old Gion.",
    image: unsplash("1493976040374-85c8e12f0c0e"),
    rating: 4.8,
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    description: "Rice terraces, reef breaks and cliffside temples wrapped in warm evenings.",
    image: unsplash("1537996194471-e657df975ab4"),
    rating: 4.7,
  },
  {
    id: "patagonia",
    name: "Patagonia",
    country: "Chile",
    description: "Granite towers, turquoise glacier lakes and famously honest mountain wind.",
    image: unsplash("1483729558449-99ef09a8c325"),
    rating: 4.9,
  },
  {
    id: "marrakech",
    name: "Marrakech",
    country: "Morocco",
    description: "Spice-heavy souks, quiet riad courtyards and the Atlas range on the skyline.",
    image: unsplash("1489749798305-4fea3ae63d43"),
    rating: 4.6,
  },
  {
    id: "iceland",
    name: "Reykjavík",
    country: "Iceland",
    description: "Waterfalls, black-sand coastlines and aurora nights within an hour of town.",
    image: unsplash("1504829857797-ddff29c27927"),
    rating: 4.8,
  },
];

export const POPULAR_PACKAGES: FeaturedPackage[] = [
  {
    id: "kyoto-temples-tea",
    title: "Kyoto Temples & Tea",
    destination: "Kyoto, Japan",
    summary:
      "Seven slow days across Higashiyama, Arashiyama and Nara, with a private tea ceremony.",
    durationDays: 7,
    price: 2450,
    image: unsplash("1573843981267-be1999ff37cd"),
  },
  {
    id: "santorini-island-hop",
    title: "Santorini Island Hopper",
    destination: "Cyclades, Greece",
    summary: "Five days of caldera villages, volcanic beaches and a sunset catamaran crossing.",
    durationDays: 5,
    price: 1980,
    image: unsplash("1476610182048-b716b8518aae"),
  },
  {
    id: "torres-del-paine-w",
    title: "Torres del Paine W Trek",
    destination: "Patagonia, Chile",
    summary: "Eight guided days through the W circuit with refugio stays and all permits sorted.",
    durationDays: 8,
    price: 2890,
    image: unsplash("1520250497591-112f2f40a3f4"),
  },
];

export const HOME_TESTIMONIALS: HomeTestimonial[] = [
  {
    id: "amelia",
    name: "Amelia Rhodes",
    location: "Bristol, United Kingdom",
    quote:
      "Booked the Kyoto tour, a hotel and both flights in about twenty minutes. The day-by-day itinerary saved us when it rained for two days straight.",
    initials: "AR",
  },
  {
    id: "daniel",
    name: "Daniel Okafor",
    location: "Toronto, Canada",
    quote:
      "We travel with two kids, so clear inclusions matter. Everything was exactly as listed and there were no surprise extras at check-in.",
    initials: "DO",
  },
  {
    id: "priya",
    name: "Priya Nair",
    location: "Bengaluru, India",
    quote:
      "The W Trek was hard and brilliant. Our guides were local, the group stayed small, and every refugio booking was already sorted.",
    initials: "PN",
  },
];
