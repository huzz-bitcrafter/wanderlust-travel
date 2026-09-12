# Design — Wanderlust v2 (aligned to codebase tokens)

## Brand Feel

Warm, cinematic, aspirational. Large photography, generous whitespace, deep navy-teal
base with energetic coral accents. Light theme only (v1).

## Color Tokens — Tailwind v4 / OKLCH in src/styles.css (NEVER hard-code hex in components)

### Palette Refinement (Direction A: Premium Travel Editorial + Restrained Liquid-Glass Depth)

| Token | Before OKLCH | After OKLCH | ~Hex (After) | Semantic Purpose | Usage Guidance | Contrast Result |
|---|---|---|---|---|---|---|
| `primary` | `oklch(0.3 0.062 250)` | `oklch(0.24 0.066 256)` | #071f3e | Midnight Navy — cinematic depth, anchor | Navbar, footer, primary buttons, major headings | **16.50:1** vs white (AAA), **15.35:1** vs bg (AAA) |
| `primary-foreground` | `oklch(1 0 0)` | `oklch(1 0 0)` | #ffffff | Crisp Pure White | Text on primary/midnight surfaces | **16.50:1** vs primary (AAA) |
| `accent` | `oklch(0.676 0.146 40)` | `oklch(0.680 0.168 38)` | #ec6c44 | Luminous Coral — emotional warmth & action | Primary CTAs, booking actions, large prices, star ratings | **3.08:1** vs white/card (AA Large/UI) |
| `accent-foreground` | `oklch(1 0 0)` | `oklch(1 0 0)` | #ffffff | Crisp Pure White | Button text on accent CTAs | **3.08:1** vs accent (AA Large/UI) |
| `accent-text` | — | `oklch(0.565 0.168 38)` | #c4471c | Deep Coral Text — WCAG AA compliant small text | Small/normal accent text, metadata warnings, links on light surfaces | **4.92:1** vs white/card (AA Normal), **4.57:1** vs bg (AA Normal) |
| `secondary` | `oklch(0.62 0.096 186)` | `oklch(0.62 0.096 186)` | #2d998f | Restrained Travel Teal | Links, subtle badges, secondary tags, focus rings | **3.67:1** vs card (AA UI) |
| `secondary-foreground` | `oklch(1 0 0)` | `oklch(1 0 0)` | #ffffff | Crisp Pure White | Text on solid secondary surfaces | **3.67:1** vs secondary |
| `background` | `oklch(0.975 0.008 85)` | `oklch(0.975 0.008 85)` | #f9f6f1 | Warm Ivory / Off-White | Editorial page canvas, comfortable luxury | **13.96:1** vs foreground (AAA) |
| `foreground` | `oklch(0.27 0.019 230)` | `oklch(0.27 0.019 230)` | #1d282e | Deep Ink Neutral | Body text, titles on light backgrounds | **13.96:1** vs background (AAA) |
| `card` | `oklch(1 0 0)` | `oklch(1 0 0)` | #ffffff | Crisp White Surface | Destination cards, hotel cards, modal bodies | **1.08:1** separation vs background |
| `card-foreground` | `oklch(0.27 0.019 230)` | `oklch(0.27 0.019 230)` | #1d282e | Deep Ink Neutral | Content text within cards | **14.50:1** vs card (AAA) |
| `muted` | `oklch(0.938 0.012 80)` | `oklch(0.938 0.012 80)` | #efeae2 | Soft Sand Neutral | Subdued chips, disabled tabs, divider fills | — |
| `muted-foreground` | `oklch(0.51 0.019 225)` | `oklch(0.51 0.019 225)` | #5b696e | Slate Editorial Neutral | Subtitles, metadata, reviews counts, captions | **5.31:1** vs bg (AA), **5.71:1** vs card (AA) |
| `border` | `oklch(0.898 0.014 85)` | `oklch(0.898 0.014 85)` | #e2ddd3 | Subtle Warm Edge | 1px material separator | Subtle boundary |

