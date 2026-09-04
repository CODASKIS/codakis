import { useCallback, useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { isSpeakingEnabled } from "../../lib/userPreferences";
import { speakText, stopSpeaking } from "../../lib/speak";

type Props = {
  text: string;
  language?: string;
  className?: string;
  /** Lecture auto à l’arrivée sur la question. */
  autoPlay?: boolean;
  size?: "sm" | "md" | "lg";
};

/** Bouton haut-parleur style Duo — lit le texte via ElevenLabs au clic. */
export default function SpeakButton({ text, language, className = "", autoPlay = false, size = "md" }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const enabled = isSpeakingEnabled();

  const play = useCallback(async () => {
    const cleaned = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!cleaned || !isSpeakingEnabled()) return;
    setBusy(true);
    setError(false);
    try {
      await speakText(cleaned, language);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }, [text, language]);

  useEffect(() => {
    if (!autoPlay || !enabled) return;
    void play();
    return () => stopSpeaking();
  }, [autoPlay, enabled, text, play]);

  if (!enabled) return null;

  return (
    <button
      type="button"
      className={`ck-speak-btn ck-speak-btn--${size}${busy ? " is-busy" : ""}${error ? " is-error" : ""} ${className}`.trim()}
      aria-label={busy ? "Lecture en cours" : "Écouter"}
      title={error ? "Lecture indisponible" : "Écouter"}
      disabled={busy || !text.trim()}
      onClick={() => void play()}
    >
      <Volume2 size={size === "lg" ? 28 : size === "sm" ? 18 : 22} strokeWidth={2.5} aria-hidden />
    </button>
  );
}
