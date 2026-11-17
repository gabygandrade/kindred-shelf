import { z } from "zod";
import { olKeySchema } from "./common";

/**
 * A work from the shared catalog (the `work` table). The server fills it only
 * from its own Open Library responses, never from fields a client sends.
 */
export const workSchema = z.object({
  olKey: olKeySchema,
  title: z.string().min(1),
  authors: z.array(z.string()),
  firstPublishYear: z.number().int().nullable(),
  pageCount: z.number().int().positive().nullable(),
  subjects: z.array(z.string()),
  /** Null when Open Library has no cover; the frontend draws a generated cover. */
  coverId: z.number().int().positive().nullable(),
});
export type Work = z.infer<typeof workSchema>;

// GET /books/search?q=

export const bookSearchQuerySchema = z.object({
  /** Title, author or ISBN. */
  q: z.string().trim().min(1).max(200),
});
export type BookSearchQuery = z.infer<typeof bookSearchQuerySchema>;

/** A search hit: what the results list shows (cover, title, author, year) plus page count for the spine. */
export const bookSearchResultSchema = workSchema.pick({
  olKey: true,
  title: true,
  authors: true,
  firstPublishYear: true,
  pageCount: true,
  coverId: true,
});
export type BookSearchResult = z.infer<typeof bookSearchResultSchema>;

export const bookSearchResponseSchema = z.object({
  results: z.array(bookSearchResultSchema),
});
export type BookSearchResponse = z.infer<typeof bookSearchResponseSchema>;
