# Wanderlust — Foundation Build (Phases 1–2 + Backend)

Your docs assume React Router + Vite SPA with `src/pages/`. This project runs on TanStack Start, so routing lives in `src/routes/` (file-based) and design tokens in `src/styles.css` instead of `index.css`. Everything else in Design.md, Rules.md, and the schema is followed exactly. Each route maps 1:1 to your route table.

## What this session delivers

**1. Backend foundation**

- Enable Lovable Cloud (Postgres + Auth + Storage).
- Create all 11 tables from Architecture.md §5: profiles, destinations, tour_packages, hotels, flights, bookings, itineraries, itinerary_items, reviews, gallery_images, contact_messages.
- Roles in a dedicated `user_roles` table with an `is_admin()` / `has_role()` security-definer function (safer than a role column on profiles; prevents privilege escalation).
- Row Level Security on every table per §6: public read of published content and approved reviews, users own their bookings/itineraries/reviews/profile, admins full access, anonymous insert on contact messages.
- Signup trigger that creates the profile row.
- Seed data in the same migration: ~12 destinations, ~15 tour packages, ~15 hotels, ~25 flights, gallery images, sample reviews — all with Unsplash imagery consistent with the schema.

**2. Design system (Phase 1)**

- Playfair Display + Inter loaded via link tags in the root route.
- Full token set in `src/styles.css` (oklch): Deep Ocean Navy primary, Lagoon Teal secondary, Sunset Coral accent, Warm Sand background, plus success/warning tokens for booking badges.
- Type scale, radii (rounded-full buttons, rounded-xl cards), card hover lift, teal focus rings, coral ratings. Light theme only.

**3. Layout & Home (Phase 2)**

- Sticky navbar: transparent over hero → solid navy on scroll, auth-aware links, mobile slide-in drawer.
- Navy 4-column footer (Explore, Company, Support, Newsletter).
- Home page: 21:9 cinematic hero with gradient overlay and global search bar, featured destinations grid, featured packages, why-us section, testimonials, coral CTA band.
- Home pulls featured destinations and packages from the seeded database (not placeholders), with skeleton loaders and empty states.

**4. Project memory**

- `Memory.md` at project root, filled in with completed phases, key decisions (including the TanStack routing deviation), and next steps. Updated at the end of every future phase.

## Technical notes

- Public catalog reads use a server function with the publishable key behind narrow anon SELECT policies, so pages render server-side for SEO.
- Data access goes through TanStack Query hooks (`useDestinations`, `usePackages`, …); components never call the database directly.
- sonner for toasts, zod + react-hook-form for all forms, lucide-react icons, shadcn/ui only. No hardcoded hex in components — tokens only.
- Home route gets its own unique title/description/OG metadata.

## After approval

Following sessions continue in Phases.md order: Phase 3 Destinations, Phase 4 Auth, Phase 5 Packages + booking, and so on through the admin panel and QA. Nothing already built gets regenerated.
