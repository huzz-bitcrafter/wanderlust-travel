# Phases — Wanderlust v2 (codebase roadmap numbering)

**DONE:** Foundation (DB, RLS, seed data) · Phase 1 (design system) · Phase 2 (layout + home)

## Phase 3 — Destinations ← CURRENT

List page (SSR, URL-synced search + continent/region filters), detail page by slug,
shared DestinationCard. Done when both pages render seeded data server-side.

## Phase 4 — Authentication

/login, /register, password recovery; auth state in Navbar; protected routes.
Done when register → logout → login cycle works and navbar reacts.

## Phase 5 — Tour Packages

Catalog with filters (destination, price, duration, difficulty); detail page with
day-by-day itinerary accordion + pricing card.

## Phase 6 — Hotels

Hotel search, star ratings, amenity filters, detail page with booking card.

## Phase 7 — Flights

Search form (origin/destination/date/class/passengers), results list, class selection.

## Phase 8 — Itinerary Builder

Logged-in day-by-day trip builder (itineraries + itinerary_items), full CRUD.

## Phase 9 — Reviews & Ratings

Submit (stars + comment), moderation approval, aggregates on cards + detail pages.

## Phase 10 — Bookings & Checkout

Multi-step checkout for tour/hotel/flight, reference (WL-XXXXXX), simulated payment,
confirmation/receipt. Done when all 3 types book end-to-end.

## Phase 11 — User Dashboard

Trips history, active bookings, saved itineraries, profile editor with avatar upload.

## Phase 12 — Admin Panel

is_admin guard, stats dashboard, CRUD for all entities, booking management,
review moderation, contact inbox, user role management.

## Phase 13 — Gallery & Contact

Masonry gallery + lightbox + destination filter; validated contact form → messages.

## Phase 14 — QA & Polish

Responsive audit 320px→4K · skeletons/empty/error everywhere · lazy images + alt ·
meta per route · 404 page · full-flow walkthrough · RLS security re-audit.
