import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
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

  return (
    <>
      <PageMeta title={t("pricing.pageTitle")} description={t("pricing.pageDescription")} />

      <div className="ck-page">
        <PublicPageHeader title={t("pricing.pageTitle")} lead={t("pricing.pageLead")} />

        <section id="abonnement" className="ck-page-section" style={{ paddingTop: 0 }}>
          <div className="ck-page-section__head" style={{ marginBottom: "1.2rem" }}>
            <h2 style={{ margin: 0 }}>{t("nav.subscription")}</h2>
          </div>
          <PricingTable plans={plans} loading={plansLoading} planPricing={planPricing} />
        </section>
      </div>
    </>
  );
}
