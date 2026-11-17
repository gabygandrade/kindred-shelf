/** Fetchers and query keys for Goodreads imports: upload a CSV, read a job, fix a row. */
import {
  createImportResponseSchema,
  fixImportRowResponseSchema,
  IMPORT_CONTENT_TYPE,
  importJobResponseSchema,
} from "@kindred/shared";
import { requestJson, segment } from "../../api/client";

export const importKeys = {
  job: (id: string) => ["imports", id] as const,
};

/** Upload a Goodreads export. The CSV is the request body (see createImportBodySchema). */
export async function createImport(file: Blob) {
  const { jobId } = await requestJson("POST", "/imports", createImportResponseSchema, {
    file: { data: file, contentType: IMPORT_CONTENT_TYPE },
  });
  return jobId;
}

export function fetchImportJob(id: string) {
  return requestJson("GET", `/imports/${segment(id)}`, importJobResponseSchema);
}

export function fixImportRow(jobId: string, rowNumber: number, olKey: string) {
  return requestJson(
    "POST",
    `/imports/${segment(jobId)}/rows/${segment(rowNumber)}/fix`,
    fixImportRowResponseSchema,
    { body: { olKey } },
  );
}
