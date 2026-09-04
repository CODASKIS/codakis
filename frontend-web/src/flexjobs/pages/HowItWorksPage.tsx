import { Link } from "react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AUTH_PATHS } from "../../constants/authPaths";
import PageMeta from "../../components/common/PageMeta";
import FaqAccordionSection, { FaqAnswerText } from "../components/FaqAccordionSection";
import PublicPageHeader from "../components/PublicPageHeader";

type StepItem = { num: string; title: string; text: string };
type FaqItem = { question: string; answer: string; linkLabel?: string; linkHref?: string };

export default function HowItWorksPage() {
  const { t } = useTranslation();

  const intro = useMemo(() => t("howItWorks.intro", { returnObjects: true }) as string[], [t]);
  const steps = useMemo(() => t("howItWorks.steps", { returnObjects: true }) as StepItem[], [t]);
  const clientFaq = useMemo(
    () => t("howItWorks.clientFaq", { returnObjects: true }) as FaqItem[],
    [t],
  );

  return (
    <>
      <PageMeta title={t("howItWorks.metaTitle")} description={t("howItWorks.metaDescription")} />

      <div className="ck-page">
        <PublicPageHeader title={t("howItWorks.title")} lead={intro[0]} />

        <ol className="ck-timeline">
          {steps.map((step) => (
            <li key={step.num} className="ck-timeline__item">
              <span className="ck-timeline__num" aria-hidden>
                {step.num}
              </span>
              <div className="ck-timeline__body">
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="ck-page-section">
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
        </div>

        <div className="ck-page-banner">
          <div>
            <h2>{t("howItWorks.includesTitle")}</h2>
            <p>{t("howItWorks.notice")}</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            <Link to={AUTH_PATHS.register.candidat} className="ck-public-btn ck-public-btn--ghost ck-public-btn--lg">
              {t("howItWorks.signupCta")}
            </Link>
            <Link to={AUTH_PATHS.login} className="ck-public-btn ck-public-btn--ghost">
              {t("nav.login")}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
