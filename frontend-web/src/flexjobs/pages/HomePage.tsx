import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import RevealOnScroll from "../../components/motion/RevealOnScroll";
import { FJ_IMG } from "../assets/online-images";
import HeaderSearch from "../components/HeaderSearch";
import {
  formatDrivingSchoolListLabel,
  type DrivingSchool,
} from "../../data/mockDrivingSchools";
import { fetchPublicSchools, mapPublicSchoolToDrivingSchool } from "../../lib/publicSchoolsApi";
import { AUTH_PATHS } from "../../constants/authPaths";
import { THEME_CODES } from "../../i18n/themeLabels";

const HOME_THEME_CODES = THEME_CODES.slice(0, 6);

export default function HomePage() {
  const { t } = useTranslation();
  const [schools, setSchools] = useState<DrivingSchool[]>([]);

  useEffect(() => {
    void fetchPublicSchools()
      .then((items) => setSchools(items.map((item) => mapPublicSchoolToDrivingSchool(item)).slice(0, 6)))
      .catch(() => setSchools([]));
  }, []);

  const steps = useMemo(
    () => [
      { num: "1", title: t("home.pillar3Title"), text: t("auth.brand.highlights.lessons", { defaultValue: "Créez votre compte candidat" }) },
      { num: "2", title: t("home.pillar1Title"), text: t("home.pillar1Text") },
      { num: "3", title: t("home.pillar2Title"), text: t("home.pillar2Text") },
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
              <h1>{t("home.heroTitle")}</h1>
              <p className="ck-home-hero__lead">{t("home.heroLead")}</p>
              <div className="ck-public-search ck-public-search--hero">
                <HeaderSearch />
              </div>
              <div className="ck-home-hero__actions">
                <Link to={AUTH_PATHS.register.candidat} className="ck-public-btn ck-public-btn--primary ck-public-btn--lg">
                  {t("home.heroCta")}
                </Link>
              </div>
            </div>
            <div className="ck-home-hero__visual" aria-hidden>
              <div className="ck-home-hero__glow" />
              <img src={FJ_IMG.hero} alt="" className="ck-home-hero__photo" fetchPriority="high" />
            </div>
          </div>
        </div>
      </RevealOnScroll>

      <RevealOnScroll as="section" className="ck-page-section">
        <div className="fj-container">
          <div className="ck-page-section__head">
            <h2>{t("home.pillarsTitle")}</h2>
            <p>{t("home.heroLead")}</p>
          </div>
          <div className="ck-home-steps">
            {steps.map((step) => (
              <article key={step.num} className="ck-home-step">
                <span className="ck-home-step__num" aria-hidden>
                  {step.num}
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

      <RevealOnScroll as="section" className="ck-page-section">
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

      <RevealOnScroll as="section" className="ck-page-section">
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
