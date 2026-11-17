/**
 * Every error the API returns has this shape: `{ error: { code, message } }`.
 *
 * `not_found` covers both "doesn't exist" and "not allowed": an unknown username,
 * a non-friend's shelf and someone else's import job all return the same 404 body,
 * so a response never reveals whether something exists.
 */
import { z } from "zod";

export const errorCodeSchema = z.enum([
  "validation_error", // 400
  "unauthorized", // 401: no session
  "not_found", // 404: missing OR not allowed
  "conflict", // 409: e.g. an import is already running, already friends
  "payload_too_large", // 413: CSV over 5 MB
  "upstream_unavailable", // 503: Open Library is down or slow (search only)
  "internal", // 500
]);
export type ErrorCode = z.infer<typeof errorCodeSchema>;

export const errorResponseSchema = z.object({
  error: z.object({
    code: errorCodeSchema,
    message: z.string(),
  }),
});
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
