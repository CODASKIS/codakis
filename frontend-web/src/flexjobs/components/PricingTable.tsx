import { ArrowRight, Check, Globe } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { VitrinePlanItem } from "../../lib/cms-api";
import type { PlanPricing } from "../../lib/payment-api";
import Loader from "../../components/common/Loader";
import { AuthApiError, clearTokens, getAccessToken } from "../../lib/authApi";
import { getSession } from "../../auth/authStore";
import { AUTH_PATHS } from "../../constants/authPaths";
import { getRoleDashboardPath } from "../../auth/roles";
import { buildLoginUrl, rememberAuthRedirect } from "../../auth/purchaseIntent";
import {
  useCurrencyRates,
} from "../../hooks/useCurrencyConversion";
import { initiatePayment } from "../../lib/payment-api";
import {
  filterVitrinePlans,
  getVitrineDisplayPrice,
  getVitrinePlanBadge,
  getVitrinePlanFeatures,
  type PricingAudience,
} from "../data/pricingTableData";

type BillingPeriod = "monthly" | "yearly";

type PricingTableProps = {
  plans: VitrinePlanItem[];
  loading?: boolean;
  planPricing?: PlanPricing | null;
  hideIntro?: boolean;
};

function FeatureCheck() {
  return (
    <Check size={20} strokeWidth={1.5} className="fj-pricing-dark__check" aria-hidden="true" />
  );
}

function freePlanHref(audience: PricingAudience): string {
  const session = getSession();
  const token = getAccessToken();

  if (audience === "business") {
    if (token && session?.role === "gerant") return getRoleDashboardPath("gerant");
    return AUTH_PATHS.register.autoEcole;
  }

  if (token && session?.role === "candidat") return getRoleDashboardPath("candidat");
  if (token && session?.role) return getRoleDashboardPath(session.role);
  return AUTH_PATHS.register.candidat;
}

