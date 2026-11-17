import { z } from "zod";
import { displayNameSchema, isoDateTimeSchema, userIdSchema, usernameSchema } from "./common";

/*
 * `/auth/*` is Better Auth's own handler, so its wire format belongs to Better Auth.
 * These schemas cover what the app adds or reads: the sign-up form (with our
 * username and invite code fields) and the signed-in member the app works with.
 */

export const emailSchema = z.email().trim().toLowerCase();

/** Better Auth's default limits. */
export const passwordSchema = z.string().min(8).max(128);

/** Sign-up codes are short so they can be typed or pasted from a message. */
export const inviteCodeSchema = z.string().trim().min(6).max(64);

// POST /auth/sign-up/email

export const signUpBodySchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
  username: usernameSchema,
  /** Required while INVITE_ONLY=true; the server ignores it once sign-up opens. */
  inviteCode: inviteCodeSchema.optional(),
});
export type SignUpBody = z.infer<typeof signUpBodySchema>;

// POST /auth/sign-in/email

export const signInBodySchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});
export type SignInBody = z.infer<typeof signInBodySchema>;

// GET /auth/get-session  (the part of the session the app uses)

export const sessionUserSchema = z.object({
  userId: userIdSchema,
  email: emailSchema,
  username: usernameSchema,
  displayName: displayNameSchema,
  /** Null until the member finishes or skips the Goodreads import step. */
  onboardedAt: isoDateTimeSchema.nullable(),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

export const sessionResponseSchema = z.object({
  user: sessionUserSchema.nullable(),
});
export type SessionResponse = z.infer<typeof sessionResponseSchema>;

// POST /invites  (create a sign-up code; no body)

export const createInviteResponseSchema = z.object({
  code: inviteCodeSchema,
  expiresAt: isoDateTimeSchema,
});
export type CreateInviteResponse = z.infer<typeof createInviteResponseSchema>;
