export type SchoolForfaitType = "codeSeul" | "conduiteSeule" | "complet";

export const DRIVING_HOUR_OPTIONS = [5, 10, 20, 30] as const;
export type DrivingHourOption = (typeof DRIVING_HOUR_OPTIONS)[number];

export type SchoolForfait = {
  id: string;
  label: { fr: string; en: string };
  price: number;
  comparePrice?: number;
  description: { fr: string; en: string };
  drivingHours?: DrivingHourOption;
  featured?: boolean;
  codeMode?: "salle" | "online";
};

export type DrivingSchool = {
  id: string;
  name: string;
  logoUrl?: string;
  logoColor?: string;
  countryCode?: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  successRate: number;
  priceFrom: number;
  available: boolean;
  description: { fr: string; en: string };
  longDescription: { fr: string; en: string };
  accessInfo: { fr: string; en: string };
  certifiedSince: string;
  hours: {
    mon: string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
    sat: string;
    sun: string;
  };
  /** Forfaits alignés CDC : code_seul, conduite_seule, complet */
  forfaits: Record<SchoolForfaitType, SchoolForfait[]>;
};

const DEFAULT_HOURS = {
  mon: "08:00 – 18:00",
  tue: "08:00 – 18:00",
  wed: "08:00 – 18:00",
  thu: "08:00 – 18:00",
  fri: "08:00 – 18:00",
  sat: "08:00 – 13:00",
  sun: "closed",
} as const;

function withCompare(price: number): number {
  return Math.round(price * 1.22);
}

function conduitePriceForHours(base20h: number, hours: DrivingHourOption): number {
  const perHour = base20h / 20;
  const factor = hours <= 5 ? 1.12 : hours <= 10 ? 1.06 : hours >= 30 ? 0.9 : 1;
  return Math.round(perHour * hours * factor);
}

function buildDefaultForfaits(priceFrom: number): DrivingSchool["forfaits"] {
  const codeSalle = Math.round(priceFrom * 0.35);
  const codeOnline = Math.round(codeSalle * 0.85);
  const conduite20 = Math.round(priceFrom * 0.55);
  const complet20 = priceFrom;

  return {
    codeSeul: [
      {
        id: "code-salle",
        label: { fr: "Code en salle", en: "Classroom theory" },
        price: codeSalle,
        comparePrice: withCompare(codeSalle),
        codeMode: "salle",
        description: {
          fr: "Inscription au code, cours en salle et accès CODAKIS Premium 3 mois.",
          en: "Theory enrolment, classroom lessons and 3 months CODAKIS Premium.",
        },
      },
      {
        id: "code-online",
        label: { fr: "Code 100 % en ligne", en: "Fully online theory" },
        price: codeOnline,
        comparePrice: withCompare(codeOnline),
        codeMode: "online",
        description: {
          fr: "Révision autonome CODAKIS avec suivi moniteur à distance.",
          en: "Self-paced CODAKIS revision with remote instructor follow-up.",
        },
      },
    ],
    conduiteSeule: DRIVING_HOUR_OPTIONS.map((hours) => ({
      id: `conduite-${hours}h`,
      label: {
        fr: `Conduite seule — ${hours} h`,
        en: `Driving only — ${hours} h`,
      },
      price: conduitePriceForHours(conduite20, hours),
      comparePrice: withCompare(conduitePriceForHours(conduite20, hours)),
      drivingHours: hours,
      description: {
        fr:
          hours >= 20
            ? "Évaluation préalable, créneaux CODAKIS et préparation examen pratique."
            : "Leçons réservables sur CODAKIS — forfait conduite confirmé requis.",
        en:
          hours >= 20
            ? "Initial assessment, CODAKIS slots and practical exam preparation."
            : "Bookable lessons on CODAKIS — confirmed driving package required.",
      },
    })),
    complet: DRIVING_HOUR_OPTIONS.map((hours) => ({
      id: `complet-${hours}h`,
      label: {
        fr: hours >= 30 ? "Forfait complet accéléré" : "Forfait complet code + conduite",
        en: hours >= 30 ? "Intensive full package" : "Full theory + driving package",
      },
      price:
        hours === 20
          ? complet20
          : Math.round(complet20 * (hours / 20) * (hours >= 30 ? 0.92 : hours <= 10 ? 1.08 : 1)),
      comparePrice: withCompare(
        hours === 20
          ? complet20
          : Math.round(complet20 * (hours / 20) * (hours >= 30 ? 0.92 : hours <= 10 ? 1.08 : 1)),
      ),
      drivingHours: hours,
      featured: hours === 20,
      description: {
        fr:
          hours === 20
            ? "Code CEMAC, examens blancs, conduite, reçu Mobile Money et QR code d'enrôlement."
            : hours >= 30
              ? "Formation accélérée — code intensif et créneaux conduite prioritaires."
              : "Parcours adapté avec cours code et heures de conduite incluses.",
        en:
          hours === 20
            ? "CEMAC theory, mock exams, driving, Mobile Money receipt and enrolment QR code."
            : hours >= 30
              ? "Intensive track — fast theory and priority driving slots."
              : "Tailored journey with theory and driving hours included.",
      },
    })),
  };
}

