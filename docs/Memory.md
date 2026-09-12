# Memory — Wanderlust

**Last updated:** 2026-09-12 | **Current phase:** UI Polish (Phase 2 Complete, awaiting Phase 3) | **Session #:** 8

## Completed

- [x] Backend foundation — Database migration to user project, RLS policies, tables, and seed data.
- [x] Phase 1 — Design system (tokens, Playfair Display + Inter, card/button/focus styling).
- [x] Phase 2 — Layout & Home (navbar with mobile drawer, footer, hero, featured sections, why-us, testimonials, CTA band).
- [x] Phase 3 — Destinations (listing with URL-synced search/filter/pagination, /destinations/$slug detail with hero, breadcrumb, and live tours/hotels/reviews).
- [x] Phase 4 — Authentication (client AuthProvider/useAuth hook, /login, /register, /forgot-password, auth-aware Navbar with avatar dropdown & mobile drawer, reusable beforeLoad auth guards).
- [x] Phase 5 — Tour Packages (listing with URL-synced search/filters/sorting/pagination, shared PackageCard, /packages/$slug detail with hero, itinerary accordion, includes/excludes list, sticky booking card, and destination detail integration).
- [x] Phase 6 — Hotels (listing with URL-synced search/destination/star-rating/price/sorting/pagination, shared HotelCard, /hotels/$id detail with hero, amenities with Lucide icons, live date-fns calculation with Zod validation, and top hotels on destination detail).
- [x] Phase 7 — Flights (search form with origin/destination/date/cabin-class/passengers URL-synced via validateSearch, shared FlightCard with direct flight indicators & seat availability/sold-out states, and Step 3 flight summary confirmation dialog with live passenger multiplier and BookingCTA).
- [x] Phase 8 — Itinerary Builder (auth-guarded account layout at `/account` with desktop sidebar / mobile horizontal tabs, itinerary listing `/account/itineraries` with TanStack Query on own rows, create dialog with zod validation, day-by-day editor `/account/itineraries/$id` with activity CRUD, optimistic reordering, print-friendly CSS view, and 404 on foreign itineraries).
- [x] Phase 9 — Reviews & Ratings (shared ReviewSection with aggregate score, star distribution breakdown, approved reviews stream, and authenticated review submission form with pending approval moderation note; live ReviewSection mounted across destinations, packages, and hotels detail pages; dynamic review aggregates wired into DestinationCard, PackageCard, and HotelCard via batch `fetchReviewAggregates` query).
- [x] Phase 10 — Bookings & Checkout (client-rendered checkout flow at `/checkout` with URL `validateSearch`, 3-step navigation for trip summary, guest details form, and simulated credit card payment; retry-safe reference generator with format `WL-` + 6 unambiguous chars; confirmation receipt at `/checkout/confirmation` with print view; all `BookingCTA` buttons live across tours, hotels, and flights).
- [x] Phase 11 — User Dashboard (activated all account sidebar tabs; Overview at `/account/overview` with metrics row, upcoming trip spotlight card with countdown badge, recent activity timeline, and quick actions; My Bookings at `/account/bookings` with Upcoming/Past/Cancelled tabs, booking cards, and 48h cancellation modal; My Reviews at `/account/reviews` with approved/pending reviews list, edit modal with moderation reset, and delete confirmation; Profile & Settings at `/account/profile` with personal information, avatar photo upload to Supabase Storage avatars bucket with instant preview, and password update form).
- [x] Phase 12A — Admin Portal Foundation & User/Booking Operations (admin route guard with `requireAdminGuard` and 403 Forbidden state; responsive Admin Portal layout at `/admin` with management sidebar; Overview Dashboard at `/admin/overview` with real-time KPI metrics, revenue tracking, and recent bookings stream; Bookings Management at `/admin/bookings` with multi-facet search/filtering, detailed reservation drawer, and status/payment update modal; Users & Roles Management at `/admin/users` with user search, admin role assignment/revocation with self-demotion lockout protection; documented database migration `004_user_roles_admin_policy.sql`).
- [x] Phase 12B — Content CRUD, Review Moderation & Contact Inbox (Destinations CRUD at `/admin/destinations` with continent filter, cover photo preview, auto-slug generator, and delete dialog; Tour Packages CRUD at `/admin/packages` with destination linkage, duration/price/difficulty specs, multi-day itinerary JSON builder, inclusions/exclusions tags, and live public preview link; Hotels CRUD at `/admin/hotels` with destination linkage, star rating selector, rate per night, interactive amenities checklist, and live public preview link; Flights CRUD at `/admin/flights` with airline, flight number, origin/destination codes, datetime-local timestamps, seat inventory tracking, and cabin class filtering; Review Moderation Queue at `/admin/reviews` with Pending Moderation, Approved & Live, and All tabs, single-click approve/unapprove actions, and permanent deletion; Customer Inbox at `/admin/inbox` with status filters, inquiry reader modal, status state machine, and reply-via-email link).
- [x] Phase 13 — Gallery Lightbox & Contact Form (SSR gallery at `/gallery` with destination URL filters, responsive Masonry grid, hover overlays with location tags, interactive fullscreen Lightbox modal with keyboard navigation [Arrows + Escape] and photo index counters; Contact Page at `/contact` with Zod-validated submission to `contact_messages` table, user auto-fill, inquiry tracking badge, global concierge office details, and interactive FAQ accordion).
- [x] Acceptance Testing Fixes (Multi-guest booking, itinerary reordering, demo payment notice, 48h cancellation rule).
- [x] Phase 14 — QA & Polish (A11y audits, SEO OpenGraph metadata, Supabase RLS security sweep table, end-to-end user & admin flow verification).
- [x] Content Expansion (Domestic India):
  - Generated migration `docs/migrations/006_domestic_seed.sql` with 12 Indian destinations, 20 hotels, 9 tour packages, and 28 domestic flights across DEL, BOM, BLR, GOI, JAI, IXC, CCU, MAA, COK.
  - Extended `fetchDestinations` in `src/lib/catalog.functions.ts` with `country` filter support.
  - Added URL-synced `All | India | International` quick pills to `/destinations` filter bar with SSR preservation.
  - Resolved image 404s for Hampi and Rishikesh: added local high-res assets to `public/images/destinations/hampi.jpg` (user-supplied stone chariot photo) and `public/images/destinations/rishikesh.jpg` (Lakshman Jhula suspension bridge over the emerald Ganges with the Himalayas).
  - Updated `006_domestic_seed.sql` and wired automatic server/client fallbacks in `src/lib/catalog.functions.ts`, `DestinationCard.tsx`, and `PackageCard.tsx`.
