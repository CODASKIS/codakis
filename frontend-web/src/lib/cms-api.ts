import { apiFetch } from "./api";

const API_URL = import.meta.env.VITE_API_URL ?? "";

export type PublicDomainItem = {
  id: string;
  code: string;
  label: string;
  description?: string | null;
  image_url?: string | null;
  cost_label?: string | null;
  technician_count: number;
};

export type BlogPostListItem = {
  slug: string;
  title: string;
  excerpt?: string | null;
  cover_image_url?: string | null;
  author_name: string;
  published_at?: string | null;
};

export type BlogPostDetail = BlogPostListItem & {
  body: string;
};

export type VitrinePlanItem = {
  plan_key: string;
  sticker: string;
  title: string;
  location: string;
  price_label: string;
  highlight?: string | null;
  description?: string | null;
  cta_label: string;
  cta_href: string;
};

export function resolveCmsMediaUrl(url?: string | null): string {
  const value = url?.trim();
  if (!value) return "/images/blog/default-cover.jpg";
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/images/")) {
    return value;
  }
  if (value.startsWith("images/")) {
    return `/${value}`;
  }
  if (value.startsWith("/api/")) {
    return `${API_URL}${value}`;
  }
  if (!API_URL) return "/images/blog/default-cover.jpg";
  return `${API_URL}/api/v1/public/media/${value.replace(/^\//, "")}`;
}

export async function fetchPublicDomains(): Promise<PublicDomainItem[]> {
  return apiFetch<PublicDomainItem[]>("/api/v1/public/domains");
}

export async function fetchBlogPosts(): Promise<BlogPostListItem[]> {
  return apiFetch<BlogPostListItem[]>("/api/v1/public/blog");
}

export async function fetchBlogPost(slug: string): Promise<BlogPostDetail> {
  return apiFetch<BlogPostDetail>(`/api/v1/public/blog/${encodeURIComponent(slug)}`);
}

export async function fetchVitrinePlans(): Promise<VitrinePlanItem[]> {
  const plans = await apiFetch<VitrinePlanItem[]>("/api/v1/public/vitrine/plans");
  return plans.map((plan) => ({
    ...plan,
    sticker: plan.sticker.trim(),
  }));
}
