/**
 * Mirror of apps/api/src/books/access.ts (stage 2): the only mock code that
 * reads `db.userBooks`. Keeping the same two functions here means the mocks
 * enforce the same privacy rules the real API will, so the UI is never built
 * around data a friend shouldn't see.
 */
import type { MyBook, ShelfBook, ShelfCounts } from "@kindred/shared";
import { db, friendshipBetween, type MockUserBook } from "./db";

function toMyBook(row: MockUserBook): MyBook {
  const work = db.works.get(row.olKey);
  if (!work) throw new Error(`Mock data error: no work ${row.olKey}`);
  return {
    work,
    shelf: row.shelf,
    rating: row.rating,
    startedAt: row.startedAt,
    finishedAt: row.finishedAt,
    isPrivate: row.isPrivate,
    source: row.source,
  };
}

/** All of the caller's own books, private ones included. */
export function myBooks(userId: string): MyBook[] {
  return db.userBooks.filter((b) => b.userId === userId).map(toMyBook);
}

/**
 * The owner's books as the viewer may see them: everything for yourself,
 * public books for an accepted friend, nothing for anyone else.
 */
export function visibleBooks(viewerId: string, ownerId: string): ShelfBook[] {
  if (viewerId === ownerId) return myBooks(ownerId).map(toShelfBook);
  if (friendshipBetween(viewerId, ownerId)?.status !== "accepted") return [];
  return db.userBooks
    .filter((b) => b.userId === ownerId && !b.isPrivate)
    .map(toMyBook)
    .map(toShelfBook);
}

/** Counts are built from the same visible list, so private books never show up in a total. */
export function countShelves(books: ShelfBook[]): ShelfCounts {
  return {
    reading: books.filter((b) => b.shelf === "reading").length,
    read: books.filter((b) => b.shelf === "read").length,
    want: books.filter((b) => b.shelf === "want").length,
  };
}

// Drop the owner-only fields so a friend's response can't carry them.
function toShelfBook({ work, shelf, rating, startedAt, finishedAt }: MyBook): ShelfBook {
  return { work, shelf, rating, startedAt, finishedAt };
}
