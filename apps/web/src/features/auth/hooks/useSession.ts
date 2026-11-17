/** Hook for the signed-in member, shared by every screen through TanStack Query. */
import { useQuery } from "@tanstack/react-query";
import { authKeys, fetchSession } from "../api";

/** The signed-in member, or null. */
export function useSession() {
  const query = useQuery({
    queryKey: authKeys.session,
    queryFn: fetchSession,
    staleTime: 5 * 60_000,
  });
  return { ...query, user: query.data?.user ?? null };
}
