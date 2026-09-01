# Memory — Wanderlust

**Last updated:** 2026-09-02 | **Current phase:** 8 complete | **Session #:** 4

## Completed

- [x] Backend foundation — Lovable Cloud enabled; all tables created with RLS, grants and seed data.
- [x] Phase 1 — Design system (tokens, Playfair Display + Inter, card/button/focus styling).
- [x] Phase 2 — Layout & Home (navbar with mobile drawer, footer, hero, featured sections, why-us, testimonials, CTA band).
- [x] Phase 3 — Destinations (listing with URL-synced search/filter/pagination, /destinations/$slug detail with hero, breadcrumb, and future phase placeholders, shared DestinationCard).
- [x] Phase 4 — Authentication (client AuthProvider/useAuth hook, /login, /register, /forgot-password, auth-aware Navbar with avatar dropdown & mobile drawer, reusable beforeLoad auth guards).
- [x] Phase 5 — Tour Packages (listing with URL-synced search/filters/sorting/pagination, shared PackageCard and BookingCTA stub, /packages/$slug detail with hero, itinerary accordion, includes/excludes list, sticky booking card, and destination detail integration).
- [x] Phase 6 — Hotels (listing with URL-synced search/destination/star-rating/price/sorting/pagination, shared HotelCard, /hotels/$id detail with hero, amenities with Lucide icons, live date-fns calculation with Zod validation and BookingCTA stub, and top hotels on destination detail).
- [x] Phase 7 — Flights (search form with origin/destination/date/cabin-class/passengers URL-synced via validateSearch, shared FlightCard with direct flight indicators & seat availability/sold-out states, and Step 3 flight summary confirmation dialog with live passenger multiplier and BookingCTA stub).
- [x] Phase 8 — Itinerary Builder (auth-guarded account layout at `/account` with desktop sidebar / mobile horizontal tabs, itinerary listing `/account/itineraries` with TanStack Query on own rows, create dialog with zod validation, day-by-day editor `/account/itineraries/$id` with activity CRUD, optimistic reordering, print-friendly CSS view, and 404 on foreign itineraries).
- [ ] Phases 9–14

## In Progress

- None. Next is Phase 9 (Reviews & Ratings).

## Key Decisions

- Stack is **TanStack Start**, not React Router SPA: pages live in `src/routes/` (file-based), design tokens in `src/styles.css` (oklch), head metadata via the route `head()` option. No `src/pages/`, no react-router-dom, no react-helmet.
- Roles live in a separate `user_roles` table with `has_role()` / `is_admin()` security-definer functions — NOT a role column on profiles.
- `tour_packages.itinerary` is a jsonb array of `{day,title,description}` (added beyond Architecture.md §5).
- `bookings` has extra `reference` and `end_date` columns; `reviews` has `author_name`.
- Public catalog reads go through `createServerFn` + publishable-key client (`src/lib/catalog.functions.ts`) so pages render server-side for SEO.
- Phase 3 destinations listing (`/destinations`) uses `validateSearch` to synchronize all filter state (`q`, `continent`, `region`, `page`) directly with query params for shareability and zero-waterfall SSR.
- Phase 5 tour packages listing (`/packages`) synchronizes search, destination, difficulty, max price, max duration, sorting, and pagination via `validateSearch`.
- Package detail pages (`/packages/$slug`) feature full SSR prefetching, dynamic SEO/OG meta, day-by-day collapsible Radix accordion itinerary, includes/excludes matrix, and sticky booking card with `BookingCTA` tooltip stub.
- Phase 6 hotels listing (`/hotels`) synchronizes search, destination (reusing `fetchFilterDestinations`), star rating pills (3★, 4★, 5★), max price per night, sorting (`price_asc`, `price_desc`, `stars_desc`, `name_asc`), and pagination.
- Hotel detail pages (`/hotels/$id`) use ID-based routing (hotels table has no slug column), full SSR prefetching with 404 handling, amenities grid with dynamic Lucide icons, and sticky interactive booking card with live `date-fns` night/room price calculation + inline Zod validation.
- Destination detail pages (`/destinations/$slug`) now render both live tour packages and live top hotels dynamically using `fetchPackagesByDestination` and `fetchHotelsByDestination`.
- Phase 7 flights listing (`/flights`) implements `searchFlights` and `fetchFlightCities` server functions, origin/destination dropdowns with airport swap, departure date selection, cabin class filtering (`all`, `economy`, `business`, `first`), passengers stepper (1–9), sort options, sold-out flight handling (`seats_available === 0`), and an interactive flight confirmation summary dialog with total calculation (`$fare × passengers`) and `BookingCTA` stub.
- Phase 4 authentication provides a client-side `AuthProvider` mounted at root with dual-client architecture (`src/integrations/supabase/client.ts` for browser auth/profile hydration and `user_roles` permission checking). Navbar dynamically reacts to login/logout events and presents avatar dropdown and admin link without page refreshes.
- Phase 8 Itinerary Builder is entirely client-side rendered using `supabase` client with `requireAuthGuard`. Implements account shell with responsive tabbed nav, user itinerary listing with destination and activity counters, and full interactive day-by-day activity editor with optimistic reordering and print view.
- Flights/hotels seeded in the database; no external APIs. Payments simulated. Light theme only.

## Schema Changes (keep in sync with Architecture.md §5)

- Added `tour_packages.itinerary` (jsonb), `bookings.reference`, `bookings.end_date`, `reviews.author_name`.
- Added `user_roles` table + `app_role` enum; profiles has no role column.
- Added `docs/migrations/001_auth_triggers.sql` documenting the user profile and role initialization trigger.

## Known Bugs / TODO

- Ratings on cards are display placeholders until review aggregates land (Phase 9).
- BookingCTA stubs across packages, hotels, and flights will be wired to checkout in Phase 10.

## Next Steps

1. Phase 9 — Reviews & Ratings.
2. Phase 10 — Bookings & Checkout Flow.
3. Phase 11 — User Dashboard.

## Reminders for the AI

- Read PRD.md, Architecture.md, Design.md, Rules.md before coding.
- Do not regenerate completed phases. Only touch what the current phase requires.
- Update this file at the end of every phase.
