import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Volume2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthApiError, synthesizeCandidatSpeech } from "../../../lib/pedagogyApi";

type ListenButtonProps = {
  text: string;
  className?: string;
  /** Relance l'audio quand le contenu change (ex. question suivante). */
  resetKey?: string;
};

export default function ListenButton({ text, className = "", resetKey = "" }: ListenButtonProps) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPlaying(false);
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  useEffect(() => {
    cleanup();
    setError("");
  }, [resetKey, text, cleanup]);

  async function handleToggle() {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }

    const plain = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!plain) return;

    setError("");
    setLoading(true);
    try {
      cleanup();
      const blob = await synthesizeCandidatSpeech(plain, i18n.language);
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setPlaying(false);
      audio.onpause = () => setPlaying(false);
      audio.onplay = () => setPlaying(true);
      await audio.play();
      setPlaying(true);
    } catch (err) {
      const message =
        err instanceof AuthApiError
          ? err.message
          : t("coursePlayer.listenUnavailable");
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`codakis-listen${className ? ` ${className}` : ""}`}>
      <button
        type="button"
        className="codakis-listen__btn"
        onClick={() => void handleToggle()}
        disabled={loading || !text.trim()}
        aria-pressed={playing}
      >
        {loading ? (
          <img
            src="/images/logo-simple.png"
            alt=""
            width={16}
            height={16}
            className="codakis-listen__spin"
            aria-hidden
          />
        ) : playing ? (
          <Pause size={16} aria-hidden />
        ) : (
          <Volume2 size={16} aria-hidden />
        )}
        {loading
          ? t("coursePlayer.listenLoading")
          : playing
            ? t("coursePlayer.listenPause")
            : t("coursePlayer.listen")}
      </button>
      {error ? <p className="codakis-listen__error">{error}</p> : null}
    </div>
  );
}
