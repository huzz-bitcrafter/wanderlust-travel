import type { GalleryImageData } from "@/lib/catalog.functions";

/**
 * Curated local placeholder gallery captures aggregating ALL local photography assets
 * from the asset folders:
 * - 13 high-definition .avif captures from assets.img
 * - Local destination photographs (Hampi, Rishikesh)
 * - Hero cinematic backdrop (Swiss Alps)
 */
export const ALL_LOCAL_PLACEHOLDERS: GalleryImageData[] = [
  {
    id: "local-asset-1",
    url: "/images/assets/photo-1476514525535-07fb3b4ae5f1.avif",
    caption: "Crystal glacial canoe drifting along turquoise alpine waters",
    destination_id: "dest-banff",
    destination: {
      id: "dest-banff",
      name: "Lake Louise, Banff",
      country: "Canada",
      slug: "banff-canada",
    },
  },
  {
    id: "local-asset-2",
    url: "/images/assets/photo-1476610182048-b716b8518aae.avif",
    caption: "Morning mist rising over ancient pine-fringed alpine ridges",
    destination_id: "dest-vancouver",
    destination: {
      id: "dest-vancouver",
      name: "Pacific Rim, Vancouver",
      country: "Canada",
      slug: "vancouver-island",
    },
  },
  {
    id: "local-asset-3",
    url: "/images/assets/photo-1483729558449-99ef09a8c325.avif",
    caption: "Towering granite spires and glacial lakes of the southern Andes",
    destination_id: "dest-patagonia",
    destination: {
      id: "dest-patagonia",
      name: "Torres del Paine",
      country: "Chile",
      slug: "patagonia-chile",
    },
  },
  {
    id: "local-asset-4",
    url: "/images/assets/photo-1489749798305-4fea3ae63d43.avif",
    caption: "Swaying tropical palms framing crystalline lagoon shallows",
    destination_id: "dest-maldives",
    destination: {
      id: "dest-maldives",
      name: "Baa Atoll Lagoon",
      country: "Maldives",
      slug: "maldives-baa",
    },
  },
  {
    id: "local-asset-5",
    url: "/images/assets/photo-1493976040374-85c8e12f0c0e.avif",
    caption: "Historic timber pagoda illuminated amidst fiery Japanese autumn foliage",
    destination_id: "dest-kyoto-pagoda",
    destination: {
      id: "dest-kyoto-pagoda",
      name: "Higashiyama, Kyoto",
      country: "Japan",
      slug: "kyoto-japan",
    },
  },
  {
    id: "local-asset-6",
    url: "/images/assets/photo-1504829857797-ddff29c27927.avif",
    caption: "Vibrant emerald Aurora Borealis dancing across the midnight Arctic sky",
    destination_id: "dest-tromso",
    destination: {
      id: "dest-tromso",
      name: "Tromsø Fjords",
      country: "Norway",
      slug: "tromso-norway",
    },
  },
  {
    id: "local-asset-7",
    url: "/images/assets/photo-1518548419970-58e3b4079ab2.avif",
    caption: "Wind-sculpted golden dunes glowing under desert sunset shadows",
    destination_id: "dest-sahara",
    destination: {
      id: "dest-sahara",
      name: "Erg Chebbi, Merzouga",
      country: "Morocco",
      slug: "sahara-morocco",
    },
  },
  {
    id: "local-asset-8",
    url: "/images/assets/photo-1520250497591-112f2f40a3f4.avif",
    caption: "Iconic whitewashed caldera cliff villas overlooking the Aegean Sea",
    destination_id: "dest-santorini",
    destination: {
      id: "dest-santorini",
      name: "Oia, Santorini",
      country: "Greece",
      slug: "santorini-greece",
    },
  },
  {
    id: "local-asset-9",
    url: "/images/assets/photo-1537996194471-e657df975ab4.avif",
    caption: "Pastel cliffside villas cascading steeply down to the Tyrrhenian shore",
    destination_id: "dest-positano",
    destination: {
      id: "dest-positano",
      name: "Positano, Amalfi Coast",
      country: "Italy",
      slug: "amalfi-italy",
    },
  },
  {
    id: "local-asset-10",
    url: "/images/assets/photo-1539020140153-e479b8c22e70.avif",
    caption: "Intricate Moorish arabesque archways and serene tiled courtyard fountain",
    destination_id: "dest-marrakech",
    destination: {
      id: "dest-marrakech",
      name: "Historic Medina, Marrakech",
      country: "Morocco",
      slug: "marrakech-morocco",
    },
  },
  {
    id: "local-asset-11",
    url: "/images/assets/photo-1545569341-9eb8b30979d9.avif",
    caption: "Sunbeams filtering through towering stalks of the sacred bamboo grove",
    destination_id: "dest-arashiyama",
    destination: {
      id: "dest-arashiyama",
      name: "Arashiyama Bamboo Grove",
      country: "Japan",
      slug: "kyoto-japan",
    },
  },
  {
    id: "local-asset-12",
    url: "/images/assets/photo-1570077188670-e3a8d69ac5ff.avif",
    caption: "Sun-drenched bougainvillea climbing rustic Cycladic cobblestone paths",
    destination_id: "dest-mykonos",
    destination: {
      id: "dest-mykonos",
      name: "Little Venice, Mykonos",
      country: "Greece",
      slug: "mykonos-greece",
    },
  },
  {
    id: "local-asset-13",
    url: "/images/assets/photo-1613395877344-13d4a8e0d49e.avif",
    caption: "Dawn hot air balloons floating silently over volcanic fairy chimneys",
    destination_id: "dest-cappadocia",
    destination: {
      id: "dest-cappadocia",
      name: "Göreme Valley, Cappadocia",
      country: "Turkey",
      slug: "cappadocia-turkey",
    },
  },
  {
    id: "local-asset-14",
    url: "/images/destinations/hampi.jpg",
    caption: "Monolithic 15th-century stone chariot standing sentinel under twilight skies",
    destination_id: "dest-hampi",
    destination: {
      id: "dest-hampi",
      name: "Vittala Temple, Hampi",
      country: "India",
      slug: "hampi-karnataka",
    },
  },
  {
    id: "local-asset-15",
    url: "/images/destinations/rishikesh.jpg",
    caption: "Sacred Ganges suspension bridge gleaming at evening Ganga Aarti hour",
    destination_id: "dest-rishikesh",
    destination: {
      id: "dest-rishikesh",
      name: "Ram Jhula, Rishikesh",
      country: "India",
      slug: "rishikesh-uttarakhand",
    },
  },
  {
    id: "local-asset-16",
    url: "/hero-poster.jpg",
    caption: "Majestic alpine summits touched by the first golden light of sunrise",
    destination_id: "dest-swiss-alps",
    destination: {
      id: "dest-swiss-alps",
      name: "Valais, Swiss Alps",
      country: "Switzerland",
      slug: "swiss-alps",
    },
  },
];
