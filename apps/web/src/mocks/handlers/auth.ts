/** Mock API for sign-in, sign-up, sign-out and the session. */
import {
  createInviteResponseSchema,
  sessionResponseSchema,
  signInBodySchema,
  signUpBodySchema,
  type SessionUser,
} from "@kindred/shared";
import { http } from "msw";
import { db, findUser, getSessionUserId, setSessionUserId, type MockUser } from "../db";
import {
  API,
  apiError,
  json,
  latency,
  noContent,
  parseInput,
  readJson,
  sessionUser,
} from "../http";

function toSessionUser(user: MockUser): SessionUser {
  return {
    userId: user.userId,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    onboardedAt: null,
  };
}

export const authHandlers = [
  http.get(`${API}/auth/get-session`, async () => {
    await latency(100);
    const userId = getSessionUserId();
    const user = userId ? findUser(userId) : undefined;
    return json(sessionResponseSchema, { user: user ? toSessionUser(user) : null });
  }),

  http.post(`${API}/auth/sign-in/email`, async ({ request }) => {
    await latency();
    const input = parseInput(signInBodySchema, await readJson(request));
    if ("response" in input) return input.response;
    const user = db.users.find((u) => u.email === input.data.email);
    // Same message for "no such email" and "wrong password".
    if (user?.password !== input.data.password) {
      return apiError(401, "unauthorized", "That email and password don't match");
    }
    setSessionUserId(user.userId);
    return json(sessionResponseSchema, { user: toSessionUser(user) });
  }),

  http.post(`${API}/auth/sign-up/email`, async ({ request }) => {
    await latency();
    const input = parseInput(signUpBodySchema, await readJson(request));
    if ("response" in input) return input.response;
    const { email, password, displayName, username, inviteCode } = input.data;

    // v1 is invite-only (INVITE_ONLY=true on the real server).
    const codeIndex = inviteCode ? db.inviteCodes.indexOf(inviteCode) : -1;
    if (codeIndex === -1) {
      return apiError(400, "validation_error", "That invite code isn't valid or was already used");
    }
    if (db.users.some((u) => u.email === email)) {
      return apiError(409, "conflict", "An account with that email already exists");
    }
    if (db.users.some((u) => u.username === username)) {
      return apiError(409, "conflict", "That username is taken");
    }

    db.inviteCodes.splice(codeIndex, 1); // single use
    const user: MockUser = { userId: `user_${username}`, username, displayName, email, password };
    db.users.push(user);
    setSessionUserId(user.userId);
    return json(sessionResponseSchema, { user: toSessionUser(user) });
  }),

  http.post(`${API}/auth/sign-out`, async () => {
    await latency(100);
    setSessionUserId(null);
    return noContent();
  }),

  http.post(`${API}/invites`, async () => {
    await latency();
    const session = sessionUser();
    if ("response" in session) return session.response;
    const code = `KIND-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    db.inviteCodes.push(code);
    const expiresAt = new Date(Date.now() + 14 * 86_400_000).toISOString();
    return json(createInviteResponseSchema, { code, expiresAt }, 201);
  }),
];
