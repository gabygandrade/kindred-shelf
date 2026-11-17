# Kindred Shelf

A calm, visual reading tracker: log books, rate them, see your read books as spines on a bookshelf, share shelves with friends, and import your Goodreads history. v1 is invite-only for a few friends, built so public sign-up can be switched on later without a rewrite.

This is also a **learning project** for a frontend engineer moving into fullstack. Prefer code that makes the backend concepts visible (plain SQL-like Drizzle queries, explicit routes, explicit access checks) over clever abstractions. When you make a non-obvious backend choice, leave a short comment saying why.

## Source of truth

Read these before starting any task. When they disagree, the earlier one wins:

1. `docs/PRD.md`: what to build and what is out of scope.
2. `docs/TECHNICAL_DESIGN.md`: stack, data model, API, flows, privacy rules, build plan.
3. `docs/design/`: the **Night reading room** look. `README.md` describes the screens and rules; `tokens.css` holds colors, fonts and spacing; `mockups/*.html` open in a browser.

If a task needs something these docs don't cover, or contradicts them, stop and ask instead of guessing. If a decision changes, update the doc in the same change.

**Out of scope for v1** (don't build, don't scaffold): recommendations, favorite friends, AI features, embeddings, cover-matched spine colors, Google Books fallback, public profiles, reviews/notes, reading goals, shelf themes/sorting, native mobile. These are v2/P2 in the PRD.

## Repo layout

pnpm workspaces monorepo:

```
apps/web         React + TypeScript + Vite SPA (React Router, TanStack Query, MSW in dev)
apps/api         Node + Hono API, plus the pg-boss worker entry point (src/worker.ts)
packages/shared  Zod schemas for every request and response: the API contract
docs/            PRD, technical design, design reference
```

## Commands

Fill these in as the scripts are created in stage 1, and keep them accurate:

```
pnpm install
pnpm dev            # web app (MSW mocks on until stage 3)
pnpm typecheck      # tsc --noEmit across all packages
pnpm lint           # ESLint + Prettier check
pnpm test           # Vitest across all packages
pnpm test:e2e       # Playwright (stage 3)
```

A task is **done** only when `pnpm typecheck`, `pnpm lint` and `pnpm test` all pass. Never disable a lint rule, skip a test or add `@ts-ignore` to get there; fix the cause or ask.

## Code standards

### TypeScript (everywhere)

- `strict: true` plus `noUncheckedIndexedAccess`. No `any`; use `unknown` and narrow. No non-null assertions (`!`) outside tests.
- Types for API data come from `packages/shared` via `z.infer`. Never redeclare an API type by hand in an app.
- Named exports only. Small, single-purpose modules; split a file when it passes ~200 lines.
- Names say what things are (`useFriendShelf`, `normalizeTitle`), not how they work.

### The contract (`packages/shared`)

- One Zod schema per request body, query and response, grouped by area (`books`, `shelves`, `imports`, `friends`, `auth`).
- Write or change the schema **first**, then the mock handler, then the UI or route. The mocks and the real API must return the same shapes, so stage 3 changes no frontend code.

### Frontend (`apps/web`)

- Feature folders: `src/features/<feature>/` with `components/`, `hooks/`, `api.ts` (fetchers + query keys). Shared UI primitives in `src/components/`. Routes in `src/routes/`.
- Server state lives in TanStack Query only. No global store for API data. One query-key factory per feature.
- MSW handlers live in `src/mocks/`, built from shared schemas and fixtures. Fixtures use generic placeholder people ("Reader A", "Friend B") and public-domain books, never real names.
- Styling: CSS Modules plus the CSS variables from `docs/design/tokens.css` (copied to `src/styles/tokens.css`). No hard-coded colors, font sizes or radii in components; add a token instead.
- Accessibility is required, not polish: real `<button>`, `<a href>`, `<label>` + `<input>`; visible focus; touch targets ≥ 44px; text contrast ≥ 4.5:1; every spine is a link with an accessible name ("Title by Author"); icon-only buttons get `aria-label`.
- Every data screen handles loading, empty and error states.
- Responsive down to phone width (390px). The sidebar stacks above the content; shelves wrap into rows.

### Backend (`apps/api`)

- Layers: `routes/` (Hono handlers: parse with Zod, call a service, return) → `services/` (logic) → `db/` (Drizzle schema and queries). Routes stay thin.
- The acting user **always** comes from the Better Auth session, never from a URL param or body.
- All Open Library calls go through `src/openLibrary.ts` (User-Agent, rate budget, cache, Zod-validated responses). Nothing else calls Open Library.
- The `work` table is written only from the server's own Open Library responses, never from client-sent fields.
- Errors use `{ error: { code, message } }`. Not-found and not-allowed return the **same** 404.
- Secrets only in environment variables, documented in `.env.example`. Nothing secret in `apps/web`.

## Privacy rules (zero tolerance)

The PRD's one hard guardrail: a private book or a non-friend's shelf must never leak.

- `apps/api/src/books/access.ts` is the **only** code that reads `user_book`. It exports `myBooks(userId)` and `visibleBooks(viewerId, ownerId)`. Counts go through these functions too.
- A friend can only be accepted by the person who received the request (`requested_by` is the other user).
- Import jobs and rows are only readable by their owner.
- Re-import inserts with `ON CONFLICT DO NOTHING`: it never changes a book already on a shelf.
- Every privacy rule has a test in the privacy suite (see the Testing table in the technical design). Never weaken one to make something else pass.

## Testing

- Vitest, tests next to the code (`foo.test.ts`). Test behavior through public functions, not internals.
- Backend tests run against a real Postgres (Docker), not mocks of the database.
- Use the fixture Goodreads CSV in `apps/api/test/fixtures/` for import tests; add a row to it for every new edge case.

## Working style

- Follow the build stages in `docs/TECHNICAL_DESIGN.md` and the goals in `docs/GOALS.md`. Don't start the backend during stage 1.
- Ask before adding a dependency the technical design doesn't name.
- Keep changes reviewable: one concern per change, with a short summary of what changed and why.
