/**
 * Every endpoint in packages/shared's `endpoints` registry has a handler here.
 * Stage 3 turns these off one area at a time, so they're grouped the same way.
 */
import { authHandlers } from "./auth";

export const handlers = [...authHandlers];
