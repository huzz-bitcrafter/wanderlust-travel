# Rules — Wanderlust v2

## Allowed (ONLY these — all already installed)

TanStack Start/Router/Query v5 · Tailwind v4 + OKLCH tokens · Radix/shadcn
(src/components/ui/) · lucide-react · supabase-js v2 · zod · react-hook-form ·
date-fns · sonner

## Prohibited

- react-router-dom (superseded by TanStack Router — never add it)
- Other UI kits (MUI, Ant, Chakra, Bootstrap) · CSS-in-JS · separate .css files
- External travel/flight/hotel APIs · real payment integration (v1)
- Service-role keys/secrets in client code · `any` types · disabling TS strictness
- Hand-editing src/routeTree.gen.ts (generated)
- Editing src/integrations/supabase/* except types.ts
- New dependencies without asking first
- DB migrations: foundation is LIVE and seeded. Write SQL only for a proven schema gap
  → save to docs/migrations/, PAUSE, human runs it in Supabase SQL Editor.

## SSR discipline

- Public catalog pages fetch via createServerFn (src/lib/*.functions.ts) + route loader
  ensureQueryData + useSuspenseQuery. NO client-only initial fetching on public pages.
- Auth + mutations go through src/integrations/supabase/client.ts.

## Error handling

- Every async view: loading skeleton + empty state + error state with retry
- All Supabase calls: try/catch or Query onError → sonner toast, never silent
- All forms: zod-validated, inline field errors
- Unexpected errors: console.error + generic user message

## Security

- RLS is the real guard (user_roles table + has_role()/is_admin() security definers).
  Client-side role checks are UX only — never authorization.
- Sanitize and length-limit all user input.

## Conventions

- One page per route file; shared widgets in components/shared/; files < ~250 lines
- "Fix only this" = touch nothing else. Never rebuild completed phases.
- Update docs/Memory.md after every phase.
