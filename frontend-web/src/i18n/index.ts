import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "./locales/fr.json";
import en from "./locales/en.json";
import frPages from "./locales/fr-pages.json";
import enPages from "./locales/en-pages.json";

const STORAGE_KEY = "codakis-lang";

export const supportedLanguages = ["fr", "en"] as const;
export type AppLanguage = (typeof supportedLanguages)[number];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge<T extends Record<string, unknown>>(base: T, extra: Record<string, unknown>): T {
  const result: Record<string, unknown> = { ...base };

  for (const [key, extraValue] of Object.entries(extra)) {
    const baseValue = result[key];
    if (isPlainObject(baseValue) && isPlainObject(extraValue)) {
      result[key] = deepMerge(baseValue, extraValue);
    } else {
      result[key] = extraValue;
    }
  }

  return result as T;
}

function detectLanguage(): AppLanguage {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "fr" || stored === "en") return stored;
  const browser = navigator.language.toLowerCase();
  return browser.startsWith("en") ? "en" : "fr";
}

void i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: deepMerge(fr, frPages) },
    en: { translation: deepMerge(en, enPages) },
  },
  lng: detectLanguage(),
  fallbackLng: "fr",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
  document.documentElement.lang = lng;
});

document.documentElement.lang = i18n.language;

export default i18n;
