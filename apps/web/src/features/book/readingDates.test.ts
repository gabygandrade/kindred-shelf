import { describe, expect, it } from "vitest";
import { readingDates } from "./readingDates";

describe("readingDates", () => {
  it("shows how long a finished book took, like the mockup", () => {
    expect(readingDates({ shelf: "read", startedAt: "2026-03-02", finishedAt: "2026-03-19" })).toBe(
      "Read in 17 days · Mar 2 – Mar 19, 2026",
    );
  });

  it("shows both years when a book spans New Year", () => {
    expect(readingDates({ shelf: "read", startedAt: "2025-12-28", finishedAt: "2026-01-03" })).toBe(
      "Read in 6 days · Dec 28, 2025 – Jan 3, 2026",
    );
  });

  it("counts a book finished the day it started as one day", () => {
    expect(readingDates({ shelf: "read", startedAt: "2026-03-02", finishedAt: "2026-03-02" })).toBe(
      "Read in 1 day · Mar 2 – Mar 2, 2026",
    );
  });

  it("falls back to whichever date exists", () => {
    expect(readingDates({ shelf: "read", startedAt: null, finishedAt: "2026-03-19" })).toBe(
      "Finished Mar 19, 2026",
    );
    expect(readingDates({ shelf: "reading", startedAt: "2026-11-02", finishedAt: null })).toBe(
      "Started Nov 2, 2026",
    );
    expect(readingDates({ shelf: "want", startedAt: null, finishedAt: null })).toBeNull();
  });
});
