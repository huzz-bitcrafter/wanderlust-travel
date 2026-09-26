<div align="center">

  <img src="public/Wanderlust_Nasalization_transparent_HD.png" alt="Wanderlust Logo" width="240"/>

### Full-Stack Travel Booking & Trip Planning Platform

_Cinematic travel discovery — destinations, tours, hotels, flights, itineraries, and a complete admin panel — in one seamless experience._

[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![TanStack Start](https://img.shields.io/badge/TanStack_Start-SSR%20%2B%20Nitro-3B82F6?style=for-the-badge&logo=tanstack&logoColor=white)](https://tanstack.com/start)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4%20·%20OKLCH-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Radix%20Primitives-18181B?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)

[![Live Demo](https://img.shields.io/badge/LIVE_DEMO-Visit_Site-EC6C44?style=for-the-badge)](https://your-deployed-url.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](LICENSE)

</div>

---

<div align="center">
  <img src="docs/screenshots/home-light.png" width="49%" alt="Home — Light"/>
  <img src="docs/screenshots/home-dark.png" width="49%" alt="Home — Dark"/>
  <br/>
  <em>Light & Dark themes — full-bleed video hero, glassmorphic tabbed search, animated theme toggle (View Transitions API)</em>
</div>

---

## ✨ What It Does

Wanderlust is a complete, production-deployed travel booking and trip-planning platform covering the entire customer journey — discover → plan → book → manage. It serves 24 destinations (international + India), tour packages, hotels, and live flight search, backed by real bookings, moderated reviews, and a role-gated admin panel.

## 🧭 Feature Walkthrough

| Capability | What you can actually do |
| --- | --- |
| 🔐 User Registration &amp; Login | Sign up with email + password — a verification link is emailed on signup, and accounts must verify before first login ("Please verify your email before logging in"). Or sign in with Google in one click. Password recovery via emailed reset links. |
| 🗺️ Destination Listings | SSR-rendered catalog of 24 destinations with regional groupings, hero imagery, and rich detail pages linking to related packages and hotels. |
| 🔎 Search &amp; Filter | Live search + filters on every catalog (destinations, packages, hotels, flights) with URL-synced state — filtered views are shareable, bookmarkable links. |
| 🧳 Tour Package Details | Full detail pages per package: itinerary outline, inclusions/exclusions, duration, pricing, and availability — booking launches directly from here. |
| 🏨 Hotel Booking | Search hotels by city, date, and guests; browse rooms and amenities; book through a multi-step checkout with live price math and a booking reference. |
| ✈️ Flight Booking | Search real flight data by origin, destination, date, and passengers; filter by airline, stops, price, and departure window; compare carrier, duration, and fare at a glance; book in the same checkout flow (payment step is clearly labeled simulated demo — no real charges). |
| 📅 Travel Itinerary | Registered users build and manage day-by-day itineraries for their trips from the user dashboard. |
| 🖼️ Photo Gallery | Editorial travel photography with an interactive 3D cylinder showcase (auto-spin, drag-to-rotate) and a keyboard-navigable lightbox. |
| ⭐ Reviews &amp; Ratings | Authenticated users post star ratings + written reviews on destinations, packages, and hotels. Reviews become publicly visible after moderation; listings show star-distribution summaries. |
| ✉️ Contact Form | Validated contact form — submissions land in the database and the admin inbox. |
| 📱 Responsive Design | Fully responsive from 375px mobile to ultrawide desktop, with measured light/dark themes (WCAG AA/AAA contrast) and prefers-reduced-motion respected. |
| ⚙️ Admin Panel | Role-gated dashboard: manage users &amp; roles, bookings, tour packages, hotels, flights, review moderation, and contact messages, plus real-time stats and 30-day booking charts. |

## 🔐 Roles &amp; Access — how it works

Access runs in three tiers, and authorization is enforced at the database layer (PostgreSQL Row Level Security) — not just hidden in the UI:

| Role | Can do | How it's obtained |
| --- | --- | --- |
| Visitor | Browse everything public: destinations, packages, hotels, flights, gallery, approved reviews | Just open the site — no account needed |
| Member | Everything above plus: book tours/hotels/flights, build itineraries, write reviews, manage profile &amp; avatar | Register + verify email, or Continue with Google |
| Admin | Everything above plus the full admin panel (users, bookings, catalog CRUD, moderation, stats) | Granted by the project owner via the user_roles table in Supabase — role escalation through the app itself is impossible by design |

Users can only read and modify their own bookings, itineraries, and reviews — cross-account access is blocked by RLS at the query level (verified with cross-account tests). Catalog data is publicly readable but writable only by admins.

## 🚀 Try it in 5 steps

1. Browse the home page and any catalog — no account required.
2. Create an account (check your inbox for the verification link) or Continue with Google.
3. Search a flight (e.g., DEL → BLR), apply filters, and complete a booking through checkout.
4. Open My Trips in the dashboard — your bookings, itineraries, and review tools live there.
5. Toggle dark/light mode and resize the window — the entire experience adapts.

## 🏗️ Architecture

flowchart TD

subgraph group_discovery["Travel discovery"]
  node_home["Home discovery<br/>[index.tsx]"]
  node_search["Search widget<br/>[SearchWidget.tsx]"]
  node_catalog["Catalog pages<br/>[destinations.tsx]"]
  node_destination["Destination detail"]
  node_packages["Package catalog<br/>[packages.tsx]"]
  node_package_detail["Package details<br/>[packages.$slug.tsx]"]
  node_hotels["Hotel search<br/>[hotels.tsx]"]
  node_hotel_detail["Hotel details<br/>[hotels.$id.tsx]"]
  node_flights["Flight search<br/>[flights.tsx]"]
  node_gallery["Photo gallery<br/>[gallery.tsx]"]
  node_catalog_api["Catalog functions"]
end

subgraph group_booking["Booking and trips"]
  node_checkout["Checkout<br/>[checkout.tsx]"]
  node_confirmation["Booking confirmation<br/>[confirmation.tsx]"]
  node_account["Trip dashboard<br/>[index.tsx]"]
  node_itineraries["Itinerary management<br/>[itineraries.tsx]"]
end

subgraph group_identity["Accounts and feedback"]
  node_auth["Registration and login<br/>[register.tsx]"]
  node_auth_provider{{"Supabase Auth"}}
  node_reviews["Review experience<br/>[ReviewSection.tsx]"]
  node_review_api["Review functions"]
end

subgraph group_operations["Platform operations"]
  node_contact["Contact form<br/>[contact.tsx]"]
  node_admin["Admin workspace<br/>[index.tsx]"]
  node_admin_reviews["Review moderation<br/>[reviews.tsx]"]
  node_supabase_client["Public Supabase client<br/>[client.ts]"]
  node_supabase_server["Public server client"]
  node_database[("Supabase database")]
end

node_traveler(("Traveler"))

node_traveler -->|"browses"| node_home
node_home -->|"loads featured data"| node_catalog_api
node_home -->|"offers search"| node_search
node_search -->|"opens results"| node_catalog
node_search -->|"opens results"| node_packages
node_search -->|"opens results"| node_hotels
node_search -->|"opens results"| node_flights
node_catalog -->|"opens details"| node_destination
node_packages -->|"opens details"| node_package_detail
node_hotels -->|"opens details"| node_hotel_detail
node_traveler -->|"views"| node_gallery
node_traveler -->|"books"| node_checkout
node_package_detail -->|"starts booking"| node_checkout
node_hotel_detail -->|"starts booking"| node_checkout
node_flights -->|"starts booking"| node_checkout
node_checkout -->|"confirms booking"| node_confirmation
node_traveler -->|"registers or signs in"| node_auth
node_auth -->|"authenticates"| node_auth_provider
node_traveler -->|"manages trips"| node_account
node_account -->|"manages itineraries"| node_itineraries
node_destination -->|"shows reviews"| node_reviews
node_package_detail -->|"shows reviews"| node_reviews
node_hotel_detail -->|"shows reviews"| node_reviews
node_reviews -->|"loads reviews and ratings"| node_review_api
node_review_api -->|"queries public data"| node_supabase_server
node_supabase_server -->|"reads"| node_database
node_reviews -->|"submits reviews"| node_supabase_client
node_supabase_client -->|"reads and writes"| node_database
node_traveler -->|"sends inquiry"| node_contact
node_admin -->|"moderates reviews"| node_admin_reviews
node_admin_reviews -->|"deletes reviews"| node_supabase_client
node_admin -->|"manages platform data"| node_supabase_client
node_catalog_api -->|"loads catalog data"| node_supabase_server

click node_home "https://github.com/huzz-bitcrafter/wanderlust-travel/blob/main/src/routes/index.tsx"
click node_search "https://github.com/huzz-bitcrafter/wanderlust-travel/blob/main/src/components/home/SearchWidget.tsx"
click node_catalog "https://github.com/huzz-bitcrafter/wanderlust-travel/blob/main/src/routes/destinations.tsx"
click node_destination "https://github.com/huzz-bitcrafter/wanderlust-travel/blob/main/src/routes/destinations.%24slug.tsx"
click node_packages "https://github.com/huzz-bitcrafter/wanderlust-travel/blob/main/src/routes/packages.tsx"
click node_package_detail "https://github.com/huzz-bitcrafter/wanderlust-travel/blob/main/src/routes/packages.%24slug.tsx"
click node_hotels "https://github.com/huzz-bitcrafter/wanderlust-travel/blob/main/src/routes/hotels.tsx"
click node_hotel_detail "https://github.com/huzz-bitcrafter/wanderlust-travel/blob/main/src/routes/hotels.%24id.tsx"
click node_flights "https://github.com/huzz-bitcrafter/wanderlust-travel/blob/main/src/routes/flights.tsx"
click node_gallery "https://github.com/huzz-bitcrafter/wanderlust-travel/blob/main/src/routes/gallery.tsx"
click node_checkout "https://github.com/huzz-bitcrafter/wanderlust-travel/blob/main/src/routes/checkout.tsx"
click node_confirmation "https://github.com/huzz-bitcrafter/wanderlust-travel/blob/main/src/routes/checkout/confirmation.tsx"
click node_account "https://github.com/huzz-bitcrafter/wanderlust-travel/blob/main/src/routes/account/index.tsx"
click node_itineraries "https://github.com/huzz-bitcrafter/wanderlust-travel/blob/main/src/routes/account/itineraries.tsx"
click node_auth "https://github.com/huzz-bitcrafter/wanderlust-travel/blob/main/src/routes/register.tsx"
click node_reviews "https://github.com/huzz-bitcrafter/wanderlust-travel/blob/main/src/components/shared/ReviewSection.tsx"
click node_review_api "https://github.com/huzz-bitcrafter/wanderlust-travel/blob/main/src/lib/review.functions.ts"
click node_contact "https://github.com/huzz-bitcrafter/wanderlust-travel/blob/main/src/routes/contact.tsx"
click node_admin "https://github.com/huzz-bitcrafter/wanderlust-travel/blob/main/src/routes/admin/index.tsx"
click node_admin_reviews "https://github.com/huzz-bitcrafter/wanderlust-travel/blob/main/src/routes/admin/reviews.tsx"
click node_catalog_api "https://github.com/huzz-bitcrafter/wanderlust-travel/blob/main/src/lib/catalog.functions.ts"
click node_supabase_client "https://github.com/huzz-bitcrafter/wanderlust-travel/blob/main/src/integrations/supabase/client.ts"
click node_supabase_server "https://github.com/huzz-bitcrafter/wanderlust-travel/blob/main/src/lib/supabase-public.server.ts"

classDef toneNeutral fill:#f8fafc,stroke:#334155,stroke-width:1.5px,color:#0f172a
classDef toneBlue fill:#dbeafe,stroke:#2563eb,stroke-width:1.5px,color:#172554
classDef toneAmber fill:#fef3c7,stroke:#d97706,stroke-width:1.5px,color:#78350f
classDef toneMint fill:#dcfce7,stroke:#16a34a,stroke-width:1.5px,color:#14532d
classDef toneRose fill:#ffe4e6,stroke:#e11d48,stroke-width:1.5px,color:#881337
classDef toneIndigo fill:#e0e7ff,stroke:#4f46e5,stroke-width:1.5px,color:#312e81
classDef toneTeal fill:#ccfbf1,stroke:#0f766e,stroke-width:1.5px,color:#134e4a
class node_home,node_search,node_catalog,node_destination,node_packages,node_package_detail,node_hotels,node_hotel_detail,node_flights,node_gallery,node_catalog_api toneBlue
class node_checkout,node_confirmation,node_account,node_itineraries toneAmber
class node_auth,node_auth_provider,node_reviews,node_review_api toneMint
class node_contact,node_admin,node_admin_reviews,node_supabase_client,node_supabase_server,node_database toneRose
class node_traveler toneIndigo

**Key engineering decisions:**

- 🖥️ **SSR-first for public pages** — catalog data is prefetched in route loaders via `ensureQueryData` + `useSuspenseQuery`, so the initial HTML ships with content (SEO + zero layout shift[...]
- 🔐 **Security at the database layer** — every table is RLS-protected with role checks via PostgreSQL security-definer functions (`is_admin()`, `has_role()`). Client-side guards are UX only; [...]
- 🎨 **Design-token discipline** — the entire UI (including dual light/dark themes and glass materials) is driven by centralized **OKLCH CSS custom properties**; zero hard-coded colors in comp[...]
- 🎬 **Apple-style motion system** — critically-damped springs (`motion`), View Transitions API theme reveal, staggered scroll reveals — all with `prefers-reduced-motion` fallbacks.

## 🛠️ Tech Stack

| Layer          | Technology                                   | Why                                                           |
| -------------- | -------------------------------------------- | ------------------------------------------------------------- |
| Framework      | **TanStack Start** (React 19 + Vite + Nitro) | SSR, streaming, type-safe RPC                                 |
| Routing        | **TanStack Router**                          | File-based, fully typed search params (shareable filter URLs) |
| Data           | **TanStack Query v5**                        | Suspense-ready caching, optimistic mutations                  |
| Styling        | **Tailwind CSS v4**                          | OKLCH token system, `@theme` design variables                 |
| UI             | **shadcn/ui + Radix**                        | Accessible primitives (40+ components)                        |
| Backend        | **Supabase**                                 | Postgres, Row Level Security, Auth, Storage                   |
| Validation     | **Zod** + react-hook-form                    | Every form, both client & flow gates                          |
| Animation      | **motion** (motion.dev)                      | Interruptible, velocity-aware springs                         |
| Icons / Toasts | **lucide-react** / **sonner**                | —                                                             |

## 🗄️ Database (12 tables, RLS-enforced)

`profiles` · `user_roles` · `destinations` · `tour_packages` · `hotels` · `flights` · `bookings` · `itineraries` · `itinerary_items` · `reviews` · `gallery_images` · `contact_messages`

Every table enforces authorization at the row level — e.g. users CRUD only their own bookings/itineraries/reviews, catalog reads are public but writes are admin-only, and reviews are publicly vi[...]

## 📁 Project Structure

```
wanderlust-codebase/
├── src/
│   ├── routes/            # File-based routes (public SSR / client /account /admin)
│   ├── components/
│   │   ├── ui/            # shadcn/Radix primitives
│   │   ├── home/          # Hero, SearchWidget, sections
│   │   ├── shared/        # Cards, ReviewSection, BookingCTA...
│   │   ├── vendored/      # Ported registry components (toggled, adapted)
│   │   └── admin/         # DataTable, EntityForm, dashboards
│   ├── lib/               # Server functions (SSR data layer), guards, utils
│   ├── hooks/             # use-auth (session/role context)
│   │   └── integrations/      # Supabase clients + generated DB types
├── docs/                  # PRD, architecture, design system, memory
└── drizzle/               # Schema & migrations
```

## 🚀 Run It Locally

```bash
git clone https://github.com/huzz-bitcrafter/wanderlust-travel.git
cd "wanderlust-travel/Travel Booking Site/wanderlust-codebase"

npm install

# Configure your own Supabase project
cp .env.example .env    # add SUPABASE_URL + SUPABASE_PUBLISHABLE_KEY

npm run dev             # → http://localhost:8080
```

> The schema lives in `drizzle/migrations/` — run it in your Supabase SQL Editor to stand up all tables, RLS policies, and the signup trigger.

## 🧪 Verified

- ✅ TypeScript strict — zero `any`
- ✅ ESLint clean, production build green
- ✅ WCAG 2.1 AA/AAA contrast — both themes (measured, not assumed)
- ✅ SSR content verified in raw HTML across public routes
- ✅ RLS cross-account access tests (user A cannot read user B's data — enforced at DB level)
- ✅ `prefers-reduced-motion` respected by every effect

## 🤝 Credits

Built as a solo full-stack project with an AI-assisted, spec-driven workflow — 14 documented phases, full PRD/architecture/design-system docs in [`docs/`](docs/), and a git history that tells t[...]

<div align="center">

**[huzz-bitcrafter](https://github.com/huzz-bitcrafter)**

</div>
