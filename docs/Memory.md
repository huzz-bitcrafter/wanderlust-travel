# Memory — Wanderlust

**Last updated:** 2026-09-18 | **Current phase:** Pre-Deployment Audit | **Target:** Production (Vercel · Nitro · Supabase)

## 1. Project Overview & Architecture

Wanderlust is a full-stack travel booking & trip planning platform built with:
- **Framework**: TanStack Start (React 19 + SSR) with Vite and Nitro runtime.
- **Routing**: TanStack Router (file-based in `src/routes/`, strict URL search synchronization via `validateSearch`).
- **Data Fetching**: TanStack Query v5 with `useSuspenseQuery` and route loader prefetching via `createServerFn`.
- **Database & Auth**: Supabase PostgreSQL with strict Row Level Security (RLS) and security-definer role checks (`is_admin()`, `has_role()`). Public catalog queries read server-side via `src/lib/supabase-public.server.ts`; mutations and auth run client-side via `src/integrations/supabase/client.ts`.
- **Styling**: Tailwind CSS v4 using pure OKLCH design tokens in `src/styles.css` (dual-theme light/dark, zero raw hex).
- **UI System**: Radix UI / shadcn/ui primitives, Lucide icons, and Sonner notifications.
- **Archive Reference**: Historical milestone logs from earlier phases are archived in [`docs/archive/memory-log.md`](archive/memory-log.md).

## 2. Design-Token & Theming Decisions

- **Dual-Theme OKLCH Foundation**: Light theme features editorial warm ivory canvas (`oklch(0.975 0.008 85)`) with midnight navy primary (`oklch(0.24 0.066 256)`). Dark theme uses deep midnight void (`oklch(0.14 0.035 256)`) with luminous moonlight ivory primary (`oklch(0.92 0.015 85)`).
- **Accent Tokens**: Luminous coral (`oklch(0.680 0.168 38)`) for action CTAs, paired with high-contrast `--accent-text` (`oklch(0.565 0.168 38)`) delivering WCAG AA compliance (≥4.5:1) for text.
- **Zero-Flash SSR Theme**: Synchronous inline script in `<head>` of `__root.tsx` prevents flash of unstyled theme; theme toggler uses native View Transitions API with circular ripple effect.
- **Surface Hierarchy**: Multi-layer glass materials (`.glass-navbar`, `.glass-search`, `.glass-card`) with calibrated spring animations and hardware-accelerated transforms.

## 3. Recent Milestones (Last 5 Sprints)

- **3D Photo Cylinder Showcase Polish (`/gallery`)**:
  Enlarged 3D stage height (`h-[70vh] sm:h-[76vh]`) with tuned perspective geometry (`cardWidth={340}`). Rendered card height increased ~2.5x to eliminate letterboxing. Replaced separate controls with a floating glass overlay row (`backdrop-blur-md`). Upgraded Unsplash cylinder images to `w=1000&q=85`.
- **Real Airline Logo Marks on Flight Cards (`/flights`)**:
  Audited all 23 distinct airline carriers in database; curated self-hosted PNG brand marks in `public/airlines/{CODE}.png` (zero hotlinking). Built normalized resolver `getAirlineLogo()` in `src/lib/airline-logos.ts`. Replaced monogram avatar with branded logo chip on white backdrop with fallback.
- **Flight Card UX Refinement (`/flights`)**:
  Purged decorative destination and aviation photograph thumbnails from results feed (0 `<img>` elements in list). Re-architected desktop/tablet cards into a 5-zone airline-anchored data row (Airline Identity, Departure, Journey Route with Non-Stop badge, Arrival, Fare & CTA). Synchronized loading skeletons.
- **Visual Parity, Search Console Overhaul & Page Heros**:
  Created universal tokenized `<PageHeroBanner />` with multi-stage gradient scrims across `/destinations`, `/packages`, `/hotels`, `/gallery`, and `/contact`. Re-architected 12-column flight search console grid to eliminate label truncation and CTA overlap.
- **Admin Branding & Theme Switch, Home Search Icon Alignment, and Forgot Password Overhaul**:
  Integrated official high-resolution brand medallion in Admin sidebar header with `AnimatedThemeToggler`. Aligned home tabbed search calendar picker indicator. Upgraded forgot-password view to interactive 3D perspective `AuthCardWrapper`.

## 4. Open Debt & Pre-Deployment Notes

1. **Unsplash Hero Placeholders (`src/config/hero-registry.ts`)**: 6 catalog page banners rely on external Unsplash URLs (`photo-1436491865332-7a61a109cc05`, `photo-1570077188670-e3a8d69ac5ff`, etc.). Scheduled for self-hosted WebP/AVIF asset migration in Phase 2.
2. **2048px Brand Medallion (`public/Bookify_W_logo_transparent_2048px.png`)**: High-res logo file is 700.6 KB. Needs optimization to appropriately sized 256px/512px WebP variants.
3. **Typography Payload**: Local hero eyebrow font `TheCrowInlineGrunge.otf` (717.7 KB) exceeds optimal font budget; recommended for subsetting or WOFF2 compression in follow-up asset pass.
4. **Mockup Reference File in Public**: `public/flight-mockup-reference.png` (1.46 MB) is a static design reference sitting in the public directory; should be moved to docs or deleted.
