import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Compass, X, User, LogOut, Shield, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { AnimatedThemeToggler } from "@/components/vendored/AnimatedThemeToggler";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/destinations", label: "Destinations" },
  { to: "/packages", label: "Tours" },
  { to: "/hotels", label: "Hotels" },
  { to: "/flights", label: "Flights" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
] as const;

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "U";
}

export function Navbar({ transparentOverHero = false }: { transparentOverHero?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, profile, isAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || !transparentOverHero || open;

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Traveler";
  const displayEmail = profile?.email || user?.email || "";
  const initials = getInitials(profile?.full_name || user?.user_metadata?.full_name, user?.email);

  const handleLogout = async () => {
    setOpen(false);
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate({ to: "/" });
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Failed to log out. Please try again.");
    }
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        solid ? "glass-navbar text-primary-foreground" : "bg-transparent text-primary-foreground",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-primary-foreground"
          onClick={() => setOpen(false)}
        >
          <img
            src="/Logo_wanderlust.png"
            alt="Wanderlust"
            className="h-8 w-8 rounded-full object-cover ring-1 ring-primary-foreground/20"
          />
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

        {/* Desktop Auth Section */}
        <div className="hidden items-center gap-2 lg:flex">
          <AnimatedThemeToggler className="text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground" />
          {!loading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full p-1 text-primary-foreground transition hover:ring-2 hover:ring-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label="User account menu"
                >
                  <Avatar className="h-9 w-9 border border-primary-foreground/20">
                    <AvatarImage src={profile?.avatar_url ?? undefined} alt={displayName} />
                    <AvatarFallback className="bg-accent text-xs font-bold text-accent-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[130px] truncate text-sm font-medium text-primary-foreground">
                    {displayName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-primary-foreground/70" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-lg">
                <DropdownMenuLabel className="px-2 py-1.5 font-normal">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-semibold leading-none text-foreground">
                        {displayName}
                      </p>
                      {isAdmin ? (
                        <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-[10px] font-medium text-accent-text">
                          Admin
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-xs leading-none text-muted-foreground">
                      {displayEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account" className="flex cursor-pointer items-center gap-2 text-sm">
                    <User className="h-4 w-4" aria-hidden="true" />
                    <span>My Account</span>
                  </Link>
                </DropdownMenuItem>
                {isAdmin ? (
                  <DropdownMenuItem asChild>
                    <Link
                      to="/admin"
                      className="flex cursor-pointer items-center gap-2 text-sm font-medium text-accent-text"
                    >
                      <Shield className="h-4 w-4" aria-hidden="true" />
                      <span>Admin Portal</span>
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex cursor-pointer items-center gap-2 text-sm text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 lg:hidden">
          <AnimatedThemeToggler className="text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground" />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-primary-foreground"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={cn(
          "overflow-hidden glass-drawer transition-[max-height] duration-300 lg:hidden",
          open ? "max-h-[36rem]" : "max-h-0",
        )}
      >
        <ul className="space-y-1 px-4 py-4">
          {!loading && user ? (
            <li className="mb-3 border-b border-primary-foreground/10 pb-3">
              <div className="flex items-center gap-3 px-2 py-1">
                <Avatar className="h-10 w-10 border border-primary-foreground/20">
                  <AvatarImage src={profile?.avatar_url ?? undefined} alt={displayName} />
                  <AvatarFallback className="bg-accent text-sm font-bold text-accent-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-primary-foreground">
                      {displayName}
                    </p>
                    {isAdmin ? (
                      <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                        Admin
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-primary-foreground/70">{displayEmail}</p>
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <Link
                  to="/account"
                  onClick={() => setOpen(false)}
                  className="flex min-h-10 items-center gap-2.5 rounded-lg px-2 text-sm font-medium text-primary-foreground/85 hover:bg-primary-foreground/10"
                >
                  <User className="h-4 w-4" aria-hidden="true" />
                  My Account
                </Link>
                {isAdmin ? (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="flex min-h-10 items-center gap-2.5 rounded-lg px-2 text-sm font-medium text-accent hover:bg-primary-foreground/10"
                  >
                    <Shield className="h-4 w-4" aria-hidden="true" />
                    Admin Portal
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full min-h-10 items-center gap-2.5 rounded-lg px-2 text-left text-sm font-medium text-red-300 hover:bg-red-500/20"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Log out
                </button>
              </div>
            </li>
          ) : null}

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

          {!user && (
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
          )}
        </ul>
      </div>
    </header>
  );
}
