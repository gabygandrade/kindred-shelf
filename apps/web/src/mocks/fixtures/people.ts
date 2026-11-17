/** The mock members (Reader A, Friend B, …), their books, friendships and invite codes. */
import type { Shelf } from "@kindred/shared";
import type { MockFriendship, MockUser, MockUserBook } from "../db";
import { WORKS } from "./works";

// Generic placeholder people only (CLAUDE.md): never real names.
export const READER_A: MockUser = {
  userId: "user_reader_a",
  username: "reader_a",
  displayName: "Reader A",
  email: "reader.a@example.com",
  password: "password123",
};
const FRIEND_B: MockUser = {
  userId: "user_friend_b",
  username: "friend_b",
  displayName: "Friend B",
  email: "friend.b@example.com",
  password: "password123",
};
const FRIEND_C: MockUser = {
  userId: "user_friend_c",
  username: "friend_c",
  displayName: "Friend C",
  email: "friend.c@example.com",
  password: "password123",
};
const READER_D: MockUser = {
  userId: "user_reader_d",
  username: "reader_d",
  displayName: "Reader D",
  email: "reader.d@example.com",
  password: "password123",
};
const STRANGER_E: MockUser = {
  userId: "user_stranger_e",
  username: "stranger_e",
  displayName: "Stranger E",
  email: "stranger.e@example.com",
  password: "password123",
};

const FRIEND_F: MockUser = {
  userId: "user_friend_f",
  username: "friend_f",
  displayName: "Friend F",
  email: "friend.f@example.com",
  password: "password123",
};

export const SEED_USERS: MockUser[] = [
  READER_A,
  FRIEND_B,
  FRIEND_C,
  READER_D,
  STRANGER_E,
  FRIEND_F,
];

/** Sign-up codes that work in the mocks. */
export const SEED_INVITE_CODES = ["WELCOME-2026"];

/** A friend invite link made by Friend F (no connection to anyone yet); open /invite/<this> to try it. */
export const SEED_FRIEND_INVITE_CREATOR = FRIEND_F.userId;
export const SEED_FRIEND_INVITE_TOKEN = "mockInviteTokenFromFriendC_0123456789abcdefghij";

function book(
  userId: string,
  work: { olKey: string },
  shelf: Shelf,
  options: Partial<Omit<MockUserBook, "userId" | "olKey" | "shelf">> = {},
): MockUserBook {
  return {
    userId,
    olKey: work.olKey,
    shelf,
    rating: null,
    startedAt: null,
    finishedAt: null,
    isPrivate: false,
    source: "manual",
    ...options,
  };
}

function readBook(
  userId: string,
  work: { olKey: string },
  rating: number | null,
  finishedAt: string,
  isPrivate = false,
) {
  return book(userId, work, "read", { rating, finishedAt, isPrivate, source: "goodreads" });
}

const A = READER_A.userId;
const B = FRIEND_B.userId;
const E = STRANGER_E.userId;

export const SEED_USER_BOOKS: MockUserBook[] = [
  // Reader A: 18 read, 2 reading, 3 want.
  book(A, WORKS.janeEyre, "read", { rating: 5, startedAt: "2026-03-02", finishedAt: "2026-03-19" }),
  readBook(A, WORKS.pride, 5, "2025-01-12"),
  readBook(A, WORKS.mobyDick, 3, "2025-02-20"),
  readBook(A, WORKS.frankenstein, 4, "2025-03-30"),
  readBook(A, WORKS.gatsby, 4, "2025-04-11"),
  readBook(A, WORKS.middlemarch, 5, "2025-05-25"),
  readBook(A, WORKS.littleWomen, null, "2025-06-14"),
  readBook(A, WORKS.dracula, 4, "2025-07-03"),
  readBook(A, WORKS.wuthering, 4, "2025-08-09"),
  readBook(A, WORKS.annaKarenina, 5, "2025-09-21"),
  readBook(A, WORKS.emma, 3, "2025-10-30"),
  readBook(A, WORKS.persuasion, 5, "2025-11-15"),
  readBook(A, WORKS.greatExpectations, 4, "2025-12-28"),
  readBook(A, WORKS.ageOfInnocence, 4, "2026-01-17"),
  readBook(A, WORKS.mrsDalloway, 3, "2026-02-08"),
  readBook(A, WORKS.secretGarden, 4, "2026-04-22"),
  readBook(A, WORKS.roomWithAView, 4, "2026-05-30"),
  readBook(A, WORKS.dorianGray, 2, "2026-06-18", true),
  book(A, WORKS.monteCristo, "reading", { startedAt: "2026-09-01" }),
  book(A, WORKS.shirley, "reading", { startedAt: "2026-11-02" }),
  book(A, WORKS.warAndPeace, "want"),
  book(A, WORKS.copperfield, "want"),
  book(A, WORKS.timeMachine, "want"),

  // Friend B: an accepted friend with one private book (Carmilla) that must never reach Reader A.
  readBook(B, WORKS.pride, 4, "2025-03-01"),
  readBook(B, WORKS.timeMachine, 5, "2025-05-10"),
  readBook(B, WORKS.invisibleMan, 4, "2025-07-19"),
  readBook(B, WORKS.carmilla, 5, "2025-10-31", true),
  readBook(B, WORKS.treasure, 3, "2026-01-04"),
  readBook(B, WORKS.northanger, 4, "2026-03-15"),
  book(B, WORKS.sense, "reading", { startedAt: "2026-10-20" }),
  book(B, WORKS.copperfield, "want"),

  // Stranger E: not a friend, so their shelf is a 404 for Reader A.
  readBook(E, WORKS.dracula, 5, "2026-01-01"),
];

export const SEED_FRIENDSHIPS: MockFriendship[] = [
  { a: A, b: B, status: "accepted", requestedBy: B },
  { a: A, b: FRIEND_C.userId, status: "pending", requestedBy: FRIEND_C.userId },
  { a: A, b: READER_D.userId, status: "pending", requestedBy: A },
];
