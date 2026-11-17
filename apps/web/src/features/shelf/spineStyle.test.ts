// @vitest-environment node
// Pure functions: no DOM needed, and Node lets the palette test read tokens.css.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio, hash, inkFor, SPINE_PALETTE, spineStyle, spineStyles } from "./spineStyle";

const book = (olKey: string, pageCount: number | null = 300) => ({ olKey, pageCount });

describe("spineStyle", () => {
  it("gives the same book the same look every time", () => {
    expect(spineStyle(book("OL66554W"), null)).toEqual(spineStyle(book("OL66554W"), null));
  });

  it("uses the mockups' hash", () => {
    expect(hash("a")).toBe(7 * 31 + 97);
  });

  it("never gives two neighbors the same color", () => {
    const keys = Array.from({ length: 200 }, (_, i) => `OL${i * 7919}W`);
    const styles = spineStyles(keys.map((k) => book(k)));
    styles.slice(1).forEach((style, i) => {
      expect(style.colorIndex).not.toBe(styles[i]?.colorIndex);
    });
  });

  it("scales width with page count, clamped to 30–60px, 40px when unknown", () => {
    expect(spineStyle(book("OL1W", 520), null).width).toBe(40);
    expect(spineStyle(book("OL1W", 100), null).width).toBe(30);
    expect(spineStyle(book("OL1W", 2000), null).width).toBe(60);
    expect(spineStyle(book("OL1W", null), null).width).toBe(40);
  });

  it("varies height between 196 and 241px", () => {
    const heights = new Set(
      Array.from({ length: 50 }, (_, i) => spineStyle(book(`OL${i}W`), null).height),
    );
    for (const h of heights) expect(h).toBeGreaterThanOrEqual(196);
    for (const h of heights) expect(h).toBeLessThanOrEqual(241);
    expect(heights.size).toBeGreaterThan(1);
  });
});

describe("spine palette", () => {
  it("matches --spine-1…8 in tokens.css", () => {
    const tokensCss = readFileSync(new URL("../../styles/tokens.css", import.meta.url), "utf8");
    SPINE_PALETTE.forEach((hex, i) => {
      expect(tokensCss).toContain(`--spine-${i + 1}: ${hex};`);
    });
  });

  it("keeps spine text at 4.5:1 contrast or better for every color", () => {
    for (const hex of SPINE_PALETTE) {
      const ink = inkFor(hex) === "light" ? "#ffffff" : "#14161f";
      expect(contrastRatio(hex, ink)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
