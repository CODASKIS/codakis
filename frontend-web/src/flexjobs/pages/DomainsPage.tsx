import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import Loader from "../../components/common/Loader";
import { AUTH_PATHS } from "../../constants/authPaths";
import { MOCK_VITRINE_PLANS } from "../../data/mockCmsContent";
import { getPlanPricing, type PlanPricing } from "../../lib/payment-api";
import PublicPageHeader from "../components/PublicPageHeader";
import PricingTable from "../components/PricingTable";
import SubNav from "../components/SubNav";
import { usePublicDomains, useVitrinePlans } from "../hooks/useCmsData";
import { useSecondaryNavItems } from "../hooks/useSecondaryNavItems";
import { getThemeLabel, themeMatchesSearch } from "../../i18n/themeLabels";
import { MOCK_DOMAINS } from "../../data/mockCmsContent";

export default function DomainsPage() {
  const { t } = useTranslation();
  const subNavItems = useSecondaryNavItems();
  const { data: domains, loading } = usePublicDomains(MOCK_DOMAINS);
  const { data: plans, loading: plansLoading } = useVitrinePlans(MOCK_VITRINE_PLANS);
  const [query, setQuery] = useState("");
  const [planPricing, setPlanPricing] = useState<PlanPricing | null>(null);

  useEffect(() => {
    getPlanPricing()
      .then(setPlanPricing)
      .catch(() => setPlanPricing(null));
  }, []);

  const visibleDomains = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return domains;
    return domains.filter((domain) => themeMatchesSearch(domain.code, domain.label, query, t));
  }, [domains, query, t]);

  return (
    <>
      <PageMeta title={`${t("nav.themes")} | CODAKIS`} description={t("domains.metaDescription")} />
      <SubNav activePath="/themes" items={[...subNavItems]} />

      <div className="ck-page">
        <PublicPageHeader
          title={t("domains.pageTitle")}
          lead={t("domains.pageLead")}
          actions={
            <Link to={AUTH_PATHS.register.candidat} className="ck-public-btn ck-public-btn--primary">
              {t("domains.startRevision")}
            </Link>
          }
        />

        <div className="ck-public-search ck-public-search--compact ck-public-search--page">
          <div className="fj-search-box">
            <input
              id="domain-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("domains.searchPlaceholder")}
              aria-label={t("domains.searchLabel")}
            />
            <button type="button" onClick={() => setQuery("")} aria-label={t("domains.reset")}>
              ×
            </button>
          </div>
        </div>

        {loading && domains.length === 0 ? (
          <Loader variant="inline" theme="flexjobs" message={t("domains.loading")} />
        ) : visibleDomains.length === 0 ? (
          <p className="ck-page-lead">{t("domains.empty")}</p>
        ) : (
          <div className="ck-home-themes">
            {visibleDomains.map((domain) => (
              <Link key={domain.id} to={`/themes?q=${domain.code}`} className="ck-theme-unit">
                {getThemeLabel(domain.code, t)}
              </Link>
            ))}
          </div>
        )}

        <section className="ck-page-section" id="abonnement">
          <div className="ck-page-section__head">
            <h2>{t("nav.subscription")}</h2>
            <p>{t("domains.pagePurpose")}</p>
          </div>
          <PricingTable plans={plans} loading={plansLoading} planPricing={planPricing} />
          <div className="ck-home-schools__cta" style={{ marginTop: "2rem" }}>
            <Link to="/tarifs" className="ck-public-btn ck-public-btn--ghost">
              {t("nav.subscription")}
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
