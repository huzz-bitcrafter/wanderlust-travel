# Memory — Wanderlust

**Last updated:** 2026-09-16 | **Current phase:** Flight Booking Page Redesign — Complete | **Session #:** 16

## Completed

- [x] Flight Booking Page Redesign (/flights) — Sky Hero, Floating Search Bar & 2-Column Dashboard:
  - **Sky Hero & Floating Search Console (`src/components/flights/FlightHeroSearch.tsx`)**: Implemented full-bleed high-res aviation hero (`https://images.unsplash.com/photo-1436491865332-7a61a109cc05`) with multi-stage dark scrims, uppercase wide-tracked eyebrow (`FLY FURTHER, EXPLORE MORE`), Playfair Display headline (`Find Your Next Flight`), and subtitle. Positioned a glassmorphic floating search bar straddling the hero and page content with circular icon badges for Origin (From), Swap airport button, Destination (To), Departure date picker, Passengers counter (1–9), and gradient coral Search CTA (`--accent` with `.cta-shine`).
  - **2-Column Layout Architecture (`src/routes/flights.tsx`)**: Redesigned page below hero into a 2-column layout with a "Best Flights" headline and dynamic flight count metadata. Left column features the sticky `FlightFilterSidebar` with interactive Price Range slider, Airline checkboxes with dynamic counts, Stops checkboxes with counts, and Departure Time blocks with counts. Tablet and mobile viewports integrate a responsive sliding Sheet drawer with zero horizontal overflow.
  - **Premium Flight Card Anatomy (`src/components/shared/FlightCard.tsx`)**: Re-architected flight card matching the exact reference layout: left aviation photography thumbnail with top-left anchored deal badge (`⭐ Best Deal` or `⭐ Lowest Price` in maritime teal `--secondary`), Departure block with bold time and large airport code, Route journey indicator with flight number, duration, airline brand logo/tag, cabin class, and pulsing `🟢 Non Stop` badge, Arrival block, and price with `$${flight.price.toLocaleString()}` currency formatting and luminous coral `Book Now →` button with hover shine. Handled sold-out flight states with disabled badges.
  - **Helpers & Architecture Extraction (`src/lib/flight-utils.ts`)**: Extracted deterministic aviation thumbnail mapping, time/duration/price formatters, and airline brand metadata, eliminating component export warnings and ensuring fast refresh compliance.
  - **SSR & Checkout Preservation**: Preserved 100% server-side prefetching with TanStack Start route loaders and TanStack Query `useSuspenseQuery`. Retained URL search synchronization via `validateSearch`. Maintained the Phase 10 flight reservation summary modal and seamless link to `/checkout` passenger registration and payment flow.
  - **Quality Gates**: Verified `npm run lint` (0 errors) and `npm run build` (clean code 0 production build). Confirmed SSR HTTP 200 responses with full pre-rendered HTML payloads.

- [x] Admin Branding & Theme Switch, Home Search Calendar Icon Alignment, and Forgot Password AuthCard Overhaul:
  - **Admin Portal Branding (`src/routes/admin.tsx`)**: Replaced the static `'W'` text badge in the top-left sidebar brand header with the official high-resolution `/Bookify_W_logo_transparent_2048px.png` image. Integrated `AnimatedThemeToggler` (`id="theme-toggle-admin"`) in the admin sticky top header bar beside the live website action buttons, enabling instant light/dark mode switching across all viewports.
  - **Home Tabbed Search Date Calendar Icon Alignment (`src/components/home/SearchWidget.tsx`)**: Shifted the native calendar picker indicator inward away from the right rounded border (`rounded-2xl`) using `[&::-webkit-calendar-picker-indicator]:mr-2.5` and padding relief (`pr-2`), aligning it to the designated safe zone. Configured `[color-scheme:light] dark:[color-scheme:dark]` and indicator opacity states so the calendar icon is crisp and clearly visible in both dark and light modes without altering any other tabbed search elements.
  - **Forgot Password AuthCard Overhaul (`src/routes/forgot-password.tsx`)**: Upgraded the static card to the interactive 3D perspective `AuthCardWrapper` from `@/components/ui/sign-in-card-2` with 4 traveling perimeter light beams, ambient glowing border on hover, and the official `/Bookify_W_logo_transparent_2048px.png` brand medallion. Added interactive motion input focus zoom and replaced the submit button with `AnimatedSubmitButton` featuring loading spinner and transition sheen. Enhanced the confirmation dispatched view with a consistent card structure.
  - **Quality Gates**: Verified zero TypeScript / build regressions with successful `npm run build` production compilation. Verified SSR hydration across all modified routes.


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
  - Production build and multi-route SSR tests passed with 0 errors.
