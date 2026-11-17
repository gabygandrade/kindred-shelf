/** Fetcher and query keys for book search. */
import { bookSearchResponseSchema } from "@kindred/shared";
import { requestJson } from "../../api/client";

export const searchKeys = {
  results: (q: string) => ["search", q] as const,
};

export async function searchBooks(q: string) {
  const { results } = await requestJson("GET", "/books/search", bookSearchResponseSchema, {
    query: { q },
  });
  return results;
}
