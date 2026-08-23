import { apiFetch } from "./api";
import { DEFAULT_COVER_IMAGE } from "../flexjobs/assets/online-images";
import {
  MOCK_BLOG_DETAILS,
  MOCK_BLOG_POSTS,
  MOCK_DOMAINS,
  MOCK_VITRINE_PLANS,
} from "../data/mockCmsContent";

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
  if (!value) return DEFAULT_COVER_IMAGE;
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/images/")) {
    return value;
  }
  if (value.startsWith("/api/")) {
    return `${API_URL}${value}`;
  }
  return `${API_URL}/api/v1/public/media/${value.replace(/^\//, "")}`;
}

async function fetchWithFallback<T>(path: string, fallback: T): Promise<T> {
  try {
    const data = await apiFetch<T>(path);
    if (Array.isArray(data) && data.length === 0) return fallback;
    return data;
  } catch {
    return fallback;
  }
}

export async function fetchPublicDomains(): Promise<PublicDomainItem[]> {
  return fetchWithFallback("/api/v1/public/domains", MOCK_DOMAINS);
}

export async function fetchBlogPosts(): Promise<BlogPostListItem[]> {
  return fetchWithFallback("/api/v1/public/blog", MOCK_BLOG_POSTS);
}

export async function fetchBlogPost(slug: string): Promise<BlogPostDetail> {
  try {
    return await apiFetch<BlogPostDetail>(`/api/v1/public/blog/${encodeURIComponent(slug)}`);
  } catch {
    const mock = MOCK_BLOG_DETAILS[slug];
    if (mock) return mock;
    throw new Error("Article introuvable");
  }
}

export async function fetchVitrinePlans(): Promise<VitrinePlanItem[]> {
  const plans = await fetchWithFallback("/api/v1/public/vitrine/plans", MOCK_VITRINE_PLANS);
  const normalized = plans.map((plan) => ({
    ...plan,
    sticker: plan.sticker.trim(),
  }));

  const hasCandidate = normalized.some((plan) => plan.sticker === "Candidat" || /client|particulier/i.test(plan.sticker));
  const hasSchool = normalized.some((plan) => /auto|école|ecole|technicien/i.test(plan.sticker));

  if (!hasCandidate && !hasSchool) {
    return MOCK_VITRINE_PLANS;
  }

  return normalized;
}
