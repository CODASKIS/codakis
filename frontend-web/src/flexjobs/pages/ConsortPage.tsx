import { ClipboardList, FileText, HeartPulse, Home, IdCard, Stamp } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import { AUTH_PATHS } from "../../constants/authPaths";
import Container from "../components/Container";
import SubNav from "../components/SubNav";
import { useSecondaryNavItems } from "../hooks/useSecondaryNavItems";

const PIECES = [
  { icon: IdCard, key: "id" },
  { icon: FileText, key: "birth" },
  { icon: HeartPulse, key: "medical" },
  { icon: IdCard, key: "photos" },
  { icon: Home, key: "address" },
  { icon: Stamp, key: "stamps" },
] as const;

export default function ConsortPage() {
  const { t } = useTranslation();
  const subNavItems = useSecondaryNavItems();

  return (
    <>
      <PageMeta title={t("consort.metaTitle")} description={t("consort.metaDescription")} />
      <SubNav activePath="/consort" items={[...subNavItems]} />

      <section className="fj-section fj-consort-page">
        <Container>
          <div className="fj-consort-page__hero">
            <ClipboardList size={48} strokeWidth={1.5} className="fj-consort-page__icon" aria-hidden />
            <h1>{t("consort.title")}</h1>
            <p className="fj-consort-page__lead">{t("consort.lead")}</p>
          </div>

          <div className="fj-consort-page__grid">
            {PIECES.map(({ icon: Icon, key }) => (
              <article key={key} className="fj-consort-page__card">
                <span className="fj-consort-page__card-icon" aria-hidden>
                  <Icon size={28} strokeWidth={1.5} />
                </span>
                <h2>{t(`consort.pieces.${key}.title`)}</h2>
                <p>{t(`consort.pieces.${key}.desc`)}</p>
              </article>
            ))}
          </div>

          <div className="fj-consort-page__cta">
            <p>{t("consort.ctaText")}</p>
            <Link to={AUTH_PATHS.register.candidat} className="fj-btn fj-btn--primary fj-btn--lg">
              {t("consort.ctaButton")}
            </Link>
            <Link to={AUTH_PATHS.login} className="fj-consort-page__login">
              {t("nav.login")}
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
