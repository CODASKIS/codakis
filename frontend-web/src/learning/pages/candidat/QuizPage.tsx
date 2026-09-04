import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { CheckCircle, X, XCircle } from "lucide-react";
import Loader from "../../../components/common/Loader";
import MediaVideo from "../../../components/common/MediaVideo";
import SpeakPrompt from "../../../components/prefs/SpeakPrompt";
import {
  fetchCandidatQuizTake,
  submitCandidatQuiz,
  validateCandidatCheckpoint,
  type TakeQuestion,
} from "../../../lib/pedagogyApi";

type CheckResult = {
  est_correcte: boolean;
  correct_reponse_id: string | null;
  explanation: string | null;
};

export default function QuizPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
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

  useEffect(() => {
    let cancelled = false;
    void fetchCandidatQuizTake(id)
      .then((quiz) => {
        if (cancelled) return;
        setTitle(quiz.title);
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
    };
  }, [id]);

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
    setSubmitting(true);
    try {
      const merged = current && selected ? { ...answers, [current.id]: selected } : answers;
      const payload = Object.entries(merged).map(([question_id, reponse_id]) => ({ question_id, reponse_id }));
      const result = await submitCandidatQuiz(id, payload, Math.round((Date.now() - startedAt) / 1000));
      navigate(`/espace/candidat/quiz/${id}/resultat`, { state: { result, title }, replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi impossible");
      setSubmitting(false);
    }
  }

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
        <Link to="/espace/candidat" className="ck-back" style={{ marginBottom: 0 }} aria-label="Fermer">
          <X size={22} />
        </Link>
        <div className="ck-quiz__progress" aria-hidden>
          <span style={{ width: `${progress}%` }} />
        </div>
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
        <SpeakPrompt key={current.id} text={current.prompt} autoPlay />
        <div className="ck-quiz__options" role="radiogroup">
          {current.reponses.map((r, i) => (
            <button
              key={r.id}
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
          ))}
        </div>
        {isBad && checkResult?.explanation ? (
          <p className="ck-feedback is-wrong" style={{ marginTop: "1.2rem" }}>
            {checkResult.explanation}
          </p>
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
