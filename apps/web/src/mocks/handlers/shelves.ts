/** Mock API for shelves: my books, adding or changing one, and other members' shelves. */
import {
  myBookParamsSchema,
  myBooksQuerySchema,
  myBooksResponseSchema,
  putMyBookBodySchema,
  putMyBookResponseSchema,
  userShelfParamsSchema,
  userShelfResponseSchema,
} from "@kindred/shared";
import { http } from "msw";
import { countShelves, myBooks, visibleBooks } from "../access";
import { db, findUserByUsername, friendshipBetween, today, type MockUserBook } from "../db";
import {
  API,
  json,
  latency,
  noContent,
  notFound,
  parseInput,
  queryObject,
  readJson,
  sessionUser,
} from "../http";

export const shelfHandlers = [
  http.get(`${API}/me/books`, async ({ request }) => {
    await latency();
    const session = sessionUser();
    if ("response" in session) return session.response;
    const input = parseInput(myBooksQuerySchema, queryObject(request));
    if ("response" in input) return input.response;
    const books = myBooks(session.userId).filter(
      (b) => !input.data.shelf || b.shelf === input.data.shelf,
    );
    return json(myBooksResponseSchema, { books });
  }),

  http.put(`${API}/me/books/:olKey`, async ({ request, params }) => {
    await latency();
    const session = sessionUser();
    if ("response" in session) return session.response;
    const p = parseInput(myBookParamsSchema, params);
    if ("response" in p) return p.response;
    const body = parseInput(putMyBookBodySchema, await readJson(request));
    if ("response" in body) return body.response;

    // Only the key comes from the client; work details come from the catalog
    // (the real server fetches them from Open Library if they're missing).
    if (!db.works.has(p.data.olKey)) return notFound();

    const { shelf, rating, startedAt, finishedAt, isPrivate } = body.data;
    let row = db.userBooks.find((b) => b.userId === session.userId && b.olKey === p.data.olKey);
    const moved = !row || row.shelf !== shelf;
    if (!row) {
      row = {
        userId: session.userId,
        olKey: p.data.olKey,
        shelf,
        rating: null,
        startedAt: null,
        finishedAt: null,
        isPrivate: false,
        source: "manual",
      } satisfies MockUserBook;
      db.userBooks.push(row);
    }
    // Moving a book records today's date (started for Reading, finished for
    // Read) unless the client sent one.
    if (moved && shelf === "reading" && startedAt === undefined) row.startedAt = today();
    if (moved && shelf === "read" && finishedAt === undefined) row.finishedAt = today();
    row.shelf = shelf;
    if (shelf !== "read") row.rating = null;
    if (rating !== undefined) row.rating = rating;
    if (startedAt !== undefined) row.startedAt = startedAt;
    if (finishedAt !== undefined) row.finishedAt = finishedAt;
    if (isPrivate !== undefined) row.isPrivate = isPrivate;

    const saved = myBooks(session.userId).find((b) => b.work.olKey === p.data.olKey);
    if (!saved) return notFound();
    return json(putMyBookResponseSchema, saved);
  }),

  http.delete(`${API}/me/books/:olKey`, async ({ params }) => {
    await latency();
    const session = sessionUser();
    if ("response" in session) return session.response;
    const p = parseInput(myBookParamsSchema, params);
    if ("response" in p) return p.response;
    db.userBooks = db.userBooks.filter(
      (b) => !(b.userId === session.userId && b.olKey === p.data.olKey),
    );
    return noContent();
  }),

  http.get(`${API}/users/:username/shelf`, async ({ params }) => {
    await latency();
    const session = sessionUser();
    if ("response" in session) return session.response;
    const p = parseInput(userShelfParamsSchema, params);
    if ("response" in p) return notFound();

    const owner = findUserByUsername(p.data.username);
    if (!owner) return notFound();
    const isOwn = owner.userId === session.userId;
    // Not yourself and not an accepted friend: the same 404 as an unknown username.
    if (!isOwn && friendshipBetween(session.userId, owner.userId)?.status !== "accepted") {
      return notFound();
    }
    const books = visibleBooks(session.userId, owner.userId);
    const response = json(userShelfResponseSchema, {
      owner: { userId: owner.userId, username: owner.username, displayName: owner.displayName },
      isOwn,
      counts: countShelves(books),
      books,
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  }),
];
