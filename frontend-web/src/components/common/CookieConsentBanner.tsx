import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { acceptCookiePolicy, isCookiePolicyAccepted } from "../../lib/cookieConsent";

const CURRENT_YEAR = new Date().getFullYear();

export default function CookieConsentBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!isCookiePolicyAccepted());
  }, []);

  function handleAccept() {
    acceptCookiePolicy();
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          id="cookiepolicy"
          className="cookiepolicy cookiepolicy--codakis"
          role="dialog"
          aria-live="polite"
          aria-label="Politique de cookies"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="cookiepolicy__container fj-container">
            <div className="cookiepolicy__row">
              <div className="cookiepolicy__start">
                <Link to="/politique-de-confidentialite#cookies" className="cookiepolicy__learn-more">
                  {t("cookies.learnMore")}
                </Link>
              </div>

              <div className="cookiepolicy__legal">
                <Link to="/politique-de-confidentialite">{t("cookies.privacy")}</Link>
                <span className="cookiepolicy__sep" aria-hidden="true">
                  |
                </span>
                <Link to="/conditions-d-utilisation">{t("cookies.terms")}</Link>
                <span className="cookiepolicy__sep" aria-hidden="true">
                  |
                </span>
                <span className="cookiepolicy__copy">
                  {t("cookies.rights", { year: CURRENT_YEAR })}
                </span>
              </div>

              <div className="cookiepolicy__action">
                <button type="button" id="cookieconfirm" className="cookiepolicy__accept" onClick={handleAccept}>
                  {t("cookies.accept")}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
