/** Hooks for starting an import and fixing an unmatched row, refreshing my shelves afterwards. */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { shelfKeys } from "../../shelf/api";
import { createImport, fixImportRow, importKeys } from "../api";

export function useCreateImport() {
  return useMutation({ mutationFn: createImport });
}

export function useFixImportRow(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rowNumber, olKey }: { rowNumber: number; olKey: string }) =>
      fixImportRow(jobId, rowNumber, olKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: importKeys.job(jobId) });
      void queryClient.invalidateQueries({ queryKey: shelfKeys.all });
    },
  });
}
