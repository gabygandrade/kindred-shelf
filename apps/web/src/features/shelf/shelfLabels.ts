/** Display names for the three shelves, and book-count wording. */
import type { Shelf } from "@kindred/shared";

export const SHELVES: Shelf[] = ["read", "reading", "want"];

export const shelfLabel: Record<Shelf, string> = {
  read: "Read",
  reading: "Reading",
  want: "Want to read",
};

export function bookCount(n: number): string {
  return n === 1 ? "1 book" : `${n} books`;
}
