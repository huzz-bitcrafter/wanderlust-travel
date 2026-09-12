# Design — Wanderlust v2 (aligned to codebase tokens)

## Brand Feel

Warm, cinematic, aspirational. Large photography, generous whitespace, deep navy-teal
base with energetic coral accents. Dual-theme system (Light & Dark) — editorial warm ivory luxury in light mode; deep cinematic midnight navy surfaces in dark mode.

## Color Tokens — Tailwind v4 / OKLCH in src/styles.css (NEVER hard-code hex in components)

### Dual-Theme Token Architecture

#### Light Mode Palette (Direction A: Premium Travel Editorial + Restrained Liquid-Glass Depth)

| Token | OKLCH | ~Hex | Semantic Purpose | Usage Guidance | Contrast Result |
|---|---|---|---|---|---|
| `primary` | `oklch(0.24 0.066 256)` | #071f3e | Midnight Navy — cinematic depth, anchor | Navbar, footer, primary buttons, major headings | **16.50:1** vs white (AAA), **15.35:1** vs bg (AAA) |
| `primary-foreground` | `oklch(1 0 0)` | #ffffff | Crisp Pure White | Text on primary/midnight surfaces | **16.50:1** vs primary (AAA) |
| `accent` | `oklch(0.680 0.168 38)` | #ec6c44 | Luminous Coral — emotional warmth & action | Primary CTAs, booking actions, large prices, star ratings | **3.08:1** vs white/card (AA Large/UI) |
| `accent-foreground` | `oklch(1 0 0)` | #ffffff | Crisp Pure White | Button text on accent CTAs | **3.08:1** vs accent (AA Large/UI) |
| `accent-text` | `oklch(0.565 0.168 38)` | #c4471c | Deep Coral Text — WCAG AA compliant small text | Small/normal accent text, metadata warnings, links on light surfaces | **4.92:1** vs white/card (AA Normal), **4.57:1** vs bg (AA Normal) |
| `secondary` | `oklch(0.62 0.096 186)` | #2d998f | Restrained Travel Teal | Links, subtle badges, secondary tags, focus rings | **3.67:1** vs card (AA UI) |
| `secondary-foreground` | `oklch(1 0 0)` | #ffffff | Crisp Pure White | Text on solid secondary surfaces | **3.67:1** vs secondary |
| `background` | `oklch(0.975 0.008 85)` | #f9f6f1 | Warm Ivory / Off-White | Editorial page canvas, comfortable luxury | **13.96:1** vs foreground (AAA) |
| `foreground` | `oklch(0.27 0.019 230)` | #1d282e | Deep Ink Neutral | Body text, titles on light backgrounds | **13.96:1** vs background (AAA) |
| `card` | `oklch(1 0 0)` | #ffffff | Crisp White Surface | Destination cards, hotel cards, modal bodies | **1.08:1** separation vs background |
| `card-foreground` | `oklch(0.27 0.019 230)` | #1d282e | Deep Ink Neutral | Content text within cards | **14.50:1** vs card (AAA) |
| `muted` | `oklch(0.938 0.012 80)` | #efeae2 | Soft Sand Neutral | Subdued chips, disabled tabs, divider fills | — |
| `muted-foreground` | `oklch(0.51 0.019 225)` | #5b696e | Slate Editorial Neutral | Subtitles, metadata, reviews counts, captions | **5.31:1** vs bg (AA), **5.71:1** vs card (AA) |
| `border` | `oklch(0.898 0.014 85)` | #e2ddd3 | Subtle Warm Edge | 1px material separator | Subtle boundary |

#### Dark Mode Palette (.dark Token Block — Deep Midnight Navy Architecture)

