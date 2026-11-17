/** Fetchers for the Settings page: download my data as CSV and delete my account. */
import { requestBlob, requestNoContent } from "../../api/client";

export function downloadExport() {
  return requestBlob("/me/export");
}

export function deleteAccount() {
  return requestNoContent("DELETE", "/me");
}