function PricingCard({
  plan,
  billing,
  audience,
  featured,
  planPricing,
  payLabel,
  startLabel,
  convertFromFcfa,
  onSelectPlan,
  paying,
}: {
  plan: VitrinePlanItem;
  billing: BillingPeriod;
  audience: PricingAudience;
  featured: boolean;
  planPricing?: PlanPricing | null;
  payLabel: string;
  startLabel: string;
  convertFromFcfa: (amount: number) => { amountFormatted: string; symbol: string; rawAmount: number };
  onSelectPlan: (plan: VitrinePlanItem) => void;
  paying: boolean;
}) {
  const price = getVitrineDisplayPrice(plan, billing, planPricing);
  const features = getVitrinePlanFeatures(plan);
  const tierLabel = plan.sticker?.trim() || plan.title;

  // Calcul du montant numérique en FCFA
  let rawAmountFcfa = 0;
  if (!price.isCustom) {
    const numMatch = price.current.replace(/\s/g, "").match(/\d+/);
    if (numMatch) {
      rawAmountFcfa = Number.parseInt(numMatch[0], 10);
    }
  }

  const converted = convertFromFcfa(rawAmountFcfa);
  const isFree = price.isCustom && price.current.toLowerCase().includes("gratuit");
  const ctaLabel = (plan.cta_label?.trim() || (isFree ? startLabel : payLabel)).trim();

  return (
    <article className={`fj-pricing-dark__card${featured ? " is-featured" : ""}`}>
      <div className="fj-pricing-dark__header">
        <span className="fj-pricing-dark__tier">{tierLabel}</span>
        {price.isCustom ? (
          <h2 className="fj-pricing-dark__price-title">{price.current}</h2>
        ) : (
          <div className="fj-pricing-dark__price-row">
            <h2 className="fj-pricing-dark__price-title">
              {converted.amountFormatted} <span style={{ fontSize: "0.65em", fontWeight: 700 }}>{converted.symbol}</span>
            </h2>
            <span className="fj-pricing-dark__period">
              {billing === "yearly" ? "/ an" : "/ mois"}
            </span>
          </div>
        )}
        {!price.isCustom && converted.symbol !== "FCFA" && (
          <p className="fj-pricing-dark__price-note" style={{ fontSize: "1.2rem", marginTop: "0.4rem" }}>
            ({price.current} FCFA {billing === "yearly" ? "/ an" : "/ mois"})
          </p>
        )}
        {price.note ? <p className="fj-pricing-dark__price-note">{price.note}</p> : null}
        <p className="fj-pricing-dark__plan-name">{plan.title}</p>
      </div>

      <ul className="fj-pricing-dark__features">
        {features.map((feature) => (
          <li key={feature}>
            <FeatureCheck />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="fj-pricing-dark__footer">
        {isFree ? (
          <Link
            to={freePlanHref(audience)}
            className={`ck-public-btn ck-public-btn--primary fj-pricing-dark__btn${featured ? " is-featured" : ""}`}
            style={{ width: "100%" }}
          >
            <span>{ctaLabel}</span>
            <ArrowRight size={20} strokeWidth={1.5} className="fj-pricing-dark__btn-icon" aria-hidden="true" />
          </Link>
        ) : (
          <button
            type="button"
            className={`ck-public-btn ck-public-btn--primary fj-pricing-dark__btn${featured ? " is-featured" : ""}`}
            onClick={() => onSelectPlan(plan)}
            disabled={paying}
            style={{ width: "100%" }}
          >
            <span>{paying ? "…" : ctaLabel}</span>
            <ArrowRight size={20} strokeWidth={1.5} className="fj-pricing-dark__btn-icon" aria-hidden="true" />
          </button>
        )}
      </div>
    </article>
  );
}

function mapPlanToPaymentId(plan: VitrinePlanItem): string | null {
  const key = plan.plan_key;
  if (["clientPremium", "candidatPremium", "premium"].includes(key)) return "pro";
  if (["clientEntreprise", "candidatEntreprise", "entreprise"].includes(key)) return "entreprise";
  if (["autoEcolePremium"].includes(key)) return "premium";
  return null;
}

export default function PricingTable({
  plans,
  loading = false,
  planPricing = null,
  hideIntro = false,
}: PricingTableProps) {
  const { t } = useTranslation();
  const [billing, setBilling] = useState<BillingPeriod>("yearly");
  const [audience, setAudience] = useState<PricingAudience>("individual");
  const [payingKey, setPayingKey] = useState<string | null>(null);

  const { selectedCountry, changeCountry, convertFromFcfa, supportedCountries } = useCurrencyRates();

  const visiblePlans = useMemo(() => filterVitrinePlans(plans, audience), [plans, audience]);

  const handleSelectPlan = async (plan: VitrinePlanItem) => {
    const session = getSession();
    const token = getAccessToken();
    const isSchoolAudience = audience === "business";
    const paymentPlanId = mapPlanToPaymentId(plan);

    // Onglet Auto-écoles — plans sans paiement (partenaire / gratuit)
    if (isSchoolAudience && (!paymentPlanId || plan.plan_key === "autoEcolePartenaire")) {
      window.location.href = freePlanHref("business");
      return;
    }

    // Onglet Auto-écoles — abonnement payant → compte gérant
    if (isSchoolAudience) {
      if (!token || session?.role !== "gerant") {
        rememberAuthRedirect("/tarifs");
        window.location.href = token
          ? AUTH_PATHS.register.autoEcole
          : buildLoginUrl("/tarifs");
        return;
      }
    } else {
      // Onglet Candidats — abonnement payant → compte candidat
      if (!token || session?.role !== "candidat") {
        rememberAuthRedirect("/tarifs");
        window.location.href = buildLoginUrl("/tarifs");
        return;
      }
    }

    if (!paymentPlanId) {
      alert("Cette formule ne nécessite pas de paiement ou n'est pas disponible pour l'achat direct.");
      return;
    }

    setPayingKey(plan.plan_key);
    try {
      const result = await initiatePayment(token!, {
        plan_id: paymentPlanId,
        billing_period: isSchoolAudience ? "yearly" : billing,
        payment_method: "orange",
        purpose: "subscription",
      });
      if (result.payment_url) {
        window.location.href = result.payment_url;
        return;
      }
      alert(result.redirect_error || result.message || "Erreur lors de la redirection PawaPay");
    } catch (err) {
      if (err instanceof AuthApiError && err.status === 401) {
        clearTokens();
        rememberAuthRedirect("/tarifs");
        window.location.href = buildLoginUrl("/tarifs");
        return;
      }
      alert(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setPayingKey(null);
    }
  };

  return (
    <section className={`fj-pricing-table-section${hideIntro ? " fj-pricing-table-section--embedded" : ""}`}>
      {hideIntro ? null : (
        <div className="fj-pricing-table-section__intro">
          <h1>{t("pricing.title")}</h1>
        </div>
      )}

      {/* Sélecteur de pays et devise */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.8rem",
            background: "#fff",
            padding: "0.6rem 1.4rem",
            borderRadius: "999px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <Globe size={18} style={{ color: "var(--ck-green, #158a4e)" }} />
          <span style={{ fontSize: "1.35rem", fontWeight: 700, color: "#334155" }}>
            Pays & Devise :
          </span>
          <select
            value={selectedCountry.countryCode}
            onChange={(e) => changeCountry(e.target.value)}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "var(--ck-green-dark, #158a4e)",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {supportedCountries.map((c) => (
              <option key={c.countryCode} value={c.countryCode}>
                {c.flag} {c.countryName} ({c.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="fj-pricing-table__toolbar">
        <div className="fj-pricing-table__segments" role="tablist" aria-label={t("pricingTable.clientTypeAria")}>
          <button
            type="button"
            role="tab"
            aria-selected={audience === "individual"}
            className={audience === "individual" ? "is-active" : undefined}
            onClick={() => setAudience("individual")}
          >
            {t("pricing.audienceCandidates")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={audience === "business"}
            className={audience === "business" ? "is-active" : undefined}
            onClick={() => setAudience("business")}
          >
            {t("pricing.audienceSchools")}
          </button>
        </div>

        <div className="fj-pricing-table__billing">
          {audience === "individual" ? (
            <div className="fj-pricing-table__billing-switch">
              <span className={billing === "monthly" ? "is-active" : undefined}>{t("pricing.monthly")}</span>
              <button
                type="button"
                className={`fj-pricing-table__toggle${billing === "yearly" ? " is-on" : ""}`}
                role="switch"
                aria-checked={billing === "yearly"}
                aria-label={t("pricingTable.billingToggleAria")}
                onClick={() => setBilling((current) => (current === "monthly" ? "yearly" : "monthly"))}
              >
                <span className="fj-pricing-table__toggle-knob" />
              </button>
              <span className={billing === "yearly" ? "is-active" : undefined}>{t("pricing.yearly")}</span>
            </div>
          ) : (
            <p className="fj-pricing-table__school-note">{t("pricing.schoolBillingNote")}</p>
          )}
        </div>
      </div>

      {loading && visiblePlans.length === 0 ? (
        <Loader variant="inline" theme="flexjobs" message={t("pricingTable.loading")} />
      ) : visiblePlans.length === 0 ? (
        <p className="fj-pricing-table__empty">{t("pricing.empty")}</p>
      ) : (
        <div className="fj-pricing-dark" role="tabpanel">
          <div className={`fj-pricing-dark__row fj-pricing-dark__row--cols-${visiblePlans.length}`}>
            {visiblePlans.map((plan, index) => (
              <PricingCard
                key={plan.plan_key}
                plan={plan}
                billing={billing}
                audience={audience}
                featured={getVitrinePlanBadge(plan, index, visiblePlans.length) === "popular"}
                planPricing={planPricing}
                payLabel={t("pricingTable.ctaPay", "S'abonner via PawaPay")}
                startLabel={t("pricingTable.ctaStart", "Commencer")}
                convertFromFcfa={convertFromFcfa}
                onSelectPlan={handleSelectPlan}
                paying={payingKey === plan.plan_key}
              />
            ))}
          </div>
        </div>
      )}

      <p className="fj-pricing-table__footnote">{t("pricing.footnote")}</p>
    </section>
  );
}
