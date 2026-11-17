/**
 * Covers load straight from Open Library, built from cover_id (never ISBN).
 * `default=false` makes a missing cover a 404 instead of a blank image, so
 * the <img> fails and we draw a generated cover instead.
 */
export function coverUrl(coverId: number, size: "S" | "M" | "L" = "M"): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg?default=false`;
}

export function openLibraryUrl(olKey: string): string {
  return `https://openlibrary.org/works/${olKey}`;
}
