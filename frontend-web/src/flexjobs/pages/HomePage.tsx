import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { BookOpen, Shield, Trophy } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import RevealOnScroll from "../../components/motion/RevealOnScroll";
import HeaderSearch from "../components/HeaderSearch";
import PricingTable from "../components/PricingTable";
import {
  formatDrivingSchoolListLabel,
  type DrivingSchool,
} from "../../data/mockDrivingSchools";
import { fetchPublicSchools, mapPublicSchoolToDrivingSchool } from "../../lib/publicSchoolsApi";
import { MOCK_VITRINE_PLANS } from "../../data/mockCmsContent";
import { getPlanPricing, type PlanPricing } from "../../lib/payment-api";
import { AUTH_PATHS } from "../../constants/authPaths";
import { THEME_CODES } from "../../i18n/themeLabels";
import { useVitrinePlans } from "../hooks/useCmsData";

const HOME_THEME_CODES = THEME_CODES.slice(0, 6);

export default function HomePage() {
  const { t } = useTranslation();
  const [schools, setSchools] = useState<DrivingSchool[]>([]);
  const { data: plans, loading: plansLoading } = useVitrinePlans(MOCK_VITRINE_PLANS);
  const [planPricing, setPlanPricing] = useState<PlanPricing | null>(null);

  useEffect(() => {
    void fetchPublicSchools()
      .then((items) => setSchools(items.map((item) => mapPublicSchoolToDrivingSchool(item)).slice(0, 6)))
      .catch(() => setSchools([]));

    getPlanPricing()
      .then(setPlanPricing)
      .catch(() => setPlanPricing(null));
  }, []);

  const steps = useMemo(
    () => [
      {
        num: "1",
        Icon: BookOpen,
        title: t("home.pillar3Title"),
        text: t("auth.brand.highlights.lessons", { defaultValue: "Créez votre compte candidat" }),
      },
      {
        num: "2",
        Icon: Shield,
        title: t("home.pillar1Title"),
        text: t("home.pillar1Text"),
      },
      {
        num: "3",
        Icon: Trophy,
        title: t("home.pillar2Title"),
        text: t("home.pillar2Text"),
      },
    ],
    [t],
  );

  const categories = HOME_THEME_CODES.map((code) => ({
    label: t(`home.themeLabels.${code}`),
    code,
    to: `/themes?q=${code}`,
  }));

  return (
    <>
      <PageMeta title={t("home.metaTitle")} description={t("home.metaDescription")} />

      <RevealOnScroll as="section" className="ck-home-hero">
        <div className="fj-container">
          <div className="ck-home-hero__grid">
            <div>
              <p className="ck-home-hero__eyebrow">CODAKIS</p>
              <h1>{t("home.heroTitle")}</h1>
              <p className="ck-home-hero__lead">{t("home.heroLead")}</p>
              <div className="ck-public-search ck-public-search--hero">
                <HeaderSearch />
              </div>
              <div className="ck-home-hero__actions">
                <Link to={AUTH_PATHS.register.candidat} className="ck-public-btn ck-public-btn--primary ck-public-btn--lg">
                  {t("home.heroCta")}
                </Link>
                <Link to="/tarifs" className="ck-public-btn ck-public-btn--ghost ck-public-btn--lg">
                  {t("nav.subscription")}
                </Link>
              </div>
            </div>
            <div className="ck-home-hero__visual" aria-hidden>
              <div className="ck-home-hero__glow" />
              <img
                src="/images/auth/cartoon-red-car.png"
                alt=""
                className="ck-home-hero__photo ck-home-hero__photo--car"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </RevealOnScroll>

      <RevealOnScroll as="section" className="ck-page-section ck-home-pillars">
        <div className="fj-container">
          <div className="ck-page-section__head">
            <h2>{t("home.pillarsTitle")}</h2>
            <p>{t("home.heroLead")}</p>
          </div>
          <div className="ck-home-steps">
            {steps.map((step) => (
              <article key={step.num} className="ck-home-step">
                <span className="ck-home-step__icon" aria-hidden>
                  <step.Icon size={22} strokeWidth={2.4} />
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </RevealOnScroll>

      <RevealOnScroll as="section" className="ck-page-section">
        <div className="fj-container">
          <div className="ck-page-section__head">
            <h2>{t("home.schoolsTitle")}</h2>
            <p>{t("home.schoolsLead")}</p>
          </div>
          {schools.length === 0 ? (
            <p className="ck-page-lead">{t("home.schoolsEmpty")}</p>
          ) : (
            <ul className="ck-home-schools__list">
              {schools.map((school) => (
                <li key={school.id}>
                  <Link to={`/auto-ecoles/${school.id}`}>{formatDrivingSchoolListLabel(school)}</Link>
                </li>
              ))}
            </ul>
          )}
          <div className="ck-home-schools__cta">
            <Link to="/auto-ecoles" className="ck-public-btn ck-public-btn--primary ck-public-btn--lg">
              {t("nav.seeAllSchools")}
            </Link>
          </div>
        </div>
      </RevealOnScroll>

      <RevealOnScroll as="section" className="ck-page-section ck-home-themes-section">
        <div className="fj-container">
          <div className="ck-page-section__head">
            <h2>{t("home.themesTitle")}</h2>
            <p>{t("home.themesLead")}</p>
          </div>
          <div className="ck-home-themes">
            {categories.map((cat) => (
              <Link key={cat.code} to={cat.to} className="ck-home-theme">
                {cat.label}
              </Link>
            ))}
          </div>
          <div className="ck-home-schools__cta" style={{ marginTop: "2rem" }}>
            <Link to="/themes" className="ck-public-btn ck-public-btn--ghost">
              {t("home.themesAll")}
            </Link>
          </div>
        </div>
      </RevealOnScroll>

      <RevealOnScroll as="section" className="ck-page-section" id="abonnement">
        <div className="fj-container">
          <div className="ck-page-section__head">
            <h2>{t("nav.subscription")}</h2>
            <p>{t("domains.pagePurpose")}</p>
          </div>
          <PricingTable plans={plans} loading={plansLoading} planPricing={planPricing} />
        </div>
      </RevealOnScroll>

      <RevealOnScroll as="section" className="ck-page-section ck-home-cta-band">
        <div className="fj-container">
          <div className="ck-page-banner">
            <div>
              <h2>{t("home.ctaTitle")}</h2>
              <p>{t("home.ctaText")}</p>
            </div>
            <Link to={AUTH_PATHS.register.candidat} className="ck-public-btn ck-public-btn--ghost ck-public-btn--lg">
              {t("home.heroCta")}
            </Link>
          </div>
        </div>
      </RevealOnScroll>
    </>
  );
}
