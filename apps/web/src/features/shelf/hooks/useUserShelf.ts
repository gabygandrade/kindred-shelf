/** Hook for another member's shelf, as much of it as I'm allowed to see. */
import { useQuery } from "@tanstack/react-query";
import { isApiError } from "../../../api/client";
import { fetchUserShelf, shelfKeys } from "../api";

export function useUserShelf(username: string) {
  return useQuery({
    queryKey: shelfKeys.user(username),
    queryFn: () => fetchUserShelf(username),
    // A 404 means "not yours to see": retrying won't change that.
    retry: (count, error) => !isApiError(error, "not_found") && count < 2,
  });
}
