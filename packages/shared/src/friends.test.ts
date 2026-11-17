import { describe, expect, it } from "vitest";
import { friendInviteParamsSchema, sendFriendRequestBodySchema } from "./friends";

describe("friendInviteParamsSchema", () => {
  it("accepts a 32-byte base64url token and rejects short ones", () => {
    expect(friendInviteParamsSchema.safeParse({ token: "a".repeat(43) }).success).toBe(true);
    expect(friendInviteParamsSchema.safeParse({ token: "abc123" }).success).toBe(false);
  });
});

describe("sendFriendRequestBodySchema", () => {
  it("only takes a username: the requester comes from the session", () => {
    const parsed = sendFriendRequestBodySchema.parse({ username: "Friend_B", requestedBy: "x" });
    expect(parsed).toEqual({ username: "friend_b" });
  });
});
