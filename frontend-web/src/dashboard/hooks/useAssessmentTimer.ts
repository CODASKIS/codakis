import { useEffect, useState } from "react";

export function formatAssessmentTime(seconds: number | null): string {
  if (seconds == null || seconds < 0) return "--:--";
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

/** Compte à rebours pour quiz / examen. Retourne isExpired quand le temps est écoulé. */
export function useAssessmentTimer(durationMinutes: number | null, enabled: boolean) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled || durationMinutes == null) {
      setSecondsLeft(null);
      return;
    }
    setSecondsLeft(durationMinutes * 60);
  }, [durationMinutes, enabled]);

  useEffect(() => {
    if (!enabled || secondsLeft == null || secondsLeft <= 0) return undefined;
    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => (current == null ? current : current - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [enabled, secondsLeft]);

  return {
    secondsLeft,
    isExpired: enabled && secondsLeft === 0,
    formatted: formatAssessmentTime(secondsLeft),
    isLow: secondsLeft != null && secondsLeft > 0 && secondsLeft <= 60,
  };
}
