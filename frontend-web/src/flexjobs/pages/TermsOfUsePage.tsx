import { Link } from "react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../components/PageBreadcrumb";

type LegalHighlight = {
  title: string;
  body: string;
  moreLabel?: string;
  moreHref?: string;
};

type LegalSubsection = {
  title?: string;
  paragraphs?: string[];
  bullets?: string[];
};

type LegalSection = {
  id?: string;
  title: string;
  paragraphs?: string[];
  subsections?: LegalSubsection[];
  showContactForm?: boolean;
  showPrivacyLink?: boolean;
};

export default function TermsOfUsePage() {
  const { t } = useTranslation();

  const highlights = useMemo(
    () => t("terms.highlights", { returnObjects: true }) as LegalHighlight[],
    [t],
  );
  const fullSections = useMemo(
    () => t("terms.fullSections", { returnObjects: true }) as LegalSection[],
    [t],
  );

  return (
    <>
      <PageMeta title={t("terms.metaTitle")} description={t("terms.metaDescription")} />

      <article className="fj-privacy-page">
        <div className="fj-container fj-privacy-page__container">
          <PageBreadcrumb
            items={[
              { label: t("breadcrumb.home"), to: "/" },
              { label: t("terms.title") },
            ]}
          />

          <header className="fj-privacy-page__header">
            <h1>{t("terms.title")}</h1>
            <p className="fj-privacy-page__updated">
              {t("terms.lastUpdatedLabel", { date: t("terms.lastUpdated") })}
            </p>
            <p className="fj-privacy-page__intro">{t("terms.intro")}</p>
            <p className="fj-privacy-page__notice">{t("terms.legalNotice")}</p>
          </header>

          <section className="fj-privacy-page__highlights" aria-labelledby="terms-highlights-title">
            <h2 id="terms-highlights-title">{t("terms.highlightsTitle")}</h2>
            <p className="fj-privacy-page__highlights-note">
              {t("terms.highlightsNoteBefore")}{" "}
              <a href="#conditions-completes" className="fj-link">
                {t("terms.highlightsNoteLink")}
              </a>
              {t("terms.highlightsNoteAfter")}
            </p>
            <ul className="fj-privacy-page__highlight-list">
              {highlights.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong>
                  <p>
                    {item.body}{" "}
                    {item.moreLabel && item.moreHref ? (
                      item.moreHref.startsWith("/") ? (
                        <Link to={item.moreHref} className="fj-link">
                          {item.moreLabel}
                        </Link>
                      ) : (
                        <a href={item.moreHref} className="fj-link">
                          {item.moreLabel}
                        </a>
                      )
                    ) : null}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section
            id="conditions-completes"
            className="fj-privacy-page__full"
            aria-labelledby="terms-full-title"
          >
            <h2 id="terms-full-title">{t("terms.fullTitle")}</h2>

            {fullSections.map((section) => (
              <section key={section.title} id={section.id} className="fj-privacy-page__section">
                <h3>{section.title}</h3>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
                {section.showPrivacyLink ? (
                  <p>
                    <Link to="/politique-de-confidentialite" className="fj-link">
                      {t("terms.privacyLink")}
                    </Link>
                  </p>
                ) : null}
                {section.showContactForm ? (
                  <p>
                    <Link to="/contact" className="fj-link">
                      {t("terms.contactFormLink")}
                    </Link>
                  </p>
                ) : null}
                {section.subsections?.map((subsection, index) => (
                  <div
                    key={subsection.title ?? `subsection-${index}`}
                    className="fj-privacy-page__subsection"
                  >
                    {subsection.title ? <h4>{subsection.title}</h4> : null}
                    {subsection.paragraphs?.map((paragraph) => (
                      <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                    ))}
                    {subsection.bullets ? (
                      <ul>
                        {subsection.bullets.map((bullet) => (
                          <li key={bullet.slice(0, 40)}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </section>
            ))}
          </section>
        </div>
      </article>
    </>
  );
}
