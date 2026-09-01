# Memory — Wanderlust

**Last updated:** 2026-09-01 | **Current phase:** 3 complete | **Session #:** 2

## Completed

- [x] Backend foundation — Lovable Cloud enabled; all tables created with RLS, grants and seed data.
- [x] Phase 1 — Design system (tokens, Playfair Display + Inter, card/button/focus styling).
- [x] Phase 2 — Layout & Home (navbar with mobile drawer, footer, hero, featured sections, why-us, testimonials, CTA band).
- [x] Phase 3 — Destinations (listing with URL-synced search/filter/pagination, /destinations/$slug detail with hero, breadcrumb, and future phase placeholders, shared DestinationCard).
- [ ] Phase 4 — Authentication
- [ ] Phases 5–13

## In Progress

- None. Placeholder pages exist at /packages, /hotels, /flights, /gallery, /contact, /login, /register and must be replaced in their phases.

## Key Decisions

- Stack is **TanStack Start**, not React Router SPA: pages live in `src/routes/` (file-based), design tokens in `src/styles.css` (oklch), head metadata via the route `head()` option. No `src/pages/`, no react-router-dom, no react-helmet.
- Roles live in a separate `user_roles` table with `has_role()` / `is_admin()` security-definer functions — NOT a role column on profiles.
- `tour_packages.itinerary` is a jsonb array of `{day,title,description}` (added beyond Architecture.md §5).
- `bookings` has extra `reference` and `end_date` columns; `reviews` has `author_name`.
- Public catalog reads go through `createServerFn` + publishable-key client (`src/lib/catalog.functions.ts`) so pages render server-side for SEO.
- Phase 3 destinations listing (`/destinations`) uses `validateSearch` to synchronize all filter state (`q`, `continent`, `region`, `page`) directly with query params for shareability and zero-waterfall SSR.
- Destination detail pages (`/destinations/$slug`) render cinematic hero banners, breadcrumbs, overview stories, quick facts, and future phase placeholders for Phase 5 (tours), Phase 6 (hotels), and Phase 9 (reviews).
- Flights/hotels seeded in the database; no external APIs. Payments simulated. Light theme only.

## Schema Changes (keep in sync with Architecture.md §5)

- Added `tour_packages.itinerary` (jsonb), `bookings.reference`, `bookings.end_date`, `reviews.author_name`.
- Added `user_roles` table + `app_role` enum; profiles has no role column.

## Known Bugs / TODO

- Navbar auth links are static; they become session-aware in Phase 4.
- Package cards link to list page until detail routes exist (Phase 5).
- Ratings on cards are display placeholders until review aggregates land (Phase 9).

## Next Steps

1. Phase 4 — Auth: `/login`, `/register`, forgot password, `_authenticated` gate, session-aware navbar.
2. Phase 5 — Tour Packages listing & detail (`/packages`, `/packages/$slug`).

## Reminders for the AI

- Read PRD.md, Architecture.md, Design.md, Rules.md before coding.
- Do not regenerate completed phases. Only touch what the current phase requires.
- Update this file at the end of every phase.
