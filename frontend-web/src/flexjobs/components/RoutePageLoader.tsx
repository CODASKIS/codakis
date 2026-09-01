import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import CodakisLoaderPanel from "@/components/common/CodakisLoaderPanel";
import { beginPageLoad, isPageReady, subscribePageReady } from "@/lib/pageLoadReady";
import { waitForPublicPageReady } from "@/lib/waitForDashboardContent";

const MIN_VISIBLE_MS = 180;
const MAX_WAIT_MS = 4500;

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

  return createPortal(
    <div
      className={`codakis-loader-overlay${adminShell ? " codakis-loader-overlay--admin" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={t("common.loadingPage")}
    >
      <CodakisLoaderPanel message={t("common.loading")} />
    </div>,
    document.body,
  );
}
