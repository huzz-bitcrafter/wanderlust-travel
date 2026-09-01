import { createFileRoute, Outlet, Link, useMatches } from "@tanstack/react-router";
import { requireAuthGuard } from "@/lib/auth-guard";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Map, LayoutDashboard, Ticket, Star, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const title = "My Account — Wanderlust";
const description = "Manage your itineraries, bookings, reviews, and profile.";

export const Route = createFileRoute("/account")({
  beforeLoad: requireAuthGuard,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AccountLayout,
});

type NavItem = {
  to: string;
  label: string;
  icon: typeof Map;
  disabled?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/account/overview", label: "Overview", icon: LayoutDashboard, disabled: true },
  { to: "/account/itineraries", label: "Itineraries", icon: Map },
  { to: "/account/bookings", label: "Bookings", icon: Ticket, disabled: true },
  { to: "/account/reviews", label: "Reviews", icon: Star, disabled: true },
  { to: "/account/profile", label: "Profile", icon: UserCircle, disabled: true },
];

function AccountLayout() {
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.pathname ?? "";

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl sm:text-4xl">My Account</h1>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Desktop Sidebar */}
          <aside className="hidden w-56 shrink-0 lg:block" aria-label="Account navigation">
            <nav>
              <ul className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath.startsWith(item.to);

                  if (item.disabled) {
                    return (
                      <li key={item.to}>
                        <span
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground/60 cursor-not-allowed"
                          title="Coming soon"
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          {item.label}
                          <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground/40">
                            Soon
                          </span>
                        </span>
                      </li>
                    );
                  }

                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-secondary/10 text-secondary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* Mobile Tabs */}
          <nav
            className="flex gap-1 overflow-x-auto border-b border-border pb-2 lg:hidden"
            aria-label="Account navigation"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath.startsWith(item.to);

              if (item.disabled) {
                return (
                  <span
                    key={item.to}
                    className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-muted-foreground/50 cursor-not-allowed"
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {item.label}
                  </span>
                );
              }

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-secondary/10 text-secondary"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Content Area */}
          <div className="min-w-0 flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
