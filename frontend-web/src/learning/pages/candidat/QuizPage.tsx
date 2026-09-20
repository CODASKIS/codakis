import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { CheckCircle, Volume2, VolumeX, X, XCircle } from "lucide-react";
import Loader from "../../../components/common/Loader";
import MediaVideo from "../../../components/common/MediaVideo";
import SpeakButton from "../../../components/prefs/SpeakButton";
import SpeakPrompt from "../../../components/prefs/SpeakPrompt";
import { ChallengeTimerBadge, useChallengeTimer } from "../../components/ChallengeTimer";
import {
  fetchCandidatQuizTake,
  submitCandidatQuiz,
  validateCandidatCheckpoint,
  type TakeQuestion,
} from "../../../lib/pedagogyApi";
import {
  isSpeakingEnabled,
  setUserPreferences,
  subscribeUserPreferences,
} from "../../../lib/userPreferences";
import { stopSpeaking, buildQuizSpeakText } from "../../../lib/speak";

type CheckResult = {
  est_correcte: boolean;
  correct_reponse_id: string | null;
  explanation: string | null;
};

export default function QuizPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [dureeMinutes, setDureeMinutes] = useState(0);
  const [questions, setQuestions] = useState<TakeQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<"none" | "checked">("none");
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const startedAt = useMemo(() => Date.now(), [id]);
  const submittingRef = useRef(false);

  // ── état TTS synchronisé avec les préférences utilisateur ──────────────────
  const [voiceOn, setVoiceOn] = useState<boolean>(() => isSpeakingEnabled());

  useEffect(() => {
    return subscribeUserPreferences((prefs) => setVoiceOn(prefs.speakingEnabled));
  }, []);

  function toggleVoice() {
    const next = !voiceOn;
    if (!next) stopSpeaking();
    setUserPreferences({ speakingEnabled: next });
    // setVoiceOn mis à jour via subscribeUserPreferences
  }

  useEffect(() => {
    let cancelled = false;
    void fetchCandidatQuizTake(id)
      .then((quiz) => {
        if (cancelled) return;
        setTitle(quiz.title);
        setDureeMinutes(quiz.duree_minutes || 0);
        setQuestions(quiz.questions);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Quiz indisponible");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      stopSpeaking();
    };
  }, [id]);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  function closeQuiz() {
    stopSpeaking();
  }

  const current = questions[index];
  const progress = questions.length ? ((index + (status === "checked" ? 1 : 0)) / questions.length) * 100 : 0;

  function choose(reponseId: string) {
    if (!current || status === "checked" || checking) return;
    setSelected(reponseId);
  }

  async function onCheck() {
    if (!current || !selected || status === "checked" || checking) return;
    setChecking(true);
    setError("");
    try {
      const result = await validateCandidatCheckpoint(current.id, selected);
      setAnswers((prev) => ({ ...prev, [current.id]: selected }));
      setCheckResult(result);
      setStatus("checked");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vérification impossible");
    } finally {
      setChecking(false);
    }
  }

  async function goNext() {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      setSelected(null);
      setStatus("none");
      setCheckResult(null);
      return;
    }
    await finishQuiz(false);
  }

  const finishQuiz = useCallback(
    async (timedOut: boolean) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setSubmitting(true);
      try {
        const merged = current && selected ? { ...answers, [current.id]: selected } : answers;
        const payload = Object.entries(merged).map(([question_id, reponse_id]) => ({ question_id, reponse_id }));
        const result = await submitCandidatQuiz(id, payload, Math.round((Date.now() - startedAt) / 1000));
        stopSpeaking();
        navigate(`/espace/candidat/quiz/${id}/resultat`, {
          state: { result, title: timedOut ? `${title} (temps écoulé)` : title },
          replace: true,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Envoi impossible");
        submittingRef.current = false;
        setSubmitting(false);
      }
    },
    [answers, current, id, navigate, selected, startedAt, title],
  );

  const timer = useChallengeTimer({
    dureeMinutes,
    enabled: !loading && questions.length > 0 && !submitting,
    onExpire: () => void finishQuiz(true),
  });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Enter") return;
      if (status === "none" && selected && !checking) void onCheck();
      else if (status === "checked" && !submitting) void goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (loading) return <Loader variant="page" />;
  if (!current) return <p className="ck-empty">{error || "Aucune question"}</p>;

  const isOk = status === "checked" && Boolean(checkResult?.est_correcte);
  const isBad = status === "checked" && checkResult != null && !checkResult.est_correcte;
  const footerMod = isOk ? "is-ok" : isBad ? "is-bad" : selected ? "is-ready" : "";

  function optionClass(reponseId: string): string {
    const classes = ["ck-quiz__option"];
    if (selected === reponseId && status === "none") classes.push("is-selected");
    if (status !== "checked" || !checkResult) return classes.join(" ");
    if (checkResult.est_correcte) {
      if (reponseId === selected) classes.push("is-correct");
      return classes.join(" ");
    }
    if (reponseId === selected) classes.push("is-wrong");
    if (reponseId === checkResult.correct_reponse_id) classes.push("is-correct");
    return classes.join(" ");
  }

  return (
    <div className="ck-challenge">
      <div className="ck-challenge__top">
        <Link
          to="/espace/candidat"
          className="ck-back"
          style={{ marginBottom: 0 }}
          aria-label="Fermer"
          onClick={closeQuiz}
        >
          <X size={22} />
        </Link>
        <div className="ck-quiz__progress" aria-hidden>
          <span style={{ width: `${progress}%` }} />
        </div>
        <ChallengeTimerBadge label={timer.label} urgent={timer.urgent} active={timer.active} />
        {/* Toggle voix — toujours visible, même si la voix est désactivée */}
        <button
          type="button"
          className={`ck-quiz__voice-toggle${voiceOn ? " is-on" : " is-off"}`}
          onClick={toggleVoice}
          aria-label={voiceOn ? "Désactiver la voix" : "Activer la voix"}
          title={voiceOn ? "Voix activée — cliquer pour désactiver" : "Voix désactivée — cliquer pour activer"}
        >
          {voiceOn
            ? <Volume2 size={18} strokeWidth={2.5} aria-hidden />
            : <VolumeX size={18} strokeWidth={2.5} aria-hidden />}
        </button>
      </div>

      <div className="ck-challenge__body">
        <p className="ck-subtitle" style={{ marginBottom: "0.8rem" }}>
          {title} · {index + 1}/{questions.length}
        </p>
        {current.video_url ? (
          <MediaVideo url={current.video_url} title={current.prompt} className="ck-challenge__media" />
        ) : current.image_url ? (
          <img src={current.image_url} alt="" className="ck-lesson__cover" />
        ) : null}
        <SpeakPrompt
          key={current.id}
          text={current.prompt}
          speakText={buildQuizSpeakText(current.prompt, current.reponses)}
          autoPlay
        />
        <div className="ck-quiz__options" role="radiogroup">
          {current.reponses.map((r, i) => (
            <div key={r.id} className="ck-quiz__option-row">
              <button
                type="button"
                role="radio"
                aria-checked={selected === r.id}
                className={optionClass(r.id)}
                onClick={() => choose(r.id)}
                disabled={status === "checked" || checking}
              >
                <span className="ck-quiz__label">{r.label || String(i + 1)}</span>
                <span style={{ flex: 1 }}>{r.texte}</span>
              </button>
              <SpeakButton
                text={`Option ${r.label || String.fromCharCode(65 + i)}. ${r.texte}`}
                size="sm"
                className="ck-speak-btn--option"
              />
            </div>
          ))}
        </div>
        {isBad && checkResult?.explanation ? (
          <div className="ck-feedback is-wrong" style={{ marginTop: "1.2rem", display: "flex", gap: "0.8rem", alignItems: "flex-start" }}>
            <SpeakButton key={`expl-${current.id}`} text={checkResult.explanation} size="sm" autoPlay />
            <p style={{ margin: 0 }}>{checkResult.explanation}</p>
          </div>
        ) : null}
        {error ? <p className="ck-empty">{error}</p> : null}
      </div>

      <footer className={`ck-challenge__footer ${footerMod}`}>
        <div className="ck-challenge__footer-inner">
          {isOk ? (
            <div className="ck-challenge__status is-ok">
              <CheckCircle size={36} />
              Bien joué !
            </div>
          ) : isBad ? (
            <div className="ck-challenge__status is-bad">
              <XCircle size={36} />
              Incorrect
            </div>
          ) : (
            <span />
          )}
          {status === "none" ? (
            <button
              type="button"
              className="ck-btn ck-btn--primary"
              disabled={!selected || checking}
              onClick={() => void onCheck()}
            >
              {checking ? "Vérification…" : "Vérifier"}
            </button>
          ) : (
            <button
              type="button"
              className={`ck-btn ${isBad ? "ck-btn--danger" : "ck-btn--primary"}`}
              disabled={submitting}
              onClick={() => void goNext()}
            >
              {index < questions.length - 1 ? "Continuer" : submitting ? "Envoi…" : "Résultat"}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
