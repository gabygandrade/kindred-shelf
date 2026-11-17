# Build goals

Run these one at a time in Claude Code with `/goal`. Each has an end state that can be checked. Read the diff and review before starting the next one.

## Goal 0: foundation (small, run first)

```
/goal pnpm monorepo with apps/web, apps/api and packages/shared is set up per CLAUDE.md and docs/TECHNICAL_DESIGN.md; TypeScript strict, ESLint and Prettier are configured; packages/shared has Zod schemas for every endpoint in the technical design's API table; the Commands section in CLAUDE.md is filled in; and pnpm typecheck, lint and test all pass
```

## Goal 1: frontend with mocks (build stage 1)

```
/goal every v1 screen in apps/web (sign-up with invite code, Goodreads import onboarding with mocked progress and unmatched rows, search and add, shelves and ratings, the bookshelf view, the open-book view, friends and a friend's shelf with private books hidden) works against MSW mocks built from packages/shared, matches docs/design (Night reading room) at desktop and 390px widths, and pnpm typecheck, lint and test all pass
```

Tip: this is big. You can split it per screen (for example "the bookshelf and open-book views …"), and start with the bookshelf, since it's the heart of the app.

## Goal 2: backend (build stage 2)

Before starting, answer the open questions in the technical design (hosting, batched ISBN search, pg-boss expiry).

```
/goal every endpoint in docs/TECHNICAL_DESIGN.md is implemented in apps/api against Postgres with Drizzle migrations, Better Auth with invite codes, the Open Library client and the pg-boss import worker; the privacy and import test suites described in the technical design exist and pass; and pnpm typecheck, lint and test all pass
```

## Goal 3: connect (build stage 3)

```
/goal apps/web runs against the real API with MSW disabled, the Playwright flow (sign up with an invite, import, see shelf, open a book) passes, and pnpm typecheck, lint, test and test:e2e all pass
```
