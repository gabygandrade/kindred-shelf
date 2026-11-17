# Design: Night reading room

Dark navy, jewel-tone spines and one gold accent. Calm and cozy, like reading by lamplight. The source mockups live on the [design canvas](https://claude.ai/artifact/6yebpmMsxGWnatLYzFEbBz) (direction C); `mockups/` has standalone copies you can open in a browser.

- `tokens.css`: every color, font, size, space, radius and shadow. Use these variables; don't hard-code values.
- `mockups/shelf.html`: the bookshelf (home) screen.
- `mockups/book.html`: the open-book screen.

The mockups are a visual reference, not production code. Where they differ from the PRD, the PRD wins (differences are listed at the end).

## Fonts

Space Grotesk (500, 600, 700) for display text: logo, page titles, book titles, spine titles. Inter (400, 500, 600) for everything else. Self-host them with `@fontsource/space-grotesk` and `@fontsource/inter` rather than loading Google Fonts.

## App shell

- **Sidebar** (max 260px, right border `--color-border`): logo; nav links Read, Reading, Want to read, Friends (44px tall, active item on `--color-surface-raised` with semibold text, others `--color-text-muted`); a "Currently reading" card showing the most recent book on the Reading shelf (hide it when the shelf is empty).
- **Content** fills the rest, padding 32px 48px.
- **Phone width:** the sidebar stacks above the content (flex-wrap), nav becomes a horizontal row of links that wraps, and content padding drops to 16px–20px.
- **Footer** credit: "Book data from Open Library" with a link (required by Open Library).

## Bookshelf screen (P0-4)

- Header row: page title (the shelf name, `--text-3xl`, display font, tight tracking), a count line under it ("18 books on the shelf", muted), and a gold **+ Add a book** button on the right.
- **Shelves:** books sit on planks in rows. Each row is a flex row of spines aligned to the bottom, 4px gap, over a 12px plank (`--color-surface-raised`, 2px top border `--color-border-strong`, `--shadow-plank`). On wide screens a row holds as many spines as fit; on phones rows wrap (the PRD asks for wrapping, not horizontal scrolling).
- **Spine:** a link to the book view whose accessible name is "Title by Author". Title runs vertically (`writing-mode: vertical-rl`) at the top in the display font, 14px semibold, truncated with an ellipsis; author last name runs vertically at the bottom, `--text-xs`, uppercase. Right edge has `--shadow-spine-edge`. Focus ring is a 2px `--color-accent` outline with 2px offset.
- **Empty state:** no books yet → a friendly panel with "Import from Goodreads" (primary) and "Add a book" (secondary), never an empty plank.

### Spine rules (deterministic)

```ts
const PALETTE = ["--spine-1", …, "--spine-8"]; // from tokens.css

function hash(s: string): number {        // same hash the mockups use
  let x = 7;
  for (const ch of s) x = (x * 31 + ch.charCodeAt(0)) >>> 0;
  return x;
}

// For each book, left to right on a shelf:
//   h      = hash(work.olKey)                 // the mockup hashed the title; the app uses the stable key
//   color  = PALETTE[h % 8]; if it equals the previous spine's color, use (index + 3) % 8 instead
//   width  = clamp(30, round(pageCount / 13), 60) px; 40px when pageCount is unknown
//   height = 196 + (h % 6) * 9 px              // slight variation so the shelf isn't a grid
//   ink    = relative luminance(color) > 0.5 ? var(--color-bg) : #ffffff
```

Keep this in one tested pure function (`spineStyle(work, previousColor)`), so the same book always looks the same everywhere.

## Open-book screen (P0-4)

- Top bar: "← Back to {shelf}" link (gold) on the left, muted logo on the right.
- **Cover panel** (left, max 340px, `--color-surface`, `--radius-xl`, 1px border): the real cover from `covers.openlibrary.org/b/id/{coverId}-M.jpg?default=false`, max 260px wide, 2:3, `--shadow-cover`. If there's no `coverId` or the image fails to load, show the **generated cover**: the spine color as background, title in display font 32px bold, author uppercase at the bottom, using the spine's ink color. Under it: "View on Open Library ↗".
- **Details** (right): title `--text-4xl` display bold, tight tracking; meta line "Author · year · N pages" muted `--text-lg`.
- **Rating:** five 44px star buttons in gold, in a group labeled "Your rating"; each has an aria-label ("3 stars") and `aria-pressed`. Next to it: "Read in 17 days · Mar 2 – Mar 19, 2026" when both dates exist.
- **Shelf:** a segmented control (Reading / Read / Want to read) on `--color-surface`; the selected segment is gold with dark text. Implement as a radio group for keyboard and screen-reader support.
- **Private:** a checkbox "Keep this book private" with a gold accent.
- Phone width: the cover panel stacks above the details; the title drops to ~40px.

## Where the app differs from the mockups

- Spine color is hashed from the Open Library work key, not the title.
- Shelves wrap into rows at phone width instead of scrolling sideways.
- The book view loads the real cover; the mockup always shows the generated one.
- There is no "Friends who read this" section (out of scope for v1).
- Book counts and the "Currently reading" card come from the API; the numbers in the mockups are sample data.
