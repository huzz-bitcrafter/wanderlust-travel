# Memory Archive — Wanderlust Historical Log

This document archives completed milestones and historical phase logs from Wanderlust's initial development cycles, preserving full project lineage and decision records.

---

## Historical Completed Phases & Milestones

### Typography, Motion & Visual Polish Milestones

- [x] Motion Root-Cause Debugging, Site-Wide Reveal Sweep & Eyebrow Size Doubling:
  - **Environment Audit (Step 1)**: Checked `matchMedia('(prefers-reduced-motion: reduce)').matches` in dev-server browser context (Chromium/Chrome/Edge) = `false`. Evaluated Windows registry `HKCU:\Control Panel\Desktop\UserPreferencesMask` (`9E 1E 03 80 12 00 00 00`): Bit 2 (`SPI_GETCLIENTAREAANIMATION` / Windows Animation Effects) is `0` (`Off` in OS visual settings). When desktop browsers inherit this, reduced-motion fallbacks activate as designed.
  - **Root Cause 1 (`TypingAnimation.tsx`)**: Re-render cancellation race condition during hydration and hero video readiness (`videoReady` state) triggered the effect cleanup, cancelling the typing interval while `hasStartedRef.current` remained `true`. The component was permanently frozen displaying `""` with only the cursor `|`. Fixed by adding `Promise.race([document.fonts.ready, 2000ms timeout])` font safety and stabilizing typing lifecycle state in an `animStateRef` so normal re-renders do not interrupt character typing. Verified ~2.8s smooth typing with cursor self-removal upon completion.
  - **Root Cause 2 (`TestimonialsColumn.tsx`)**: `motion/react` percentage `translateY` transform does not create DOM WAAPI animations; `getAnimations()` returned `[]`, breaking hover/focus pause. Upgraded to hardware-accelerated WAAPI marquee directly on `innerRef.current.animate(...)` with native DOM `mouseenter`/`mouseleave`/`focusin`/`focusout` listeners. Verified 3 columns running at 15s/19s/17s with instant pause on hover/focus and continuous resume.
  - **Root Cause 3 (`SectionReveal.tsx`)**: Viewport root margin (`-20px`) and `amount: 0.15` delayed near-fold sections. Optimized to `viewport={{ once: true, amount: "some", margin: "0px 0px -40px 0px" }}` so above-the-fold content triggers immediately and scroll-ins reveal with critically damped `duration: 0.45, ease: [0.16, 1, 0.3, 1]`.
  - **Site-Wide Reveal Sweep**: Added `SectionReveal` to unmounted sections in `/gallery` (filter pills, 3D cylinder carousel, and archive grid), `/contact` (concierge form/office info grid and FAQ accordion), and `/flights` (flight search console and schedule cards). Verified active reveal triggers across all routes.
  - **Hero Eyebrow Sizing (Part 2)**: Doubled eyebrow size from `text-sm` (14px) to `text-xl sm:text-2xl` (20px mobile / 24px desktop) with tightened proportional tracking (`tracking-[0.04em]` / `0.96px`) for optical lockup beside the Tropikal H1 headline.
  - **Reduced Motion Degradation**: Tested under `prefers-reduced-motion: reduce` emulation in Chrome CDP: verified typing subheadline displays full text immediately with zero delay, marquee displays static cards without loop, and section reveals initialize with instant full opacity.
  - **Quality Gates**: `npm run lint` (0 errors, 10 expected warnings) and `npm run build` cleanly passed. Git status verified clean.

- [x] Typography: Hero Lockup Fonts + Typing Animation & Testimonials Scrolling Marquee:
  - Added `TheCrowInlineGrunge.otf` (734.9 KB) and `Alga-RegularItalic.otf` (28.7 KB) to `public/fonts/`.
  - Registered `@font-face` for `"Crow Inline Grunge"` and `"Alga"` (italic 400), mapped `--font-crow` and `--font-alga` tokens in `src/styles.css`.
  - Applied Crow Inline Grunge to hero eyebrow (`"Handpicked journeys since 2011"`), stepped up size to `text-sm`, with `"Halenoir Compact", sans-serif` fallback.
  - Applied Alga italic to hero subheadline with vendored MagicUI-based `TypingAnimation` (`src/components/vendored/TypingAnimation.tsx`) in `motion/react`, calibrated start delay (~400ms), 2.8s total reveal, font readiness guard (`document.fonts.ready`), SSR full-text preservation for SEO, and immediate reveal under `prefers-reduced-motion`.
  - Preloaded hero fonts in `src/routes/__root.tsx`. Flagged hero payload total (793 KB > 600 KB) in `docs/Design.md` with subsetting recommendations.
  - Vendored `TestimonialsColumn` in `src/components/TestimonialsColumn.tsx` utilizing `motion/react` infinite loop transform (`translateY: "-50%"`), WAAPI pause on hover and focus-within, and token-adapted cards (`rounded-xl`, `bg-card`, `border-border/60`, `shadow-card`, `card-lift`, star rating above quote).
  - Expanded `HOME_TESTIMONIALS` in `src/lib/home-content.ts` from 3 to 9 real destination testimonials (Santorini, Bali, Leh-Ladakh, Goa, Maldives, Marrakech, Kyoto, Amalfi, Patagonia) with Unsplash portraits and 4.5–5.0 ratings.
  - Replaced static testimonial grid in `src/components/home/Testimonials.tsx` with 3-column marquee (durations 15s/19s/17s, responsive 1 col mobile / 2 md / 3 lg, top+bottom fade mask, max-h 740px) and static 9-card responsive grid fallback under `prefers-reduced-motion`.
  - Upgraded "Why Wanderlust" (`src/components/home/WhyUs.tsx`) with staggered entrance reveals (`SectionReveal` delay `index * 0.08`) and `card-lift` hover elevation on the 4 feature cards.
  - Verified 100% SSR preservation of subheadline and all 9 testimonial cards, 0 ESLint errors, and clean production build.

