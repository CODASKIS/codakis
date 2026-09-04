import { CircleCheck, Globe, Headphones, Search, Users, GraduationCap } from "lucide-react";
import { Link } from "react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AUTH_PATHS } from "../../constants/authPaths";
import PageMeta from "../../components/common/PageMeta";
import PublicPageHeader from "../components/PublicPageHeader";

const STAT_ICONS = [Users, GraduationCap, Globe] as const;
const HOW_ICONS = [Globe, Search, Headphones] as const;

type StatItem = { value: string; label: string };
type HowItem = { title: string; text: string };
type BenefitItem = { title: string; text: string };

export default function AboutPage() {
  const { t } = useTranslation();

  const stats = useMemo(() => t("about.stats", { returnObjects: true }) as StatItem[], [t]);
  const howItems = useMemo(() => t("about.howItems", { returnObjects: true }) as HowItem[], [t]);
  const benefits = useMemo(() => t("about.benefits", { returnObjects: true }) as BenefitItem[], [t]);

  return (
    <>
      <PageMeta title={t("about.metaTitle")} description={t("about.metaDescription")} />

      <div className="ck-page">
        <PublicPageHeader
          title={`${t("about.heroTitle")} ${t("about.heroBrand")}`}
          lead={t("about.heroP1")}
          actions={
            <Link to="/auto-ecoles" className="ck-public-btn ck-public-btn--primary">
              {t("about.heroCta")}
            </Link>
          }
        />

        <div className="ck-home-steps">
          {stats.map((item, index) => {
            const Icon = STAT_ICONS[index] ?? Users;
            return (
              <article key={item.label} className="ck-home-step">
                <span className="ck-home-step__num" aria-hidden>
                  <Icon size={18} />
                </span>
                <div>
                  <h3>{item.value}</h3>
                  <p>{item.label}</p>
                </div>
              </article>
            );
          })}
        </div>

        <section className="ck-page-section">
          <div className="ck-page-section__head">
            <h2>
              {t("about.howTitleBefore")} {t("about.howTitleAccent")}
            </h2>
          </div>
          <ol className="ck-timeline">
            {howItems.map((item, index) => {
              const Icon = HOW_ICONS[index] ?? Globe;
              return (
                <li key={item.title} className="ck-timeline__item">
                  <span className="ck-timeline__num" aria-hidden>
                    <Icon size={18} />
                  </span>
                  <div className="ck-timeline__body">
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="ck-page-section">
          <div className="ck-page-section__head">
            <h2>{t("about.benefitsTitle")}</h2>
          </div>
          <div className="ck-home-steps">
            {benefits.slice(0, 3).map((item) => (
              <article key={item.title} className="ck-home-step">
                <span className="ck-home-step__num" aria-hidden>
                  <CircleCheck size={18} />
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="ck-page-banner">
          <div>
            <h2>{t("about.heroBrand")}</h2>
            <p>{t("about.heroP2Before")} {t("about.heroP2After")}</p>
          </div>
          <Link to={AUTH_PATHS.register.candidat} className="ck-public-btn ck-public-btn--ghost ck-public-btn--lg">
            {t("nav.signup")}
          </Link>
        </div>
      </div>
    </>
  );
}
