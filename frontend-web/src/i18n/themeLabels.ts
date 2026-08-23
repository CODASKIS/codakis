import type { TFunction } from "i18next";

/** Référentiel CEMAC / MINT — 10 thèmes pédagogiques (schema.sql). */
export const THEME_CODES = [
  "signalisation",
  "priorites",
  "circulation",
  "vitesse",
  "stationnement",
  "vehicule",
  "documents",
  "comportement",
  "usagers",
  "contexte_local",
] as const;

export type ThemeCode = (typeof THEME_CODES)[number];

/** Anciens liens avec libellés FR en query — rétrocompatibilité. */
const FRENCH_LABEL_TO_CODE: Record<string, ThemeCode> = {
  "signalisation routière": "signalisation",
  "priorités et intersections": "priorites",
  "priorités & intersections": "priorites",
  "règles de circulation": "circulation",
  "vitesse et distances": "vitesse",
  "vitesse et distances de sécurité": "vitesse",
  "vitesse & distances": "vitesse",
  "arrêt et stationnement": "stationnement",
  "véhicule, éclairage et équipements": "vehicule",
  "documents et contrôles": "documents",
  "comportement et alcool": "comportement",
  "comportement, alcool et substances": "comportement",
  "comportement & alcool": "comportement",
  "usagers vulnérables": "usagers",
  "particularités cemac": "contexte_local",
  "particularités camerounaises et cemac": "contexte_local",
  cemac: "contexte_local",
};

export function isThemeCode(value: string): value is ThemeCode {
  return (THEME_CODES as readonly string[]).includes(value);
}

export function normalizeThemeCode(query: string): ThemeCode | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  if (isThemeCode(lower)) return lower;

  return FRENCH_LABEL_TO_CODE[lower] ?? null;
}

export function getThemeLabel(code: string, t: TFunction): string {
  if (isThemeCode(code)) {
    return t(`home.themeLabels.${code}`);
  }
  return code;
}

/** Libellé affiché pour une recherche (code thème, ancien libellé FR ou texte libre). */
export function resolveSearchQueryLabel(query: string, t: TFunction): string {
  const trimmed = query.trim();
  if (!trimmed) return trimmed;

  const code = normalizeThemeCode(trimmed);
  if (code) return getThemeLabel(code, t);

  return trimmed;
}

export function themeMatchesSearch(code: string, label: string, search: string, t: TFunction): boolean {
  const normalized = search.trim().toLowerCase();
  if (!normalized) return true;

  const translated = getThemeLabel(code, t).toLowerCase();
  return (
    code.toLowerCase().includes(normalized) ||
    label.toLowerCase().includes(normalized) ||
    translated.includes(normalized)
  );
}
