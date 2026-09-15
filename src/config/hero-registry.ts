export interface HeroConfig {
  eyebrow: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  focalPosition?: string;
  ctaText?: string;
  ctaHref?: string;
}

export const HERO_REGISTRY: Record<string, HeroConfig> = {
  flights: {
    eyebrow: "FLY FURTHER, EXPLORE MORE",
    title: "Find Your Next Flight",
    description:
      "Discover the best deals, flexible options, and unforgettable destinations across world capitals and scenic island getaways.",
    imageUrl:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2400&q=80",
    imageAlt: "Commercial jetliner wing banking above sunset clouds",
    focalPosition: "object-[right_35%]",
  },
  destinations: {
    eyebrow: "EXPLORE THE WORLD",
    title: "Top Destinations",
    description:
      "From iconic cities to hidden gems, find the perfect place for your next adventure across six continents.",
    imageUrl:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=2400&q=80",
    imageAlt: "Santorini cliffside white villas and blue church domes overlooking the Aegean sea",
    focalPosition: "object-[right_center]",
    ctaText: "Explore Destinations →",
    ctaHref: "#destinations-catalog",
  },
  tours: {
    eyebrow: "CURATED EXPERIENCES",
    title: "Amazing Tours",
    description:
      "Handpicked tours, expert guides, and unforgettable experiences crafted for curious adventurers around the globe.",
    imageUrl:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=80",
    imageAlt: "Backpacker hiker on an alpine mountain ridge at golden sunrise",
    focalPosition: "object-[right_center]",
    ctaText: "Browse Tours →",
    ctaHref: "#packages-catalog",
  },
  hotels: {
    eyebrow: "STAY IN COMFORT",
    title: "Best Hotels",
    description:
      "From luxury oceanfront resorts to cozy mountain boutique retreats, find the perfect accommodation for your journey.",
    imageUrl:
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=80",
    imageAlt: "Luxury resort infinity pool and sun loungers overlooking coastal sunset",
    focalPosition: "object-[right_center]",
    ctaText: "Explore Hotels →",
    ctaHref: "#hotels-catalog",
  },
  gallery: {
    eyebrow: "TRAVEL MOMENTS",
    title: "Photo Gallery",
    description:
      "Explore breathtaking moments, iconic horizons, and vibrant cultural memories captured by our travelers worldwide.",
    imageUrl:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=2400&q=80",
    imageAlt: "Vibrant coastal cliffside village of Positano overlooking the Mediterranean bay",
    focalPosition: "object-[right_center]",
    ctaText: "View Gallery →",
    ctaHref: "#gallery-catalog",
  },
  contact: {
    eyebrow: "GET IN TOUCH",
    title: "Contact Us",
    description:
      "Have questions or need bespoke travel arrangements? Our team of specialist curators is here to assist you.",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=80",
    imageAlt: "Serene scenic coastal headland cliffs and gentle ocean waves at twilight",
    focalPosition: "object-[right_center]",
    ctaText: "Send Message →",
    ctaHref: "#contact-form",
  },
};
