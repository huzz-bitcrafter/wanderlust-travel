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
