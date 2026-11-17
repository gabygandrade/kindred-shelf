/** Mock API for Goodreads imports, with a pretend worker that finishes a job over a few polls. */
import {
  createImportBodySchema,
  createImportResponseSchema,
  fixImportRowBodySchema,
  fixImportRowParamsSchema,
  fixImportRowResponseSchema,
  importJobParamsSchema,
  importJobResponseSchema,
  MAX_IMPORT_BYTES,
  type ImportRow,
} from "@kindred/shared";
import { http } from "msw";
import { db, type MockImportJob, type MockUserBook } from "../db";
import { IMPORT_MATCHES, IMPORT_UNMATCHED_ROWS } from "../fixtures/imports";
import { API, apiError, json, latency, notFound, parseInput, readJson, sessionUser } from "../http";

/** How many polls a simulated import takes to finish. */
const POLLS_TO_FINISH = 4;

/** Insert unless the book is already on the shelf: re-import never changes an existing row. */
function insertOrIgnore(book: MockUserBook) {
  const exists = db.userBooks.some((b) => b.userId === book.userId && b.olKey === book.olKey);
  if (!exists) db.userBooks.push(book);
}

/** Each poll moves the fake worker along; the last one writes the books. */
function advance(job: MockImportJob) {
  if (job.status === "done" || job.status === "failed") return;
  job.status = "running";
  const step = Math.ceil(job.total / POLLS_TO_FINISH);
  const processed = Math.min(job.total, job.matched + job.unmatched + step);
  // Pretend the matchable rows come first and the unmatched ones last.
  job.matched = Math.min(processed, job.total - job.rows.length);
  job.unmatched = processed - job.matched;
  if (processed === job.total) {
    job.status = "done";
    job.pendingBooks.forEach(insertOrIgnore);
  }
}

// Only the owner can read a job; anyone else gets the same 404 as a missing job.
function ownJob(id: string, userId: string): MockImportJob | undefined {
  return db.importJobs.find((j) => j.id === id && j.userId === userId);
}

function visibleRows(job: MockImportJob): ImportRow[] {
  return job.status === "done" ? job.rows : [];
}

export const importHandlers = [
  http.post(`${API}/imports`, async ({ request }) => {
    await latency(600);
    const session = sessionUser();
    if ("response" in session) return session.response;
    if (Number(request.headers.get("content-length")) > MAX_IMPORT_BYTES) {
      return apiError(413, "payload_too_large", "That file is larger than 5 MB");
    }
    const input = parseInput(createImportBodySchema, await request.text());
    if ("response" in input) return input.response;
    const active = db.importJobs.some(
      (j) => j.userId === session.userId && (j.status === "queued" || j.status === "running"),
    );
    if (active) return apiError(409, "conflict", "An import is already running");

    // The real API parses the CSV; the mock only counts its lines.
    const lines = input.data.split("\n").filter((l) => l.trim()).length - 1;
    const rows = IMPORT_UNMATCHED_ROWS.map((r) => ({ ...r }));
    const job: MockImportJob = {
      id: crypto.randomUUID(),
      userId: session.userId,
      status: "queued",
      total: Math.max(lines, IMPORT_MATCHES.length + rows.length),
      matched: 0,
      unmatched: 0,
      createdAt: new Date().toISOString(),
      rows,
      pendingBooks: IMPORT_MATCHES.map((m) => ({
        userId: session.userId,
        olKey: m.olKey,
        shelf: m.shelf,
        rating: m.rating,
        startedAt: null,
        finishedAt: m.finishedAt,
        isPrivate: false,
        source: "goodreads",
      })),
    };
    db.importJobs.push(job);
    return json(createImportResponseSchema, { jobId: job.id }, 202);
  }),

  http.get(`${API}/imports/:id`, async ({ params }) => {
    await latency(150);
    const session = sessionUser();
    if ("response" in session) return session.response;
    const p = parseInput(importJobParamsSchema, params);
    if ("response" in p) return notFound();
    const job = ownJob(p.data.id, session.userId);
    if (!job) return notFound();
    advance(job);
    const { id, status, total, matched, unmatched, createdAt } = job;
    return json(importJobResponseSchema, {
      ...{ id, status, total, matched, unmatched, createdAt },
      rows: visibleRows(job),
    });
  }),

  http.post(`${API}/imports/:id/rows/:n/fix`, async ({ request, params }) => {
    await latency();
    const session = sessionUser();
    if ("response" in session) return session.response;
    const p = parseInput(fixImportRowParamsSchema, params);
    if ("response" in p) return notFound();
    const body = parseInput(fixImportRowBodySchema, await readJson(request));
    if ("response" in body) return body.response;

    const job = ownJob(p.data.id, session.userId);
    const row = job?.rows.find((r) => r.rowNumber === p.data.n);
    if (!job || !row || !db.works.has(body.data.olKey)) return notFound();

    if (row.status === "unmatched") job.unmatched -= 1;
    row.status = "fixed";
    row.workOlKey = body.data.olKey;
    insertOrIgnore({
      userId: session.userId,
      olKey: body.data.olKey,
      shelf: row.shelf,
      rating: null,
      startedAt: null,
      finishedAt: null,
      isPrivate: false,
      source: "goodreads",
    });
    return json(fixImportRowResponseSchema, row);
  }),
];
