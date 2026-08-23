import { apiFetch } from "./api";

export interface RegionItem {
  id: string;
  name: string;
  code: string | null;
}

export interface CityItem {
  id: string;
  region_id: string;
  name: string;
}

export interface NeighborhoodItem {
  id: string;
  city_id: string;
  name: string;
}

export interface ResolvedGeoItem {
  region_id: string | null;
  city_id: string | null;
  neighborhood_id: string | null;
  address_hint: string | null;
  label: string | null;
}

export function fetchRegions(): Promise<RegionItem[]> {
  return apiFetch<RegionItem[]>("/api/v1/geo/regions");
}

export function fetchCities(regionId: string): Promise<CityItem[]> {
  return apiFetch<CityItem[]>(`/api/v1/geo/regions/${regionId}/cities`);
}

export function fetchNeighborhoods(cityId: string): Promise<NeighborhoodItem[]> {
  return apiFetch<NeighborhoodItem[]>(`/api/v1/geo/cities/${cityId}/neighborhoods`);
}

export function resolveGeoCoordinates(
  latitude: number,
  longitude: number,
): Promise<ResolvedGeoItem> {
  const params = new URLSearchParams({
    lat: String(latitude),
    lng: String(longitude),
  });
  return apiFetch<ResolvedGeoItem>(`/api/v1/geo/resolve?${params}`);
}