function schoolBase(
  partial: Omit<
    DrivingSchool,
    "hours" | "forfaits" | "longDescription" | "accessInfo" | "address" | "phone" | "latitude" | "longitude"
  > & {
    address?: string;
    phone?: string;
    latitude: number;
    longitude: number;
    longDescription?: { fr: string; en: string };
    accessInfo?: { fr: string; en: string };
    forfaits?: Partial<DrivingSchool["forfaits"]>;
  },
): DrivingSchool {
  const street = partial.address ?? `${partial.district}, ${partial.city}`;
  const defaultForfaits = buildDefaultForfaits(partial.priceFrom);

  return {
    ...partial,
    address: street,
    phone: partial.phone ?? "+237 6XX XXX XXX",
    longDescription: partial.longDescription ?? {
      fr: `${partial.name} accompagne les candidats au permis au Cameroun avec une équipe de moniteurs agréés MINT. Forfaits code seul, conduite seule ou complet — achat sécurisé par Mobile Money sur CODAKIS.`,
      en: `${partial.name} supports licence candidates in Cameroon with MINT-approved instructors. Theory-only, driving-only or full packages — secure purchase via Mobile Money on CODAKIS.`,
    },
    accessInfo: partial.accessInfo ?? {
      fr: "Souscrivez en ligne via CODAKIS (Orange Money / MTN MoMo). Reçu numérique et QR code d'enrôlement envoyés après confirmation du paiement. Première leçon sous 48 h.",
      en: "Subscribe online via CODAKIS (Orange Money / MTN MoMo). Digital receipt and enrolment QR code sent after payment confirmation. First lesson within 48 hours.",
    },
    hours: { ...DEFAULT_HOURS },
    forfaits: {
      codeSeul: partial.forfaits?.codeSeul ?? defaultForfaits.codeSeul,
      conduiteSeule: partial.forfaits?.conduiteSeule ?? defaultForfaits.conduiteSeule,
      complet: partial.forfaits?.complet ?? defaultForfaits.complet,
    },
  };
}

