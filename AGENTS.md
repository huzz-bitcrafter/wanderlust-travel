# Wanderlust — Agent Instructions

## Project

Travel booking & trip planning platform. Docs in docs/ are source of truth.

## Stack (do not deviate)

- TanStack Start (React 19 + Vite + Nitro), SSR enabled
- TanStack Router — file-based routes in src/routes/ (routeTree.gen.ts is generated, never hand-edit)
- TanStack Query v5 — useSuspenseQuery + route loaders with ensureQueryData
- Tailwind CSS v4 with OKLCH tokens in src/styles.css (no raw hex in components)
- Radix/shadcn primitives in src/components/ui/ · lucide-react icons
- Supabase: server reads via src/lib/supabase-public.server.ts + createServerFn
  (src/lib/*.functions.ts); auth + mutations via src/integrations/supabase/client.ts

## Read before any task

docs/Memory.md (current status) → docs/PRD.md → Architecture doc → docs/Design.md → docs/Rules.md

## Status

- DB FOUNDATION COMPLETE: all tables, RLS, seed data, has_role()/is_admin() exist in Supabase.
  Do NOT write migrations unless a proven schema gap is found (then: SQL file + PAUSE for human).
- Completed: Phase 1 (design system), Phase 2 (layout + home)
- Phase roadmap and numbering: follow the roadmap table in the Architecture doc.

## Hard rules

- One phase per task. Never rebuild completed phases. "Fix only this" = touch nothing else.
- Public catalog pages: SSR via server function + route loader prefetch (follow index.tsx pattern).
- Filters/search: TanStack Router validateSearch (URL-synced), not local state.
- All forms: zod. Every data view: loading/empty/error states. No `any` types.
- Style only with existing tokens. No new dependencies without asking.
- After each phase: update docs/Memory.md.
- Commits: stage ALL files related to the change (git add -A, or the complete
  file list) and verify `git status` is clean afterward — never selective adds
  that leave new files or modified wiring uncommitted.
- Before starting any new task: verify `git status` is clean; if not, commit
  pending work as a checkpoint first.
