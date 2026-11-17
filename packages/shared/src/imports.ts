/**
 * API contract for the Goodreads import: what the web app and the API send each
 * other to upload a CSV, follow the import job, and fix rows that didn't match a
 * book. The web app, the mock API and the real API all import these schemas.
 */
import { z } from "zod";
import { isoDateTimeSchema, olKeySchema, shelfSchema } from "./common";

export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

export const importJobStatusSchema = z.enum(["queued", "running", "done", "failed"]);
export type ImportJobStatus = z.infer<typeof importJobStatusSchema>;

export const importRowStatusSchema = z.enum(["pending", "matched", "unmatched", "fixed"]);
export type ImportRowStatus = z.infer<typeof importRowStatusSchema>;

// POST /imports  (body: the Goodreads CSV itself, Content-Type: text/csv)
//
// A raw text body rather than multipart/form-data: there's only one file and
// no other fields, so the server can read it with one call and check its size,
// with no multipart parsing.

export const IMPORT_CONTENT_TYPE = "text/csv";

export const createImportBodySchema = z
  .string()
  .refine((csv) => csv.trim().length > 0, "The file is empty")
  .refine(
    (csv) => new TextEncoder().encode(csv).byteLength <= MAX_IMPORT_BYTES,
    "The file is larger than 5 MB",
  );
export type CreateImportBody = z.infer<typeof createImportBodySchema>;

export const createImportResponseSchema = z.object({
  jobId: z.uuid(),
});
export type CreateImportResponse = z.infer<typeof createImportResponseSchema>;

// GET /imports/:id

export const importJobParamsSchema = z.object({
  id: z.uuid(),
});
export type ImportJobParams = z.infer<typeof importJobParamsSchema>;

/** A row that needs (or got) a manual fix. Reviews and private notes are never stored or sent. */
export const importRowSchema = z.object({
  rowNumber: z.number().int().positive(),
  title: z.string(),
  author: z.string(),
  isbn10: z.string().nullable(),
  isbn13: z.string().nullable(),
  shelf: shelfSchema,
  status: importRowStatusSchema,
  workOlKey: olKeySchema.nullable(),
});
export type ImportRow = z.infer<typeof importRowSchema>;

export const importJobResponseSchema = z.object({
  id: z.uuid(),
  status: importJobStatusSchema,
  total: z.number().int().nonnegative(),
  matched: z.number().int().nonnegative(),
  unmatched: z.number().int().nonnegative(),
  createdAt: isoDateTimeSchema,
  /** Rows the member can fix: status `unmatched`, plus `fixed` ones so the list doesn't jump. */
  rows: z.array(importRowSchema),
});
export type ImportJobResponse = z.infer<typeof importJobResponseSchema>;

// POST /imports/:id/rows/:n/fix

export const fixImportRowParamsSchema = z.object({
  id: z.uuid(),
  // URL params arrive as strings.
  n: z.coerce.number().int().positive(),
});
export type FixImportRowParams = z.infer<typeof fixImportRowParamsSchema>;

/** The member picked the right work from search; the server fetches its details itself. */
export const fixImportRowBodySchema = z.object({
  olKey: olKeySchema,
});
export type FixImportRowBody = z.infer<typeof fixImportRowBodySchema>;

export const fixImportRowResponseSchema = importRowSchema;
export type FixImportRowResponse = z.infer<typeof fixImportRowResponseSchema>;
