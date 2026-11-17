/** Fetchers and query keys for shelves: my books, adding or changing one, and a friend's shelf. */
import {
  myBooksResponseSchema,
  putMyBookResponseSchema,
  userShelfResponseSchema,
  type PutMyBookBody,
} from "@kindred/shared";
import { requestJson, requestNoContent, segment } from "../../api/client";

export const shelfKeys = {
  all: ["shelf"] as const,
  /** All of my books, every shelf. Pages filter by shelf locally. */
  mine: () => [...shelfKeys.all, "mine"] as const,
  user: (username: string) => [...shelfKeys.all, "user", username] as const,
};

export async function fetchMyBooks() {
  const { books } = await requestJson("GET", "/me/books", myBooksResponseSchema);
  return books;
}

/** Add a book or change it. Only the work key goes in the URL; the server fills in the details. */
export function putMyBook(olKey: string, body: PutMyBookBody) {
  return requestJson("PUT", `/me/books/${segment(olKey)}`, putMyBookResponseSchema, { body });
}

export function deleteMyBook(olKey: string) {
  return requestNoContent("DELETE", `/me/books/${segment(olKey)}`);
}

export function fetchUserShelf(username: string) {
  return requestJson("GET", `/users/${segment(username)}/shelf`, userShelfResponseSchema);
}
