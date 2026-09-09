import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  acceptCookiePolicy,
  isCookiePolicyAccepted,
  refuseCookiePolicy,
} from "../../lib/cookieConsent";

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

  function handleRefuse() {
    refuseCookiePolicy();
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
          aria-label={t("cookies.aria")}
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="cookiepolicy__panel">
            <div className="cookiepolicy__copy-block">
              <p className="cookiepolicy__message">{t("cookies.message")}</p>
              <p className="cookiepolicy__links">
                <Link to="/politique-de-confidentialite#cookies" className="cookiepolicy__learn-more">
                  {t("cookies.learnMore")}
                </Link>
                <span className="cookiepolicy__sep" aria-hidden="true">
                  ·
                </span>
                <Link to="/politique-de-confidentialite">{t("cookies.privacy")}</Link>
                <span className="cookiepolicy__sep" aria-hidden="true">
                  ·
                </span>
                <Link to="/conditions-d-utilisation">{t("cookies.terms")}</Link>
              </p>
            </div>

            <div className="cookiepolicy__actions">
              <button type="button" className="cookiepolicy__refuse" onClick={handleRefuse}>
                {t("cookies.refuse")}
              </button>
              <button type="button" id="cookieconfirm" className="cookiepolicy__accept" onClick={handleAccept}>
                {t("cookies.accept")}
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
