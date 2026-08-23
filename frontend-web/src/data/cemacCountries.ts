export type CemacCountry = {
  code: string;
  nameKey: string;
};

/** Pays membres de la zone CEMAC (codes ISO 3166-1 alpha-2). */
export const CEMAC_COUNTRIES: CemacCountry[] = [
  { code: "cm", nameKey: "cameroon" },
  { code: "cf", nameKey: "car" },
  { code: "td", nameKey: "chad" },
  { code: "gq", nameKey: "equatorialGuinea" },
  { code: "ga", nameKey: "gabon" },
  { code: "cg", nameKey: "congo" },
];

export function cemacFlagUrl(countryCode: string, width = 40): string {
  return `https://flagcdn.com/w${width}/${countryCode.toLowerCase()}.png`;
}
