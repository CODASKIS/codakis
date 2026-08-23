import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { CODAKIS_LOGO_ICON } from "./BrandLogo";

const MIN_VISIBLE_MS = 280;

function isAdminShellPath(pathname: string): boolean {
  return (
    pathname === "/dashboard" ||
    pathname === "/profile" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/dashboard/")
  );
}

export default function RoutePageLoader() {
  const { t } = useTranslation();
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const adminShell = isAdminShellPath(location.pathname);

  useEffect(() => {
    setVisible(true);
    const hideAt = window.setTimeout(() => setVisible(false), MIN_VISIBLE_MS);
    return () => window.clearTimeout(hideAt);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    const hideAt = window.setTimeout(() => setVisible(false), MIN_VISIBLE_MS);
    return () => window.clearTimeout(hideAt);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fj-page-loader${adminShell ? " fj-page-loader--admin" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={t("common.loadingPage")}
    >
      <div className="fj-page-loader__panel">
        <img src={CODAKIS_LOGO_ICON} alt="" className="fj-page-loader__logo" width={40} height={40} aria-hidden />
        <div className="fj-page-loader__spinner" aria-hidden />
        <p className="fj-page-loader__text">{t("common.loading")}</p>
      </div>
    </div>
  );
}