Status colors: confirmed = success green (`oklch(0.615 0.126 158)`), pending = amber (`oklch(0.765 0.135 72)`), cancelled/error = destructive (`oklch(0.575 0.178 25)`).

### Gradient System

| Gradient Token | Value | Direction | Intended Usage | Prohibited Usage |
|---|---|---|---|---|
| `--gradient-primary` | `linear-gradient(135deg, oklch(0.24 0.066 256) 0%, oklch(0.32 0.070 200) 100%)` | Midnight Navy → Restrained Maritime Teal | Hero atmospheric overlays, subtle hero depth, admin sidebar depth, selected material layers | Large body backgrounds, generic cards |
| `--gradient-accent` | `linear-gradient(135deg, oklch(0.680 0.168 38) 0%, oklch(0.720 0.150 62) 100%)` | Luminous Coral → Warm Restrained Amber | Primary CTA highlights, premium badges, price emphasis, tiny decorative accents | Full page backgrounds, large content cards |

#### Gradient Rules:
- **Natural Depth, Not Decorative Rainbows**: Gradients must evoke atmospheric depth and natural lighting.
- **Dominance Preservation**: In `--gradient-primary`, midnight navy must anchor the identity; teal is an atmospheric wash. In `--gradient-accent`, coral remains the action color; amber adds warm sunlight energy.
- **Never Overuse**: Never layer accent gradients over large areas; keep them focused on points of action and delight.

### Glass / Material Depth & Surface Hierarchy
1. **Layer 1 (Page Canvas / Photography)**: `var(--color-background)` or high-res landscape imagery.
2. **Layer 2 (Atmospheric Wash)**: Gradient overlays (`--gradient-primary` with low opacity) pushing background back in perceptual z-space.
3. **Layer 3 (Functional Surface)**: Translucent materials (`.glass-navbar`, `.glass-chrome`, `.admin-sidebar`) with high saturation (`saturate(180%)`), moderate blur (`16px-20px`), and fine low-opacity borders (`1px solid oklch(1 0 0 / 0.12)`).
4. **Layer 4 (Typography & Content)**: High-contrast typography (`text-foreground` or `text-primary-foreground`) never placed on raw uncontrolled photos without an obscuring scrim.

### Shadow Depth Architecture
- `--shadow-card`: `0 1px 3px oklch(0.24 0.066 256 / 0.04), 0 4px 12px -2px oklch(0.24 0.066 256 / 0.05)` (Subtle resting material depth, close to canvas).
- `--shadow-card-hover`: `0 16px 36px -10px oklch(0.24 0.066 256 / 0.16), 0 4px 12px -2px oklch(0.24 0.066 256 / 0.06)` (Soft expansive physical lift on hover).
- `--shadow-elegant`: `0 28px 64px -20px oklch(0.24 0.066 256 / 0.22), 0 8px 24px -6px oklch(0.24 0.066 256 / 0.08)` (Cinematic depth for hero & floating containers).
- `--shadow-modal`: `0 32px 64px -16px oklch(0.24 0.066 256 / 0.25), 0 0 0 1px oklch(0.24 0.066 256 / 0.05)` (Definitive elevation for dialogs & sheets).

### Accessibility & Contrast Compliance
- **Normal Text**: All body copy, inputs, muted metadata, and small accent text exceed 4.5:1 against their backgrounds (foreground on bg: 13.96:1; muted-foreground on bg: 5.31:1; muted-foreground on card: 5.71:1; accent-text on card: 4.92:1; accent-text on bg: 4.57:1).
- **Large Text & UI Components**: Buttons, badges, and heading elements exceed 3.0:1 (primary on bg: 15.35:1; primary-foreground on primary: 16.50:1; accent on card: 3.08:1; accent-foreground on accent: 3.08:1).
- **Reduced Motion & Reduced Transparency**: Full fallbacks in `src/styles.css` ensuring zero vestibulary discomfort and solid surfaces when user preferences dictate.

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


