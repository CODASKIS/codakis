import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { beginPageLoad, isPageReady, subscribePageReady } from "@/lib/pageLoadReady";
import { waitForPublicPageReady } from "@/lib/waitForDashboardContent";
import { CODAKIS_LOGO_ICON } from "./BrandLogo";

const MIN_VISIBLE_MS = 320;
const MAX_WAIT_MS = 12000;
const LOADER_LOGO_PX = 40;

function isAdminShellPath(pathname: string): boolean {
  return (
    pathname === "/dashboard" ||
    pathname === "/profile" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard/") ||
    pathname.startsWith("/espace/")
  );
}

export default function RoutePageLoader() {
  const { t } = useTranslation();
  const location = useLocation();
  const loadKey = `${location.pathname}${location.search}${location.hash}`;
  const previousLoadKeyRef = useRef<string | null>(null);
  const shellForLoadRef = useRef(isAdminShellPath(location.pathname));

  if (previousLoadKeyRef.current !== loadKey) {
    previousLoadKeyRef.current = loadKey;
    shellForLoadRef.current = isAdminShellPath(location.pathname);
  }

  const adminShell = shellForLoadRef.current;
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let hideTimer: number | undefined;
    let maxTimer: number | undefined;

    const hideLoader = () => {
      if (cancelled) return;
      hideTimer = window.setTimeout(() => {
        if (!cancelled) setVisible(false);
      }, MIN_VISIBLE_MS);
    };

    setVisible(true);
    beginPageLoad();

    if (adminShell) {
      const unsubscribe = subscribePageReady(() => {
        if (isPageReady()) hideLoader();
      });
      if (isPageReady()) hideLoader();

      maxTimer = window.setTimeout(hideLoader, MAX_WAIT_MS);

      return () => {
        cancelled = true;
        unsubscribe();
        if (hideTimer) window.clearTimeout(hideTimer);
        if (maxTimer) window.clearTimeout(maxTimer);
      };
    }

    void waitForPublicPageReady().then(() => {
      if (!cancelled) hideLoader();
    });
    maxTimer = window.setTimeout(hideLoader, MAX_WAIT_MS);

    return () => {
      cancelled = true;
      if (hideTimer) window.clearTimeout(hideTimer);
      if (maxTimer) window.clearTimeout(maxTimer);
    };
  }, [adminShell, loadKey]);

  if (!visible) return null;

  return (
    <div
      className={`fj-page-loader${adminShell ? " fj-page-loader--admin" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={t("common.loadingPage")}
    >
      <div className="fj-page-loader__panel">
        <img
          src={CODAKIS_LOGO_ICON}
          alt=""
          className="fj-page-loader__logo"
          width={LOADER_LOGO_PX}
          height={LOADER_LOGO_PX}
          aria-hidden
        />
        <div className="fj-page-loader__spinner" aria-hidden />
        <p className="fj-page-loader__text">{t("common.loading")}</p>
      </div>
    </div>
  );
}
