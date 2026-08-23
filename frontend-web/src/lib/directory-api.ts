import { apiFetch } from "./api";

export type ServiceDomainItem = {
  id?: string;
  code: string;
  label: string;
  description?: string | null;
  image_url?: string | null;
  cost_label?: string | null;
  technician_count?: number;
};

export type DirectoryReviewItem = {
  rating: number;
  comment: string;
  author: string;
  date: string;
};

export type DirectoryTechnicianItem = {
  id: string;
  name: string;
  photo: string | null;
  domain: string;
  domain_code: string;
  city: string;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  whatsapp_number: string | null;
  rating: number;
  review_count: number;
  reviews: DirectoryReviewItem[];
  certified_since: string | null;
  available: boolean;
  bio: string | null;
};

export async function fetchServiceDomains(): Promise<ServiceDomainItem[]> {
  return apiFetch<ServiceDomainItem[]>("/api/v1/public/domains");
}

export async function fetchDirectoryTechnicians(params?: {
  domain_code?: string;
  city_id?: string;
  q?: string;
  limit?: number;
}): Promise<DirectoryTechnicianItem[]> {
  const search = new URLSearchParams();
  if (params?.domain_code) search.set("domain_code", params.domain_code);
  if (params?.city_id) search.set("city_id", params.city_id);
  if (params?.q) search.set("q", params.q);
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return apiFetch<DirectoryTechnicianItem[]>(
    `/api/v1/public/technicians${qs ? `?${qs}` : ""}`,
  );
}
