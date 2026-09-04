import { ClipboardList, FileText, HeartPulse, Home, IdCard, Stamp } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import { AUTH_PATHS } from "../../constants/authPaths";
import PublicPageHeader from "../components/PublicPageHeader";

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

  return (
    <>
      <PageMeta title={t("consort.metaTitle")} description={t("consort.metaDescription")} />

      <div className="ck-page">
        <PublicPageHeader
          title={t("consort.title")}
          lead={t("consort.lead")}
          actions={<ClipboardList size={36} strokeWidth={1.5} aria-hidden color="var(--ck-green)" />}
        />

        <div className="ck-home-steps" style={{ gridTemplateColumns: undefined }}>
          <div
            className="ck-home-themes"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))" }}
          >
            {PIECES.map(({ icon: Icon, key }) => (
              <article key={key} className="ck-home-step" style={{ flexDirection: "column" }}>
                <span className="ck-home-step__num" aria-hidden>
                  <Icon size={20} />
                </span>
                <div>
                  <h3>{t(`consort.pieces.${key}.title`)}</h3>
                  <p>{t(`consort.pieces.${key}.desc`)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="ck-page-banner" style={{ marginTop: "3.2rem" }}>
          <div>
            <h2>{t("consort.ctaText")}</h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            <Link to={AUTH_PATHS.register.candidat} className="ck-public-btn ck-public-btn--ghost ck-public-btn--lg">
              {t("consort.ctaButton")}
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
