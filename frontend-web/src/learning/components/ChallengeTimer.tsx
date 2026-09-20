import { useEffect, useRef, useState } from "react";
import { Timer } from "lucide-react";

type Options = {
  dureeMinutes: number;
  enabled?: boolean;
  onExpire?: () => void;
};

function formatRemain(totalSec: number) {
  const safe = Math.max(0, totalSec);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Compte à rebours pour quiz / examens (auto-expire). */
export function useChallengeTimer({ dureeMinutes, enabled = true, onExpire }: Options) {
  const totalSec = Math.max(0, Math.round(dureeMinutes * 60));
  const [remain, setRemain] = useState(totalSec);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    expiredRef.current = false;
    setRemain(totalSec);
  }, [totalSec]);

  useEffect(() => {
    if (!enabled || totalSec <= 0) return;
    const started = Date.now();
    const tick = () => {
      const left = Math.max(0, totalSec - Math.floor((Date.now() - started) / 1000));
      setRemain(left);
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current?.();
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [enabled, totalSec]);

  const urgent = totalSec > 0 && remain <= Math.min(60, Math.floor(totalSec * 0.1));

  return {
    remainSec: remain,
    label: formatRemain(remain),
    urgent,
    active: enabled && totalSec > 0,
  };
}

export function ChallengeTimerBadge({
  label,
  urgent,
  active,
}: {
  label: string;
  urgent: boolean;
  active: boolean;
}) {
  if (!active) return null;
  return (
    <span className={`ck-timer-badge${urgent ? " is-urgent" : ""}`} aria-live="polite">
      <Timer size={15} aria-hidden />
      {label}
    </span>
  );
}