- [x] Palette Refinement (Direction A: Premium Travel Editorial + Restrained Liquid-Glass Material Depth):
  - Evolved `primary` to midnight navy `oklch(0.24 0.066 256)` (#071f3e) for deeper, cooler, more cinematic editorial branding.
  - Evolved `accent` to luminous coral `oklch(0.680 0.168 38)` (#ec6c44) for warmer, more energetic booking action without neon oversaturation.
  - Added centralized gradient tokens `--gradient-primary` (midnight navy → restrained maritime teal) and `--gradient-accent` (luminous coral → warm restrained amber).
  - Softer, deeper material shadows (`--shadow-card`, `--shadow-card-hover`, `--shadow-elegant`, `--shadow-modal`) and refined glass utilities (`.glass-navbar`, `.glass-drawer`, `.glass-chrome`, `.admin-sidebar`).
  - Zero component files modified; 100% CSS token and documentation refinement.
  - WCAG AA/AAA verified across all 7 mandatory contrast pairs.
- [x] Home Page v2 Rebuild (Cinematic Hero + MakeMyTrip-Style Tabbed Search Widget):
  - Cinematic video background in `Hero.tsx` using local `/hero-loop.mp4` with Ken Burns slow-zoom fallback on `/hero-poster.jpg` and midnight-navy gradient overlay.
  - Floating 4-tab glassmorphic `SearchWidget.tsx` (Flights, Hotels, Packages, Destinations) straddling the hero and page content with `.glass-search` material depth.
  - Flights tab features origin/destination Select pickers (populated via `fetchFlightCities`), airport swapping button, date picker, cabin class picker, and interactive traveller counter.
  - Hotels & Packages tabs feature destination combobox autocomplete with keyboard navigation and name/keyword search.
  - Destinations tab features instant keyword search with region quick pills (All, India, International).
  - All tabs navigate cleanly to existing catalog search routes with exact URL query params.
  - Added `ExploreIndia.tsx` home section powered by new `listIndianDestinations` server function in `src/lib/catalog.functions.ts`.
  - Added SSR query prefetching for Indian destinations, filter destinations, and flight cities in `src/routes/index.tsx`.
  - Production build verified with zero errors and clean bundle output.
  - Refined tabbed search card styling to match custom `.glass-card` liquid-glass aesthetic: `rgba(255, 255, 255, 0.15)` backdrop blur (20px), 20px border-radius, `rgba(255, 255, 255, 0.3)` border, 4-tier ambient + specular inset box-shadows, top/left 1px gradient highlights, and `:has([role="listbox"])` overflow protection.
- [x] Hero Fix (Full-Bleed Video & Neutral Cinematic Scrims):
  - Made hero video and poster full-bleed edge-to-edge at all aspect ratios (`absolute inset-0 w-full h-full object-cover object-center`), eliminating letterboxing and pillarboxing.
  - Set responsive viewport heights: `h-[100svh] min-h-[600px]` on desktop, `h-[85svh] min-h-[520px]` on mobile (maintaining headline and widget visibility under mobile browser chrome).
  - Deleted colored navy-to-teal gradient overlay; replaced with neutral, black-based overlays:
    - Bottom-anchored separation gradient: `linear-gradient(to top, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0) 40%)` for cinematic contrast against the floating search widget.
    - Subtle uniform neutral scrim: `bg-black/[0.08]` for ambient legibility without dimming the natural video coloring.
  - Added soft text-shadow (`text-shadow: 0 2px 24px rgba(0, 0, 0, 0.45)`) on headline and subline for contrast over bright frames.
  - Verified no box-shadow on hero container.
  - Updated prefers-reduced-motion to explicitly disable `.ken-burns` zoom on poster.
  - Verified with `npm run lint` and `npm run build` passing with 0 errors.

- [x] Home Page v2 Restoration & Root Cause Resolution:
  - **Root Cause**: During commit `53da8e3` ("Hero fix: full-bleed video, neutral cinematic scrim (no colored tint)"), files were staged selectively (`Hero.tsx`, `Design.md`, `Memory.md`, `styles.css`). Consequently, `SearchWidget.tsx` and `ExploreIndia.tsx` remained untracked, while changes to `index.tsx` (5-query prefetch + widget/ExploreIndia rendering) and `catalog.functions.ts` (`listIndianDestinations`) were unstaged. When an abandoned spotlight task was later reverted with `git reset --hard` and `git checkout HEAD -- .`, the unstaged and untracked files were lost from the working tree.
  - **Restoration**: Recreated `SearchWidget.tsx` (4-tab flights/hotels/packages/destinations search with airport swapping, destination combobox autocomplete, and parameter navigation) and `ExploreIndia.tsx` (6 Indian destination cards with skeleton loaders). Restored `listIndianDestinations` server function and 5 concurrent query prefetches in `src/routes/index.tsx`.
  - **Verification**: Cleared build caches (`node_modules/.vite`, `.output`, `.nitro`), verified `GET /` returns 200 with complete SSR payload (tabs, Explore India, hero video), verified all 4 search target routes with query parameters return 200, and verified `npm run lint` and `npm run build` pass cleanly.
  - **Safeguard**: All related files staged together in a single comprehensive commit to ensure zero orphaned state.

- [x] UI Polish Phase 1 — Contrast Fix (WCAG AA):
  - Added `--accent-text` OKLCH token (`oklch(0.565 0.168 38)`, ~#c4471c) delivering **4.92:1** on card and **4.57:1** on background for small/normal accent text (<18.66px bold / <24px normal).
  - Audited all coral text usages across public, account, and admin surfaces.
  - Replaced `text-accent` with `text-accent-text` on small/normal text instances: `FlightCard.tsx` (seat availability warning), `Navbar.tsx` (desktop user menu Admin badge and Admin Portal link), `login.tsx` (Forgot password & Create account links), `register.tsx` (Sign in link), `flights.tsx` (Total Amount in booking confirmation dialog), `hotels.$id.tsx` (Total live estimate in sticky booking card), and `checkout.tsx` (Included in your booking guarantee header).
  - Preserved `--accent` for large/bold prices (24px/30px bold: 3.09:1 passes WCAG AA Large), primary CTA fills (`bg-accent`), badges, and star rating icons.
  - Updated `docs/Design.md` palette table and contrast compliance documentation.
- [x] UI Polish Phase 2 — CTA Hover Shine:
  - Implemented subtle, elegant pure-CSS shine sweep + 1.5px elevation on primary CTA buttons via the shared `Button` component's `default` and `primary` variants using `@utility cta-shine`.
  - Sweeps light across buttons on `:hover::after` using an angled gradient (`linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, 0.3) 50%, transparent 80%)`, `translateX(-100%)` → `translateX(100%)` in 180ms cubic-bezier(0.16, 1, 0.3, 1)).
  - Transitions only on hover, instantly resetting off-canvas on mouse-out without reverse sweep.
  - Existing press state (`scale(0.97)` on pointer-down) preserved.
  - Reduced motion respects user preferences: sweep disabled (`display: none !important`), hover color and elevation preserved.
  - Zero classes added to individual buttons; secondary/ghost/outline variants completely unchanged.

## In Progress

- UI Polish Phase 2 complete and verified. Awaiting user review and explicit "continue" before Phase 3 (Section Entrance Reveals).

## Key Decisions

- Stack is **TanStack Start**, not React Router SPA: pages live in `src/routes/` (file-based), design tokens in `src/styles.css` (oklch), head metadata via the route `head()` option. No `src/pages/`, no react-router-dom, no react-helmet.
- Database migrated from old Lovable-managed project to user-owned Supabase project (`https://loypxmczumghuusljnnj.supabase.co`). Old Lovable project deprecated.
- Roles live in a separate `user_roles` table with `has_role()` / `is_admin()` security-definer functions — NOT a role column on profiles.
- `tour_packages.itinerary` is a jsonb array of `{day,title,description}` (added beyond Architecture.md §5).
- `bookings` has extra `reference` and `end_date` columns; `reviews` has `author_name`.
- Booking reference is client-generated with format `WL-` + 6 characters from unambiguous alphabet `23456789ABCDEFGHJKLMNPQRSTUVWXYZ` (excludes 0, O, 1, I). Collision retry mechanism attempts insertion up to 3 times before failing.
- Account dashboard routes under `/account` are protected by `requireAuthGuard`, rendering Overview, Itineraries, Bookings, Reviews, and Profile.
- Storage policy for avatar uploads documented in `docs/migrations/003_avatars_storage_policy.sql`.
- Multi-step checkout at `/checkout` requires authentication (`requireAuthGuard`), supports `'tour' | 'hotel' | 'flight'`, calculates exact flat prices (Tour: `price × guests`, Hotel: `nights × price × rooms`, Flight: `fare × passengers`), collects primary and additional/passenger names with Zod validation, provides demo card quick-fill, and saves full booking snapshot into `guest_details` JSON.
- Confirmation receipt at `/checkout/confirmation` provides one-click reference code copy, detailed breakdown, per-passenger list for flights, `@media print` clean receipt styling, and dashboard navigation.
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
- Phase 12 Admin Portal provides complete backend administration with dedicated sub-routes for Overview KPIs, Bookings Management, User Roles, Destinations CRUD, Packages CRUD, Hotels CRUD, Flights Inventory, Review Moderation, and Customer Inbox.
- Phase 13 delivers a full-screen interactive lightbox gallery with URL destination filters and a live concierge contact portal with automated inquiry ticket generation and FAQs.
- Flights/hotels seeded in the database; no external APIs. Payments simulated. Light theme only.

## Schema Changes (keep in sync with Architecture.md §5)

- Added `tour_packages.itinerary` (jsonb), `bookings.reference`, `bookings.end_date`, `reviews.author_name`.
- Added `user_roles` table + `app_role` enum; profiles has no role column.
- Added `docs/migrations/001_auth_triggers.sql` documenting the user profile and role initialization trigger.
- Added `docs/migrations/004_user_roles_admin_policy.sql` documenting user_roles admin CRUD policy.

## Known Bugs / TODO

- None. All functional bugs and assets resolved.

## Next Steps

- Final report to user.

## Reminders for the AI

- Read PRD.md, Architecture.md, Design.md, Rules.md before coding.
- Do not regenerate completed phases. Only touch what the current phase requires.
- Update this file at the end of every phase.
