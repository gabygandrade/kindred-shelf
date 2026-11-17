import type { z } from "zod";
import { accountExportResponseSchema } from "./account";
import {
  createInviteResponseSchema,
  sessionResponseSchema,
  signInBodySchema,
  signUpBodySchema,
} from "./auth";
import { bookSearchQuerySchema, bookSearchResponseSchema } from "./books";
import { noContentSchema } from "./common";
import {
  acceptFriendResponseSchema,
  createFriendInviteResponseSchema,
  friendInviteParamsSchema,
  friendParamsSchema,
  friendRequestsResponseSchema,
  friendsResponseSchema,
  sendFriendRequestBodySchema,
  sendFriendRequestResponseSchema,
  useFriendInviteResponseSchema,
} from "./friends";
import {
  createImportBodySchema,
  createImportResponseSchema,
  fixImportRowBodySchema,
  fixImportRowParamsSchema,
  fixImportRowResponseSchema,
  importJobParamsSchema,
  importJobResponseSchema,
} from "./imports";
import {
  myBookParamsSchema,
  myBooksQuerySchema,
  myBooksResponseSchema,
  putMyBookBodySchema,
  putMyBookResponseSchema,
  userShelfParamsSchema,
  userShelfResponseSchema,
} from "./shelves";

interface EndpointContract {
  params?: z.ZodType;
  query?: z.ZodType;
  body?: z.ZodType;
  response: z.ZodType;
}

/**
 * Every endpoint in the technical design's API table, keyed by "METHOD /path".
 * Route handlers, MSW mocks and fetchers all look schemas up here, so the
 * mocks and the real API can't drift apart.
 *
 * Every route except /auth/* needs a session, and the acting user always
 * comes from that session, so no schema here carries a "current user" field.
 */
export const endpoints = {
  // Auth (Better Auth owns /auth/*; listed for the fields the app adds)
  "POST /auth/sign-up/email": { body: signUpBodySchema, response: sessionResponseSchema },
  "POST /auth/sign-in/email": { body: signInBodySchema, response: sessionResponseSchema },
  "POST /auth/sign-out": { response: noContentSchema },
  "GET /auth/get-session": { response: sessionResponseSchema },
  "POST /invites": { response: createInviteResponseSchema },

  // Search
  "GET /books/search": { query: bookSearchQuerySchema, response: bookSearchResponseSchema },

  // Shelves
  "GET /me/books": { query: myBooksQuerySchema, response: myBooksResponseSchema },
  "PUT /me/books/:olKey": {
    params: myBookParamsSchema,
    body: putMyBookBodySchema,
    response: putMyBookResponseSchema,
  },
  "DELETE /me/books/:olKey": { params: myBookParamsSchema, response: noContentSchema },

  // Import
  "POST /imports": { body: createImportBodySchema, response: createImportResponseSchema },
  "GET /imports/:id": { params: importJobParamsSchema, response: importJobResponseSchema },
  "POST /imports/:id/rows/:n/fix": {
    params: fixImportRowParamsSchema,
    body: fixImportRowBodySchema,
    response: fixImportRowResponseSchema,
  },

  // Bookshelf
  "GET /users/:username/shelf": {
    params: userShelfParamsSchema,
    response: userShelfResponseSchema,
  },

  // Friends
  "POST /friends/requests": {
    body: sendFriendRequestBodySchema,
    response: sendFriendRequestResponseSchema,
  },
  "GET /friends/requests": { response: friendRequestsResponseSchema },
  "POST /friends/:userId/accept": {
    params: friendParamsSchema,
    response: acceptFriendResponseSchema,
  },
  "DELETE /friends/:userId": { params: friendParamsSchema, response: noContentSchema },
  "GET /friends": { response: friendsResponseSchema },
  "POST /friend-invites": { response: createFriendInviteResponseSchema },
  "POST /friend-invites/:token/use": {
    params: friendInviteParamsSchema,
    response: useFriendInviteResponseSchema,
  },

  // Account
  "GET /me/export": { response: accountExportResponseSchema },
  "DELETE /me": { response: noContentSchema },
} as const satisfies Record<string, EndpointContract>;

export type EndpointKey = keyof typeof endpoints;
