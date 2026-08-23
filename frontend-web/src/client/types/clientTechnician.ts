import type { DirectoryTechnicianItem, ServiceDomainItem } from "../../lib/directory-api";

export type TechnicianReview = {
  rating: number;
  comment: string;
  author: string;
  date: string;
};

export type CertifiedTechnician = {
  id: string;
  name: string;
  photo: string;
  domain: string;
  domainCode: string;
  city: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  phone: string;
  whatsappNumber: string;
  rating: number;
  reviewCount: number;
  reviews: TechnicianReview[];
  certifiedSince: string;
  available: boolean;
  bio: string;
};

export type DomainEntry = {
  title: string;
  domainCode: string;
  location: string;
  profiles: string[];
  speakers: string;
  buttonText: string;
  buttonLink: string;
};

const DEFAULT_PHOTO = "";

const CITY_COORDS: Record<string, { latitude: number; longitude: number }> = {
  Yaoundé: { latitude: 3.848, longitude: 11.502 },
  Douala: { latitude: 4.051, longitude: 9.768 },
  Bafoussam: { latitude: 5.478, longitude: 10.417 },
};

function resolveTechnicianCoords(item: DirectoryTechnicianItem): {
  latitude: number;
  longitude: number;
} {
  const lat = item.latitude;
  const lng = item.longitude;
  if (
    lat != null &&
    lng != null &&
    !(lat === 0 && lng === 0) &&
    lat >= 1.5 &&
    lat <= 13.5 &&
    lng >= 8.5 &&
    lng <= 16.5
  ) {
    return { latitude: lat, longitude: lng };
  }

  const cityCoords = CITY_COORDS[item.city];
  if (cityCoords) {
    return cityCoords;
  }

  return { latitude: 0, longitude: 0 };
}

export function hasValidTechnicianCoords(
  technician: Pick<CertifiedTechnician, "latitude" | "longitude">,
): boolean {
  return (
    technician.latitude !== 0 &&
    technician.longitude !== 0 &&
    technician.latitude >= 1.5 &&
    technician.latitude <= 13.5 &&
    technician.longitude >= 8.5 &&
    technician.longitude <= 16.5
  );
}

export function formatTechnicianPhone(phone: string | null | undefined, locked: boolean): string {
  if (!phone?.trim()) return "—";
  if (locked) return "+237 6XX XXX XXX";
  return phone.trim();
}

export function mapDirectoryTechnician(item: DirectoryTechnicianItem): CertifiedTechnician {
  const coords = resolveTechnicianCoords(item);
  return {
    id: item.id,
    name: item.name,
    photo: item.photo?.trim() || DEFAULT_PHOTO,
    domain: item.domain,
    domainCode: item.domain_code,
    city: item.city,
    neighborhood: item.neighborhood || "—",
    latitude: coords.latitude,
    longitude: coords.longitude,
    phone: item.phone?.trim() || "",
    whatsappNumber: item.whatsapp_number?.trim() || item.phone?.trim() || "",
    rating: item.rating,
    reviewCount: item.review_count,
    reviews: (item.reviews ?? []).map((review) => ({
      rating: review.rating,
      comment: review.comment,
      author: review.author,
      date: review.date,
    })),
    certifiedSince: item.certified_since || "—",
    available: item.available,
    bio: item.bio || "",
  };
}

export function buildDomainEntries(
  domains: ServiceDomainItem[],
  technicians: CertifiedTechnician[],
): DomainEntry[] {
  return domains.map((domain) => {
    const matches = technicians.filter((t) => t.domainCode === domain.code);
    const cities = [...new Set(matches.map((t) => t.city).filter((c) => c !== "—"))];
    const names = matches.slice(0, 2).map((t) => t.name.split(" ")[0] + ".");
    const photos = matches
      .slice(0, 3)
      .map((t) => t.photo)
      .filter(Boolean);

    return {
      title: domain.label,
      domainCode: domain.code,
      location: cities.length > 0 ? cities.join(" · ") : "Cameroun",
      profiles: photos,
      speakers:
        names.length > 0
          ? names.join(" & ")
          : matches.length > 0
            ? `${matches.length} technicien(s) certifié(s)`
            : "Techniciens certifiés BS",
      buttonText: "Trouver un technicien",
      buttonLink: `/espace/client/techniciens?domain=${encodeURIComponent(domain.code)}`,
    };
  });
}

export type PendingEvaluation = {
  id: string;
  technicianId: string;
  technicianName: string;
  domain: string;
  interventionDate: string;
  photo: string;
  serviceLabel: string;
};

export type CompletedEvaluation = {
  id: string;
  technicianName: string;
  domain: string;
  rating: number;
  comment: string;
  date: string;
  photo: string;
};
