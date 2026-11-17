/**
 * Every endpoint in packages/shared's `endpoints` registry gets a handler here.
 * Stage 3 turns these off one area at a time, so they're grouped the same way.
 */
import type { RequestHandler } from "msw";

export const handlers: RequestHandler[] = [];
