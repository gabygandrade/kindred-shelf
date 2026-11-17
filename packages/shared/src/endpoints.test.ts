import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { endpoints } from "./endpoints";

// Pull every `METHOD /path` out of the API table in the technical design, so
// adding an endpoint to the doc without a schema here fails the build.
function endpointsInTechnicalDesign(): string[] {
  const doc = readFileSync(new URL("../../../docs/TECHNICAL_DESIGN.md", import.meta.url), "utf8");
  const apiSection = doc.split("## API")[1]?.split("\n## ")[0] ?? "";
  const tableRows = apiSection.split("\n").filter((line) => line.startsWith("| "));
  return tableRows.flatMap((row) =>
    [...row.matchAll(/`(GET|POST|PUT|DELETE|PATCH) ([^`?\s]+)/g)].map((m) => `${m[1]} ${m[2]}`),
  );
}

describe("endpoints", () => {
  it("finds the API table in the technical design", () => {
    expect(endpointsInTechnicalDesign().length).toBeGreaterThan(15);
  });

  it("has a contract for every endpoint in the technical design", () => {
    const missing = endpointsInTechnicalDesign().filter((key) => !(key in endpoints));
    expect(missing).toEqual([]);
  });
});
