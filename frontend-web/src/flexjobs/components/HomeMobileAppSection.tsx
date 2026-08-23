import { Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CODAKIS_LOGO_ICON } from "./BrandLogo";
import Container from "./Container";

/** URL de téléchargement — remplacer par le lien stores quand l'app sera publiée. */
const APP_DOWNLOAD_URL = "https://codakis.cm/app";

export default function HomeMobileAppSection() {
  const { t } = useTranslation();
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(APP_DOWNLOAD_URL)}&bgcolor=ffffff&color=1a1a1a&margin=0`;

  return (
    <section className="fj-mobile-app" aria-labelledby="mobile-app-title">
      <Container>
        <div className="fj-mobile-app__grid">
          <div className="fj-mobile-app__copy">
            <span className="fj-mobile-app__eyebrow">
              <Smartphone size={20} strokeWidth={1.5} aria-hidden />
              {t("mobile.eyebrow")}
            </span>
            <h2 id="mobile-app-title">{t("mobile.title")}</h2>
            <p>{t("mobile.lead")}</p>
            <ul className="fj-mobile-app__features">
              <li>{t("mobile.feature1")}</li>
              <li>{t("mobile.feature2")}</li>
              <li>{t("mobile.feature3")}</li>
            </ul>
          </div>

          <div className="fj-mobile-app__qr-wrap">
            <div className="fj-mobile-app__qr-square">
              <img
                src={qrSrc}
                alt={t("mobile.qrAlt")}
                className="fj-mobile-app__qr"
                width={240}
                height={240}
                loading="lazy"
              />
              <img
                src={CODAKIS_LOGO_ICON}
                alt=""
                className="fj-mobile-app__qr-logo"
                width={40}
                height={40}
                aria-hidden
              />
            </div>
            <p className="fj-mobile-app__scan">{t("mobile.scan")}</p>
            <p className="fj-mobile-app__stores">{t("mobile.stores")}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
