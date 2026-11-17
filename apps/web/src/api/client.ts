/**
 * The one place the web app calls the API: sends the request, checks the response
 * against its shared schema, and turns error bodies into an ApiError.
 */
import { errorResponseSchema, type ErrorCode } from "@kindred/shared";
import type { z } from "zod";
import { API_BASE } from "./config";

/** An error response from the API, already parsed from `{ error: { code, message } }`. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isApiError(error: unknown, code?: ErrorCode): error is ApiError {
  return error instanceof ApiError && (code === undefined || error.code === code);
}

interface RequestOptions {
  query?: Record<string, string | undefined>;
  /** Sent as JSON. */
  body?: unknown;
  /** Sent as-is with its own content type (file uploads). */
  file?: { data: Blob; contentType: string };
}

function buildUrl(path: string, query: RequestOptions["query"]): URL {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, value);
  }
  return url;
}

async function send(method: string, path: string, options: RequestOptions = {}): Promise<Response> {
  const headers: Record<string, string> = { Accept: "application/json" };
  let body: BodyInit | undefined;
  if (options.file) {
    headers["Content-Type"] = options.file.contentType;
    body = options.file.data;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    // credentials: the session is an HttpOnly cookie set by Better Auth.
    response = await fetch(buildUrl(path, options.query), {
      method,
      headers,
      body,
      credentials: "include",
    });
  } catch {
    throw new ApiError(
      0,
      "upstream_unavailable",
      "Can't reach Kindred Shelf. Check your connection.",
    );
  }
  if (!response.ok) throw await toApiError(response);
  return response;
}

async function toApiError(response: Response): Promise<ApiError> {
  const parsed = errorResponseSchema.safeParse(await response.json().catch(() => null));
  if (parsed.success) {
    return new ApiError(response.status, parsed.data.error.code, parsed.data.error.message);
  }
  return new ApiError(response.status, "internal", "Something went wrong. Please try again.");
}

/**
 * Call an endpoint and validate the JSON response against its shared schema,
 * so a server that drifts from the contract fails loudly here, not deep in a component.
 */
export async function requestJson<S extends z.ZodType>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  schema: S,
  options?: RequestOptions,
): Promise<z.output<S>> {
  const response = await send(method, path, options);
  return schema.parse(await response.json());
}

/** For 204 No Content routes. */
export async function requestNoContent(
  method: "POST" | "DELETE",
  path: string,
  options?: RequestOptions,
): Promise<void> {
  await send(method, path, options);
}

/** For non-JSON downloads such as the CSV export. */
export async function requestBlob(path: string): Promise<Blob> {
  const response = await send("GET", path);
  return response.blob();
}

/** Encode a URL path segment (usernames and keys are validated, but never trust that alone). */
export function segment(value: string | number): string {
  return encodeURIComponent(String(value));
}
