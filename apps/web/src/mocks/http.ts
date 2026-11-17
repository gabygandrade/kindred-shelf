/**
 * Helpers the mock handlers share: contract-checked JSON responses, errors,
 * input parsing, and the signed-in user.
 */
import type { ErrorCode } from "@kindred/shared";
import { errorResponseSchema } from "@kindred/shared";
import { HttpResponse } from "msw";
import type { z } from "zod";
import { getSessionUserId } from "./db";

/** Same base path the app's fetchers use. */
export { API_BASE as API } from "../api/config";

/** A little latency in the browser so loading states are visible; none in tests. */
export async function latency(ms = 250): Promise<void> {
  if (import.meta.env.MODE === "test") return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Validate a response against its shared schema before sending it. If a mock
 * ever drifts from the contract, this throws in dev instead of quietly
 * teaching the UI a shape the real API won't send.
 */
export function json<S extends z.ZodType>(schema: S, data: z.input<S>, status = 200) {
  return HttpResponse.json(schema.parse(data) as never, { status });
}

export function apiError(status: number, code: ErrorCode, message: string) {
  return HttpResponse.json(errorResponseSchema.parse({ error: { code, message } }), { status });
}

/** One body for "doesn't exist" and "not allowed", so a response never reveals which. */
export function notFound() {
  return apiError(404, "not_found", "Not found");
}

export function noContent() {
  return new HttpResponse(null, { status: 204 });
}

/** Parse request input; on failure return the 400 response instead. */
export function parseInput<S extends z.ZodType>(
  schema: S,
  input: unknown,
): { data: z.output<S> } | { response: Response } {
  const result = schema.safeParse(input);
  if (result.success) return { data: result.data };
  const message = result.error.issues[0]?.message ?? "Invalid request";
  return { response: apiError(400, "validation_error", message) };
}

/** The acting user always comes from the session, never from the request. */
export function sessionUser(): { userId: string } | { response: Response } {
  const userId = getSessionUserId();
  if (!userId) return { response: apiError(401, "unauthorized", "Please sign in") };
  return { userId };
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

export function queryObject(request: Request): Record<string, string> {
  return Object.fromEntries(new URL(request.url).searchParams);
}
