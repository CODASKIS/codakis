import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import { AUTH_PATHS } from "../../constants/authPaths";
import { MOCK_VITRINE_PLANS } from "../../data/mockCmsContent";
import { getPlanPricing, type PlanPricing } from "../../lib/payment-api";
import PublicPageHeader from "../components/PublicPageHeader";
import PricingTable from "../components/PricingTable";
import { useVitrinePlans } from "../hooks/useCmsData";

export default function PricingPage() {
  const { t } = useTranslation();
  const { data: plans, loading: plansLoading } = useVitrinePlans(MOCK_VITRINE_PLANS);
  const [planPricing, setPlanPricing] = useState<PlanPricing | null>(null);

  useEffect(() => {
    getPlanPricing()
      .then(setPlanPricing)
      .catch(() => setPlanPricing(null));
  }, []);

  const commissionRate = planPricing?.platform_commission_rate_pct ?? 10;

  return (
    <>
      <PageMeta title={t("pricing.pageTitle")} description={t("pricing.pageDescription")} />

      <div className="ck-page">
        <PublicPageHeader title={t("pricing.pageTitle")} lead={t("pricing.pageLead")} />

        <div className="ck-pack-grid" style={{ marginBottom: "3.2rem" }}>
          <article className="ck-pack-card">
            <h3>{t("pricing.candidateTitle")}</h3>
            <p>{t("pricing.candidateLead")}</p>
            <ul style={{ margin: 0, paddingLeft: "1.4rem", color: "var(--ck-muted)", fontWeight: 600 }}>
              <li>{t("pricing.candidateFeature1")}</li>
              <li>{t("pricing.candidateFeature2")}</li>
              <li>{t("pricing.candidateFeature3")}</li>
            </ul>
            <Link to={AUTH_PATHS.register.candidat} className="ck-public-btn ck-public-btn--primary">
              {t("pricing.candidateCta")}
            </Link>
          </article>

          <article className="ck-pack-card">
            <h3>{t("pricing.schoolTitle")}</h3>
            <p>{t("pricing.schoolLead", { rate: commissionRate })}</p>
            <ul style={{ margin: 0, paddingLeft: "1.4rem", color: "var(--ck-muted)", fontWeight: 600 }}>
              <li>{t("pricing.schoolFeature1")}</li>
              <li>{t("pricing.schoolFeature2", { rate: commissionRate })}</li>
              <li>{t("pricing.schoolFeature3")}</li>
            </ul>
            <Link to="/inscription-auto-ecole" className="ck-public-btn ck-public-btn--ghost">
              {t("pricing.schoolCta")}
            </Link>
          </article>
        </div>

        <section id="abonnement" className="ck-page-section">
          <div className="ck-page-section__head">
            <h2>{t("nav.subscription")}</h2>
          </div>
          <PricingTable plans={plans} loading={plansLoading} planPricing={planPricing} />
        </section>
      </div>
    </>
  );
}
