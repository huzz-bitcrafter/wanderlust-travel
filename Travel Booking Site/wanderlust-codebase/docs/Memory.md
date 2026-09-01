# Memory — Wanderlust

**Last updated:** 2026-09-02 | **Current phase:** 11 complete | **Session #:** 4

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
- [x] Phase 9 — Reviews & Ratings (shared ReviewSection with aggregate score, star distribution breakdown, approved reviews stream, and authenticated review submission form with pending approval moderation note; live ReviewSection mounted across destinations, packages, and hotels detail pages; dynamic review aggregates wired into DestinationCard, PackageCard, and HotelCard via batch `fetchReviewAggregates` query).
- [x] Phase 10 — Bookings & Checkout (client-rendered checkout flow at `/checkout` with URL `validateSearch`, 3-step navigation for trip summary, guest details form, and simulated credit card payment; retry-safe reference generator with format `WL-` + 6 unambiguous chars; confirmation receipt at `/checkout/confirmation` with print view; all `BookingCTA` buttons live across tours, hotels, and flights).
- [x] Phase 11 — User Dashboard (activated all account sidebar tabs; Overview at `/account/overview` with metrics row, upcoming trip spotlight card with countdown badge, recent activity timeline, and quick actions; My Bookings at `/account/bookings` with Upcoming/Past/Cancelled tabs, booking cards, and 48h cancellation modal; My Reviews at `/account/reviews` with approved/pending reviews list, edit modal with moderation reset, and delete confirmation; Profile & Settings at `/account/profile` with personal information, avatar photo upload to Supabase Storage avatars bucket with instant preview, and password update form).
- [x] Phase 12A — Admin Portal Foundation & User/Booking Operations (admin route guard with `requireAdminGuard` and 403 Forbidden state; responsive Admin Portal layout at `/admin` with management sidebar; Overview Dashboard at `/admin/overview` with real-time KPI metrics, revenue tracking, and recent bookings stream; Bookings Management at `/admin/bookings` with multi-facet search/filtering, detailed reservation drawer, and status/payment update modal; Users & Roles Management at `/admin/users` with user search, admin role assignment/revocation with self-demotion lockout protection; documented database migration `004_user_roles_admin_policy.sql`).
- [ ] Phase 12B — Content CRUD, Review Moderation, Contact Inbox
- [ ] Phases 13–14

## In Progress

- None. Next is Phase 12B (Admin Content CRUD, Review Moderation & Contact Inbox).

## Key Decisions

