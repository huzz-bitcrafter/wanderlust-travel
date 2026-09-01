import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Compass, Facebook, Instagram, Twitter, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { to: "/destinations", label: "Destinations" },
      { to: "/packages", label: "Tour packages" },
      { to: "/hotels", label: "Hotels" },
      { to: "/flights", label: "Flights" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/gallery", label: "Gallery" },
      { to: "/contact", label: "Contact us" },
      { to: "/register", label: "Create account" },
      { to: "/login", label: "Sign in" },
    ],
  },
] as const;

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    toast.success("Thank you for subscribing to Wanderlust Dispatch!");
    setEmail("");
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-accent" aria-hidden="true" />
            <span className="font-display text-xl font-bold">Wanderlust</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-primary-foreground/60">
            Discover destinations, book tours, hotels and flights, and plan every day of the trip in
            one place.
          </p>
          <div className="mt-5 flex gap-2">
            {[Instagram, Twitter, Facebook].map((Icon, i) => (
              <span
                key={i}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground/70"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
            ))}
          </div>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="eyebrow font-sans text-primary-foreground/50">{column.title}</h3>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="eyebrow font-sans text-primary-foreground/50">Newsletter</h3>
          <p className="mt-4 text-sm text-primary-foreground/60">
            Trip ideas and seasonal fares, once a month.
          </p>
          {subscribed ? (
            <div className="mt-4 p-3 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20 text-xs text-primary-foreground flex items-center gap-2">
              <Check className="h-4 w-4 text-accent" />
              <span>You are subscribed to Wanderlust Dispatch!</span>
            </div>
          ) : (
            <form className="mt-4 flex gap-2" onSubmit={handleSubscribe}>
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <Input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="rounded-full border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40"
              />
              <Button
                type="submit"
                className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Join
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <p className="mx-auto max-w-7xl px-4 py-6 text-xs text-primary-foreground/50 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} Wanderlust Travel. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
