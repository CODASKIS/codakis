import { resolveGeoCoordinates } from "./geo-api";

export interface ResolvedGeo {
  regionId: string | null;
  cityId: string | null;
  neighborhoodId: string | null;
  addressHint: string | null;
  label: string | null;
}

const EMPTY_RESOLVED: ResolvedGeo = {
  regionId: null,
  cityId: null,
  neighborhoodId: null,
  addressHint: null,
  label: null,
};

function mapResolvedGeoItem(item: {
  region_id: string | null;
  city_id: string | null;
  neighborhood_id: string | null;
  address_hint: string | null;
  label: string | null;
}): ResolvedGeo {
  return {
    regionId: item.region_id,
    cityId: item.city_id,
    neighborhoodId: item.neighborhood_id,
    addressHint: item.address_hint,
    label: item.label,
  };
}

export async function resolveGeoFromCoordinates(
  latitude: number,
  longitude: number,
): Promise<ResolvedGeo> {
  try {
    const resolved = await resolveGeoCoordinates(latitude, longitude);
    return mapResolvedGeoItem(resolved);
  } catch {
    return EMPTY_RESOLVED;
  }
}
