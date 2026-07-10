/**
 * Typed API client for the FastAPI backend. All backend routes live under
 * /api/v1 except /health. See lib/types.ts for response/request shapes.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const API_V1 = `${API_BASE_URL}/api/v1`;

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // body wasn't JSON — keep statusText
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  isFormData?: boolean;
};

async function request<T>(
  token: string | null,
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!options.isFormData && options.body) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_V1}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.isFormData
      ? (options.body as FormData)
      : options.body
      ? JSON.stringify(options.body)
      : undefined,
  });

  return handleResponse<T>(res);
}

/**
 * Usage in a client component:
 *
 *   "use client";
 *   import { useAuth } from "@clerk/nextjs";
 *   import { apiClient } from "@/lib/api";
 *
 *   const { getToken } = useAuth();
 *   const api = apiClient(getToken);
 *   const projects = await api.get<Project[]>("/projects");
 *
 * Usage in a server component:
 *
 *   import { auth } from "@clerk/nextjs/server";
 *   import { apiClient } from "@/lib/api";
 *
 *   const { getToken } = await auth();
 *   const api = apiClient(getToken);
 *   const projects = await api.get<Project[]>("/projects");
 */
export function apiClient(getToken: () => Promise<string | null>) {
  return {
    get: async <T>(path: string) => request<T>(await getToken(), path),
    post: async <T>(path: string, body?: unknown) =>
      request<T>(await getToken(), path, { method: "POST", body }),
    postForm: async <T>(path: string, formData: FormData) =>
      request<T>(await getToken(), path, {
        method: "POST",
        body: formData,
        isFormData: true,
      }),
    patch: async <T>(path: string, body?: unknown) =>
      request<T>(await getToken(), path, { method: "PATCH", body }),
    delete: async <T>(path: string) =>
      request<T>(await getToken(), path, { method: "DELETE" }),
  };
}


