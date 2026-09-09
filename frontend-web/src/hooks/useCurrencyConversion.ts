import { useEffect, useState } from "react";

export type CurrencyCode = "XAF" | "EUR" | "USD" | "XOF" | "GBP" | "CAD";

export type CountryCurrencyConfig = {
  countryCode: string;
  countryName: string;
  flag: string;
  currency: CurrencyCode;
  symbol: string;
};

export const SUPPORTED_COUNTRIES: CountryCurrencyConfig[] = [
  { countryCode: "CM", countryName: "Cameroun", flag: "🇨🇲", currency: "XAF", symbol: "FCFA" },
  { countryCode: "GA", countryName: "Gabon", flag: "🇬🇦", currency: "XAF", symbol: "FCFA" },
  { countryCode: "CG", countryName: "Congo-Brazzaville", flag: "🇨🇬", currency: "XAF", symbol: "FCFA" },
  { countryCode: "TD", countryName: "Tchad", flag: "🇹🇩", currency: "XAF", symbol: "FCFA" },
  { countryCode: "CF", countryName: "Centrafrique", flag: "🇨🇫", currency: "XAF", symbol: "FCFA" },
  { countryCode: "GQ", countryName: "Guinée Équatoriale", flag: "🇬🇶", currency: "XAF", symbol: "FCFA" },
  { countryCode: "CI", countryName: "Côte d'Ivoire", flag: "🇨🇮", currency: "XOF", symbol: "FCFA" },
  { countryCode: "SN", countryName: "Sénégal", flag: "🇸🇳", currency: "XOF", symbol: "FCFA" },
  { countryCode: "FR", countryName: "France / Zone Euro", flag: "🇪🇺", currency: "EUR", symbol: "€" },
  { countryCode: "US", countryName: "États-Unis / Autre", flag: "🇺🇸", currency: "USD", symbol: "$" },
  { countryCode: "GB", countryName: "Royaume-Uni", flag: "🇬🇧", currency: "GBP", symbol: "£" },
  { countryCode: "CA", countryName: "Canada", flag: "🇨🇦", currency: "CAD", symbol: "CA$" },
];

const CURRENCY_STORAGE_KEY = "codakis_selected_currency_country";

const FALLBACK_RATES_FROM_EUR: Record<CurrencyCode, number> = {
  EUR: 1,
  XAF: 655.957,
  XOF: 655.957,
  USD: 1.08,
  GBP: 0.85,
  CAD: 1.48,
};

export function getInitialCountryCurrency(): CountryCurrencyConfig {
  const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
  if (saved) {
    const found = SUPPORTED_COUNTRIES.find((c) => c.countryCode === saved);
    if (found) return found;
  }
  return SUPPORTED_COUNTRIES[0];
}

export function saveSelectedCountryCurrency(countryCode: string) {
  localStorage.setItem(CURRENCY_STORAGE_KEY, countryCode);
}

export function useCurrencyRates() {
  const [selectedCountry, setSelectedCountry] = useState<CountryCurrencyConfig>(getInitialCountryCurrency);
  const [ratesFromEur, setRatesFromEur] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES_FROM_EUR);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch("https://api.frankfurter.dev/v1/latest?from=EUR&to=USD,GBP,CAD")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted || !data?.rates) return;
        setRatesFromEur((prev) => ({
          ...prev,
          USD: data.rates.USD ?? prev.USD,
          GBP: data.rates.GBP ?? prev.GBP,
          CAD: data.rates.CAD ?? prev.CAD,
        }));
      })
      .catch((err) => {
        console.warn("Utilisation des taux de devises de secours:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const changeCountry = (countryCode: string) => {
    const found = SUPPORTED_COUNTRIES.find((c) => c.countryCode === countryCode);
    if (found) {
      setSelectedCountry(found);
      saveSelectedCountryCurrency(found.countryCode);
    }
  };

  const convertFromFcfa = (amountFcfa: number): { amountFormatted: string; symbol: string; rawAmount: number } => {
    const targetCurrency = selectedCountry.currency;

    if (targetCurrency === "XAF" || targetCurrency === "XOF") {
      return {
        amountFormatted: amountFcfa.toLocaleString("fr-FR"),
        symbol: selectedCountry.symbol,
        rawAmount: amountFcfa,
      };
    }

    const eurRate = ratesFromEur.XAF; // 655.957
    const amountInEur = amountFcfa / eurRate;
    const targetRateFromEur = ratesFromEur[targetCurrency] || 1;
    const converted = amountInEur * targetRateFromEur;

    const formatted = converted.toLocaleString("fr-FR", {
      minimumFractionDigits: converted < 10 ? 2 : 0,
      maximumFractionDigits: 2,
    });

    return {
      amountFormatted: formatted,
      symbol: selectedCountry.symbol,
      rawAmount: Math.round(converted * 100) / 100,
    };
  };

  return {
    selectedCountry,
    changeCountry,
    convertFromFcfa,
    loadingRates: loading,
    supportedCountries: SUPPORTED_COUNTRIES,
  };
}
