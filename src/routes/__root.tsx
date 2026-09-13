import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { reportLovableError } from "../lib/lovable-error-reporting";

import { Compass, AlertCircle, Home, MapPin, Package, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

function NotFoundComponent() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-16 text-center relative overflow-hidden">
      {/* Background subtle radial glow */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-lg mx-auto space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary mx-auto shadow-sm animate-in zoom-in duration-300">
          <Compass className="h-10 w-10 animate-[spin_12s_linear_infinite]" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
            Error 404 • Destination Unknown
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground">
            Off the Map
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            The coordinates you were heading toward don't exist, may have been relocated, or are
            currently uncharted territory.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button asChild size="default" className="shadow-sm">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Return to Homepage
            </Link>
          </Button>

          <Button asChild variant="outline" size="default">
            <Link to="/destinations">
              <MapPin className="mr-2 h-4 w-4 text-primary" />
              Explore Destinations
            </Link>
          </Button>
        </div>

        <div className="pt-8 border-t border-border/80 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <Link
            to="/packages"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <Package className="h-3.5 w-3.5" /> Tour Packages
          </Link>
          <span>•</span>
          <Link to="/gallery" className="hover:text-primary transition-colors">
            Photo Gallery
          </Link>
          <span>•</span>
          <Link to="/contact" className="hover:text-primary transition-colors">
            Help &amp; Support
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-16 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mx-auto">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-destructive">
            Unexpected Turbulence
          </span>
          <h1 className="font-display text-3xl font-bold text-foreground">Something went wrong</h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            We ran into an unexpected issue rendering this section. You can attempt to refresh the
            view or return to the main lobby.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="shadow-sm"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          <Button asChild variant="outline">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Wanderlust — Travel Booking & Trip Planning" },
      {
        name: "description",
        content:
          "Discover destinations, book tours, hotels and flights, and plan your itinerary with Wanderlust.",
      },
      { name: "author", content: "Wanderlust Travel" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preload",
        href: "/fonts/HalenoirCompact-Medium.otf",
        as: "font",
        type: "font/otf",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: "/fonts/tropikal-bold.otf",
        as: "font",
        type: "font/otf",
        crossOrigin: "anonymous",
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap",
      },
      { rel: "icon", href: "/Bookify_W_logo_transparent_2048px.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/Bookify_W_logo_transparent_2048px.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
