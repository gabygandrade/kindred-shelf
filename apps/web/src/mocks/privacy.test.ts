import { describe, expect, it } from "vitest";
import { ApiError } from "../api/client";
import { signIn } from "../features/auth/api";
import {
  acceptFriend,
  fetchFriends,
  redeemFriendInvite,
  removeFriend,
} from "../features/friends/api";
import { createImport, fetchImportJob } from "../features/imports/api";
import { fetchMyBooks, fetchUserShelf } from "../features/shelf/api";
import { SEED_FRIEND_INVITE_TOKEN } from "./fixtures/people";
import { WORKS } from "./fixtures/works";

// The mocks follow the same privacy rules as the real API (technical design,
// "Testing" table), so the UI is never built around data it shouldn't get.

const signInAs = (who: string) => signIn({ email: `${who}@example.com`, password: "password123" });

async function errorOf(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof ApiError) return error;
    throw error;
  }
  throw new Error("Expected the request to fail");
}

describe("mock API privacy", () => {
  it("never shows a friend's private book, in the list or the counts", async () => {
    await signInAs("reader.a");
    const shelf = await fetchUserShelf("friend_b");
    const keys = shelf.books.map((b) => b.work.olKey);
    expect(keys).not.toContain(WORKS.carmilla.olKey);
    expect(shelf.counts.read).toBe(5); // 6 read books, 1 of them private
    expect(shelf.books[0]).not.toHaveProperty("isPrivate");

    const [friend] = await fetchFriends();
    expect(friend?.counts.read).toBe(5);
  });

  it("returns the same 404 for a stranger, a pending friend and an unknown username", async () => {
    await signInAs("reader.a");
    const stranger = await errorOf(fetchUserShelf("stranger_e"));
    const pending = await errorOf(fetchUserShelf("friend_c"));
    const unknown = await errorOf(fetchUserShelf("nobody_here"));
    for (const error of [stranger, pending, unknown]) {
      expect(error.status).toBe(404);
      expect(error.message).toBe(unknown.message);
    }
  });

  it("hides shelves on the very next request after removing a friend", async () => {
    await signInAs("reader.a");
    await fetchUserShelf("friend_b");
    await removeFriend("user_friend_b");
    expect((await errorOf(fetchUserShelf("friend_b"))).status).toBe(404);
  });

  it("doesn't let a requester accept their own request", async () => {
    await signInAs("reader.a"); // Reader A sent the request to Reader D
    expect((await errorOf(acceptFriend("user_reader_d"))).status).toBe(404);
  });

  it("only shows an import job to its owner", async () => {
    await signInAs("reader.a");
    const jobId = await createImport(new File(["Title,Author\nEmma,Austen\n"], "export.csv"));
    await signInAs("friend.b");
    expect((await errorOf(fetchImportJob(jobId))).status).toBe(404);
  });

  it("keeps a book's rating and privacy when the same file is imported again", async () => {
    await signInAs("reader.a");
    const before = (await fetchMyBooks()).find((b) => b.work.olKey === WORKS.pride.olKey);
    const jobId = await createImport(
      new File(["Title,Author\nPride and Prejudice,Austen\n"], "export.csv"),
    );
    let job = await fetchImportJob(jobId);
    while (job.status !== "done") job = await fetchImportJob(jobId);
    const after = (await fetchMyBooks()).find((b) => b.work.olKey === WORKS.pride.olKey);
    expect(after).toEqual(before);
  });

  it("rejects a friend invite link that was already used or that you made", async () => {
    await signInAs("reader.a");
    await redeemFriendInvite(SEED_FRIEND_INVITE_TOKEN);
    expect((await errorOf(redeemFriendInvite(SEED_FRIEND_INVITE_TOKEN))).status).toBe(404);
    await signInAs("friend.f");
    expect((await errorOf(redeemFriendInvite(SEED_FRIEND_INVITE_TOKEN))).status).toBe(404);
  });
});