| Token | OKLCH | ~Hex | Semantic Purpose | Usage Guidance | Contrast Result |
|---|---|---|---|---|---|
| `background` | `oklch(0.14 0.035 256)` | #020917 | Deep Midnight Abyss — void canvas | Dark page body, canvas behind cards | **17.73:1** vs foreground (AAA) |
| `foreground` | `oklch(0.96 0.008 85)` | #f4f1ec | Moonlight Ivory — high legibility | Body text, headings on dark backgrounds | **17.73:1** vs bg (AAA), **16.45:1** vs card (AAA) |
| `card` | `oklch(0.19 0.040 256)` | #071425 | Elevated Midnight Surface | Destination cards, hotel cards, dialog bodies | **1.08:1** separation vs bg + 1px border |
| `card-foreground` | `oklch(0.96 0.008 85)` | #f4f1ec | Moonlight Ivory | Content text within cards | **16.45:1** vs card (AAA) |
| `primary` | `oklch(0.92 0.015 85)` | #e9e4da | Luminous Moonlight Ivory CTA | Buttons, active filter pills, search action | **15.72:1** vs bg (AAA), **15.72:1** vs primary-fg (AAA) |
| `primary-foreground` | `oklch(0.14 0.035 256)` | #020917 | Deep Midnight Navy Text | Text on solid primary buttons/pills | **15.72:1** vs primary (AAA) |
| `accent` | `oklch(0.70 0.165 38)` | #ee724d | Luminous Coral CTA | Booking action buttons, large prices, star ratings | **6.98:1** vs bg (AAA) |
| `accent-foreground` | `oklch(0.14 0.035 256)` | #020917 | Deep Midnight Text | Text on solid accent CTAs | **6.98:1** vs accent (AAA) |
| `accent-text` | `oklch(0.74 0.160 42)` | #f57f58 | Luminous Coral Text — WCAG AA/AAA compliant | Small/normal accent text, badges, metadata | **8.15:1** vs bg (AAA), **7.56:1** vs card (AAA) |
| `secondary` | `oklch(0.68 0.110 186)` | #3db3a6 | Luminous Travel Teal | Links, focus rings, subtle badges | **7.28:1** vs bg (AAA) |
| `secondary-foreground` | `oklch(0.14 0.035 256)` | #020917 | Deep Midnight Text | Text on solid secondary surfaces | **7.28:1** vs secondary (AAA) |
| `muted` | `oklch(0.22 0.030 256)` | #0f1c2d | Subdued Midnight Neutral | Subdued chips, unselected tabs | — |
| `muted-foreground` | `oklch(0.70 0.025 220)` | #93a5b1 | Slate Editorial Neutral | Subtitles, metadata, reviews counts, captions | **7.52:1** vs bg (AAA), **6.97:1** vs card (AA) |
| `border` | `oklch(0.28 0.035 256)` | #1c2b42 | Crisp Midnight Edge | 1px material separator | Subtle boundary |

Status colors (dark): confirmed = success green (`oklch(0.68 0.140 158)`), pending = amber (`oklch(0.78 0.135 72)`), cancelled/error = destructive (`oklch(0.65 0.190 25)`).

### Gradient System

| Gradient Token | Light Value | Dark Value | Intended Usage |
|---|---|---|---|
| `--gradient-primary` | `linear-gradient(135deg, oklch(0.24 0.066 256) 0%, oklch(0.32 0.070 200) 100%)` | `linear-gradient(135deg, oklch(0.18 0.045 256) 0%, oklch(0.24 0.055 200) 100%)` | Hero atmospheric overlays, admin sidebar depth |
| `--gradient-accent` | `linear-gradient(135deg, oklch(0.680 0.168 38) 0%, oklch(0.720 0.150 62) 100%)` | `linear-gradient(135deg, oklch(0.70 0.165 38) 0%, oklch(0.74 0.155 62) 100%)` | Primary CTA highlights, premium badges |
| `--gradient-card-edge` | `linear-gradient(135deg, oklch(0.68 0.168 38 / 0.32) 0%, oklch(0.62 0.096 186 / 0.28) 100%)` | `linear-gradient(135deg, oklch(0.70 0.165 38 / 0.40) 0%, oklch(0.68 0.110 186 / 0.35) 100%)` | Card perimeter highlight on hover |

#### Gradient Rules:
- **Natural Depth, Not Decorative Rainbows**: Gradients must evoke atmospheric depth and natural lighting.
- **Dominance Preservation**: In `--gradient-primary`, midnight navy must anchor the identity; teal is an atmospheric wash. In `--gradient-accent`, coral remains the action color; amber adds warm sunlight energy.
- **Never Overuse**: Never layer accent gradients over large areas; keep them focused on points of action and delight.

### Glass / Material Depth & Surface Hierarchy
1. **Layer 1 (Page Canvas / Photography)**: `var(--color-background)` or high-res landscape imagery.
2. **Layer 2 (Atmospheric Wash)**: Gradient overlays (`--gradient-primary` with low opacity) pushing background back in perceptual z-space.
3. **Layer 3 (Functional Surface)**: Translucent materials (`.glass-navbar`, `.glass-chrome`, `.admin-sidebar`, `.glass-search`):
   - Light Mode: `oklch(0.24 0.066 256 / 0.82)` navbar; `rgba(255, 255, 255, 0.15)` liquid glass search widget.
   - Dark Mode: `oklch(0.14 0.035 256 / 0.82)` navbar; `oklch(0.18 0.040 256 / 0.55)` smoky obsidian search widget with `1px solid oklch(1 0 0 / 0.15)`.