- [x] Typography: Halenoir Compact Global UI Font & Weight-Collapse Compensation:
  - Copied `HalenoirCompact-Medium.otf` (126,216 bytes) to `public/fonts/HalenoirCompact-Medium.otf`.
  - Registered `@font-face` for `"Halenoir Compact"` with static weight range 100–900 resolving to Medium in `src/styles.css`.
  - Updated `--font-sans` token to `"Halenoir Compact", Inter, ui-sans-serif, system-ui, sans-serif`.
  - Preloaded `/fonts/HalenoirCompact-Medium.otf` in `src/routes/__root.tsx` for zero-FOUT first paint; removed Inter from Google Fonts `<link>` while preserving Playfair Display (and existing Tropikal preload).
  - Enforced Apple Design §15 weight-collapse compensations: added `+0.005em` letter-spacing relief to `body` reading copy, `+0.01em` tracking to `.text-xs` / `.text-sm` compact metadata, and enabled `font-variant-numeric: tabular-nums;` on tables.
  - Updated `docs/Design.md` with complete Font Usage Map, weight-collapse mapping decisions, and license-verification-pending note.

- [x] Tabbed Search Card Border Beam & Velocity Tuning:
  - Integrated Motiq `BorderBeamPanel` (`src/components/ui/border-beam-panel.tsx`) orbiting twin comets (Cyan `#22c7d9` and Coral `#ff6b5e`) around the tabbed search widget in `src/components/home/SearchWidget.tsx`.
  - Calibrated rotation speed down by over 60% (`idleSpeed: 22°/s`, `hoverSpeed: 48°/s`) with buttery spring damping (`stiffness: 18`, `damping: 12`) for serene, luxurious ambient orbital motion.

- [x] Phase 15 — Modernized Auth UI & Brand Emblem (21st.dev sign-in-card-2 Adaptation):
  - Created reusable 3D perspective auth card in `src/components/ui/sign-in-card-2.tsx` featuring traveling perimeter light beams, corner glow points, ambient backdrop blur, and the official Wanderlust brand medallion (`/Bookify_W_logo_transparent_2048px.png`).
  - Redesigned Sign In (`src/routes/login.tsx`) and Sign Up (`src/routes/register.tsx`) pages, maintaining full Supabase authentication, Zod validation, password toggles, and redirect query parameter handling.

- [x] Brand Identity & Theme Switch Modernization:
  - Upgraded theme toggle to interactive Uiverse `red-dingo-61` by JustCode14 with smooth cubic-bezier transitions, celestial sun/moon morphing, twinkling stars, animated clouds, and circular ripple view-transition.
  - Replaced header and footer brand marks with `Wanderlust_Nasalization_transparent_HD.png` in `src/components/layout/Navbar.tsx` and `src/components/layout/Footer.tsx`.
  - Updated browser tab favicon in `src/routes/__root.tsx` to `Bookify_W_logo_transparent_2048px.png` and regenerated `favicon.ico` and `favicon.png`.
  - Purged all legacy Lovable logos from `public/` and `assets.img/`.

- [x] Theme System Phases A–D (Dual Theme OKLCH, Dot Pattern, SSR Theme Script):
  - Defined full `.dark` OKLCH token dictionary in `src/styles.css` (`--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--accent`, `--accent-text`, `--muted`, `--border`, gradients, and black-based shadow tokens).
  - Selected Option A for dark primary: `--primary: oklch(0.92 0.015 85)` with `--primary-foreground: oklch(0.14 0.035 256)`.
  - Added dark glass material utilities (`.dark .glass-navbar`, `.dark .glass-drawer`, `.dark .glass-chrome`, `.dark .admin-sidebar`, `.dark .glass-card`, `.dark .glass-search`).
  - Injected zero-flash synchronous pre-paint script into `<head>` of `src/routes/__root.tsx`.
  - Ported MagicUI `AnimatedThemeToggler` into `src/components/vendored/AnimatedThemeToggler.tsx`.
  - Vendored pure SVG `DotPattern` on Contact page backdrop.
  - Hardened photographic hero overlays across detail routes to neutral black-based scrims.

