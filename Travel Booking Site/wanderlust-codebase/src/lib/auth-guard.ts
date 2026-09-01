import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/**
 * Reusable beforeLoad guard for protected routes (e.g., Phase 10+ /account, /my-bookings).
 * Checks client-side session on route navigation.
 */
export async function requireAuthGuard({ location }: { location: { href: string } }) {
  if (typeof window === "undefined") {
    // SSR passes through to allow initial HTML shell render; client useEffect / hydration verifies
    return;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw redirect({
      to: "/login",
      search: {
        redirect: location.href,
      },
    });
  }

  return { user: session.user };
}

/**
 * Reusable beforeLoad guard for guest-only routes (e.g., /login, /register, /forgot-password).
 * Redirects logged-in users to home.
 */
export async function requireGuestGuard() {
  if (typeof window === "undefined") {
    return;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    throw redirect({
      to: "/",
    });
  }
}
