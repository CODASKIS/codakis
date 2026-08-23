import type { PlanPricing } from "./payment-api";

export type ClientPlanId = "essentiel" | "pro" | "entreprise";

export function formatFcfa(amount: number): string {
  return amount.toLocaleString("fr-FR");
}

export function buildClientPlanPrices(
  pricing: PlanPricing,
): Record<ClientPlanId, { monthly: number; yearly: number }> {
  return {
    essentiel: { monthly: pricing.essentiel, yearly: pricing.essentiel_yearly },
    pro: { monthly: pricing.pro, yearly: pricing.pro_yearly },
    entreprise: { monthly: pricing.entreprise, yearly: pricing.entreprise },
  };
}

export type VitrinePaymentPlanKey = ClientPlanId | "certification";

export const VITRINE_PLAN_PAYMENT_MAP: Record<string, VitrinePaymentPlanKey> = {
  clientEssentiel: "essentiel",
  clientPremium: "pro",
  clientEntreprise: "entreprise",
  techCertification: "certification",
};

export function resolveVitrinePlanAmounts(
  planKey: string,
  billing: "monthly" | "yearly",
  planPricing?: PlanPricing | null,
): { amount: number; compare?: number } | null {
  if (!planPricing) return null;

  const mapped = VITRINE_PLAN_PAYMENT_MAP[planKey];
  if (!mapped) return null;

  if (mapped === "certification") {
    return { amount: planPricing.certification_fee_fcfa };
  }

  if (billing === "monthly") {
    if (mapped === "essentiel") return { amount: planPricing.essentiel };
    if (mapped === "pro") return { amount: planPricing.pro };
    return { amount: planPricing.entreprise };
  }

  if (mapped === "essentiel") {
    return { amount: planPricing.essentiel_yearly, compare: planPricing.essentiel };
  }
  if (mapped === "pro") {
    return { amount: planPricing.pro_yearly, compare: planPricing.pro };
  }
  return { amount: planPricing.entreprise };
}
