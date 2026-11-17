/**
 * An in-memory stand-in for the Postgres tables in docs/TECHNICAL_DESIGN.md.
 * It resets on every page load (except the session), which is fine for mocks.
 */
import type { ImportJobStatus, ImportRow, MyBook, Work } from "@kindred/shared";
import {
  SEED_FRIENDSHIPS,
  SEED_FRIEND_INVITE_CREATOR,
  SEED_FRIEND_INVITE_TOKEN,
  SEED_INVITE_CODES,
  SEED_USERS,
  SEED_USER_BOOKS,
} from "./fixtures/people";
import { ALL_WORKS } from "./fixtures/works";

export interface MockUser {
  userId: string;
  username: string;
  displayName: string;
  email: string;
  password: string;
}

/** A `user_book` row. */
export type MockUserBook = Omit<MyBook, "work"> & { userId: string; olKey: string };

/**
 * A `friendship` row. The real table stores the pair as user_low < user_high so
 * A–B and B–A can't both exist; here `friendshipBetween` checks both orders.
 */
export interface MockFriendship {
  a: string;
  b: string;
  status: "pending" | "accepted";
  requestedBy: string;
}

export interface MockImportJob {
  id: string;
  userId: string;
  status: ImportJobStatus;
  total: number;
  matched: number;
  unmatched: number;
  createdAt: string;
  rows: ImportRow[];
  /** Books to put on the shelf once the simulated job finishes. */
  pendingBooks: MockUserBook[];
}

export interface MockFriendInvite {
  token: string;
  createdBy: string;
  usedBy: string | null;
  expiresAt: string;
}

export interface MockDb {
  users: MockUser[];
  works: Map<string, Work>;
  userBooks: MockUserBook[];
  friendships: MockFriendship[];
  importJobs: MockImportJob[];
  friendInvites: MockFriendInvite[];
  inviteCodes: string[];
}

function seed(): MockDb {
  return {
    users: SEED_USERS.map((u) => ({ ...u })),
    works: new Map(ALL_WORKS.map((w) => [w.olKey, w])),
    userBooks: SEED_USER_BOOKS.map((b) => ({ ...b })),
    friendships: SEED_FRIENDSHIPS.map((f) => ({ ...f })),
    importJobs: [],
    friendInvites: [
      {
        token: SEED_FRIEND_INVITE_TOKEN,
        createdBy: SEED_FRIEND_INVITE_CREATOR,
        usedBy: null,
        expiresAt: "2099-01-01T00:00:00Z",
      },
    ],
    inviteCodes: [...SEED_INVITE_CODES],
  };
}

export let db: MockDb = seed();

/** Tests call this between cases so each starts from the fixtures. */
export function resetDb(): void {
  db = seed();
  setSessionUserId(null);
}

// The mock session survives reloads (like a real cookie) via localStorage.
const SESSION_KEY = "kindred-mock-session";
let memorySession: string | null = null;

export function getSessionUserId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return memorySession;
  }
}

export function setSessionUserId(userId: string | null): void {
  memorySession = userId;
  try {
    if (userId) localStorage.setItem(SESSION_KEY, userId);
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    // Storage unavailable: the in-memory session still works for this page.
  }
}

export function findUser(userId: string): MockUser | undefined {
  return db.users.find((u) => u.userId === userId);
}

export function findUserByUsername(username: string): MockUser | undefined {
  return db.users.find((u) => u.username === username);
}

export function friendshipBetween(x: string, y: string): MockFriendship | undefined {
  return db.friendships.find((f) => (f.a === x && f.b === y) || (f.a === y && f.b === x));
}

export function otherUserIn(friendship: MockFriendship, me: string): string {
  return friendship.a === me ? friendship.b : friendship.a;
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
