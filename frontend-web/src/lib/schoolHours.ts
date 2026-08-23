export type SchoolHours = {
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;
};

export const DEFAULT_SCHOOL_HOURS: SchoolHours = {
  mon: "08:00 – 18:00",
  tue: "08:00 – 18:00",
  wed: "08:00 – 18:00",
  thu: "08:00 – 18:00",
  fri: "08:00 – 18:00",
  sat: "08:00 – 13:00",
  sun: "closed",
};

export const SCHOOL_HOUR_DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export type SchoolHourDay = (typeof SCHOOL_HOUR_DAYS)[number];

export function normalizeSchoolHours(raw?: Partial<SchoolHours> | null): SchoolHours {
  const merged = { ...DEFAULT_SCHOOL_HOURS };
  if (!raw) return merged;
  for (const day of SCHOOL_HOUR_DAYS) {
    const value = raw[day];
    if (typeof value === "string" && value.trim()) {
      merged[day] = value.trim();
    }
  }
  return merged;
}

export function buildSchoolMapEmbedUrl(latitude: number, longitude: number): string {
  const pad = 0.012;
  const bbox = [longitude - pad, latitude - pad, longitude + pad, latitude + pad].join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;
}
