/** The rows a simulated Goodreads import matches and fails to match. */
import type { ImportRow, Shelf } from "@kindred/shared";
import { WORKS } from "./works";

/** Rows the simulated import "matches", added to the shelf when the job finishes. */
export const IMPORT_MATCHES: {
  olKey: string;
  shelf: Shelf;
  rating: number | null;
  finishedAt: string | null;
}[] = [
  { olKey: WORKS.sense.olKey, shelf: "read", rating: 4, finishedAt: "2024-06-02" },
  { olKey: WORKS.northanger.olKey, shelf: "read", rating: 3, finishedAt: "2024-08-17" },
  { olKey: WORKS.treasure.olKey, shelf: "read", rating: null, finishedAt: "2024-10-05" },
  { olKey: WORKS.invisibleMan.olKey, shelf: "want", rating: null, finishedAt: null },
  // Already on Reader A's shelf: re-import must not change it (ON CONFLICT DO NOTHING).
  { olKey: WORKS.pride.olKey, shelf: "read", rating: 1, finishedAt: "2020-01-01" },
];

/** Rows the simulated import can't match, like Kindle and audiobook editions without ISBNs. */
export const IMPORT_UNMATCHED_ROWS: ImportRow[] = [
  {
    rowNumber: 7,
    title: "Carmilla (Kindle Edition)",
    author: "J. Sheridan Le Fanu",
    isbn10: null,
    isbn13: null,
    shelf: "read",
    status: "unmatched",
    workOlKey: null,
  },
  {
    rowNumber: 12,
    title: "The Time Machine: Unabridged Audiobook",
    author: "H.G. Wells",
    isbn10: null,
    isbn13: null,
    shelf: "want",
    status: "unmatched",
    workOlKey: null,
  },
  {
    rowNumber: 19,
    title: "Middlemarsh",
    author: "George Elliot",
    isbn10: null,
    isbn13: "9780000000019",
    shelf: "read",
    status: "unmatched",
    workOlKey: null,
  },
];
