/** The order books stand on a shelf. */
import type { ShelfBook } from "@kindred/shared";

/** Most recent first: finished date for Read, started date otherwise, then title. */
export function sortForShelf<T extends ShelfBook>(books: T[]): T[] {
  const dateOf = (b: ShelfBook) => (b.shelf === "read" ? b.finishedAt : b.startedAt) ?? "";
  return [...books].sort(
    (a, b) => dateOf(b).localeCompare(dateOf(a)) || a.work.title.localeCompare(b.work.title),
  );
}
