import { apiFetch } from "./api";
import { resolveGeoCoordinates } from "./geo-api";

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export async function searchPlaces(
  query: string,
  options?: { countryCode?: string; limit?: number },
): Promise<NominatimResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const params = new URLSearchParams({
    q: trimmed,
    limit: String(options?.limit ?? 5),
  });

  if (options?.countryCode) {
    params.set("country", options.countryCode);
  }

  return apiFetch<NominatimResult[]>(`/api/v1/geo/search?${params}`);
}

export async function geocodeAddress(query: string): Promise<{
  lat: number;
  lng: number;
  label: string;
} | null> {
  const results = await searchPlaces(query, { countryCode: "cm", limit: 1 });
  const first = results[0];
  if (!first) return null;

  return {
    lat: Number.parseFloat(first.lat),
    lng: Number.parseFloat(first.lon),
    label: first.display_name,
  };
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  try {
    const resolved = await resolveGeoCoordinates(latitude, longitude);
    return resolved.label;
  } catch {
    return null;
  }
}