export const MOCK_DRIVING_SCHOOLS: DrivingSchool[] = [
  schoolBase({
    id: "ae-001",
    name: "Auto-École Excellence Yaoundé",
    logoColor: "#0d9488",
    city: "Yaoundé",
    district: "Bastos",
    address: "Avenue Kennedy, Bastos, Yaoundé",
    phone: "+237 677 12 34 56",
    latitude: 3.8689,
    longitude: 11.5211,
    rating: 4.8,
    reviewCount: 124,
    successRate: 82,
    priceFrom: 85000,
    available: true,
    description: {
      fr: "Forfaits code seul, conduite seule ou complet — paiement Mobile Money sur CODAKIS.",
      en: "Theory-only, driving-only or full packages — Mobile Money payment on CODAKIS.",
    },
    certifiedSince: "2024-03-15",
  }),
  schoolBase({
    id: "ae-002",
    name: "École de Conduite du Littoral",
    logoColor: "#2563eb",
    city: "Douala",
    district: "Akwa",
    address: "Boulevard de la Liberté, Akwa, Douala",
    phone: "+237 699 45 67 89",
    latitude: 4.0511,
    longitude: 9.7679,
    rating: 4.6,
    reviewCount: 98,
    successRate: 78,
    priceFrom: 90000,
    available: true,
    description: {
      fr: "Auto-école agréée MINT — forfaits transparents et créneaux flexibles.",
      en: "MINT-approved school — transparent plans and flexible slots.",
    },
    certifiedSince: "2023-11-02",
  }),
  schoolBase({
    id: "ae-003",
    name: "Permis Plus Bafoussam",
    logoColor: "#7c3aed",
    city: "Bafoussam",
    district: "Tamdja",
    address: "Carrefour Tamdja, Bafoussam",
    phone: "+237 676 98 76 54",
    latitude: 5.4781,
    longitude: 10.4173,
    rating: 4.5,
    reviewCount: 67,
    successRate: 75,
    priceFrom: 75000,
    available: true,
    description: {
      fr: "Code CEMAC et conduite en zones urbaines et rurales — forfaits adaptés.",
      en: "CEMAC theory and driving in urban and rural areas — tailored packages.",
    },
    certifiedSince: "2024-01-20",
  }),
  schoolBase({
    id: "ae-004",
    name: "Conduite Pro Garoua",
    logoColor: "#dc2626",
    city: "Garoua",
    district: "Centre-ville",
    address: "Avenue du 20 Mai, Garoua",
    phone: "+237 694 11 22 33",
    latitude: 9.3014,
    longitude: 13.397,
    rating: 4.3,
    reviewCount: 41,
    successRate: 71,
    priceFrom: 70000,
    available: false,
    description: {
      fr: "Établissement de référence dans le Nord — forfait complet avec flotte récente.",
      en: "Leading school in the North — full package with modern fleet.",
    },
    certifiedSince: "2023-08-10",
  }),
  schoolBase({
    id: "ae-005",
    name: "Auto-École Horizon Limbé",
    logoColor: "#059669",
    city: "Limbé",
    district: "Down Beach",
    address: "Down Beach Road, Limbé",
    phone: "+237 678 55 44 33",
    latitude: 4.0187,
    longitude: 9.2105,
    rating: 4.7,
    reviewCount: 53,
    successRate: 80,
    priceFrom: 82000,
    available: true,
    description: {
      fr: "Forfaits étudiants et professionnels — achat en ligne et reçu QR code.",
      en: "Student and professional plans — online purchase with QR receipt.",
    },
    certifiedSince: "2024-06-01",
  }),
  schoolBase({
    id: "ae-006",
    name: "Cap Permis Bertoua",
    logoColor: "#d97706",
    city: "Bertoua",
    district: "Mokolo",
    address: "Quartier Mokolo, Bertoua",
    phone: "+237 691 77 88 99",
    latitude: 4.5833,
    longitude: 14.0833,
    rating: 4.4,
    reviewCount: 29,
    successRate: 73,
    priceFrom: 68000,
    available: true,
    description: {
      fr: "Structure à taille humaine — forfaits code seul ou complet selon votre rythme.",
      en: "Human-scale school — theory-only or full packages at your pace.",
    },
    certifiedSince: "2024-02-14",
  }),
];

export function filterDrivingSchools(
  schools: DrivingSchool[],
  query: string,
  city: string,
): DrivingSchool[] {
  const q = query.trim().toLowerCase();
  const c = city.trim().toLowerCase();

  return schools.filter((school) => {
    const haystack = [school.name, school.city, school.district, school.address].join(" ").toLowerCase();
    const matchesQuery = !q || haystack.includes(q);
    const matchesCity = !c || haystack.includes(c);
    return matchesQuery && matchesCity;
  });
}