- Stack is **TanStack Start**, not React Router SPA: pages live in `src/routes/` (file-based), design tokens in `src/styles.css` (oklch), head metadata via the route `head()` option. No `src/pages/`, no react-router-dom, no react-helmet.
- Database migrated from old Lovable-managed project to user-owned Supabase project (`https://loypxmczumghuusljnnj.supabase.co`). Old Lovable project deprecated.
- Roles live in a separate `user_roles` table with `has_role()` / `is_admin()` security-definer functions — NOT a role column on profiles.
- `tour_packages.itinerary` is a jsonb array of `{day,title,description}` (added beyond Architecture.md §5).
- `bookings` has extra `reference` and `end_date` columns; `reviews` has `author_name`.
- Booking reference is client-generated with format `WL-` + 6 characters from unambiguous alphabet `23456789ABCDEFGHJKLMNPQRSTUVWXYZ` (excludes 0, O, 1, I). Collision retry mechanism attempts insertion up to 3 times before failing.
- Account dashboard routes under `/account` are protected by `requireAuthGuard`, rendering Overview, Itineraries, Bookings, Reviews, and Profile.
- Storage policy for avatar uploads documented in `docs/migrations/003_avatars_storage_policy.sql`.
- Multi-step checkout at `/checkout` requires authentication (`requireAuthGuard`), supports `'tour' | 'hotel' | 'flight'`, calculates 10% taxes/fees, collects primary and additional traveler names with Zod validation, provides demo card quick-fill, and saves full booking snapshot into `guest_details` JSON.
- Confirmation receipt at `/checkout/confirmation` provides one-click reference code copy, detailed breakdown, `@media print` clean receipt styling, and dashboard navigation.
- All `BookingCTA` components across packages detail, hotels detail, and flights search modal are wired directly to `/checkout` with live query parameters.
- Public catalog reads go through `createServerFn` + publishable-key client (`src/lib/catalog.functions.ts` and `src/lib/review.functions.ts`) so pages render server-side for SEO.
- Phase 9 reviews aggregate calculation is executed via server functions (`fetchReviewAggregate` for detail views and `fetchReviewAggregates` for batch card listings) ensuring single-query batching on catalog pages.
- Review submission is RLS-enforced with `is_approved = false` by default, making unapproved reviews invisible to the public until moderated.
- Phase 3 destinations listing (`/destinations`) uses `validateSearch` to synchronize all filter state (`q`, `continent`, `region`, `page`) directly with query params for shareability and zero-waterfall SSR.
- Phase 5 tour packages listing (`/packages`) synchronizes search, destination, difficulty, max price, max duration, sorting, and pagination via `validateSearch`.
- Package detail pages (`/packages/$slug`) feature full SSR prefetching, dynamic SEO/OG meta, day-by-day collapsible Radix accordion itinerary, includes/excludes matrix, sticky booking card with `BookingCTA` tooltip stub, and live `ReviewSection`.
- Phase 6 hotels listing (`/hotels`) synchronizes search, destination (reusing `fetchFilterDestinations`), star rating pills (3★, 4★, 5★), max price per night, sorting (`price_asc`, `price_desc`, `stars_desc`, `name_asc`), and pagination.
- Hotel detail pages (`/hotels/$id`) use ID-based routing (hotels table has no slug column), full SSR prefetching with 404 handling, amenities grid with dynamic Lucide icons, sticky interactive booking card with live `date-fns` night/room price calculation + inline Zod validation, and live `ReviewSection`.
- Destination detail pages (`/destinations/$slug`) render live tour packages, live top hotels, and live `ReviewSection`.
- Phase 7 flights listing (`/flights`) implements `searchFlights` and `fetchFlightCities` server functions, origin/destination dropdowns with airport swap, departure date selection, cabin class filtering (`all`, `economy`, `business`, `first`), passengers stepper (1–9), sort options, sold-out flight handling (`seats_available === 0`), and an interactive flight confirmation summary dialog with total calculation (`$fare × passengers`) and `BookingCTA` stub.
- Phase 4 authentication provides a client-side `AuthProvider` mounted at root with dual-client architecture (`src/integrations/supabase/client.ts` for browser auth/profile hydration and `user_roles` permission checking). Navbar dynamically reacts to login/logout events and presents avatar dropdown and admin link without page refreshes.
- Phase 8 Itinerary Builder is entirely client-side rendered using `supabase` client with `requireAuthGuard`. Implements account shell with responsive tabbed nav, user itinerary listing with destination and activity counters, and full interactive day-by-day activity editor with optimistic reordering and print view.
- Flights/hotels seeded in the database; no external APIs. Payments simulated. Light theme only.

## Schema Changes (keep in sync with Architecture.md §5)

- Added `tour_packages.itinerary` (jsonb), `bookings.reference`, `bookings.end_date`, `reviews.author_name`.
- Added `user_roles` table + `app_role` enum; profiles has no role column.
- Added `docs/migrations/001_auth_triggers.sql` documenting the user profile and role initialization trigger.

## Known Bugs / TODO

- BookingCTA stubs across packages, hotels, and flights will be wired to checkout in Phase 10.

## Next Steps

1. Phase 10 — Bookings & Checkout Flow.
2. Phase 11 — User Dashboard.
3. Phase 12A — Admin Portal Foundation.

## Reminders for the AI

- Read PRD.md, Architecture.md, Design.md, Rules.md before coding.
- Do not regenerate completed phases. Only touch what the current phase requires.
- Update this file at the end of every phase.
