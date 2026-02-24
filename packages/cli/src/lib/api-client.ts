import { API_URL } from "./config.js";
import { getToken } from "./auth-store.js";

/** Build auth headers, injecting bearer token if available */
function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

/** Handle response: throw on 401 or non-OK, return parsed JSON */
async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    throw new Error("Not authenticated. Run `internmarket login` first.");
  }
  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

/** GET {API_URL}{path} */
export async function apiGet<T = unknown>(urlPath: string): Promise<T> {
  const res = await fetch(`${API_URL}${urlPath}`, {
    headers: authHeaders(),
    redirect: "follow",
  });
  return handleResponse<T>(res);
}

/** POST {API_URL}{path} with JSON body */
export async function apiPost<T = unknown>(urlPath: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${urlPath}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

/** PUT {API_URL}{path} with JSON body */
export async function apiPut<T = unknown>(urlPath: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${urlPath}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

/** DELETE {API_URL}{path} */
export async function apiDelete<T = unknown>(urlPath: string): Promise<T> {
  const res = await fetch(`${API_URL}${urlPath}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse<T>(res);
}
