import { z } from "zod";
import { workSchema } from "./books";
import {
  isoDateSchema,
  olKeySchema,
  publicUserSchema,
  ratingSchema,
  shelfCountsSchema,
  shelfSchema,
  usernameSchema,
} from "./common";

/**
 * A book on someone's shelf, as anyone allowed to see it sees it.
 * Deliberately has no `isPrivate`: friends only ever receive public books,
 * so the flag would carry no information for them.
 */
export const shelfBookSchema = z.object({
  work: workSchema,
  shelf: shelfSchema,
  rating: ratingSchema.nullable(),
  startedAt: isoDateSchema.nullable(),
  finishedAt: isoDateSchema.nullable(),
});
export type ShelfBook = z.infer<typeof shelfBookSchema>;

/** One of the caller's own books: adds the fields only the owner sees. */
export const myBookSchema = shelfBookSchema.extend({
  isPrivate: z.boolean(),
  source: z.enum(["manual", "goodreads"]),
});
export type MyBook = z.infer<typeof myBookSchema>;

// GET /me/books?shelf=

export const myBooksQuerySchema = z.object({
  shelf: shelfSchema.optional(),
});
export type MyBooksQuery = z.infer<typeof myBooksQuerySchema>;

export const myBooksResponseSchema = z.object({
  books: z.array(myBookSchema),
});
export type MyBooksResponse = z.infer<typeof myBooksResponseSchema>;

// PUT /me/books/:olKey  and  DELETE /me/books/:olKey

export const myBookParamsSchema = z.object({
  olKey: olKeySchema,
});
export type MyBookParams = z.infer<typeof myBookParamsSchema>;

/**
 * Add a book or update it. The client sends only the work key (in the URL) and
 * its own choices; the server fetches the work's details itself.
 * Omitted fields keep their current value; moving shelves records today's date
 * (started for Reading, finished for Read) unless a date is sent.
 */
export const putMyBookBodySchema = z
  .object({
    shelf: shelfSchema,
    rating: ratingSchema.nullable().optional(),
    startedAt: isoDateSchema.nullable().optional(),
    finishedAt: isoDateSchema.nullable().optional(),
    isPrivate: z.boolean().optional(),
  })
  .refine((body) => body.rating == null || body.shelf === "read", {
    message: "Only books on the Read shelf can be rated",
    path: ["rating"],
  })
  .refine(
    // ISO dates compare correctly as strings.
    (body) => !body.startedAt || !body.finishedAt || body.startedAt <= body.finishedAt,
    { message: "Finished date can't be before the started date", path: ["finishedAt"] },
  );
export type PutMyBookBody = z.infer<typeof putMyBookBodySchema>;

export const putMyBookResponseSchema = myBookSchema;
export type PutMyBookResponse = z.infer<typeof putMyBookResponseSchema>;

// GET /users/:username/shelf  (your own, or an accepted friend's via visibleBooks)

export const userShelfParamsSchema = z.object({
  username: usernameSchema,
});
export type UserShelfParams = z.infer<typeof userShelfParamsSchema>;

export const userShelfResponseSchema = z.object({
  owner: publicUserSchema,
  isOwn: z.boolean(),
  counts: shelfCountsSchema,
  books: z.array(shelfBookSchema),
});
export type UserShelfResponse = z.infer<typeof userShelfResponseSchema>;
