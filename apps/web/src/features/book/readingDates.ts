/** Formats when a book was read and how long it took, e.g. "Read in 17 days · Mar 2 – Mar 19, 2026". */
import type { ShelfBook } from "@kindred/shared";

const DAY_MS = 86_400_000;

// Reading dates are calendar dates with no time zone, so format them in UTC
// to stop "2026-03-02" showing as Mar 1 for anyone west of Greenwich.
function toDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00Z`);
}

function format(date: Date, withYear: boolean): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: withYear ? "numeric" : undefined,
    timeZone: "UTC",
  });
}

/** "Read in 17 days · Mar 2 – Mar 19, 2026", or a shorter line when a date is missing. */
export function readingDates({
  shelf,
  startedAt,
  finishedAt,
}: Pick<ShelfBook, "shelf" | "startedAt" | "finishedAt">): string | null {
  const start = startedAt ? toDate(startedAt) : null;
  const end = finishedAt ? toDate(finishedAt) : null;

  if (shelf === "read" && start && end) {
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY_MS));
    const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
    const unit = days === 1 ? "day" : "days";
    return `Read in ${days} ${unit} · ${format(start, !sameYear)} – ${format(end, true)}`;
  }
  if (shelf === "read" && end) return `Finished ${format(end, true)}`;
  if (shelf === "reading" && start) return `Started ${format(start, true)}`;
  return null;
}
