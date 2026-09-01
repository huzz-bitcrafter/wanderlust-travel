import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Compass, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/destinations", label: "Destinations" },
  { to: "/packages", label: "Tours" },
  { to: "/hotels", label: "Hotels" },
  { to: "/flights", label: "Flights" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar({ transparentOverHero = false }: { transparentOverHero?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || !transparentOverHero || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        solid ? "bg-primary shadow-card" : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-primary-foreground"
          onClick={() => setOpen(false)}
        >
          <Compass className="h-6 w-6 text-accent" aria-hidden="true" />
          <span className="font-display text-xl font-bold tracking-tight">Wanderlust</span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="rounded-full px-3 py-2 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
                activeProps={{ className: "text-primary-foreground bg-primary-foreground/10" }}
                activeOptions={{ exact: link.to === "/" }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            asChild
            variant="ghost"
            className="rounded-full text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link to="/login">Sign in</Link>
          </Button>
          <Button
            asChild
            className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Link to="/register">Get started</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-primary-foreground lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <Menu className="hidden" /> : null}
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <div
        className={cn(
          "overflow-hidden border-t border-primary-foreground/10 bg-primary transition-[max-height] duration-300 lg:hidden",
          open ? "max-h-[32rem]" : "max-h-0",
        )}
      >
        <ul className="space-y-1 px-4 py-4">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center rounded-lg px-3 text-base font-medium text-primary-foreground/85 hover:bg-primary-foreground/10"
                activeProps={{ className: "text-primary-foreground bg-primary-foreground/10" }}
                activeOptions={{ exact: link.to === "/" }}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="flex gap-2 pt-3">
            <Button
              asChild
              variant="outline"
              className="flex-1 rounded-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/login" onClick={() => setOpen(false)}>
                Sign in
              </Link>
            </Button>
            <Button
              asChild
              className="flex-1 rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link to="/register" onClick={() => setOpen(false)}>
                Get started
              </Link>
            </Button>
          </li>
        </ul>
      </div>
    </header>
  );
}
