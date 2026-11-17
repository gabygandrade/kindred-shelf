/** Mock API for book search, over the fixture catalog. */
import { bookSearchQuerySchema, bookSearchResponseSchema } from "@kindred/shared";
import { http } from "msw";
import { db } from "../db";
import { API, apiError, json, latency, parseInput, queryObject, sessionUser } from "../http";

/** Type this into search to see the "Open Library is unavailable" state. */
export const SEARCH_FAILURE_QUERY = "offline";

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export const bookHandlers = [
  http.get(`${API}/books/search`, async ({ request }) => {
    await latency(400);
    const session = sessionUser();
    if ("response" in session) return session.response;
    const input = parseInput(bookSearchQuerySchema, queryObject(request));
    if ("response" in input) return input.response;

    const q = normalize(input.data.q);
    if (q === SEARCH_FAILURE_QUERY) {
      return apiError(503, "upstream_unavailable", "Open Library isn't responding");
    }

    // The real API searches Open Library; the mock searches the fixture catalog.
    const results = [...db.works.values()]
      .filter((w) => normalize(`${w.title} ${w.authors.join(" ")}`).includes(q))
      .map(({ olKey, title, authors, firstPublishYear, pageCount, coverId }) => ({
        olKey,
        title,
        authors,
        firstPublishYear,
        pageCount,
        coverId,
      }));
    return json(bookSearchResponseSchema, { results });
  }),
];
