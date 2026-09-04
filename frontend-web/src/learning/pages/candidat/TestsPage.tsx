import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Ban, Clock, Hexagon, Shuffle, Star, Undo2, X, XCircle } from "lucide-react";
import Loader from "../../../components/common/Loader";
import {
  fetchCandidatExamens,
  fetchCandidatQuizList,
  type PedagogyExamen,
  type PedagogyQuiz,
} from "../../../lib/pedagogyApi";

const TRAIN_COLORS = ["#00a859", "#8b5cf6", "#64748b", "#0ea5e9", "#f59e0b", "#14b8a6"];

export default function TestsPage() {
  const [quizzes, setQuizzes] = useState<PedagogyQuiz[]>([]);
  const [examens, setExamens] = useState<PedagogyExamen[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchCandidatQuizList(), fetchCandidatExamens()])
      .then(([q, e]) => {
        if (cancelled) return;
        setQuizzes(q);
        setExamens(e);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Chargement impossible");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Loader variant="page" />;

  return (
    <div className="ck-card">
      <h1 className="ck-title">Tests supplémentaires</h1>
      <p className="ck-subtitle">Mode entraînement et examens blancs.</p>
      {error ? <p className="ck-empty">{error}</p> : null}

      <h2 className="ck-stats-block__title">Mode entraînement</h2>
      <div className="ck-list" style={{ marginBottom: "2.4rem" }}>
        <button type="button" className="ck-list__row" onClick={() => setAlertMsg("Vous n'avez pas encore de questions mal répondues.")}>
          <span className="ck-list__icon ck-list__icon--solid" style={{ background: "#ef4444" }}>
            <XCircle size={20} color="#fff" />
          </span>
          <span style={{ flex: 1 }}>
            <strong>Mal répondu</strong>
            <small>Revoir vos erreurs</small>
          </span>
        </button>
        <button type="button" className="ck-list__row" onClick={() => setAlertMsg("Vous n'avez pas de questions préférées")}>
          <span className="ck-list__icon ck-list__icon--solid" style={{ background: "#f59e0b" }}>
            <Star size={20} color="#fff" />
          </span>
          <span style={{ flex: 1 }}>
            <strong>Questions enregistrées</strong>
            <small>Vos favoris</small>
          </span>
        </button>
        {quizzes.slice(0, 6).map((quiz, i) => {
          const color = TRAIN_COLORS[i % TRAIN_COLORS.length];
          const Icon = i % 3 === 0 ? Shuffle : i % 3 === 1 ? Undo2 : Ban;
          return (
            <Link key={quiz.id} to={`/espace/candidat/quiz/${quiz.id}`} className="ck-list__row">
              <span className="ck-list__icon ck-list__icon--solid" style={{ background: color }}>
                <Icon size={20} color="#fff" />
              </span>
              <span style={{ flex: 1 }}>
                <strong>{quiz.title}</strong>
                <small>
                  {quiz.question_count || quiz.linked_count} questions · {quiz.duree_minutes} min
                </small>
              </span>
            </Link>
          );
        })}
      </div>

      <h2 className="ck-stats-block__title">Mode examen</h2>
      <div className="ck-list">
        {examens.map((exam, i) => (
          <Link key={exam.id} to={`/espace/candidat/examen/${exam.id}`} className="ck-list__row">
            <span className="ck-list__icon ck-list__icon--solid" style={{ background: i % 2 === 0 ? "#2563eb" : "#00a859" }}>
              {i % 2 === 0 ? <Clock size={20} color="#fff" /> : <Hexagon size={20} color="#fff" />}
            </span>
            <span style={{ flex: 1 }}>
              <strong>{exam.title}</strong>
              <small>
                {exam.nb_questions || exam.linked_count} questions · max {exam.max_erreurs} erreurs
              </small>
            </span>
          </Link>
        ))}
        {!examens.length ? <p className="ck-empty">Aucun examen disponible.</p> : null}
      </div>

      {alertMsg ? (
        <div className="ck-paywall" role="dialog" aria-modal="true" aria-labelledby="ck-alert-title">
          <div className="ck-paywall__card">
            <button type="button" className="ck-paywall__close" onClick={() => setAlertMsg(null)} aria-label="Fermer">
              <X size={20} />
            </button>
            <h2 id="ck-alert-title" style={{ fontWeight: 800, fontSize: "2.2rem", marginTop: "0.8rem" }}>
              Attention!
            </h2>
            <p className="ck-subtitle" style={{ marginBottom: "2rem" }}>
              {alertMsg}
            </p>
            <button type="button" className="ck-btn ck-btn--primary ck-btn--block ck-btn--pill" onClick={() => setAlertMsg(null)}>
              Confirmez
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
