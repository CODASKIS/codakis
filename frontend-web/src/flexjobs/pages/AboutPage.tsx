import { CircleCheck, Globe, Headphones, Search, Star, Users, GraduationCap } from "lucide-react";
import { Link } from "react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AUTH_PATHS } from "../../constants/authPaths";
import PageMeta from "../../components/common/PageMeta";
import Container from "../components/Container";
import SubNav from "../components/SubNav";
import TestimonialsSlider from "../components/TestimonialsSlider";
import ThemedIcon from "../components/ThemedIcon";
import { FJ_IMG } from "../assets/online-images";

const STAT_ICONS = [Users, GraduationCap, Globe] as const;
const HOW_ICONS = [Globe, Search, Headphones] as const;

type StatItem = { value: string; label: string };
type HowItem = { title: string; text: string };
type BenefitItem = { title: string; text: string };
type TestimonialItem = { quote: string; author: string; location: string };

export default function AboutPage() {
  const { t } = useTranslation();

  const stats = useMemo(() => t("about.stats", { returnObjects: true }) as StatItem[], [t]);
  const howItems = useMemo(() => t("about.howItems", { returnObjects: true }) as HowItem[], [t]);
  const benefits = useMemo(() => t("about.benefits", { returnObjects: true }) as BenefitItem[], [t]);
  const testimonials = useMemo(
    () => t("about.testimonials", { returnObjects: true }) as TestimonialItem[],
    [t],
  );

  return (
    <>
      <PageMeta title={t("about.metaTitle")} description={t("about.metaDescription")} />
      <SubNav
        activePath="/a-propos"
        items={[
          { label: t("about.navHowItWorks"), to: "/comment-ca-marche" },
          { label: t("about.navAbout"), to: "/a-propos" },
          { label: t("about.navClientGuide"), to: "/guide/candidat" },
          { label: t("about.navSchoolGuide"), to: "/guide/auto-ecole" },
        ]}
      />

      <div className="fj-about-page">
        <section className="fj-about-hero">
          <Container>
            <div className="fj-about-hero__grid">
              <div className="fj-about-hero__copy">
                <h1>
                  {t("about.heroTitle")} <span>{t("about.heroBrand")}</span>
                </h1>
                <p>
                  {t("about.heroP1")}
                  <br />
                  <br />
                  {t("about.heroP2Before")}{" "}
                  <Link to="/contact">{t("about.heroSupportLink")}</Link>{" "}
                  {t("about.heroP2After")}
                </p>
                <Link to="/auto-ecoles" className="fj-btn fj-btn--primary fj-about-hero__cta">
                  {t("about.heroCta")}
                </Link>
              </div>
              <div className="fj-about-hero__media">
                <img src={FJ_IMG.aboutHero} alt="" width={487} height={487} />
              </div>
            </div>
          </Container>
        </section>

        <section className="fj-about-stats">
          <Container>
            <div className="fj-about-stats__grid">
              {stats.map((item, index) => {
                const Icon = STAT_ICONS[index] ?? Users;
                return (
                  <article key={item.label} className="fj-about-stat">
                    <div className="fj-about-stat__copy">
                      <h2>{item.value}</h2>
                      <p>{item.label}</p>
                    </div>
                    <div className="fj-about-stat__icon">
                      <ThemedIcon icon={Icon} size={40} variant="nav" />
                    </div>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>

        <section className="fj-about-how">
          <Container>
            <h2>
              {t("about.howTitleBefore")} <span>{t("about.howTitleAccent")}</span>
            </h2>
            <div className="fj-about-how__grid">
              {howItems.map((item, index) => {
                const Icon = HOW_ICONS[index] ?? Globe;
                return (
                  <article key={item.title} className="fj-about-how__card">
                    <div className="fj-about-how__icon-wrap">
                      <ThemedIcon icon={Icon} size={32} variant="nav" />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>

        <section className="fj-about-benefits">
          <Container>
            <h2>
              <span>{t("about.benefitsTitleAccent")}</span> {t("about.benefitsTitleAfter")}
            </h2>
            <Link to={AUTH_PATHS.register.candidat} className="fj-btn fj-btn--primary fj-about-benefits__cta">
              {t("about.benefitsCta")}
            </Link>
            <div className="fj-about-benefits__grid">
              {benefits.map((item) => (
                <article key={item.title} className="fj-about-benefits__card">
                  <CircleCheck size={40} strokeWidth={1.5} className="fj-about-benefits__tick" aria-hidden="true" />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="fj-about-reviews">
          <Container>
            <h2>{t("about.reviewsTitle")}</h2>
            <TestimonialsSlider items={testimonials} />
            <div className="text-center fj-about-reviews__cta">
              <Link to="/comment-ca-marche" className="fj-btn fj-btn--outline">
                {t("about.reviewsCta")}
              </Link>
            </div>
          </Container>
        </section>

        <section className="fj-about-origin">
          <Container>
            <div className="fj-about-hero__grid">
              <div className="fj-about-hero__copy">
                <h2>
                  <span>{t("about.originTitleAccent")}</span> {t("about.originTitleAfter")}
                </h2>
                <p>
                  {t("about.originP1")}
                  <br />
                  <br />
                  {t("about.originP2")}
                  <br />
                  <br />
                  {t("about.originP3Before")}{" "}
                  <Link to="/comment-ca-marche">
                    <strong>{t("about.originHowItWorks")}</strong>
                  </Link>{" "}
                  {t("about.originMiddle")}{" "}
                  <Link to="/tarifs#abonnement">
                    <strong>{t("about.originPricing")}</strong>
                  </Link>
                  {t("about.originAfter")}
                </p>
              </div>
              <div className="fj-about-hero__media">
                <img src={FJ_IMG.aboutJobSearch} alt="" width={487} height={487} />
              </div>
            </div>
          </Container>
        </section>

        <section className="fj-about-cta-banner">
          <Star className="fj-about-cta-banner__star fj-icon fj-icon--light" aria-hidden="true" />
          <Container narrow>
            <h2>
              {t("about.bannerTitleBefore")} <span>{t("about.bannerTitleAccent")}</span>
            </h2>
            <Link to={AUTH_PATHS.register.candidat} className="fj-btn fj-btn--primary fj-about-hero__cta">
              {t("about.bannerCta")}
            </Link>
          </Container>
        </section>
      </div>
    </>
  );
}