export function buildSchoolMapEmbedUrl(latitude: number, longitude: number): string {
  const pad = 0.012;
  const bbox = [longitude - pad, latitude - pad, longitude + pad, latitude + pad].join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;
}

const NEW_SCHOOL_IDS = new Set(["ae-001", "ae-002"]);

export function isDrivingSchoolNew(id: string): boolean {
  return NEW_SCHOOL_IDS.has(id);
}

export function groupDrivingSchoolsByCity(
  schools: DrivingSchool[],
): { city: string; schools: DrivingSchool[] }[] {
  const map = new Map<string, DrivingSchool[]>();

  for (const school of schools) {
    const list = map.get(school.city) ?? [];
    list.push(school);
    map.set(school.city, list);
  }

  return [...map.entries()]
    .sort(([cityA], [cityB]) => cityA.localeCompare(cityB, "fr"))
    .map(([city, citySchools]) => ({
      city,
      schools: citySchools.sort((a, b) => a.name.localeCompare(b.name, "fr")),
    }));
}

export function formatDrivingSchoolListLabel(school: DrivingSchool): string {
  if (school.district) {
    return `${school.name} - ${school.district}`;
  }
  return school.name;
}

export function formatForfaitPrice(price: number, locale: string): string {
  return new Intl.NumberFormat(locale.startsWith("en") ? "en-CM" : "fr-CM").format(price);
}

export function pickForfaitByHours(forfaits: SchoolForfait[], hours: DrivingHourOption): SchoolForfait {
  return forfaits.find((item) => item.drivingHours === hours) ?? forfaits[0];
}

export function pickCodeForfait(forfaits: SchoolForfait[], mode: "salle" | "online"): SchoolForfait {
  return forfaits.find((item) => item.codeMode === mode) ?? forfaits[0];
}

export function getFeaturedForfait(forfaits: SchoolForfait[]): SchoolForfait {
  return forfaits.find((item) => item.featured) ?? forfaits[0];
}

export function getMinForfaitPrice(type: SchoolForfaitType, hours?: DrivingHourOption): number {
  const prices = MOCK_DRIVING_SCHOOLS.map((school) => {
    const list = school.forfaits[type];
    if (hours && (type === "conduiteSeule" || type === "complet")) {
      return pickForfaitByHours(list, hours).price;
    }
    if (type === "codeSeul") {
      return Math.min(...list.map((item) => item.price));
    }
    return Math.min(...list.map((item) => item.price));
  });
  return Math.min(...prices);
}

export function getMinCodePrice(mode: "salle" | "online"): number {
  return Math.min(
    ...MOCK_DRIVING_SCHOOLS.map((school) => pickCodeForfait(school.forfaits.codeSeul, mode).price),
  );
}

export function getMinCodeComparePrice(mode: "salle" | "online"): number | undefined {
  const values = MOCK_DRIVING_SCHOOLS.map(
    (school) => pickCodeForfait(school.forfaits.codeSeul, mode).comparePrice,
  ).filter((value): value is number => value != null);
  return values.length ? Math.min(...values) : undefined;
}

export function getMinComparePrice(type: SchoolForfaitType, hours?: DrivingHourOption): number | undefined {
  const values = MOCK_DRIVING_SCHOOLS.map((school) => {
    const list = school.forfaits[type];
    let forfait: SchoolForfait;
    if (hours && (type === "conduiteSeule" || type === "complet")) {
      forfait = pickForfaitByHours(list, hours);
    } else if (type === "codeSeul") {
      forfait = list.reduce((min, item) => (item.price < min.price ? item : min), list[0]);
    } else {
      forfait = list.reduce((min, item) => (item.price < min.price ? item : min), list[0]);
    }
    return forfait.comparePrice;
  }).filter((value): value is number => value != null);
  return values.length ? Math.min(...values) : undefined;
}
