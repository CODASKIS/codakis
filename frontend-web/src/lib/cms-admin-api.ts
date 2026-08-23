import { getAccessToken } from "./authApi";
import { ApiError } from "./api";

const API_URL = import.meta.env.VITE_API_URL ?? "";

export type AdminBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  body: string;
  cover_image_url?: string | null;
  author_name: string;
  status: "draft" | "published";
  published_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type BlogPostPayload = {
  title: string;
  slug?: string;
  excerpt?: string | null;
  body: string;
  cover_image_url?: string | null;
  status: "draft" | "published";
  published_at?: string | null;
};

export type MediaUploadResult = {
  key: string;
  url: string;
};

async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getAccessToken();
  if (!token) {
    throw new ApiError("Authentification requise", 401);
  }
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const detail = error.detail;
    const message = typeof detail === "string" ? detail : `Erreur API (${response.status})`;
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export async function fetchAdminBlogPosts(): Promise<AdminBlogPost[]> {
  return adminFetch<AdminBlogPost[]>("/api/v1/admin/blog");
}

export async function fetchAdminBlogPost(id: string): Promise<AdminBlogPost> {
  return adminFetch<AdminBlogPost>(`/api/v1/admin/blog/${id}`);
}

export async function createAdminBlogPost(payload: BlogPostPayload): Promise<AdminBlogPost> {
  return adminFetch<AdminBlogPost>("/api/v1/admin/blog", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminBlogPost(id: string, payload: Partial<BlogPostPayload>): Promise<AdminBlogPost> {
  return adminFetch<AdminBlogPost>(`/api/v1/admin/blog/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminBlogPost(id: string): Promise<void> {
  await adminFetch<void>(`/api/v1/admin/blog/${id}`, { method: "DELETE" });
}

export async function uploadCmsImage(file: File): Promise<MediaUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  return adminFetch<MediaUploadResult>("/api/v1/admin/media", {
    method: "POST",
    body: formData,
  });
}

export function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
