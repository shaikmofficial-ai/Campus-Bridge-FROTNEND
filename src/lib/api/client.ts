// Central API client for the CampusBridge Spring Boot backend.
//
// Base URL comes from VITE_API_BASE_URL (see .env). Falls back to the local
// Spring Boot dev server. The JWT token is stored in localStorage and attached
// as a Bearer header on every request.

const RAW_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8080";

/** Backend origin without a trailing slash, e.g. "http://localhost:8080". */
export const API_BASE = RAW_BASE.replace(/\/+$/, "");

const TOKEN_KEY = "campusbridge.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  /** JSON-serializable body. Ignored when `formData` is provided. */
  body?: unknown;
  /** Use for multipart/form-data uploads (e.g. resource upload). */
  formData?: FormData;
  /** Extra query params. */
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(`${API_BASE}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

function extractErrorMessage(status: number, body: unknown): string {
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    // Backend GlobalExceptionHandler shapes: { message } | { error } | { details }
    if (typeof b.message === "string" && b.message) return b.message;
    if (typeof b.error === "string" && b.error) return b.error;
    if (b.details && typeof b.details === "object") {
      const first = Object.values(b.details as Record<string, string>)[0];
      if (first) return first;
    }
  }
  if (typeof body === "string" && body) return body;
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You don't have permission to do that.";
  return `Request failed (${status})`;
}

/**
 * Perform an authenticated JSON request and return the parsed body.
 * Throws ApiError on non-2xx responses.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, formData, query, signal } = options;

  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (formData) {
    payload = formData; // browser sets multipart boundary automatically
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), { method, headers, body: payload, signal });
  } catch (err) {
    throw new ApiError(
      0,
      "Cannot reach the server. Is the backend running on " + API_BASE + "?",
      err,
    );
  }

  if (res.status === 401) {
    // Token rejected/expired — clear it and let the app redirect to login.
    clearToken();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("campusbridge:auth"));
    }
  }

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const parsed: unknown = res.status === 204 ? undefined : isJson ? await res.json() : await res.text();

  if (!res.ok) {
    throw new ApiError(res.status, extractErrorMessage(res.status, parsed), parsed);
  }

  return parsed as T;
}

/** Download a file (e.g. a resource) as a Blob, with auth header attached. */
export async function apiDownload(path: string): Promise<{ blob: Blob; filename: string }> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(buildUrl(path), { headers });
  if (!res.ok) {
    throw new ApiError(res.status, extractErrorMessage(res.status, await res.text()), null);
  }

  const disposition = res.headers.get("content-disposition") ?? "";
  const match = /filename="?([^"]+)"?/.exec(disposition);
  const filename = match?.[1] ?? "download";
  const blob = await res.blob();
  return { blob, filename };
}
