import { z } from "zod";
import {
  isoDateTimeSchema,
  publicUserSchema,
  shelfCountsSchema,
  userIdSchema,
  usernameSchema,
} from "./common";

/** An accepted friend, with book counts from `visibleBooks` (private books never counted). */
export const friendSchema = z.object({
  user: publicUserSchema,
  counts: shelfCountsSchema,
});
export type Friend = z.infer<typeof friendSchema>;

/** A pending request, seen from the caller's side. */
export const friendRequestSchema = z.object({
  user: publicUserSchema,
  direction: z.enum(["incoming", "outgoing"]),
});
export type FriendRequest = z.infer<typeof friendRequestSchema>;

// POST /friends/requests

export const sendFriendRequestBodySchema = z.object({
  username: usernameSchema,
});
export type SendFriendRequestBody = z.infer<typeof sendFriendRequestBodySchema>;

export const sendFriendRequestResponseSchema = friendRequestSchema;
export type SendFriendRequestResponse = z.infer<typeof sendFriendRequestResponseSchema>;

// GET /friends/requests

export const friendRequestsResponseSchema = z.object({
  incoming: z.array(friendRequestSchema),
  outgoing: z.array(friendRequestSchema),
});
export type FriendRequestsResponse = z.infer<typeof friendRequestsResponseSchema>;

// POST /friends/:userId/accept  and  DELETE /friends/:userId

export const friendParamsSchema = z.object({
  userId: userIdSchema,
});
export type FriendParams = z.infer<typeof friendParamsSchema>;

export const acceptFriendResponseSchema = friendSchema;
export type AcceptFriendResponse = z.infer<typeof acceptFriendResponseSchema>;

// GET /friends

export const friendsResponseSchema = z.object({
  friends: z.array(friendSchema),
});
export type FriendsResponse = z.infer<typeof friendsResponseSchema>;

// POST /friend-invites

export const createFriendInviteResponseSchema = z.object({
  url: z.url(),
  expiresAt: isoDateTimeSchema,
});
export type CreateFriendInviteResponse = z.infer<typeof createFriendInviteResponseSchema>;

// POST /friend-invites/:token/use

export const friendInviteParamsSchema = z.object({
  // 32 random bytes, base64url-encoded = 43 characters.
  token: z.string().regex(/^[A-Za-z0-9_-]{43,}$/, "Invalid invite link"),
});
export type FriendInviteParams = z.infer<typeof friendInviteParamsSchema>;

/** Using a link creates a pending request from its creator, which the caller still has to accept. */
export const useFriendInviteResponseSchema = friendRequestSchema;
export type UseFriendInviteResponse = z.infer<typeof useFriendInviteResponseSchema>;
