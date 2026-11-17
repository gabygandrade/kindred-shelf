/** Hook that runs a book search for the current query. */
import { useQuery } from "@tanstack/react-query";
import { searchBooks, searchKeys } from "../api";

export function useBookSearch(q: string) {
  return useQuery({
    queryKey: searchKeys.results(q),
    queryFn: () => searchBooks(q),
    enabled: q.length > 0,
    // Live search fails fast (technical design): show the retry message, don't spin.
    retry: false,
    staleTime: 5 * 60_000,
  });
}
