import type { CertifiedTechnician } from "../types/clientTechnician";
import { hasValidTechnicianCoords } from "../types/clientTechnician";
import {
  defaultTechnicianFilters,
  type TechnicianFilters,
} from "../components/TechnicianSearchFilter";

export type SearchCenter = {
  latitude: number;
  longitude: number;
};

export function getTechnicianCities(technicians: CertifiedTechnician[]): string[] {
  return [...new Set(technicians.map((item) => item.city).filter((c) => c !== "—"))].sort(
    (a, b) => a.localeCompare(b, "fr"),
  );
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function filterTechnicians(
  filters: TechnicianFilters,
  technicians: CertifiedTechnician[],
  searchCenter?: SearchCenter | null,
  radiusKm = 10,
): CertifiedTechnician[] {
  const query = filters.query.trim().toLowerCase();

  let results = technicians.filter((technician) => {
    if (filters.domainCode && technician.domainCode !== filters.domainCode) {
      return false;
    }

    if (filters.city && technician.city !== filters.city) {
      return false;
    }

    if (filters.availability === "available" && !technician.available) {
      return false;
    }

    if (filters.availability === "busy" && technician.available) {
      return false;
    }

    if (filters.minRating) {
      const minRating = Number.parseFloat(filters.minRating);
      if (technician.rating < minRating) return false;
    }

    if (searchCenter && hasValidTechnicianCoords(technician)) {
      const distance = distanceKm(
        searchCenter.latitude,
        searchCenter.longitude,
        technician.latitude,
        technician.longitude,
      );
      if (distance > radiusKm) return false;
    }

    if (!query) return true;

    const haystack = [
      technician.name,
      technician.domain,
      technician.domainCode,
      technician.city,
      technician.neighborhood,
      technician.phone,
      technician.bio,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });

  results = [...results].sort((a, b) => {
    if (filters.sortBy === "reviews") {
      return b.reviewCount - a.reviewCount;
    }
    if (filters.sortBy === "name") {
      return a.name.localeCompare(b.name, "fr");
    }
    return b.rating - a.rating;
  });

  return results;
}

export { defaultTechnicianFilters };
