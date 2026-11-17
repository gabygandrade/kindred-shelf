/** Fetchers and query keys for sign-in, sign-up, sign-out and the current session. */
import {
  createInviteResponseSchema,
  sessionResponseSchema,
  type SignInBody,
  type SignUpBody,
} from "@kindred/shared";
import { requestJson, requestNoContent } from "../../api/client";

export const authKeys = {
  session: ["auth", "session"] as const,
};

export function fetchSession() {
  return requestJson("GET", "/auth/get-session", sessionResponseSchema);
}

export function signIn(body: SignInBody) {
  return requestJson("POST", "/auth/sign-in/email", sessionResponseSchema, { body });
}

export function signUp(body: SignUpBody) {
  return requestJson("POST", "/auth/sign-up/email", sessionResponseSchema, { body });
}

export function signOut() {
  return requestNoContent("POST", "/auth/sign-out");
}

export function createInvite() {
  return requestJson("POST", "/invites", createInviteResponseSchema);
}
