/**
 * How each book's spine looks (color, width, height, text color), worked out from
 * the book itself so the same book looks the same everywhere.
 */
import type { Work } from "@kindred/shared";

/**
 * The v1 spine palette. Hex values mirror --spine-1…8 in tokens.css (a test
 * keeps them in sync); we need them here only to pick a readable ink color.
 */
export const SPINE_PALETTE = [
  "#c2553d",
  "#3e7c6b",
  "#4a63a8",
  "#d4a24c",
  "#7d4e8f",
  "#2f8f9d",
  "#b8475f",
  "#6e8b3d",
] as const;

const INK_LIGHT = "#ffffff"; // --color-ink-light
const INK_DARK = "#14161f"; // --color-bg

export interface SpineStyle {
  /** 0-based palette index; pass it as `previousColorIndex` for the next spine. */
  colorIndex: number;
  /** CSS value for the spine background, e.g. "var(--spine-3)". */
  background: string;
  /** CSS value for text on the spine (also used on the generated cover). */
  ink: string;
  width: number;
  height: number;
}

/** Same hash as the mockups: stable across sessions and devices. */
export function hash(s: string): number {
  let x = 7;
  for (const ch of s) x = (x * 31 + ch.charCodeAt(0)) >>> 0;
  return x;
}

/** WCAG relative luminance of a #rrggbb color. */
function luminance(hex: string): number {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** Whichever ink reads better on this color (every palette color reaches 4.5:1 with one of them). */
export function inkFor(hex: string): "light" | "dark" {
  return contrastRatio(hex, INK_LIGHT) >= contrastRatio(hex, INK_DARK) ? "light" : "dark";
}

/**
 * How a book's spine looks (docs/design/README.md, "Spine rules"). Pure and
 * deterministic: the same book looks the same everywhere, and neighbors differ.
 */
export function spineStyle(
  work: Pick<Work, "olKey" | "pageCount">,
  previousColorIndex: number | null,
): SpineStyle {
  const h = hash(work.olKey);
  let colorIndex = h % SPINE_PALETTE.length;
  if (colorIndex === previousColorIndex) colorIndex = (colorIndex + 3) % SPINE_PALETTE.length;
  const hex = SPINE_PALETTE[colorIndex] ?? SPINE_PALETTE[0];

  return {
    colorIndex,
    background: `var(--spine-${colorIndex + 1})`,
    ink: inkFor(hex) === "light" ? "var(--color-ink-light)" : "var(--color-bg)",
    width: work.pageCount ? Math.min(60, Math.max(30, Math.round(work.pageCount / 13))) : 40,
    height: 196 + (h % 6) * 9,
  };
}

/** Styles for a row of books, left to right, so each avoids its neighbor's color. */
export function spineStyles(works: Pick<Work, "olKey" | "pageCount">[]): SpineStyle[] {
  let previous: number | null = null;
  return works.map((work) => {
    const style = spineStyle(work, previous);
    previous = style.colorIndex;
    return style;
  });
}
