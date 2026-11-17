/**
 * Only follow `?next=` to a path on this site. Anything else ("//evil.com",
 * "https://…") could send a member to another site right after signing in.
 */
export function safeNextPath(next: string | null): string {
  if (next?.startsWith("/") && !next.startsWith("//")) return next;
  return "/";
}