4. **Layer 4 (Typography & Content)**: High-contrast typography (`text-foreground` or `text-primary-foreground`) never placed on raw uncontrolled photos without an obscuring scrim.

### Shadow Depth Architecture
- **Light Mode Shadows**:
  - `--shadow-card`: `0 1px 3px oklch(0.24 0.066 256 / 0.04), 0 4px 12px -2px oklch(0.24 0.066 256 / 0.05)`
  - `--shadow-card-hover`: `0 16px 36px -10px oklch(0.24 0.066 256 / 0.16), 0 4px 12px -2px oklch(0.24 0.066 256 / 0.06)`
  - `--shadow-elegant`: `0 28px 64px -20px oklch(0.24 0.066 256 / 0.22), 0 8px 24px -6px oklch(0.24 0.066 256 / 0.08)`
  - `--shadow-modal`: `0 32px 64px -16px oklch(0.24 0.066 256 / 0.25), 0 0 0 1px oklch(0.24 0.066 256 / 0.05)`
- **Dark Mode Shadows**:
  - `--shadow-card`: `0 1px 3px oklch(0 0 0 / 0.25), 0 4px 12px -2px oklch(0 0 0 / 0.30)`
  - `--shadow-card-hover`: `0 16px 36px -10px oklch(0 0 0 / 0.50), 0 4px 12px -2px oklch(0 0 0 / 0.35)`
  - `--shadow-elegant`: `0 28px 64px -20px oklch(0 0 0 / 0.65), 0 8px 24px -6px oklch(0 0 0 / 0.40)`
  - `--shadow-modal`: `0 32px 64px -16px oklch(0 0 0 / 0.75), 0 0 0 1px oklch(1 0 0 / 0.10)`

### Accessibility & Contrast Compliance (Dual Theme)
- **Light Theme**:
  - `foreground` on `bg`: **13.96:1** (AAA)
  - `muted-foreground` on `bg`: **5.31:1** (AA)
  - `muted-foreground` on `card`: **5.71:1** (AA)
  - `accent-text` on `card`: **4.92:1** (AA)
  - `accent-text` on `bg`: **4.57:1** (AA)
  - `primary` on `bg`: **15.35:1** (AAA)
- **Dark Theme**:
  - `foreground` on `bg`: **17.73:1** (AAA)
  - `foreground` on `card`: **16.45:1** (AAA)
  - `muted-foreground` on `bg`: **7.52:1** (AAA)
  - `muted-foreground` on `card`: **6.97:1** (AA)
  - `accent-text` on `card`: **7.56:1** (AAA)
  - `accent-text` on `bg`: **8.15:1** (AAA)
  - `primary` on `bg`: **15.72:1** (AAA)
  - `primary-foreground` on `primary`: **15.72:1** (AAA)
  - `accent` on `bg` (UI Large): **6.98:1** (AAA)
  - `secondary` on `bg`: **7.28:1** (AAA)

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
- Hero: Full-bleed cinematic video/poster (100svh desktop, 85svh mobile), neutral black scrims (no colored tint), Playfair serif headline with soft text-shadow + floating glass search widget
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
- **Primary CTA Hover Shine (`.cta-shine`)**:
  - Rest: coral or midnight navy base unchanged, `position: relative; overflow: hidden;`
  - Hover: single subtle light sweep via `::after` (`linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, 0.3) 50%, transparent 80%)`, `translateX(-100%)` → `translateX(100%)` in 180ms cubic-bezier(0.16, 1, 0.3, 1)) + 1.5px elevation (`translateY(-1.5px)`) + soft shadow lift.
  - Leave: transitions only on `:hover::after`, instantly resetting to `-100%` without reverse animation.
  - Active: press feedback (`scale(0.97)`) untouched.
  - Reduced-motion: sweep disabled (`display: none !important`), hover color and elevation preserved.
- **Cards (`.card-lift`)**:
  - Rest: `box-shadow: var(--shadow-card);`
  - Hover: `transform: translateY(-2px); box-shadow: var(--shadow-card-hover);` with `200ms cubic-bezier(0.16, 1, 0.3, 1)`
  - Active / Pointer-down: `transform: scale(0.97); transition: transform 100ms ease-out, box-shadow 100ms ease-out;`
