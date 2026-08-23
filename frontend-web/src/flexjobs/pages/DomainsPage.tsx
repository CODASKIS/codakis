import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import Loader from "../../components/common/Loader";
import { AUTH_PATHS } from "../../constants/authPaths";
import { MOCK_VITRINE_PLANS } from "../../data/mockCmsContent";
import { getPlanPricing, type PlanPricing } from "../../lib/payment-api";
import Container from "../components/Container";
import DomainCategoryCard from "../components/DomainCategoryCard";
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [planPricing, setPlanPricing] = useState<PlanPricing | null>(null);

  useEffect(() => {
    getPlanPricing()
      .then(setPlanPricing)
      .catch(() => setPlanPricing(null));
  }, []);

  useEffect(() => {
    if (window.location.hash === "#abonnement") {
      document.getElementById("abonnement")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const visibleDomains = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return domains;
    return domains.filter((domain) => themeMatchesSearch(domain.code, domain.label, query, t));
  }, [domains, query, t]);

  return (
    <>
      <PageMeta
        title={`${t("nav.themes")} | CODAKIS`}
        description={t("domains.metaDescription")}
      />
      <SubNav activePath="/themes" items={[...subNavItems]} />

      <section className="fj-categories fj-categories--page">
        <Container>
          <div className="fj-categories__head">
            <span className="fj-categories__pattern" aria-hidden="true" />
            <div>
              <h1>{t("domains.pageTitle")}</h1>
              <p>{t("domains.pageLead")}</p>
              <p className="fj-domains-purpose">{t("domains.pagePurpose")}</p>
              <Link to={AUTH_PATHS.register.candidat} className="fj-btn fj-btn--primary mt-4 inline-flex">
                {t("domains.startRevision")}
              </Link>
            </div>
          </div>

          <div className="fj-filters mb-6">
            <button
              type="button"
              className="fj-filters__toggle md:hidden"
              aria-expanded={mobileFiltersOpen}
              onClick={() => setMobileFiltersOpen((open) => !open)}
            >
              {t("domains.filterToggle")}
            </button>
            <div className={`fj-filters__panel${mobileFiltersOpen ? " is-open" : ""}`}>
              <div className="fj-filters__row fj-filters__row--search">
                <div className="fj-form-group">
                  <label className="fj-label" htmlFor="domain-search">
                    {t("domains.searchLabel")}
                  </label>
                  <div className="fj-filters__search-row">
                    <input
                      id="domain-search"
                      type="search"
                      className="fj-input"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={t("domains.searchPlaceholder")}
                    />
                    <button
                      type="button"
                      className="fj-btn fj-btn--outline fj-filters__reset"
                      onClick={() => setQuery("")}
                      disabled={!query.trim()}
                    >
                      {t("domains.reset")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading && domains.length === 0 ? (
            <Loader variant="inline" theme="flexjobs" message={t("domains.loading")} />
          ) : visibleDomains.length === 0 ? (
            <p className="text-center py-8 text-[1.6rem]">{t("domains.empty")}</p>
          ) : (
            <div className="fj-domain-grid">
              {visibleDomains.map((domain) => (
                <DomainCategoryCard
                  key={domain.id}
                  label={getThemeLabel(domain.code, t)}
                  code={domain.code}
                  to={`${AUTH_PATHS.register.candidat}?theme=${encodeURIComponent(domain.code)}`}
                />
              ))}
            </div>
          )}
        </Container>
      </section>

      <section className="fj-themes-subscription" id="abonnement">
        <Container>
          <div className="fj-themes-subscription__head">
            <h2>{t("domains.subscriptionTitle")}</h2>
            <p>{t("domains.subscriptionLead")}</p>
          </div>
          <PricingTable plans={plans} loading={plansLoading} planPricing={planPricing} hideIntro />
        </Container>
      </section>
    </>
  );
}