- [x] Tabbed Search Card Border Beam & Velocity Tuning:
  - Integrated Motiq `BorderBeamPanel` (`src/components/ui/border-beam-panel.tsx`) orbiting twin comets (Cyan `#22c7d9` and Coral `#ff6b5e`) around the tabbed search widget in `src/components/home/SearchWidget.tsx`.
  - Calibrated rotation speed down by over 60% (`idleSpeed: 22°/s`, `hoverSpeed: 48°/s`) with buttery spring damping (`stiffness: 18`, `damping: 12`) for serene, luxurious ambient orbital motion.
  - Preserved existing `glass-search` backdrop styling, airport swap interactions, tabs, and form controls intact.
  - Added micro-sheen animations to active tab triggers.
- [x] Phase 15 — Modernized Auth UI & Brand Emblem (21st.dev sign-in-card-2 Adaptation):
  - Created reusable 3D perspective auth card in `src/components/ui/sign-in-card-2.tsx` featuring traveling perimeter light beams, corner glow points, ambient backdrop blur, and the official Wanderlust brand medallion (`/Bookify_W_logo_transparent_2048px.png`).
  - Redesigned Sign In (`src/routes/login.tsx`) and Sign Up (`src/routes/register.tsx`) pages, maintaining full Supabase authentication, Zod validation, password toggles, and redirect query parameter handling.
- [x] Brand Identity & Theme Switch Modernization:
  - Upgraded theme toggle to interactive Uiverse `red-dingo-61` by JustCode14 with smooth cubic-bezier transitions, celestial sun/moon morphing, twinkling stars, animated clouds, and circular ripple view-transition.
  - Replaced header and footer brand marks with `Wanderlust_Nasalization_transparent_HD.png` in `src/components/layout/Navbar.tsx` and `src/components/layout/Footer.tsx`.
  - Updated browser tab favicon in `src/routes/__root.tsx` to `Bookify_W_logo_transparent_2048px.png` and regenerated `favicon.ico` and `favicon.png`.
  - Purged all legacy Lovable logos from `public/` and `assets.img/`.
- [x] Theme System Phase D — Contrast, Polish Effects & Dark Flow QA:
  - Verified `.cta-shine` and `.card-edge-light` in dark mode: added `.dark .cta-shine:hover` with black elevation (`oklch(0 0 0 / 0.5)`) and subtle luminous ivory rim reflection (`oklch(0.92 0.015 85 / 0.2)`).
  - Hardened photographic hero overlays across `destinations.$slug.tsx`, `packages.$slug.tsx`, and `hotels.$id.tsx` to use neutral `from-black/90 via-black/60 to-black/20` scrims and `bg-card` image fallbacks, preventing ivory overlay regressions and guaranteeing pristine AAA contrast on text/badges.
  - Verified full SSR health across root (`/`), `/contact`, `/destinations`, `/packages`, `/hotels`, and `/flights`.
  - Audited `prefers-reduced-motion` instantaneous toggle behavior and confirmed zero linter and zero build regressions.
- [x] Theme System Phase C — Dot Pattern Component & Ambient Background:
  - Vendored 21st.dev pure SVG `DotPattern` component into `src/components/vendored/DotPattern.tsx` with dynamic `useId()`, semantic `fill-foreground/15` styling, and zero third-party dependencies.
  - Mounted `DotPattern` exclusively on the Contact page backdrop in `src/routes/contact.tsx` with radial gradient transparency mask (`[mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]`).
  - Confirmed strict containment: DotPattern is strictly bounded to `/contact` and not scattered across other pages.
- [x] Theme System Phase B — Pre-paint SSR Theme Script & AnimatedThemeToggler:
  - Injected zero-flash synchronous pre-paint script into `<head>` of `src/routes/__root.tsx` evaluating `localStorage` theme preference with `prefers-color-scheme: dark` fallback.
  - Added `suppressHydrationWarning` to `<html>` to eliminate SSR/hydration class mismatch warnings.
  - Ported MagicUI `AnimatedThemeToggler` into `src/components/vendored/AnimatedThemeToggler.tsx` utilizing pure React 19 + native DOM APIs (`document.startViewTransition`, `document.documentElement.animate`, and `MutationObserver`).
  - Implemented graceful fallback for `prefers-reduced-motion` and legacy browsers (instant theme swap without circular clip-path transition).
  - Configured View Transitions CSS in `src/styles.css` ensuring seamless circular wipe expansion across viewport.
  - Mounted `AnimatedThemeToggler` in `src/components/layout/Navbar.tsx` across both desktop actions and mobile top header.
