import React, { useState } from "react";
import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  MapPin,
  Package,
  Building2,
  Plane,
  Star,
  Mail,
  ShieldAlert,
  ArrowLeft,
  Menu,
  X,
  ExternalLink,
  Shield,
  Loader2,
} from "lucide-react";
import { requireAdminGuard } from "@/lib/auth-guard";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    return await requireAdminGuard({ location });
  },
  head: () => ({
    meta: [
      { title: "Admin Portal — Wanderlust" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  phase?: string;
  badge?: string;
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    href: "/admin/overview",
    icon: LayoutDashboard,
  },
  {
    label: "Bookings",
    href: "/admin/bookings",
    icon: CalendarCheck,
  },
  {
    label: "Users & Roles",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Destinations",
    href: "/admin/destinations",
    icon: MapPin,
  },
  {
    label: "Tour Packages",
    href: "/admin/packages",
    icon: Package,
  },
  {
    label: "Hotels",
    href: "/admin/hotels",
    icon: Building2,
  },
  {
    label: "Flights",
    href: "/admin/flights",
    icon: Plane,
  },
  {
    label: "Reviews Moderation",
    href: "/admin/reviews",
    icon: Star,
  },
  {
    label: "Inbox Messages",
    href: "/admin/inbox",
    icon: Mail,
  },
];

function AdminLayout() {
  const { user, profile, isAdmin, loading, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">
            Verifying admin credentials...
          </p>
        </div>
      </div>
    );
  }

  // 403 Forbidden State if user is authenticated but not an admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
        <div className="max-w-md w-full rounded-2xl border border-destructive/20 bg-card p-8 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Access Restricted</h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Your account (<strong className="text-foreground">{user?.email}</strong>) does not have
            administrator privileges to access the Wanderlust Admin Management Portal.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Button asChild variant="default" className="w-full">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Public Website
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => logout()}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Sign Out & Switch Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentNav = ADMIN_NAV_ITEMS.find((item) => location.pathname.startsWith(item.href));

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-muted/20">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 admin-sidebar flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-border flex items-center justify-between">
          <Link to="/admin/overview" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display font-black text-lg shadow-xs">
              W
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-foreground block leading-tight">
                Wanderlust
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary flex items-center gap-1">
                <Shield className="h-2.5 w-2.5" /> Admin Console
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Management & Operations
          </div>
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.phase && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {item.phase}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-border bg-muted/10 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage
                src={profile?.avatar_url || undefined}
                alt={profile?.full_name || "Admin"}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold font-display">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {profile?.full_name || "Administrator"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button asChild variant="outline" size="sm" className="h-8 text-xs font-medium">
              <Link to="/">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Live Site
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 glass-chrome px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-foreground leading-tight">
                {currentNav?.label || "Admin Console"}
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Wanderlust Platform Administration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hidden sm:flex"
            >
              <Link to="/account">My Traveler Account</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-8 text-xs font-medium">
              <Link to="/" target="_blank">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                View Website
              </Link>
            </Button>
          </div>
        </header>

        {/* Page View Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
