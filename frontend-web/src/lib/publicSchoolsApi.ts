import type { DrivingSchool, SchoolForfait, SchoolForfaitType } from "../data/mockDrivingSchools";
import { normalizeSchoolHours, type SchoolHours } from "./schoolHours";

export type PublicSchoolListItem = {
  id: string;
  name: string;
  city: string;
  district: string | null;
  address: string;
  phone: string | null;
  logo_url: string | null;
  description: string | null;
  long_description: string | null;
  access_info: string | null;
  site_web: string | null;
  latitude: number | null;
  longitude: number | null;
  country_code: string;
  price_from: number;
  certified_since: string;
  hours: SchoolHours | null;
};

export type PublicForfait = {
  id: string;
  type: string;
  label_fr: string;
  label_en: string;
  prix: number;
  heures_conduite: number | null;
  description_fr: string | null;
  description_en: string | null;
};

export type PublicSchoolDetail = PublicSchoolListItem & {
  legal_name: string | null;
  forfaits: PublicForfait[];
};

function apiUrl(path: string): string {
  const base = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";
  return base ? `${base}${path}` : path;
}

function mapForfaitType(type: string): SchoolForfaitType {
  if (type === "code_seul") return "codeSeul";
  if (type === "conduite_seule") return "conduiteSeule";
  if (type === "complet") return "complet";
  if (type === "codeSeul" || type === "conduiteSeule") return type;
  return "complet";
}

function buildForfaitsRecord(forfaits: PublicForfait[]): DrivingSchool["forfaits"] {
  const empty: DrivingSchool["forfaits"] = { codeSeul: [], conduiteSeule: [], complet: [] };
  for (const item of forfaits) {
    const key = mapForfaitType(item.type);
    const pack: SchoolForfait = {
      id: item.id,
      label: { fr: item.label_fr, en: item.label_en },
      price: item.prix,
      description: { fr: item.description_fr ?? item.label_fr, en: item.description_en ?? item.label_en },
      drivingHours: (item.heures_conduite as 5 | 10 | 20 | 30 | undefined) ?? undefined,
    };
    empty[key].push(pack);
  }
  return empty;
}

function demoSchoolStats(id: string): { rating: number; reviewCount: number; successRate: number } {
  const presets = [
    { rating: 4.7, reviewCount: 42, successRate: 91 },
    { rating: 4.5, reviewCount: 28, successRate: 88 },
    { rating: 4.6, reviewCount: 36, successRate: 85 },
    { rating: 4.4, reviewCount: 19, successRate: 87 },
  ];
  let index = 0;
  for (let i = 0; i < id.length; i += 1) {
    index = (index + id.charCodeAt(i)) % presets.length;
  }
  return presets[index] ?? presets[0];
}

export function mapPublicSchoolToDrivingSchool(item: PublicSchoolListItem, forfaits: PublicForfait[] = []): DrivingSchool {
  const desc = item.description?.trim() ?? "";
  const longDesc = (item.long_description ?? desc).trim();
  const cardText = longDesc || desc;
  const access = item.access_info ?? item.address;
  const hours = normalizeSchoolHours(item.hours ?? undefined);
  const hasCoords = item.latitude != null && item.longitude != null;
  const stats = demoSchoolStats(item.id);

  return {
    id: item.id,
    name: item.name,
    logoUrl: item.logo_url ?? undefined,
    countryCode: item.country_code?.toUpperCase(),
    city: item.city || "—",
    district: item.district ?? "",
    address: item.address,
    phone: item.phone ?? "",
    latitude: hasCoords ? item.latitude! : 4.0511,
    longitude: hasCoords ? item.longitude! : 9.7679,
    rating: stats.rating,
    reviewCount: stats.reviewCount,
    successRate: stats.successRate,
    priceFrom: item.price_from,
    available: true,
    description: { fr: desc || cardText, en: desc || cardText },
    longDescription: { fr: longDesc || desc, en: longDesc || desc },
    accessInfo: { fr: access, en: access },
    certifiedSince: item.certified_since.slice(0, 10),
    hours,
    forfaits: buildForfaitsRecord(forfaits),
  };
}

export type PublicSchoolSearchParams = {
  q?: string;
  ville?: string;
  pays?: string;
  price_min?: number;
  price_max?: number;
  sort?: string;
};

export async function fetchPublicSchools(params?: PublicSchoolSearchParams): Promise<PublicSchoolListItem[]> {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.ville) search.set("ville", params.ville);
  if (params?.pays) search.set("pays", params.pays);
  if (params?.price_min != null) search.set("price_min", String(params.price_min));
  if (params?.price_max != null) search.set("price_max", String(params.price_max));
  if (params?.sort) search.set("sort", params.sort);
  const query = search.toString();
  const response = await fetch(apiUrl(`/api/v1/public/auto-ecoles${query ? `?${query}` : ""}`));
  if (!response.ok) throw new Error("Impossible de charger les auto-écoles");
  return response.json() as Promise<PublicSchoolListItem[]>;
}

export async function fetchPublicSchool(id: string): Promise<PublicSchoolDetail> {
  const response = await fetch(apiUrl(`/api/v1/public/auto-ecoles/${id}`));
  if (!response.ok) throw new Error("Auto-école introuvable");
  return response.json() as Promise<PublicSchoolDetail>;
}

export function filterPublicSchools(items: PublicSchoolListItem[], query: string, city: string): PublicSchoolListItem[] {
  const q = query.trim().toLowerCase();
  const c = city.trim().toLowerCase();
  return items.filter((item) => {
    if (c && !item.city.toLowerCase().includes(c)) return false;
    if (!q) return true;
    const haystack = `${item.name} ${item.city} ${item.district ?? ""} ${item.address} ${item.description ?? ""}`.toLowerCase();
    return haystack.includes(q);
  });
}

export { DEFAULT_SCHOOL_HOURS, buildSchoolMapEmbedUrl } from "./schoolHours";
