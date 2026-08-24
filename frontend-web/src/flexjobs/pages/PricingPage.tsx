import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import { AUTH_PATHS } from "../../constants/authPaths";
import { MOCK_VITRINE_PLANS } from "../../data/mockCmsContent";
import { getPlanPricing, type PlanPricing } from "../../lib/payment-api";
import Container from "../components/Container";
import PricingTable from "../components/PricingTable";
import SubNav from "../components/SubNav";
import { useVitrinePlans } from "../hooks/useCmsData";
import { useSecondaryNavItems } from "../hooks/useSecondaryNavItems";

export default function PricingPage() {
  const { t } = useTranslation();
  const subNavItems = useSecondaryNavItems();
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
      <SubNav activePath="/tarifs" items={[...subNavItems, { label: t("nav.subscription"), to: "/tarifs" }]} />

      <section className="fj-pricing-page-hero">
        <Container>
          <span className="fj-pricing-page-hero__eyebrow">{t("pricing.pageEyebrow")}</span>
          <h1>{t("pricing.pageTitle")}</h1>
          <p>{t("pricing.pageLead")}</p>
        </Container>
      </section>

      <section className="fj-pricing-page-split">
        <Container>
          <div className="fj-pricing-page-split__grid">
            <article className="fj-pricing-page-split__card">
              <span className="fj-pricing-page-split__badge">{t("pricing.candidateBadge")}</span>
              <h2>{t("pricing.candidateTitle")}</h2>
              <p>{t("pricing.candidateLead")}</p>
              <ul>
                <li>{t("pricing.candidateFeature1")}</li>
                <li>{t("pricing.candidateFeature2")}</li>
                <li>{t("pricing.candidateFeature3")}</li>
              </ul>
              <Link to={AUTH_PATHS.register.candidat} className="fj-btn fj-btn--primary">
                {t("pricing.candidateCta")}
              </Link>
            </article>

            <article className="fj-pricing-page-split__card is-school">
              <span className="fj-pricing-page-split__badge">{t("pricing.schoolBadge")}</span>
              <h2>{t("pricing.schoolTitle")}</h2>
              <p>{t("pricing.schoolLead", { rate: commissionRate })}</p>
              <ul>
                <li>{t("pricing.schoolFeature1")}</li>
                <li>{t("pricing.schoolFeature2", { rate: commissionRate })}</li>
                <li>{t("pricing.schoolFeature3")}</li>
              </ul>
              <Link to="/inscription-auto-ecole" className="fj-btn fj-btn--outline">
                {t("pricing.schoolCta")}
              </Link>
            </article>
          </div>
        </Container>
      </section>

      <section className="fj-pricing-page-table" id="abonnement">
        <Container>
          <PricingTable plans={plans} loading={plansLoading} planPricing={planPricing} />
        </Container>
      </section>

      <section className="fj-pricing-page-note">
        <Container>
          <p>{t("pricing.commissionNote", { rate: commissionRate })}</p>
          <Link to="/auto-ecoles" className="fj-link-muted">
            {t("pricing.browseSchools")}
          </Link>
        </Container>
      </section>
    </>
  );
}
