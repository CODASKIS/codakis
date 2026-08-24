import type { VitrinePlanItem } from "../../lib/cms-api";
import type { PlanPricing } from "../../lib/payment-api";
import {
  formatFcfa,
  resolveVitrinePlanAmounts,
} from "../../lib/planPricingDisplay";

export type PricingAudience = "individual" | "business";

const CANDIDATE_STICKERS = new Set(["candidat", "client", "particulier"]);
const SCHOOL_STICKERS = new Set(["auto-école", "auto-ecole", "technicien", "techniciens"]);

function normalizeSticker(sticker: string): string {
  const lower = sticker.trim().toLowerCase();
  if (
    CANDIDATE_STICKERS.has(lower) ||
    lower.includes("particulier") ||
    lower.includes("ménage") ||
    lower.includes("menage")
  ) {
    return "Candidat";
  }
  if (
    SCHOOL_STICKERS.has(lower) ||
    lower.includes("auto") ||
    lower.includes("école") ||
    lower.includes("ecole") ||
    lower.includes("technicien") ||
    (lower.includes("pro") && !lower.includes("progress"))
  ) {
    return "Auto-école";
  }
  return sticker.trim();
}

function matchesAudience(sticker: string, audience: PricingAudience): boolean {
  const normalized = normalizeSticker(sticker);
  return audience === "individual" ? normalized === "Candidat" : normalized === "Auto-école";
}

export { formatFcfa };

export function parseAmountFromLabel(label: string): number | null {
  const normalized = label.replace(/\s/g, "");
  const match = normalized.match(/(\d+)/);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
}

export function isCustomPriceLabel(label: string): boolean {
  const lower = label.toLowerCase();
  return (
    lower.includes("devis") ||
    lower.includes("sur mesure") ||
    lower.includes("gratuit") ||
    lower.includes("commission") ||
    !/\d/.test(label)
  );
}

const SCHOOL_PLAN_KEYS = new Set(["autoEcolePartenaire", "autoEcolePremium"]);

export function isSchoolPlan(planKey: string): boolean {
  return SCHOOL_PLAN_KEYS.has(planKey);
}

export function getSchoolPlanDisplayPrice(
  plan: VitrinePlanItem,
  planPricing?: PlanPricing | null,
): { current: string; compare?: string; suffix: string; isCustom: boolean; note?: string } {
  const rate = planPricing?.platform_commission_rate_pct ?? 10;

  if (plan.plan_key === "autoEcolePartenaire") {
    return {
      current: "Gratuit",
      suffix: "",
      isCustom: true,
      note: `${rate} % de commission sur les inscriptions payées via CODAKIS`,
    };
  }

  return {
    current: `${rate} %`,
    suffix: "par inscription",
    isCustom: false,
    note: "Le solde du forfait vous est reversé automatiquement",
  };
}

function extractPriceSuffix(priceLabel: string): string {
  const slash = priceLabel.match(/FCFA\s*\/?\s*(.+)$/i);
  if (slash?.[1]) {
    return `FCFA / ${slash[1].trim()}`;
  }
  return "FCFA";
}

function resolveMonthlyAmount(plan: VitrinePlanItem, planPricing?: PlanPricing | null): number | null {
  const fromApi = resolveVitrinePlanAmounts(plan.plan_key, "monthly", planPricing);
  if (fromApi) return fromApi.amount;
  return parseAmountFromLabel(plan.price_label);
}

export function getVitrinePlanBadge(
  plan: VitrinePlanItem,
  index: number,
  total: number,
): "popular" | "new" | undefined {
  const highlight = plan.highlight?.toLowerCase() ?? "";
  if (highlight.includes("populaire") || plan.plan_key === "clientPremium") {
    return "popular";
  }
  if (index === total - 1) {
    return "new";
  }
  return undefined;
}

export function getVitrinePlanFeatures(plan: VitrinePlanItem): string[] {
  const features: string[] = [];

  if (plan.highlight?.trim()) {
    features.push(plan.highlight.trim());
  }

  if (plan.description?.trim()) {
    const sentences = plan.description
      .split(/(?<=[.!?])\s+/)
      .map((part) => part.trim())
      .filter((part) => part.length > 8);

    for (const sentence of sentences) {
      const normalized = sentence.replace(/\.$/, "");
      if (!features.some((item) => item === normalized)) {
        features.push(normalized);
      }
    }
  }

  if (plan.location?.trim()) {
    const location = `Disponible : ${plan.location.trim()}`;
    if (!features.includes(location)) {
      features.push(location);
    }
  }

  return features.length > 0 ? features : ["Formule CODAKIS"];
}

export function getVitrineDisplayPrice(
  plan: VitrinePlanItem,
  billing: "monthly" | "yearly",
  planPricing?: PlanPricing | null,
): { current: string; compare?: string; suffix: string; isCustom: boolean; note?: string } {
  if (isSchoolPlan(plan.plan_key)) {
    return getSchoolPlanDisplayPrice(plan, planPricing);
  }

  const apiAmounts = resolveVitrinePlanAmounts(plan.plan_key, billing, planPricing);
  if (apiAmounts) {
    const suffix = extractPriceSuffix(plan.price_label);
    const isCertification = plan.plan_key === "techCertification";
    return {
      current: formatFcfa(apiAmounts.amount),
      compare: apiAmounts.compare !== undefined ? formatFcfa(apiAmounts.compare) : undefined,
      suffix: isCertification
        ? "FCFA"
        : billing === "yearly" && (plan.plan_key === "clientEntreprise" || !suffix.includes("/ an"))
          ? "FCFA / an"
          : suffix,
      isCustom: false,
    };
  }

  if (isCustomPriceLabel(plan.price_label)) {
    return { current: plan.price_label, suffix: "", isCustom: true };
  }

  const monthly = resolveMonthlyAmount(plan, planPricing);
  if (monthly === null) {
    return { current: plan.price_label, suffix: "", isCustom: true };
  }

  const suffix = extractPriceSuffix(plan.price_label);

  if (billing === "monthly") {
    return {
      current: formatFcfa(monthly),
      suffix,
      isCustom: false,
    };
  }

  return {
    current: formatFcfa(Math.round(monthly * 0.75)),
    compare: formatFcfa(monthly),
    suffix: suffix.includes("/ an") ? suffix : "FCFA / mois (facturé annuellement)",
    isCustom: false,
  };
}

export function filterVitrinePlans(
  plans: VitrinePlanItem[],
  audience: PricingAudience,
): VitrinePlanItem[] {
  return plans.filter((plan) => matchesAudience(plan.sticker, audience));
}
