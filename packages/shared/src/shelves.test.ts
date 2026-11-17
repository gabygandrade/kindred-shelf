import { describe, expect, it } from "vitest";
import { myBookParamsSchema, putMyBookBodySchema, shelfBookSchema } from "./shelves";

describe("putMyBookBodySchema", () => {
  it("accepts a rated Read book", () => {
    const body = { shelf: "read", rating: 4, startedAt: "2026-03-02", finishedAt: "2026-03-19" };
    expect(putMyBookBodySchema.parse(body)).toEqual(body);
  });

  it("accepts a book with only a shelf", () => {
    expect(putMyBookBodySchema.safeParse({ shelf: "want" }).success).toBe(true);
  });

  it("rejects half stars and out-of-range ratings", () => {
    expect(putMyBookBodySchema.safeParse({ shelf: "read", rating: 3.5 }).success).toBe(false);
    expect(putMyBookBodySchema.safeParse({ shelf: "read", rating: 0 }).success).toBe(false);
    expect(putMyBookBodySchema.safeParse({ shelf: "read", rating: 6 }).success).toBe(false);
  });

  it("only allows a rating on the Read shelf", () => {
    expect(putMyBookBodySchema.safeParse({ shelf: "reading", rating: 3 }).success).toBe(false);
    expect(putMyBookBodySchema.safeParse({ shelf: "reading", rating: null }).success).toBe(true);
  });

  it("rejects a finish date before the start date", () => {
    const body = { shelf: "read", startedAt: "2026-03-19", finishedAt: "2026-03-02" };
    expect(putMyBookBodySchema.safeParse(body).success).toBe(false);
  });

  it("does not accept work details from the client", () => {
    const parsed = putMyBookBodySchema.parse({ shelf: "want", title: "Injected title" });
    expect(parsed).not.toHaveProperty("title");
  });
});

describe("myBookParamsSchema", () => {
  it("requires a work key in the URL", () => {
    expect(myBookParamsSchema.safeParse({ olKey: "OL45804W" }).success).toBe(true);
    expect(myBookParamsSchema.safeParse({ olKey: "nope" }).success).toBe(false);
  });
});

describe("shelfBookSchema", () => {
  it("never carries the private flag to friends", () => {
    expect(Object.keys(shelfBookSchema.shape)).not.toContain("isPrivate");
  });
});
