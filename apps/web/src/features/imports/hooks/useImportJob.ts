/** Hook that follows one import job, polling until it finishes. */
import { useQuery } from "@tanstack/react-query";
import { isApiError } from "../../../api/client";
import { fetchImportJob, importKeys } from "../api";

/** Polls every 2 s while the job is queued or running, then stops. */
export function useImportJob(id: string, { poll = true }: { poll?: boolean } = {}) {
  return useQuery({
    queryKey: importKeys.job(id),
    queryFn: () => fetchImportJob(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return poll && (status === undefined || status === "queued" || status === "running")
        ? 2000
        : false;
    },
    retry: (count, error) => !isApiError(error, "not_found") && count < 2,
  });
}