- **Card Hover Edge Light (`.card-edge-light`, DestinationCard, PackageCard, HotelCard)**:
  - Rest: plain card border (`border-border/50` or `/60`), no glow, photography dominates.
  - Hover (`@media (hover: hover) and (pointer: fine)`): existing lift + very subtle 1px coral→teal gradient border highlight via `::before` (`linear-gradient(135deg, oklch(0.68 0.168 38 / 0.32) 0%, oklch(0.62 0.096 186 / 0.28) 100%)` with `mask-composite: exclude`) + gentle image micro-zoom 1.01 (`scale-[1.01]`).
  - Leave: 250ms `cubic-bezier(0.16, 1, 0.3, 1)` smooth fade back to resting border.
  - Touch / Mobile (`@media (hover: none)`): plain border, zero edge light on tap.
  - Reduced-motion: edge light disabled (`display: none !important`), image transform disabled (`transform: none !important`).
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

### 5. Hero Cinematic Footage & Neutral Scrim Specification
- **Full-Bleed Viewport Dimensions**:
  - Desktop: `h-[100svh] min-h-[600px]`
  - Mobile: `h-[85svh] min-h-[520px]` (ensures headline and tabbed widget stay visible under mobile browser chrome).
- **Edge-to-Edge Asset Scaling**:
  - Both `<video>` and poster `<img>` use `absolute inset-0 w-full h-full object-cover object-center`. Never letterboxed, no pillarboxing or horizontal/vertical gaps at any aspect ratio.
  - Smooth fade-in transition (`opacity-0` → `opacity-100 duration-700`) upon `canplay`.
- **Neutral Cinematic Scrims (Zero Colored Tint)**:
  - No chromatic tint (no navy/teal wash over footage). Video renders in natural authentic color grading.
  - **Bottom-Anchored Separation Gradient**: `linear-gradient(to top, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0) 40%)` provides physical separation and cinematic contrast for the floating `.glass-search` widget.
  - **Uniform Ambient Scrim**: `bg-black/[0.08]` (subtle 8% neutral black) ensures crisp legibility without darkening or muddying the video.
  - **Text Legibility**: Headline and subline styled with `text-shadow: 0 2px 24px rgba(0, 0, 0, 0.45)`, maintaining WCAG legibility over high-exposure frames without requiring aggressive full-frame video darkening.
- **Reduced Motion**: Under `prefers-reduced-motion: reduce`, `.ken-burns` keyframe animation and transform scale are explicitly disabled, displaying a crisp static high-res poster with identical neutral scrims.

### 6. Expressive Gallery Specification & Vendored Component Porting Record (Phase 5)

#### Gallery Specification
- **Curated Spotlight**: Features an interactive desktop spotlight collage powered by the ported `ImageCollage` component (`src/components/vendored/ImageCollage.tsx`) using up to 9 featured photographs from the active destination selection.
- **Expressive Interaction**: Provides a tactile layout toggle between **Collage view** (artistic scattered layout with natural angle rotations and offsets) and **Editorial view** (clean synchronized deck). Clicking anywhere on the collage stage or toggle buttons smoothly animates between states.
- **Fullscreen Lightbox Integration**: Every photo card in the collage is an accessible interactive element (`role="button"`, `tabIndex={0}`, Enter/Space key support). Clicking any card directly triggers the fullscreen accessible Lightbox at that image index, maintaining seamless arrow navigation (Left/Right), ESC to close, and focus retention.
- **Mobile Responsive Fallback**: On mobile devices (viewport width ≤768px), the collage component is omitted (`hidden md:block`), presenting the fast, high-density responsive masonry columns.
- **Reduced-Motion Fallback**: Under `prefers-reduced-motion: reduce`, all spring physics, offsets, and rotation animations are disabled (`duration: 0`), instantly switching views with zero vestibulary movement.
- **Complete Archive Preservation**: The full masonry collection is positioned directly below the spotlight, ensuring 100% of photographs remain immediately discoverable and accessible across all screen sizes.

#### Vendored Component Porting Record
- **Component Source**: Vengeance UI (`https://www.vengenceui.com/components/image-collage`, original file: `src/components/ui/image-collage.tsx`).
- **Vendored Path**: `src/components/vendored/ImageCollage.tsx`.
- **Porting Adaptations**:
  1. **Next.js Elimination**: Removed `"use client"` directive to ensure clean universal rendering under TanStack Start SSR.
  2. **Motion Library Alignment**: Migrated from `framer-motion` to `motion/react` (motion.dev v13, React 19 native).
  3. **Token Alignment**: Replaced ungrounded hard-coded hex and zinc classes with Wanderlust OKLCH tokens (`bg-card`, `border-border/80`, `shadow-card-hover`, `focus-visible:ring-secondary`).
  4. **Interactive Callback & A11y**: Added `onImageClick` callback with full keyboard support (`Enter`/`Space`) and ARIA labels, linking directly to the existing Lightbox modal.
  5. **Reduced Motion**: Wired `useReducedMotion()` from `motion/react` with zero-duration spring suppression.



