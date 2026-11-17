import { z } from "zod";

/** Open Library work key, e.g. "OL45804W". We track works, never editions. */
export const olKeySchema = z.string().regex(/^OL\d+W$/, "Expected an Open Library work key");

/** Better Auth user ids are opaque strings. */
export const userIdSchema = z.string().min(1).max(64);

/**
 * Public handle used for friend requests and shelf URLs.
 * Lowercase so "Reader" and "reader" can never be two different people.
 */
export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(30)
  .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers and underscores");

export const displayNameSchema = z.string().trim().min(1).max(60);

/** Calendar date without time ("2026-03-19"). Reading dates have no time zone. */
export const isoDateSchema = z.iso.date();

/** Instant in time, always UTC with offset ("2026-11-16T21:00:00Z"). */
export const isoDateTimeSchema = z.iso.datetime({ offset: true });

export const shelfSchema = z.enum(["reading", "read", "want"]);
export type Shelf = z.infer<typeof shelfSchema>;

/** Whole stars only (PRD P0-2). */
export const ratingSchema = z.number().int().min(1).max(5);

/** Book counts per shelf. Always computed from `visibleBooks`, so private books never show up in a friend's totals. */
export const shelfCountsSchema = z.object({
  reading: z.number().int().nonnegative(),
  read: z.number().int().nonnegative(),
  want: z.number().int().nonnegative(),
});
export type ShelfCounts = z.infer<typeof shelfCountsSchema>;

/** The public face of a member: what friends (and pending requesters) may see. */
export const publicUserSchema = z.object({
  userId: userIdSchema,
  username: usernameSchema,
  displayName: displayNameSchema,
});
export type PublicUser = z.infer<typeof publicUserSchema>;

/** Response body for 204 No Content routes. */
export const noContentSchema = z.undefined();
