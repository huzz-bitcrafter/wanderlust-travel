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
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4 pointer-events-none transition-all duration-300">
      <nav
        className={cn(
          "mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6 transition-all duration-300 pointer-events-auto rounded-full glass-navbar text-white",
          solid ? "shadow-2xl" : "shadow-lg",
        )}
      >
        <Link
          to="/"
          className="flex items-center py-1 transition-opacity hover:opacity-90"
          onClick={() => setOpen(false)}
          aria-label="Wanderlust Home"
        >
          <img
            src="/Wanderlust_Nasalization_transparent_HD.png"
            alt="Wanderlust"
            className="h-7 sm:h-8 w-auto object-contain drop-shadow-xs"
          />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="nav-glass-link"
                activeProps={{
                  className:
                    "nav-glass-link bg-white/20 text-white font-semibold shadow-[inset_1px_1px_3px_rgba(255,255,255,0.4),inset_-1px_-1px_3px_rgba(255,255,255,0.15)]",
                }}
                activeOptions={{ exact: link.to === "/" }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Auth Section */}
        <div className="hidden items-center gap-3 lg:flex">
          <AnimatedThemeToggler id="theme-toggle-desktop" />
          {!loading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full p-1 text-white transition hover:ring-2 hover:ring-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  aria-label="User account menu"
                >
                  <Avatar className="h-9 w-9 border-2 border-white/30 shadow-sm">
                    <AvatarImage src={profile?.avatar_url ?? undefined} alt={displayName} />
                    <AvatarFallback className="bg-accent text-xs font-bold text-accent-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[130px] truncate text-sm font-medium text-white drop-shadow-sm">
                    {displayName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-white/75" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl">
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
                className="rounded-full text-white hover:bg-white/15 hover:text-white"
              >
                <Link to="/login">Sign in</Link>
              </Button>
              <Button
                asChild
                className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm font-semibold"
              >
                <Link to="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <AnimatedThemeToggler id="theme-toggle-mobile" />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/15 transition-colors"
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
          "mx-auto mt-2 max-w-lg overflow-hidden glass-drawer transition-[max-height,opacity] duration-300 lg:hidden pointer-events-auto text-white",
          open
            ? "max-h-[38rem] opacity-100 p-4"
            : "max-h-0 opacity-0 p-0 pointer-events-none border-0",
        )}
      >
        <ul className="space-y-1">
          {!loading && user ? (
            <li className="mb-3 border-b border-white/15 pb-3">
              <div className="flex items-center gap-3 px-2 py-1">
                <Avatar className="h-10 w-10 border-2 border-white/30">
                  <AvatarImage src={profile?.avatar_url ?? undefined} alt={displayName} />
                  <AvatarFallback className="bg-accent text-sm font-bold text-accent-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                    {isAdmin ? (
                      <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                        Admin
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-white/70">{displayEmail}</p>
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <Link
                  to="/account"
                  onClick={() => setOpen(false)}
                  className="flex min-h-10 items-center gap-2.5 rounded-lg px-2 text-sm font-medium text-white/90 hover:bg-white/15"
                >
                  <User className="h-4 w-4" aria-hidden="true" />
                  My Account
                </Link>
                {isAdmin ? (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="flex min-h-10 items-center gap-2.5 rounded-lg px-2 text-sm font-medium text-accent hover:bg-white/15"
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
                className="flex min-h-11 items-center rounded-xl px-3 text-base font-medium text-white/85 hover:bg-white/15 hover:text-white transition-colors"
                activeProps={{
                  className:
                    "text-white bg-white/20 font-semibold shadow-[inset_1px_1px_3px_rgba(255,255,255,0.3)]",
                }}
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
                className="flex-1 rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link to="/login" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              </Button>
              <Button
                asChild
                className="flex-1 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm font-semibold"
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
