/** Turns any thrown error into a sentence that's safe to show a member. */
import { isApiError } from "./client";

/** A message that's safe and useful to show a member. */
export function errorMessage(error: unknown): string {
  if (isApiError(error, "not_found")) return "We couldn't find that.";
  if (isApiError(error, "upstream_unavailable") && error.status === 503) {
    return "Open Library isn't responding right now. Your shelves still work; try searching again in a moment.";
  }
  if (isApiError(error)) return error.message;
  return "Something went wrong. Please try again.";
}
