import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { CheckCircle, X } from "lucide-react";
import Loader from "../../../components/common/Loader";
import {
  fetchCandidatQuizTake,
  submitCandidatQuiz,
  type TakeQuestion,
} from "../../../lib/pedagogyApi";

export default function QuizPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<TakeQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<"none" | "checked">("none");
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
    if (!current || status === "checked") return;
    setSelected(reponseId);
  }

  function onCheck() {
    if (!current || !selected || status === "checked") return;
    setAnswers((prev) => ({ ...prev, [current.id]: selected }));
    setStatus("checked");
  }

  async function goNext() {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      setSelected(null);
      setStatus("none");
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
      if (status === "none" && selected) onCheck();
      else if (status === "checked" && !submitting) void goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (loading) return <Loader variant="page" />;
  if (!current) return <p className="ck-empty">{error || "Aucune question"}</p>;

  const footerMod = status === "checked" ? "is-ok" : selected ? "is-ready" : "";

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
        {current.image_url ? <img src={current.image_url} alt="" className="ck-lesson__cover" /> : null}
        <h1 className="ck-title" style={{ fontSize: "2.2rem", marginBottom: "2rem" }}>
          {current.prompt}
        </h1>
        <div className="ck-quiz__options" role="radiogroup">
          {current.reponses.map((r, i) => (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={selected === r.id}
              className={`ck-quiz__option${selected === r.id ? " is-selected" : ""}${status === "checked" && selected === r.id ? " is-correct" : ""}`}
              onClick={() => choose(r.id)}
              disabled={status === "checked"}
            >
              <span className="ck-quiz__label">{r.label || String(i + 1)}</span>
              <span style={{ flex: 1 }}>{r.texte}</span>
            </button>
          ))}
        </div>
        {error ? <p className="ck-empty">{error}</p> : null}
      </div>

      <footer className={`ck-challenge__footer ${footerMod}`}>
        <div className="ck-challenge__footer-inner">
          {status === "checked" ? (
            <div className="ck-challenge__status is-ok">
              <CheckCircle size={36} />
              Bien joué !
            </div>
          ) : (
            <span />
          )}
          {status === "none" ? (
            <button type="button" className="ck-btn ck-btn--primary" disabled={!selected} onClick={onCheck}>
              Vérifier
            </button>
          ) : (
            <button type="button" className="ck-btn ck-btn--primary" disabled={submitting} onClick={() => void goNext()}>
              {index < questions.length - 1 ? "Continuer" : submitting ? "Envoi…" : "Résultat"}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
