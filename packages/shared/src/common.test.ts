import { describe, expect, it } from "vitest";
import { olKeySchema, usernameSchema } from "./common";
import { errorResponseSchema } from "./errors";

describe("olKeySchema", () => {
  it("accepts work keys and rejects edition keys", () => {
    expect(olKeySchema.safeParse("OL45804W").success).toBe(true);
    expect(olKeySchema.safeParse("OL7353617M").success).toBe(false);
    expect(olKeySchema.safeParse("/works/OL45804W").success).toBe(false);
  });
});

describe("usernameSchema", () => {
  it("normalizes case and whitespace so one handle can't exist twice", () => {
    expect(usernameSchema.parse("  Reader_A ")).toBe("reader_a");
  });

  it("rejects characters that don't belong in a URL segment", () => {
    expect(usernameSchema.safeParse("reader a").success).toBe(false);
    expect(usernameSchema.safeParse("../admin").success).toBe(false);
  });
});

describe("errorResponseSchema", () => {
  it("matches the { error: { code, message } } shape", () => {
    const body = { error: { code: "not_found", message: "Not found" } };
    expect(errorResponseSchema.parse(body)).toEqual(body);
    expect(errorResponseSchema.safeParse({ error: "Not found" }).success).toBe(false);
  });
});
