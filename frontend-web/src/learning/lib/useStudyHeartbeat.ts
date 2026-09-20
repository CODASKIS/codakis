import { useEffect, useRef } from "react";
import { sendStudyHeartbeat } from "../../lib/pedagogyApi";

const TICK_MS = 60_000;
/** Au-delà de ce silence clavier/souris, l'onglet est considéré inactif. */
const IDLE_MS = 5 * 60_000;

/**
 * Crédite une minute d'étude par minute réellement passée dans l'espace candidat.
 * Alimente la quête « Apprends pendant 10 minutes » et la série quotidienne.
 */
export function useStudyHeartbeat(enabled: boolean) {
  const lastInteraction = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;

    function touch() {
      lastInteraction.current = Date.now();
    }

    const events = ["pointerdown", "keydown", "scroll", "visibilitychange"] as const;
    events.forEach((event) => window.addEventListener(event, touch, { passive: true }));

    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastInteraction.current > IDLE_MS) return;
      void sendStudyHeartbeat(1).catch(() => undefined);
    }, TICK_MS);

    return () => {
      window.clearInterval(timer);
      events.forEach((event) => window.removeEventListener(event, touch));
    };
  }, [enabled]);
}
