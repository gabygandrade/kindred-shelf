# Kindred Shelf — v1 PRD

> Exported 2026-11-16 from the [live PRD](https://claude.ai/artifact/BF6nCtDyD9tFFsH6BmBoA7). If the two differ, update this file from the live doc.

Kindred Shelf is a calm, visual reading tracker. You log books, rate them, see your read books as spines on a bookshelf, and share shelves with friends. AI-powered recommendations follow in v2. v1 is for the author and a few invited friends. It is built so public sign-up can be turned on later without a rewrite.

## Problem

Goodreads is where most readers track books, but it isn't fun to use. The interface feels dated and cluttered, and your library is a list rather than something you enjoy looking at. Its recommendations are generic and ignore the people whose taste you trust most: friends who read and rate the way you do.

Kindred Shelf is for readers who want to **see their library as a virtual bookshelf** and get **recommendations personalized from their own ratings and friends with similar reading profiles**. Switching has to be painless, so Goodreads history imports on day one.

This is also a learning project. It should exercise auth, a social graph, relational modeling, an outside API's rules, file import with fuzzy matching, an expressive frontend, and, in v2, an AI-based recommender.

## Goals

1. **Start from your history, not zero.** A Goodreads user ends onboarding with their read books on the shelf, rated.
2. **Tracking feels effortless.** Finding a book and putting it on a shelf is quick enough to do the moment you start reading.
3. **The shelf is the reason to open the app.** Your library shows as a bookshelf of spines; any spine opens to the real cover.
4. **Reading is shared, privately.** Mutual friends see each other's shelves; anything marked private never leaks.
5. **Ready to open up later.** The data model, auth and API use hold up if sign-up opens to the public, with no rewrite needed.

## Non-Goals (v1)

| Out of scope | Why |
| --- | --- |
| Recommendations and favorite friends | Moved to v2 as an AI-based feature (see below); v1 focuses on tracking, the shelf and friends |
| Public profiles, search for strangers, open sign-up | v1 is invite-only; the foundations are built for it, but the feature isn't |
| Written reviews, notes, reading goals, yearly stats | Not needed for the core loop; P2 |
| Edition-level tracking (formats, translations) | Track the *work*, not the edition; avoids most of the import mismatch pain |

## User Stories

**New member coming from Goodreads**

- As a new member, I want to upload my Goodreads export right after sign-up so that my shelves and ratings are there from the start.
- As a new member, I want to see which imported books didn't match and fix them so that nothing from my history is lost.
- As a new member without Goodreads, I want to skip import and add books by hand so that I'm not blocked.

**Everyday reader**

- As a reader, I want to search by title, author or ISBN and put a book on Reading, Read or Want to Read so that my shelves stay current.
- As a reader, I want to rate a book when I finish it (or skip) so that my ratings feed my recommendations.
- As a reader, I want to browse my read books as spines and open one to its cover, rating and dates so that my library feels like mine.
- As a reader, I want to mark a book private so that friends never see it.

**Friend**

- As a reader, I want to send a friend request by username or invite link so that I can share shelves with people I know.
- As a friend, I want to view a friend's shelves and bookshelf so that I can see what they read and loved.
- As a reader, I want to remove a friend and have my shelves hidden from them right away.

**Looking for what's next (v2)**

- As a reader, I want recommendations that say which of my books they're based on so that I can judge them quickly.
- As a reader, I want to dismiss a pick as "not for me" so that similar picks show up less.
- As a reader, I want to favorite friends whose taste overlaps with mine so that books they loved shape my recommendations.

**Edge cases**

- Empty states: a new member with no books sees a prompt to import or add, not an empty shelf.
- A book with no cover anywhere still gets a generated cover, never a blank.
- Open Library is slow or down: shelves, ratings and cached book details still load; search shows a clear retry message.

## Requirements

### P0 — Must-have

**P0-1 Accounts.** Sign up, sign in and sign out; each member has a unique username.

- [ ] Sign-up is invite-only in v1, behind one config flag that can open it later.
- [ ] Every member's data is visible only to them and their accepted friends (enforced on the server, not only in the UI).

**P0-2 Search, shelves and ratings.** Search Open Library by title, author or ISBN and add a book to Reading, Read or Want to Read. Read books take a 1–5 star rating, whole stars only.

- [ ] Results show cover, title, author and first-published year.
- [ ] A book sits on exactly one shelf. Moving it records the date (started for Reading, finished for Read).
- [ ] Marking a book Read prompts for a rating, which can be skipped and added later.
- [ ] Given Open Library is unavailable, then shelves and cached books still load and search shows a retry message.

**P0-3 Goodreads import (first onboarding step).** After sign-up, invite the member to upload their Goodreads CSV; "Skip for now" is always available.

- [ ] Shows short steps for exporting from Goodreads; import stays available in settings.
- [ ] Rows match Open Library by ISBN first, then title + author. Shelf, rating and dates carry over.
- [ ] Shows progress while matching, then lands on the filled bookshelf.
- [ ] Unmatched rows are listed for manual search-and-fix, never silently dropped.
- [ ] Re-importing the same file creates no duplicates.
- [ ] Large libraries (hundreds of books) import without errors or timeouts.

**P0-4 Bookshelf view (home screen).** Read books shown as drawn spines; tapping one opens the real cover, rating, dates and an Open Library link.

- [ ] Each spine gets a color from a fixed palette: the same book always gets the same color, neighbors vary, and text stays readable. Colors don't need to match the cover in v1.
- [ ] Spine width scales with page count when known, with a default otherwise.
- [ ] A book with no cover gets a generated cover in its spine color; the shelf never shows a blank.
- [ ] Works at phone width (shelves wrap into rows).

**P0-5 Friends and privacy.** Mutual friend requests by username or invite link; view a friend's shelves and bookshelf.

- [ ] Nothing is visible to either person until both accept.
- [ ] Books marked private never appear to friends, including in shelf counts.
- [ ] Removing a friend hides shelves both ways on the next request.

### v2 — AI recommendations (next version, not in v1)

Recommendations move to v2 and will use an AI model, taking favorited friends into account. They will get their own PRD and technical design; the decisions below carry over.

**V2-1 Favorite friends.** Mark any accepted friend as a favorite when your tastes overlap; unfavorite at any time.

- [ ] Favorites are private to you; the friend isn't notified.
- [ ] Removing a friend also removes the favorite.

**V2-2 AI recommendations.** An AI model suggests books based on your ratings and on books your favorited friends rated 4 or 5 stars.

- [ ] Picks appear once you have at least 10 rated books; a favorite friend's taste counts once you each have at least 10.
- [ ] Every pick says why: the book(s) or friend it's based on.
- [ ] Every suggested title is checked against Open Library before it's shown, so no invented books appear.
- [ ] Books on any of your shelves never appear, and "not for me" feedback shapes future picks.
- [ ] A friend's private books are never sent to the model or used for picks.

**V2-3 Cover-matched spine colors.** Each spine takes its color from the book's cover instead of the v1 palette. How to extract the color (in the browser or on the server) is decided in the v2 design.

### P2 — After v1

- Taste-match indicator on a friend's profile, and suggestions of friends to favorite.
- Friend feed of recent finishes.
- Shelf sorting (date finished, rating, author, color) and themes (wood, pastel, night).
- Google Books fallback for books Open Library has no cover or details for (v1 shows a generated cover instead).
- Open public sign-up, public profiles and discovery.

## Constraints

- **Platform:** responsive web, usable at phone width.
- **Audience:** invite-only for v1, but opening public sign-up later must not need a rewrite.
- **Book data:** books and covers come from free public sources (Open Library), so the app must follow their usage rules.

## Success Metrics

With a handful of members, these are checks on whether the product works, not growth targets. The targets are starting hypotheses to adjust after the first real imports.

| Metric | Type | Proposed target | When |
| --- | --- | --- | --- |
| Import auto-match rate (rows matched without manual fixing) | Leading | ≥ 90% of rows on the author's own export | First import |
| Onboarding completion (import done or skipped, lands on shelf) | Leading | Every invited friend | First week |
| Books with a real cover (not generated) | Leading | Measure, then decide on Google Books fallback | First import |
| Weekly active members (open the shelf or log a book) | Lagging | Most invited friends, 4 weeks after invite | 1 month |

## Phasing

v1 = all P0s, built in three stages (detail in `TECHNICAL_DESIGN.md`). v2 adds AI recommendations; P2 items come after.

1. **Frontend with a mocked API:** every v1 screen (sign-up and Goodreads import onboarding, search, shelves and ratings, the bookshelf view, friends) built against fake data. *Ends with a clickable app.*
2. **Backend:** accounts, the database, the Open Library client, the Goodreads import worker, friends and privacy, with tests. *Ends with a tested API.*
3. **Connect:** switch the app from the mocks to the real API one area at a time, then deploy. *Invite friends here. Completes v1.*
