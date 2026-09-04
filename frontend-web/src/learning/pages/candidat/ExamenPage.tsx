import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { X } from "lucide-react";
import Loader from "../../../components/common/Loader";
import {
  fetchCandidatExamenTake,
  submitCandidatExamen,
  type TakeQuestion,
} from "../../../lib/pedagogyApi";

export default function ExamenPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<TakeQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [started] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    void fetchCandidatExamenTake(id)
      .then((exam) => {
        if (cancelled) return;
        setTitle(exam.title);
        setQuestions(exam.questions);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Examen indisponible");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const current = questions[index];
  const selected = current ? answers[current.id] : undefined;
  const progress = questions.length ? ((index + (selected ? 1 : 0)) / questions.length) * 100 : 0;

  async function finish() {
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([question_id, reponse_id]) => ({ question_id, reponse_id }));
      const result = await submitCandidatExamen(id, payload, Math.round((Date.now() - started) / 1000));
      navigate(`/espace/candidat/quiz/${id}/resultat`, {
        replace: true,
        state: {
          result: {
            score: result.score,
            nb_correctes: result.nb_total - result.nb_erreurs,
            nb_total: result.nb_total,
            reussi: result.reussi,
            details: result.details,
            points_earned: result.points_earned,
          },
          title,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi impossible");
      setSubmitting(false);
    }
  }

  if (loading) return <Loader variant="page" />;
  if (!current) return <p className="ck-empty">{error || "Aucune question"}</p>;

  return (
    <div className="ck-challenge">
      <div className="ck-challenge__top">
        <Link to="/espace/candidat/tests" className="ck-back" style={{ marginBottom: 0 }} aria-label="Fermer">
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
              className={`ck-quiz__option${selected === r.id ? " is-selected" : ""}`}
              onClick={() => setAnswers((prev) => ({ ...prev, [current.id]: r.id }))}
            >
              <span className="ck-quiz__label">{r.label || String(i + 1)}</span>
              <span style={{ flex: 1 }}>{r.texte}</span>
            </button>
          ))}
        </div>
        {error ? <p className="ck-empty">{error}</p> : null}
      </div>

      <footer className={`ck-challenge__footer${selected ? " is-ready" : ""}`}>
        <div className="ck-challenge__footer-inner">
          <button type="button" className="ck-btn ck-btn--ghost" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
            Précédent
          </button>
          {index < questions.length - 1 ? (
            <button type="button" className="ck-btn ck-btn--primary" disabled={!selected} onClick={() => setIndex((i) => i + 1)}>
              Continuer
            </button>
          ) : (
            <button type="button" className="ck-btn ck-btn--primary" disabled={!selected || submitting} onClick={() => void finish()}>
              {submitting ? "Envoi…" : "Terminer"}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
