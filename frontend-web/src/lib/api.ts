// Vide en Docker prod : Nginx proxy /api → backend. En local : VITE_API_URL=http://localhost:8000
const API_URL = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const detail = error.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail
              .map((item: { msg?: string; loc?: (string | number)[] }) => {
                const field = item.loc?.filter((part) => typeof part === "string").pop();
                const msg = item.msg ?? "";
                return field ? `${field} : ${msg}` : msg;
              })
              .filter(Boolean)
              .join(" · ")
          : `Erreur API (${response.status})`;
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export interface UserProfile {
  id: string;
  clerk_id: string;
  email: string;
  role: "admin" | "technician" | "client";
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  profile_photo_url: string | null;
  is_active: boolean;
}

export async function fetchCurrentUser(token: string): Promise<UserProfile> {
  return apiFetch<UserProfile>("/api/v1/users/me", { token });
}

export async function syncUser(
  token: string,
  role: UserProfile["role"] = "client",
): Promise<UserProfile> {
  return apiFetch<UserProfile>("/api/v1/users/sync", {
    method: "POST",
    token,
    body: JSON.stringify({ role }),
  });
}
