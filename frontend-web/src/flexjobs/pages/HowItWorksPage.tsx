import { BadgeCheck, BriefcaseBusiness, Star } from "lucide-react";
import { Link } from "react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AUTH_PATHS } from "../../constants/authPaths";
import PageMeta from "../../components/common/PageMeta";
import RevealOnScroll from "../../components/motion/RevealOnScroll";
import PageBreadcrumb from "../components/PageBreadcrumb";
import FaqAccordionSection, { FaqAnswerText } from "../components/FaqAccordionSection";

const INCLUDE_ICONS = [BriefcaseBusiness, BadgeCheck, Star] as const;

type HighlightItem = { title: string; body: string; moreLabel?: string; moreHref?: string };
type StepItem = { num: string; title: string; text: string };
type FaqItem = { question: string; answer: string; linkLabel?: string; linkHref?: string };
type IncludeItem = { title: string; text: string };

export default function HowItWorksPage() {
  const { t } = useTranslation();

  const intro = useMemo(() => t("howItWorks.intro", { returnObjects: true }) as string[], [t]);
  const highlights = useMemo(
    () => t("howItWorks.highlights", { returnObjects: true }) as HighlightItem[],
    [t],
  );
  const steps = useMemo(() => t("howItWorks.steps", { returnObjects: true }) as StepItem[], [t]);
  const clientFaq = useMemo(
    () => t("howItWorks.clientFaq", { returnObjects: true }) as FaqItem[],
    [t],
  );
  const schoolFaq = useMemo(
    () => t("howItWorks.schoolFaq", { returnObjects: true }) as FaqItem[],
    [t],
  );
  const includes = useMemo(
    () => t("howItWorks.includes", { returnObjects: true }) as IncludeItem[],
    [t],
  );

  return (
    <>
      <PageMeta title={t("howItWorks.metaTitle")} description={t("howItWorks.metaDescription")} />

      <article className="fj-privacy-page fj-how-page">
        <div className="fj-container fj-privacy-page__container">
          <PageBreadcrumb
            items={[
              { label: t("breadcrumb.home"), to: "/" },
              { label: t("howItWorks.breadcrumb") },
            ]}
          />

          <header className="fj-privacy-page__header">
            <h1>{t("howItWorks.title")}</h1>
            {intro.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="fj-privacy-page__intro fj-how-page__intro">
                {paragraph}
              </p>
            ))}
            <p className="fj-privacy-page__notice">{t("howItWorks.notice")}</p>
          </header>

          <section className="fj-privacy-page__highlights" aria-labelledby="how-highlights-title">
            <h2 id="how-highlights-title">{t("howItWorks.highlightsTitle")}</h2>
            <p className="fj-privacy-page__highlights-note">{t("howItWorks.highlightsNote")}</p>
            <ul className="fj-privacy-page__highlight-list">
              {highlights.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong>
                  <p>
                    {item.body}{" "}
                    {item.moreLabel && item.moreHref ? (
                      <Link to={item.moreHref} className="fj-link">
                        {item.moreLabel}
                      </Link>
                    ) : null}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <RevealOnScroll as="section" className="fj-how-page__steps" aria-labelledby="how-steps-title">
            <h2 id="how-steps-title">{t("howItWorks.stepsTitle")}</h2>
            <div className="fj-affiliate-steps__grid">
              {steps.map((step) => (
                <article key={step.num} className="fj-affiliate-step">
                  <span className="fj-affiliate-step__num">{step.num}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </RevealOnScroll>

          <FaqAccordionSection
            title={t("howItWorks.clientFaqTitle")}
            items={clientFaq.map((item) => ({
              question: item.question,
              answer: (
                <FaqAnswerText linkLabel={item.linkLabel} linkHref={item.linkHref}>
                  {item.answer}
                </FaqAnswerText>
              ),
            }))}
          />

          <FaqAccordionSection
            title={t("howItWorks.schoolFaqTitle")}
            items={schoolFaq.map((item) => ({
              question: item.question,
              answer: (
                <FaqAnswerText linkLabel={item.linkLabel} linkHref={item.linkHref}>
                  {item.answer}
                </FaqAnswerText>
              ),
            }))}
          />

          <RevealOnScroll as="section" className="fj-how-page__includes" aria-labelledby="how-includes-title">
            <h2 id="how-includes-title">{t("howItWorks.includesTitle")}</h2>
            <div className="fj-affiliate-includes__grid">
              {includes.map((item, index) => {
                const Icon = INCLUDE_ICONS[index] ?? BriefcaseBusiness;
                return (
                  <article key={item.title} className="fj-affiliate-include">
                    <span className="fj-affiliate-include__icon" aria-hidden="true">
                      <Icon size={48} strokeWidth={1.25} />
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                );
              })}
            </div>
            <div className="fj-how-page__cta">
              <Link to={AUTH_PATHS.register.candidat} className="fj-btn fj-btn--primary fj-btn--lg">
                {t("howItWorks.signupCta")}
              </Link>
              <Link to={AUTH_PATHS.login} className="fj-btn fj-btn--outline fj-btn--lg">
                {t("nav.login")}
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </article>
    </>
  );
}
