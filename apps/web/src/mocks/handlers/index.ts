/**
 * Every endpoint in packages/shared's `endpoints` registry has a handler here.
 * Stage 3 turns these off one area at a time, so they're grouped the same way.
 */
import { authHandlers } from "./auth";
import { bookHandlers } from "./books";
import { importHandlers } from "./imports";
import { shelfHandlers } from "./shelves";

export const handlers = [...authHandlers, ...bookHandlers, ...shelfHandlers, ...importHandlers];
