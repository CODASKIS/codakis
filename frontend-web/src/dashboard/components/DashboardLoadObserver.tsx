import { useEffect, type RefObject } from "react";
import { useLocation } from "react-router";
import { markPageReady } from "@/lib/pageLoadReady";
import { waitForDashboardReady } from "@/lib/waitForDashboardContent";

type DashboardLoadObserverProps = {
  contentRef: RefObject<HTMLElement | null>;
};

/** Signale au loader global quand le dashboard est entièrement prêt. */
export default function DashboardLoadObserver({ contentRef }: DashboardLoadObserverProps) {
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await waitForDashboardReady(contentRef.current);
      } finally {
        if (!cancelled) markPageReady();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [contentRef, location.pathname, location.search, location.hash]);

  return null;
}
