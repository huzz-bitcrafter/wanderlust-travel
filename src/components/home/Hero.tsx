import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Hero() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  return (
    <section className="relative isolate flex min-h-[38rem] items-center justify-center overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2100&q=80"
        alt="Mountain road winding through a green valley at sunrise"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        loading="eager"
        fetchPriority="high"
      />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.3 0.062 250 / 0.7), oklch(0.3 0.062 250 / 0.5))",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-4xl px-4 py-32 text-center text-primary-foreground sm:px-6">
        <p className="eyebrow text-accent">Handpicked journeys since 2011</p>
        <h1 className="mt-4 text-4xl leading-tight sm:text-5xl lg:text-6xl">
          Every great trip begins with a single search
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-primary-foreground/80 sm:text-lg">
          Discover destinations, compare tour packages, book hotels and flights, and plan each day
          of your itinerary — all in one place.
        </p>

        <form
          className="mx-auto mt-9 flex w-full max-w-2xl flex-col gap-3 rounded-3xl bg-card/95 p-3 shadow-elegant sm:flex-row sm:rounded-full"
          onSubmit={(event) => {
            event.preventDefault();
            const q = query.trim();
            navigate({ to: "/destinations", search: q ? { q } : {} });
          }}
        >
          <label className="sr-only" htmlFor="hero-search">
            Search destinations, tours or hotels
          </label>
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="hero-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              maxLength={80}
              placeholder="Where to? Try Santorini, Kyoto or safari"
              className="h-12 rounded-full border-transparent bg-transparent pl-11 text-base text-foreground shadow-none focus-visible:ring-0"
            />
          </div>
          <Button
            type="submit"
            className="h-12 rounded-full bg-accent px-8 text-base text-accent-foreground hover:bg-accent/90"
          >
            Search
          </Button>
        </form>
      </div>
    </section>
  );
}
