/** Hook for all of my books, on every shelf. */
import { useQuery } from "@tanstack/react-query";
import { fetchMyBooks, shelfKeys } from "../api";

/** All of my books (every shelf). Screens filter locally, so one request feeds them all. */
export function useMyBooks() {
  return useQuery({ queryKey: shelfKeys.mine(), queryFn: fetchMyBooks });
}
