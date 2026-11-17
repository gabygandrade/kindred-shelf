/** Mock API for friends: requests, accepting, removing, and invite links. */
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
  type Friend,
  type FriendRequest,
  type PublicUser,
} from "@kindred/shared";
import { http } from "msw";
import { countShelves, visibleBooks } from "../access";
import { db, findUser, findUserByUsername, friendshipBetween, otherUserIn } from "../db";
import {
  API,
  apiError,
  json,
  latency,
  noContent,
  notFound,
  parseInput,
  readJson,
  sessionUser,
} from "../http";

function publicUser(userId: string): PublicUser {
  const user = findUser(userId);
  if (!user) throw new Error(`Mock data error: no user ${userId}`);
  return { userId: user.userId, username: user.username, displayName: user.displayName };
}

function toFriend(me: string, friendId: string): Friend {
  return { user: publicUser(friendId), counts: countShelves(visibleBooks(me, friendId)) };
}

function pendingRequests(me: string): FriendRequest[] {
  return db.friendships
    .filter((f) => f.status === "pending" && (f.a === me || f.b === me))
    .map((f) => ({
      user: publicUser(otherUserIn(f, me)),
      direction: f.requestedBy === me ? "outgoing" : "incoming",
    }));
}

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export const friendHandlers = [
  http.post(`${API}/friends/requests`, async ({ request }) => {
    await latency();
    const session = sessionUser();
    if ("response" in session) return session.response;
    const body = parseInput(sendFriendRequestBodySchema, await readJson(request));
    if ("response" in body) return body.response;
    const target = findUserByUsername(body.data.username);
    if (!target || target.userId === session.userId) return notFound();

    const existing = friendshipBetween(session.userId, target.userId);
    if (existing?.status === "accepted") return apiError(409, "conflict", "You're already friends");
    if (existing) return apiError(409, "conflict", "There's already a pending request between you");

    db.friendships.push({
      a: session.userId,
      b: target.userId,
      status: "pending",
      requestedBy: session.userId,
    });
    return json(
      sendFriendRequestResponseSchema,
      { user: publicUser(target.userId), direction: "outgoing" },
      201,
    );
  }),

  http.get(`${API}/friends/requests`, async () => {
    await latency();
    const session = sessionUser();
    if ("response" in session) return session.response;
    const requests = pendingRequests(session.userId);
    return json(friendRequestsResponseSchema, {
      incoming: requests.filter((r) => r.direction === "incoming"),
      outgoing: requests.filter((r) => r.direction === "outgoing"),
    });
  }),

  http.post(`${API}/friends/:userId/accept`, async ({ params }) => {
    await latency();
    const session = sessionUser();
    if ("response" in session) return session.response;
    const p = parseInput(friendParamsSchema, params);
    if ("response" in p) return notFound();
    const f = friendshipBetween(session.userId, p.data.userId);
    // Only the person who received the request can accept it.
    if (f?.status !== "pending" || f.requestedBy !== p.data.userId) return notFound();
    f.status = "accepted";
    const response = json(acceptFriendResponseSchema, toFriend(session.userId, p.data.userId));
    response.headers.set("Cache-Control", "no-store");
    return response;
  }),

  // Decline, cancel or remove: all delete the row, so access ends on the next request.
  http.delete(`${API}/friends/:userId`, async ({ params }) => {
    await latency();
    const session = sessionUser();
    if ("response" in session) return session.response;
    const p = parseInput(friendParamsSchema, params);
    if ("response" in p) return notFound();
    const f = friendshipBetween(session.userId, p.data.userId);
    db.friendships = db.friendships.filter((row) => row !== f);
    return noContent();
  }),

  http.get(`${API}/friends`, async () => {
    await latency();
    const session = sessionUser();
    if ("response" in session) return session.response;
    const friends = db.friendships
      .filter((f) => f.status === "accepted" && (f.a === session.userId || f.b === session.userId))
      .map((f) => toFriend(session.userId, otherUserIn(f, session.userId)));
    const response = json(friendsResponseSchema, { friends });
    response.headers.set("Cache-Control", "no-store");
    return response;
  }),

  http.post(`${API}/friend-invites`, async ({ request }) => {
    await latency();
    const session = sessionUser();
    if ("response" in session) return session.response;
    const token = randomToken();
    const expiresAt = new Date(Date.now() + 7 * 86_400_000).toISOString();
    db.friendInvites.push({ token, createdBy: session.userId, usedBy: null, expiresAt });
    const url = `${new URL(request.url).origin}/invite/${token}`;
    return json(createFriendInviteResponseSchema, { url, expiresAt }, 201);
  }),

  http.post(`${API}/friend-invites/:token/use`, async ({ params }) => {
    await latency();
    const session = sessionUser();
    if ("response" in session) return session.response;
    const p = parseInput(friendInviteParamsSchema, params);
    if ("response" in p) return notFound();
    const invite = db.friendInvites.find((i) => i.token === p.data.token);
    // Expired, used, self-created or unknown links all look the same.
    if (
      !invite ||
      invite.usedBy !== null ||
      invite.createdBy === session.userId ||
      new Date(invite.expiresAt) < new Date()
    ) {
      return notFound();
    }
    if (friendshipBetween(session.userId, invite.createdBy)) {
      return apiError(409, "conflict", "You're already connected with this person");
    }
    invite.usedBy = session.userId;
    // The link's creator becomes the requester; the person who opened it still accepts.
    db.friendships.push({
      a: invite.createdBy,
      b: session.userId,
      status: "pending",
      requestedBy: invite.createdBy,
    });
    return json(useFriendInviteResponseSchema, {
      user: publicUser(invite.createdBy),
      direction: "incoming",
    });
  }),
];