### Core Foundation & Architecture Phases (Phases 1–14)

- [x] Backend foundation — Database migration to user project, RLS policies, tables, and seed data.
- [x] Phase 1 — Design system (tokens, Playfair Display + Inter, card/button/focus styling).
- [x] Phase 2 — Layout & Home (navbar with mobile drawer, footer, hero, featured sections, why-us, testimonials, CTA band).
- [x] Phase 3 — Destinations (listing with URL-synced search/filter/pagination, /destinations/$slug detail with hero, breadcrumb, and live tours/hotels/reviews).
- [x] Phase 4 — Authentication (client AuthProvider/useAuth hook, /login, /register, /forgot-password, auth-aware Navbar with avatar dropdown & mobile drawer, reusable beforeLoad auth guards).
- [x] Phase 5 — Tour Packages (listing with URL-synced search/filters/sorting/pagination, shared PackageCard, /packages/$slug detail with hero, itinerary accordion, includes/excludes list, sticky booking card, and destination detail integration).
- [x] Phase 6 — Hotels (listing with URL-synced search/destination/star-rating/price/sorting/pagination, shared HotelCard, /hotels/$id detail with hero, amenities with Lucide icons, live date-fns calculation with Zod validation, and top hotels on destination detail).
- [x] Phase 7 — Flights (search form with origin/destination/date/cabin-class/passengers URL-synced via validateSearch, shared FlightCard with direct flight indicators & seat availability/sold-out states, and Step 3 flight summary confirmation dialog with live passenger multiplier and BookingCTA).
- [x] Phase 8 — Itinerary Builder (auth-guarded account layout at `/account` with desktop sidebar / mobile horizontal tabs, itinerary listing `/account/itineraries` with TanStack Query on own rows, create dialog with zod validation, day-by-day editor `/account/itineraries/$id` with activity CRUD, optimistic reordering, print-friendly CSS view, and 404 on foreign itineraries).
- [x] Phase 9 — Reviews & Ratings (shared ReviewSection with aggregate score, star distribution breakdown, approved reviews stream, and authenticated review submission form with pending approval moderation note).
- [x] Phase 10 — Bookings & Checkout (client-rendered checkout flow at `/checkout` with URL `validateSearch`, 3-step navigation for trip summary, guest details form, and simulated credit card payment; retry-safe reference generator with format `WL-` + 6 unambiguous chars; confirmation receipt at `/checkout/confirmation` with print view).
- [x] Phase 11 — User Dashboard (activated all account sidebar tabs; Overview at `/account/overview` with metrics row, upcoming trip spotlight card with countdown badge, recent activity timeline, and quick actions; My Bookings at `/account/bookings` with Upcoming/Past/Cancelled tabs, booking cards, and 48h cancellation modal; My Reviews at `/account/reviews` with approved/pending reviews list; Profile & Settings at `/account/profile` with personal information, avatar photo upload to Supabase Storage avatars bucket with instant preview, and password update form).
- [x] Phase 12A — Admin Portal Foundation & User/Booking Operations (admin route guard with `requireAdminGuard` and 403 Forbidden state; responsive Admin Portal layout at `/admin` with management sidebar; Overview Dashboard at `/admin/overview` with real-time KPI metrics, revenue tracking, and recent bookings stream; Bookings Management at `/admin/bookings` with multi-facet search/filtering; Users & Roles Management at `/admin/users` with user search, admin role assignment/revocation with self-demotion lockout protection; documented database migration `004_user_roles_admin_policy.sql`).
- [x] Phase 12B — Content CRUD, Review Moderation & Customer Inbox (Destinations CRUD, Packages CRUD, Hotels CRUD, Flights Inventory CRUD, Review Moderation Queue, and Customer Inbox at `/admin/inbox`).
- [x] Phase 13 — Gallery Lightbox & Contact Form (SSR gallery at `/gallery` with destination URL filters, responsive Masonry grid, hover overlays with location tags, interactive fullscreen Lightbox modal; Contact Page at `/contact` with Zod-validated submission to `contact_messages` table).
- [x] Phase 14 — QA & Polish (A11y audits, SEO OpenGraph metadata, Supabase RLS security sweep table, end-to-end user & admin flow verification).
- [x] Content Expansion (Domestic India): 12 Indian destinations, 20 hotels, 9 tour packages, and 28 domestic flights across DEL, BOM, BLR, GOI, JAI, IXC, CCU, MAA, COK in migration `006_domestic_seed.sql`.
- [x] Home Page v2 Rebuild: Cinematic video background in `Hero.tsx` using local `/hero-loop.mp4` with Ken Burns slow-zoom fallback on `/hero-poster.jpg` and floating 4-tab glassmorphic `SearchWidget.tsx` (Flights, Hotels, Packages, Destinations).