- [x] Theme System Phase A — Token Foundation & Dark Material Architecture:
  - Updated `@custom-variant dark (&:is(.dark, .dark *));` in `src/styles.css` ensuring utility styling applies to `.dark` root or any child.
  - Defined full `.dark` OKLCH token dictionary in `src/styles.css` (`--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--accent`, `--accent-text`, `--muted`, `--border`, gradients, and black-based shadow tokens).
  - Selected Option A for dark primary: `--primary: oklch(0.92 0.015 85)` (luminous moonlight ivory) with `--primary-foreground: oklch(0.14 0.035 256)` (deep midnight navy text, 15.72:1 AAA contrast).
  - Preserved deep midnight surfaces for structural sections via `.dark footer.bg-primary, .dark section.bg-primary { background-color: var(--color-card); border-color: var(--color-border); }`.
  - Added dark glass material utilities (`.dark .glass-navbar`, `.dark .glass-drawer`, `.dark .glass-chrome`, `.dark .admin-sidebar`, `.dark .glass-card`, `.dark .glass-search`).
  - Updated `docs/Design.md` with full dual-theme token table, shadow architecture, and WCAG AA/AAA compliance proofs.
  - Reversal: Replaced the legacy "light theme only" rule with a first-class dual-theme architecture.

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
  - Recreated `SearchWidget.tsx` and `ExploreIndia.tsx` with all 5 concurrent server query prefetches.
  - Staged and committed all related assets into git together.

- [x] UI Polish Phase 1 — Contrast Fix (WCAG AA):
  - Added `--accent-text` OKLCH token (`oklch(0.565 0.168 38)`, ~#c4471c) delivering 4.92:1 on card and 4.57:1 on background for small/normal accent text.
  - Replaced `text-accent` with `text-accent-text` across all small/normal coral text instances.
- [x] UI Polish Phase 2 — CTA Hover Shine:
  - Pure-CSS shine sweep + 1.5px elevation on primary buttons via `@utility cta-shine` with reduced-motion support.
- [x] UI Polish Phase 3 — Section Entrance Reveals:
  - Critically damped subtle motion reveals on section groups via `SectionReveal.tsx` with `useReducedMotion()` fallback.
- [x] UI Polish Phase 4 — Card Hover Edge Light:
  - Native 1px perimeter border gradient highlight on `DestinationCard`, `PackageCard`, and `HotelCard` via `@utility card-edge-light`.
- [x] UI Polish Phase 5 — Gallery 3D Cylinder Carousel:
  - Infinite CSS 3D Cylinder Carousel ported from Vengeance UI (`src/components/vendored/CylinderCarousel.tsx`) featuring 16 local placeholder captures (`src/data/placeholder-gallery.ts`), continuous auto-spin, interactive drag/step controls, fullscreen Lightbox modal, and enlarged card sizing (`cardWidth: 210px`, `stageHeight: h-[420px] sm:h-[480px]`).
- [x] UI Polish Phase 6 — Final Audit & Regression:
  - Verified 100% SSR route health across all public, catalog, discovery, auth, account, and admin endpoints with status 200 and complete server-rendered payloads.
  - Clean ESLint run (`0 errors, 10 warnings`).
  - Clean Vite/Nitro production build (`npm run build` exited with code 0).
  - Verified WCAG AA contrast compliance across all 7 mandatory token pairs.
  - Zero-defect sign-off on all functional, responsive, and animated application surfaces.

## In Progress

- None. All phases complete and signed off.

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
- Flights/hotels seeded in the database; no external APIs. Payments simulated. Dual theme supported (Light & Dark) via pure CSS OKLCH tokens and View Transitions API; zero flash-of-wrong-theme via `<head>` SSR script. No external theme libraries.

## Schema Changes (keep in sync with Architecture.md §5)

- Added `tour_packages.itinerary` (jsonb), `bookings.reference`, `bookings.end_date`, `reviews.author_name`.
- Added `user_roles` table + `app_role` enum; profiles has no role column.
- Added `docs/migrations/001_auth_triggers.sql` documenting the user profile and role initialization trigger.
- Added `docs/migrations/004_user_roles_admin_policy.sql` documenting user_roles admin CRUD policy.

## Known Bugs / TODO

- None. All functional bugs and assets resolved.
- Gallery updated with Infinite CSS 3D Cylinder Interactive Carousel ported from Vengeance UI, replacing the Collage/Editorial view. All 16 local placeholder photography assets are curated in `src/data/placeholder-gallery.ts` and copied to `public/images/assets/`, fully integrated with fullscreen Lightbox and drag/swipe/keyboard navigation.

## Next Steps

- Final report to user.

## Reminders for the AI

- Read PRD.md, Architecture.md, Design.md, Rules.md before coding.
- Do not regenerate completed phases. Only touch what the current phase requires.
- Update this file at the end of every phase.
