# Design — Wanderlust v2 (aligned to codebase tokens)

## Brand Feel

Warm, cinematic, aspirational. Large photography, generous whitespace, deep navy-teal
base with energetic coral accents. Light theme only (v1).

## Color Tokens — Tailwind v4 / OKLCH in src/styles.css (NEVER hard-code hex in components)

| Token                                            | OKLCH                 | ~Hex    | Usage                             |
| ------------------------------------------------ | --------------------- | ------- | --------------------------------- |
| primary                                          | oklch(0.3 0.062 250)  | #16324F | Navbar, footer, buttons, headings |
| secondary                                        | oklch(0.62 0.096 186) | #2A9D8F | Links, badges, secondary buttons  |
| accent                                           | oklch(0.676 0.146 40) | #E76F51 | CTAs, prices, ratings, highlights |
| background                                       | oklch(0.975 0.008 85) | #FAF7F2 | Page background                   |
| foreground / muted / border / card / destructive | see styles.css        | —       | Standard shadcn semantics         |

Status colors: confirmed = success green, pending = amber, cancelled/error = destructive.

## Typography

- Headings: Playfair Display (600/700) — loaded in __root.tsx
- Body/UI: Inter (400–700)
- Scale: H1 48/56 · H2 36 · H3 24 · Body 16 · Small 14 · Eyebrow 12 uppercase wide

## Components

- Buttons: rounded-full; primary navy fill, accent coral CTA; hover darken + lift
- Cards: rounded-xl, shadow-sm → hover shadow-md + translateY(-2px); image 16:10 top
- Badges/pills: rounded-full, teal-tinted
- Forms: rounded-lg inputs, 1px border, teal focus ring, zod errors in red below field
- Navbar: transparent over hero → solid navy on scroll; mobile drawer
- Footer: navy, 4 columns, white/60 text
- Hero: 21:9 image, navy gradient overlay, serif headline + search
- Ratings: coral stars + numeric average + review count

## Imagery & Accessibility

Unsplash landscape photography (hero 21:9, cards 16:10, gallery masonry). Lazy-load +
alt text mandatory. AA contrast, visible teal focus rings, 44px touch targets,
full keyboard navigation.

## v2 Addendum: Motion & Typography Rules (Apple Design Tiers 1 & 2)

Adopted from Apple Human Interface Guidelines and WWDC principles (*Designing Fluid Interfaces* & *The Details of UI Typography*). Pure-CSS polish rules.

### 1. Typography Hierarchy & Optical Tracking Scale (skill §15)
Tracking (letter-spacing) is size-specific and inversely proportional to font size. Optical sizing is enabled (`font-optical-sizing: auto;`).
- **H1 (Display / Hero)**: `letter-spacing: -0.025em`, `line-height: 1.05`, `font-weight: 700`
- **H2 (Section titles)**: `letter-spacing: -0.02em`, `line-height: 1.15`, `font-weight: 700`
- **H3 (Card & subset titles)**: `letter-spacing: -0.015em`, `line-height: 1.22`, `font-weight: 600`
- **H4 (Subheadings)**: `letter-spacing: -0.01em`, `line-height: 1.28`, `font-weight: 600`
- **H5/H6**: `letter-spacing: -0.005em`, `line-height: 1.35`, `font-weight: 600`
- **Body copy (Inter)**: `letter-spacing: 0`, `line-height: 1.6`, `text-rendering: optimizeLegibility`
- **Eyebrow / Small caps**: `letter-spacing: 0.12em`, `text-transform: uppercase`, `font-weight: 600`
- **Headings & .font-display**: Optical sizing automatically enabled site-wide in `src/styles.css`.

### 2. Press Response & Interactive Feedback (skill §1)
Immediate physical response on pointer-down (touch-down, not release).
- **Buttons (`<Button>`, `<button>`, `[role="button"]`)**: `:active { transform: scale(0.97); transition: transform 100ms ease-out; }`
- **Cards (`.card-lift`)**:
  - Rest: `box-shadow: var(--shadow-card);`
  - Hover: `transform: translateY(-2px); box-shadow: var(--shadow-card-hover);` with `200ms cubic-bezier(0.16, 1, 0.3, 1)`
  - Active / Pointer-down: `transform: scale(0.97); transition: transform 100ms ease-out, box-shadow 100ms ease-out;`
- **Focus Rings**: Standardized secondary teal (`outline: 2px solid var(--color-secondary); outline-offset: 2px;`).
- **Skeletons**: Smooth `transition-opacity duration-300 ease-out` cross-fading into live loaded content (`content-crossfade`).

### 3. Materials & Depth Hierarchy (skill §12)
Translucency acts as a functional structural layer rather than an opaque block.
- **Translucent Scrolled Navbar (`.glass-navbar`)**:
  - Background: `oklch(0.3 0.062 250 / 0.82)` (primary navy at 82% opacity)
  - Backdrop filter: `blur(16px) saturate(180%)`
  - Top/bottom edge: `1px solid oklch(1 0 0 / 0.10)` catching light
  - Shadow: `0 4px 20px -4px oklch(0.3 0.06 250 / 0.25)`
  - Mobile drawer (`.glass-drawer`): `oklch(0.3 0.062 250 / 0.94)` with `blur(20px) saturate(180%)`
- **Admin Structural Sidebar (`.admin-sidebar`)**:
  - Structural weight: `oklch(1 0 0 / 0.92)` with `blur(20px) saturate(160%)`, `1px solid var(--color-border)`, and subtle right elevation `1px 0 16px -4px oklch(0.3 0.06 250 / 0.06)`
- **Sticky Chrome & Header (`.glass-chrome`)**:
  - `oklch(1 0 0 / 0.85)` with `blur(16px) saturate(180%)` and soft border/shadow fade
- **Modal Scrims & Depth (`.modal-scrim`, Dialog, Alert Dialog, Sheet, Lightbox)**:
  - Dimming scrim: `bg-black/60 backdrop-blur-sm` (pushes background back in perceptual z-space)
  - Dialog content depth: `shadow-2xl ring-1 ring-black/5 rounded-xl`
  - Lightbox backdrop: `bg-black/90 backdrop-blur-md` with `ring-1 ring-white/10 shadow-2xl`
  - Rule: Never stack light translucent surfaces on other light translucent surfaces.

### 4. Accessibility & Fallbacks (skill §14)
- **`@media (prefers-reduced-motion: reduce)`**:
  - All transform scale effects, pulse loops, and translations are disabled (`transform: none !important`).
  - Animations replaced with zero-duration or gentle opacity cross-fades (`duration: 0.01ms !important`).
- **`@media (prefers-reduced-transparency: reduce)`**:
  - `backdrop-filter` is dropped (`none !important`).
  - Translucent surfaces fallback to solid backgrounds (`var(--color-primary)` for navbar/drawer, `var(--color-card)` for sidebar/chrome, `oklch(0 0 0 / 0.85)` for dialog scrims).
- **Contrast**: Contrast on translucent navbar exceeds 7:1 against light page content, satisfying WCAG AAA and AA requirements.

