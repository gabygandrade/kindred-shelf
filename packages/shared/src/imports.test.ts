import { describe, expect, it } from "vitest";
import { createImportBodySchema, fixImportRowParamsSchema, MAX_IMPORT_BYTES } from "./imports";

function csvOfSize(bytes: number): File {
  return new File(["x".repeat(bytes)], "goodreads_library_export.csv", { type: "text/csv" });
}

describe("createImportBodySchema", () => {
  it("accepts a CSV up to 5 MB", () => {
    expect(createImportBodySchema.safeParse({ file: csvOfSize(MAX_IMPORT_BYTES) }).success).toBe(
      true,
    );
  });

  it("rejects files over 5 MB and empty files", () => {
    expect(
      createImportBodySchema.safeParse({ file: csvOfSize(MAX_IMPORT_BYTES + 1) }).success,
    ).toBe(false);
    expect(createImportBodySchema.safeParse({ file: csvOfSize(0) }).success).toBe(false);
  });
});

describe("fixImportRowParamsSchema", () => {
  it("coerces the row number from the URL", () => {
    const params = { id: "0b8a3c1e-2f4d-4a5b-8c6d-7e8f9a0b1c2d", n: "12" };
    expect(fixImportRowParamsSchema.parse(params).n).toBe(12);
  });
});
