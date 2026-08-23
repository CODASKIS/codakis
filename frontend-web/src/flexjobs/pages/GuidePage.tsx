import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AUTH_PATHS } from "../../constants/authPaths";
import Button from "../components/Button";
import Container from "../components/Container";
import FaqAccordionSection, { faqSectionId } from "../components/FaqAccordionSection";
import SubNav from "../components/SubNav";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../components/PageBreadcrumb";

type GuidePageProps = {
  variant: "client" | "technician";
};

type GuideSection = {
  title: string;
  intro: string;
  qa: Array<{ q: string; a: string }>;
};

export default function GuidePage({ variant }: GuidePageProps) {
  const { t } = useTranslation();
  const isClient = variant === "client";

  const sections = useMemo(
    () =>
      (isClient
        ? t("guide.clientSections", { returnObjects: true })
        : t("guide.schoolSections", { returnObjects: true })) as GuideSection[],
    [isClient, t],
  );

  return (
    <>
      <PageMeta
        title={t(isClient ? "guide.clientMetaTitle" : "guide.schoolMetaTitle")}
        description={t(isClient ? "guide.clientMetaDescription" : "guide.schoolMetaDescription")}
      />
      <SubNav
        activePath={isClient ? "/guide/candidat" : "/guide/auto-ecole"}
        items={[
          { label: t("guide.navClient"), to: "/guide/candidat" },
          { label: t("guide.navSchool"), to: "/guide/auto-ecole" },
          { label: t("guide.navHowItWorks"), to: "/comment-ca-marche" },
        ]}
      />

      <section className="fj-section">
        <Container narrow>
          <PageBreadcrumb
            items={[
              { label: t("breadcrumb.home"), to: "/" },
              { label: t(isClient ? "guide.clientTitle" : "guide.schoolTitle") },
            ]}
          />

          <div className="fj-guide-page">
            <div className="fj-guide-intro">
              <h1>{t(isClient ? "guide.clientTitle" : "guide.schoolTitle")}</h1>
              <p>
                {t("guide.introP1Before")}{" "}
                <strong>{t("guide.introP1Strong")}</strong>
              </p>
              <p>{t("guide.introP2")}</p>
            </div>

            {sections.length > 1 ? (
              <nav className="fj-faq-categories" aria-label={t("guide.categoriesNav")}>
                {sections.map((section) => {
                  const sectionId = faqSectionId(section.title);
                  return (
                    <a key={section.title} href={`#${sectionId}`} className="fj-faq-category-card">
                      <span className="fj-faq-category-card__count">
                        {t("guide.faqCount", { count: section.qa.length })}
                      </span>
                      <span className="fj-faq-category-card__label">{section.title}</span>
                    </a>
                  );
                })}
              </nav>
            ) : null}

            {sections.map((section) => (
              <FaqAccordionSection
                key={section.title}
                id={faqSectionId(section.title)}
                title={section.title}
                intro={section.intro}
                items={section.qa.map((item) => ({
                  question: item.q,
                  answer: <p>{item.a}</p>,
                }))}
              />
            ))}

            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              <Button href={isClient ? "/auto-ecoles" : AUTH_PATHS.register.gerant} size="sm">
                {t(isClient ? "guide.clientCta" : "guide.schoolCta")}
              </Button>
              <Button href="/contact" variant="outline" size="sm">
                {t("guide.contactCta")}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
