import { z } from "zod";

// GET /me/export: the caller's books as a CSV download (text/csv), not JSON.
export const accountExportResponseSchema = z.string();
export type AccountExportResponse = z.infer<typeof accountExportResponseSchema>;

/** Columns of the export, in order. Only the caller's own data: no friend data is ever exported. */
export const ACCOUNT_EXPORT_COLUMNS = [
  "title",
  "authors",
  "open_library_key",
  "shelf",
  "rating",
  "started_at",
  "finished_at",
  "is_private",
] as const;

// DELETE /me: deletes the caller's account and all their data. 204, no body.
