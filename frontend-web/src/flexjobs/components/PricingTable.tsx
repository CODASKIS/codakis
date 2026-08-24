import { ArrowRight, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { VitrinePlanItem } from "../../lib/cms-api";
import type { PlanPricing } from "../../lib/payment-api";
import Loader from "../../components/common/Loader";
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

function PricingCta({
  plan,
  featured,
  payLabel,
  startLabel,
}: {
  plan: VitrinePlanItem;
  featured: boolean;
  payLabel: string;
  startLabel: string;
}) {
  const className = `fj-pricing-dark__btn${featured ? " is-featured" : ""}`;
  const label = plan.cta_label?.trim() || (featured ? payLabel : startLabel);

  if (plan.cta_href.startsWith("http")) {
    return (
      <a href={plan.cta_href} className={className}>
        <span>{label}</span>
        <ArrowRight size={20} strokeWidth={1.5} className="fj-pricing-dark__btn-icon" aria-hidden="true" />
      </a>
    );
  }

  return (
    <Link to={plan.cta_href} className={className}>
      <span>{label}</span>
      <ArrowRight size={20} strokeWidth={1.5} className="fj-pricing-dark__btn-icon" aria-hidden="true" />
    </Link>
  );
}

function formatPeriodSuffix(suffix: string, isCustom: boolean): string | null {
  if (isCustom || !suffix) return null;
  const slashIdx = suffix.indexOf("/");
  if (slashIdx >= 0) return suffix.slice(slashIdx).trim();
  return null;
}

function PricingCard({
  plan,
  billing,
  featured,
  planPricing,
  payLabel,
  startLabel,
}: {
  plan: VitrinePlanItem;
  billing: BillingPeriod;
  featured: boolean;
  planPricing?: PlanPricing | null;
  payLabel: string;
  startLabel: string;
}) {
  const price = getVitrineDisplayPrice(plan, billing, planPricing);
  const features = getVitrinePlanFeatures(plan);
  const period = formatPeriodSuffix(price.suffix, price.isCustom);
  const tierLabel = plan.sticker?.trim() || plan.title;

  return (
    <article className={`fj-pricing-dark__card${featured ? " is-featured" : ""}`}>
      <div className="fj-pricing-dark__header">
        <span className="fj-pricing-dark__tier">{tierLabel}</span>
        {price.isCustom ? (
          <h2 className="fj-pricing-dark__price-title">{price.current}</h2>
        ) : (
          <div className="fj-pricing-dark__price-row">
            {price.compare ? (
              <span className="fj-pricing-dark__price-compare">{price.compare} FCFA</span>
            ) : null}
            <h2 className="fj-pricing-dark__price-title">{price.current}</h2>
            {period ? <span className="fj-pricing-dark__period">{period}</span> : null}
          </div>
        )}
        {!price.isCustom && !period && price.suffix ? (
          <p className="fj-pricing-dark__price-note">{price.suffix}</p>
        ) : null}
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
        <PricingCta plan={plan} featured={featured} payLabel={payLabel} startLabel={startLabel} />
      </div>
    </article>
  );
}

export default function PricingTable({
  plans,
  loading = false,
  planPricing = null,
  hideIntro = false,
}: PricingTableProps) {
  const { t } = useTranslation();
  const [audience, setAudience] = useState<PricingAudience>("individual");
  const [billing, setBilling] = useState<BillingPeriod>("yearly");

  const visiblePlans = useMemo(() => filterVitrinePlans(plans, audience), [plans, audience]);

  return (
    <section className={`fj-pricing-table-section${hideIntro ? " fj-pricing-table-section--embedded" : ""}`}>
      {hideIntro ? null : (
        <div className="fj-pricing-table-section__intro">
          <h1>{t("pricing.title")}</h1>
        </div>
      )}

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
                featured={getVitrinePlanBadge(plan, index, visiblePlans.length) === "popular"}
                planPricing={planPricing}
                payLabel={t("pricingTable.ctaPay")}
                startLabel={t("pricingTable.ctaStart")}
              />
            ))}
          </div>
        </div>
      )}

      <p className="fj-pricing-table__footnote">{t("pricing.footnote")}</p>
    </section>
  );
}
