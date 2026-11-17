/** Fetchers and query keys for friends: the friend list, requests and invite links. */
import {
  acceptFriendResponseSchema,
  createFriendInviteResponseSchema,
  friendRequestsResponseSchema,
  friendsResponseSchema,
  sendFriendRequestResponseSchema,
  useFriendInviteResponseSchema,
} from "@kindred/shared";
import { requestJson, requestNoContent, segment } from "../../api/client";

export const friendKeys = {
  all: ["friends"] as const,
  list: () => [...friendKeys.all, "list"] as const,
  requests: () => [...friendKeys.all, "requests"] as const,
};

export async function fetchFriends() {
  const { friends } = await requestJson("GET", "/friends", friendsResponseSchema);
  return friends;
}

export function fetchFriendRequests() {
  return requestJson("GET", "/friends/requests", friendRequestsResponseSchema);
}

export function sendFriendRequest(username: string) {
  return requestJson("POST", "/friends/requests", sendFriendRequestResponseSchema, {
    body: { username },
  });
}

export function acceptFriend(userId: string) {
  return requestJson("POST", `/friends/${segment(userId)}/accept`, acceptFriendResponseSchema);
}

/** Decline, cancel or remove: the API treats them the same. */
export function removeFriend(userId: string) {
  return requestNoContent("DELETE", `/friends/${segment(userId)}`);
}

export function createFriendInvite() {
  return requestJson("POST", "/friend-invites", createFriendInviteResponseSchema);
}

/** Named "redeem" so it isn't mistaken for a React hook. */
export function redeemFriendInvite(token: string) {
  return requestJson(
    "POST",
    `/friend-invites/${segment(token)}/use`,
    useFriendInviteResponseSchema,
  );
}
