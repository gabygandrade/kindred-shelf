/** Hooks for adding, changing and removing my books, keeping the cached list in sync. */
import type { MyBook, PutMyBookBody } from "@kindred/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMyBook, putMyBook, shelfKeys } from "../api";

/** Add or change one of my books, then update the cached list with the server's answer. */
export function usePutMyBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ olKey, body }: { olKey: string; body: PutMyBookBody }) => putMyBook(olKey, body),
    onSuccess: (saved) => {
      queryClient.setQueryData<MyBook[]>(shelfKeys.mine(), (books) => {
        if (!books) return books;
        const others = books.filter((b) => b.work.olKey !== saved.work.olKey);
        return [...others, saved];
      });
      void queryClient.invalidateQueries({ queryKey: shelfKeys.all });
    },
  });
}

export function useDeleteMyBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMyBook,
    onSuccess: (_, olKey) => {
      queryClient.setQueryData<MyBook[]>(shelfKeys.mine(), (books) =>
        books?.filter((b) => b.work.olKey !== olKey),
      );
      void queryClient.invalidateQueries({ queryKey: shelfKeys.all });
    },
  });
}
