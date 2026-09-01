import { Rating } from "@/components/shared/Rating";

const TESTIMONIALS = [
  {
    quote:
      "Booked the Kyoto tour, a hotel and both flights in about twenty minutes. The day-by-day itinerary saved our trip when it rained for two days.",
    name: "Amelia Rhodes",
    trip: "Kyoto Temples & Tea",
    rating: 5,
  },
  {
    quote:
      "We travel with two kids, so price filters and clear inclusions matter. Everything was exactly as listed, no surprise extras.",
    name: "Daniel Okafor",
    trip: "Amalfi Slow Coast",
    rating: 5,
  },
  {
    quote:
      "The W Trek was hard and brilliant. Guides were local, the group stayed small, and refugio bookings were already sorted.",
    name: "Priya Nair",
    trip: "Torres del Paine W Trek",
    rating: 4.5,
  },
];

export function Testimonials() {
  return (
    <section className="bg-muted/60 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow text-secondary">Traveller stories</p>
          <h2 className="mt-2 text-3xl sm:text-4xl">Trips people came back raving about</h2>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <figure key={item.name} className="rounded-xl bg-card p-6 shadow-card">
              <Rating value={item.rating} />
              <blockquote className="mt-4 text-sm leading-relaxed text-foreground">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-5 border-t border-border pt-4">
                <span className="block text-sm font-semibold">{item.name}</span>
                <span className="block text-xs text-muted-foreground">{item.trip}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
