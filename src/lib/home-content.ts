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
  trip: string;
  location: string;
  quote: string;
  avatar: string;
  rating: number;
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
    trip: "Kyoto Temples & Tea",
    location: "Bristol, United Kingdom",
    quote:
      "Booked the Kyoto tour, a hotel and both flights in about twenty minutes. The day-by-day itinerary saved us when it rained for two days straight.",
    avatar: unsplash("1534528741775-53994a69daeb", 200),
    rating: 5,
    initials: "AR",
  },
  {
    id: "daniel",
    name: "Daniel Okafor",
    trip: "Amalfi Slow Coast",
    location: "Toronto, Canada",
    quote:
      "We travel with two kids, so price filters and clear inclusions matter. Everything was exactly as listed and there were no surprise extras at check-in.",
    avatar: unsplash("1507003211169-0a1dd7228f2d", 200),
    rating: 5,
    initials: "DO",
  },
  {
    id: "priya",
    name: "Priya Nair",
    trip: "Torres del Paine W Trek",
    location: "Bengaluru, India",
    quote:
      "The W Trek was hard and brilliant. Our guides were local, the group stayed small, and every refugio booking was already sorted.",
    avatar: unsplash("1517841905240-472988babdf9", 200),
    rating: 4.5,
    initials: "PN",
  },
  {
    id: "elena",
    name: "Elena Rostova",
    trip: "Santorini Island Hopper",
    location: "Vienna, Austria",
    quote:
      "Watching the sun dip below Oia's caldera from the catamaran was unforgettable. The curated wine tasting in Megalochori made the entire journey effortless.",
    avatar: unsplash("1544005313-94ddf0286df2", 200),
    rating: 5,
    initials: "ER",
  },
  {
    id: "marcus",
    name: "Marcus Vance",
    trip: "Bali Cultural Immersion",
    location: "Melbourne, Australia",
    quote:
      "From dawn treks up Mount Batur to quiet afternoons in Ubud's rice terraces, every transfer was punctual. The local host recommendations for warungs were pure gold.",
    avatar: unsplash("1500648767791-00dcc994a43e", 200),
    rating: 4.8,
    initials: "MV",
  },
  {
    id: "tenzing",
    name: "Tenzing Norbu",
    trip: "Leh-Ladakh High Passes",
    location: "New Delhi, India",
    quote:
      "Crossing Khardung La and camping by Pangong Lake at 14,000 feet was a lifelong dream. The oxygen kits and acclimatization pacing showed genuine care and safety.",
    avatar: unsplash("1506794778202-cad84cf45f1d", 200),
    rating: 5,
    initials: "TN",
  },
  {
    id: "sofia",
    name: "Sofia Al-Mansoor",
    trip: "Marrakech Medina & Atlas",
    location: "Dubai, UAE",
    quote:
      "Our riad in the heart of the Kasbah felt like an oasis of calm. Wanderlust's private Atlas guide introduced us to Berber hospitality we would never have found alone.",
    avatar: unsplash("1573496359142-b8d87734a5a2", 200),
    rating: 4.9,
    initials: "SA",
  },
  {
    id: "liam",
    name: "Liam Gallagher",
    trip: "Goa Heritage & Backwaters",
    location: "Dublin, Ireland",
    quote:
      "A completely different side of Goa away from the crowded beaches. Kayaking through the Sal river backwaters at sunrise and the spice plantation lunch were definite highlights.",
    avatar: unsplash("1492562080023-ab3db95bfbce", 200),
    rating: 4.7,
    initials: "LG",
  },
  {
    id: "chloe",
    name: "Chloe Bennett",
    trip: "Maldives Overwater Retreat",
    location: "Seattle, USA",
    quote:
      "The seaplane transfer coordination was flawless from the moment we cleared Malé customs. Waking up to manta rays gliding past our villa deck exceeded every expectation.",
    avatar: unsplash("1580489944761-15a19d654956", 200),
    rating: 5,
    initials: "CB",
  },
];
