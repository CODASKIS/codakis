import { BadgeCheck, BookOpen, Star } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import RevealOnScroll from "../../components/motion/RevealOnScroll";
import { CODAKIS_LOGO } from "../components/BrandLogo";
import { FJ_IMG } from "../assets/online-images";
import Button from "../components/Button";
import DomainCategoryCard from "../components/DomainCategoryCard";
import HomeCemacCoverageSection from "../components/HomeCemacCoverageSection";
import HomeDrivingSchoolsSection from "../components/HomeDrivingSchoolsSection";
import HomeMobileAppSection from "../components/HomeMobileAppSection";
import HomeMemberTestimonials from "../components/HomeMemberTestimonials";
import HomeRecentBlogSection from "../components/HomeRecentBlogSection";
import { AUTH_PATHS } from "../../constants/authPaths";
import { THEME_CODES } from "../../i18n/themeLabels";
import HomeUtilityBar from "../components/HomeUtilityBar";

const HOME_THEME_CODES = THEME_CODES.slice(0, 6);

export default function HomePage() {
  const { t } = useTranslation();

  const pillars = [
    { icon: BookOpen, title: t("home.pillar1Title"), text: t("home.pillar1Text") },
    { icon: BadgeCheck, title: t("home.pillar2Title"), text: t("home.pillar2Text") },
    { icon: Star, title: t("home.pillar3Title"), text: t("home.pillar3Text") },
  ] as const;

  const categories = HOME_THEME_CODES.map((code) => ({
    label: t(`home.themeLabels.${code}`),
    code,
    to: `/themes?q=${code}`,
  }));

  return (
    <>
      <PageMeta title={t("home.metaTitle")} description={t("home.metaDescription")} />

      <RevealOnScroll as="section" className="fj-home-hero fj-home-hero--codakis">
        <div className="fj-container">
          <div className="fj-home-hero__grid">
            <div className="fj-home-hero__copy">
              <img
                src={CODAKIS_LOGO}
                alt="CODAKIS"
                className="fj-home-hero__wordmark"
                width={280}
                height={64}
              />
              <h1>{t("home.heroTitle")}</h1>
              <p className="fj-home-hero__lead">{t("home.heroLead")}</p>
              <div className="fj-home-hero__actions">
                <Link to={AUTH_PATHS.login} className="fj-btn fj-btn--primary fj-btn--lg">
                  {t("home.heroCta")}
                </Link>
                <Link to="/auto-ecoles" className="fj-btn fj-btn--outline fj-btn--lg">
                  {t("home.heroCtaSecondary")}
                </Link>
              </div>
            </div>
            <div className="fj-home-hero__visual">
              <div className="fj-home-hero__circle fj-home-hero__circle--accent" aria-hidden />
              <img
                src={FJ_IMG.hero}
                alt=""
                className="fj-home-hero__photo"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </RevealOnScroll>

      <RevealOnScroll as="section" delay={0.03}>
        <HomeDrivingSchoolsSection />
      </RevealOnScroll>

      <RevealOnScroll as="section" delay={0.035}>
        <HomeCemacCoverageSection />
      </RevealOnScroll>

      <RevealOnScroll as="section" className="fj-pillars">
        <div className="fj-container">
          <h2 className="fj-pillars__title">{t("home.pillarsTitle")}</h2>
          <span className="fj-pillars__underline" aria-hidden="true" />
          <div className="fj-pillars__grid">
            {pillars.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="fj-pillar">
                  <div className="fj-pillar__icon-wrap" aria-hidden>
                    <Icon strokeWidth={1.5} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </RevealOnScroll>

      <RevealOnScroll as="section" className="fj-featured">
        <div className="fj-container">
          <h2>{t("home.featuredTitle")}</h2>
          <p className="fj-featured__lead">{t("home.featuredLead")}</p>
          <div className="fj-featured__actions">
            <Button href="/auto-ecoles">{t("home.featuredExplore")}</Button>
            <Button href="/themes" variant="outline">
              {t("home.featuredThemes")}
            </Button>
          </div>
        </div>
      </RevealOnScroll>

      <RevealOnScroll as="section" className="fj-testimonials">
        <HomeMemberTestimonials />
      </RevealOnScroll>

      <RevealOnScroll as="section" className="fj-categories">
        <div className="fj-container">
          <div className="fj-categories__head">
            <span className="fj-categories__pattern" aria-hidden="true" />
            <div>
              <h2>{t("home.themesTitle")}</h2>
              <p>{t("home.themesLead")}</p>
            </div>
          </div>
          <div className="fj-domain-grid">
            {categories.map((cat) => (
              <DomainCategoryCard key={cat.code} label={cat.label} code={cat.code} to={cat.to} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Button href="/themes" variant="outline">
              {t("home.themesAll")}
            </Button>
          </div>
        </div>
      </RevealOnScroll>

      <RevealOnScroll as="section" delay={0.04}>
        <HomeUtilityBar />
      </RevealOnScroll>

      <RevealOnScroll as="section" delay={0.04}>
        <HomeMobileAppSection />
      </RevealOnScroll>

      <RevealOnScroll as="section" className="fj-home-blog-wrap" delay={0.05}>
        <HomeRecentBlogSection />
      </RevealOnScroll>

      <RevealOnScroll as="section" className="fj-cta-banner fj-cta-banner--codakis">
        <div className="fj-container fj-cta-banner__inner">
          <div>
            <h2>{t("home.ctaTitle")}</h2>
            <h3>{t("home.ctaSubtitle")}</h3>
            <p>{t("home.ctaText")}</p>
          </div>
          <Link to="/auto-ecoles" className="fj-btn fj-btn--primary fj-btn--lg">
            {t("home.ctaButton")}
          </Link>
        </div>
      </RevealOnScroll>
    </>
  );
}
