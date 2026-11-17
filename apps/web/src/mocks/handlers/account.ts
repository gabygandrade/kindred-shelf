/** Mock API for the Settings page: data export and account deletion. */
import { ACCOUNT_EXPORT_COLUMNS } from "@kindred/shared";
import { http, HttpResponse } from "msw";
import { myBooks } from "../access";
import { db, setSessionUserId } from "../db";
import { API, latency, noContent, sessionUser } from "../http";

function csvCell(value: string | number | boolean | null): string {
  const s = value === null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const accountHandlers = [
  http.get(`${API}/me/export`, async () => {
    await latency();
    const session = sessionUser();
    if ("response" in session) return session.response;
    const rows = myBooks(session.userId).map((b) =>
      [
        b.work.title,
        b.work.authors.join("; "),
        b.work.olKey,
        b.shelf,
        b.rating,
        b.startedAt,
        b.finishedAt,
        b.isPrivate,
      ]
        .map(csvCell)
        .join(","),
    );
    const csv = [ACCOUNT_EXPORT_COLUMNS.join(","), ...rows].join("\n");
    return new HttpResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="kindred-shelf-export.csv"',
      },
    });
  }),

  http.delete(`${API}/me`, async () => {
    await latency();
    const session = sessionUser();
    if ("response" in session) return session.response;
    const me = session.userId;
    db.userBooks = db.userBooks.filter((b) => b.userId !== me);
    db.friendships = db.friendships.filter((f) => f.a !== me && f.b !== me);
    db.importJobs = db.importJobs.filter((j) => j.userId !== me);
    db.users = db.users.filter((u) => u.userId !== me);
    setSessionUserId(null);
    return noContent();
  }),
];
