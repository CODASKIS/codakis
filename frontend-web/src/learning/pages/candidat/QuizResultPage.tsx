import { Link, useLocation, useNavigate, useParams } from "react-router";
import { Star, Trophy } from "lucide-react";
import type { SubmitQuizResult } from "../../../lib/pedagogyApi";

type LocationState = {
  result?: SubmitQuizResult;
  title?: string;
};

export default function QuizResultPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? {};
  const result = state.result;

  if (!result) {
    return (
      <div className="ck-result">
        <p className="ck-empty">Résultat indisponible.</p>
        <Link to={`/espace/candidat/quiz/${id}`} className="ck-btn ck-btn--primary ck-btn--block">
          Reprendre le quiz
        </Link>
      </div>
    );
  }

  return (
    <div className="ck-result">
      <div className={`ck-result__badge${result.reussi ? "" : " is-fail"}`} aria-hidden>
        {result.reussi ? <Trophy size={56} /> : "%"}
      </div>
      <h1 className="ck-title">{result.reussi ? "Quiz réussi !" : "Presque…"}</h1>
      <div className={`ck-result__score${result.reussi ? "" : " is-fail"}`}>{result.score}%</div>
      <p className="ck-subtitle">
        {result.nb_correctes}/{result.nb_total} réponses correctes
        {state.title ? ` · ${state.title}` : ""}
      </p>
      {result.points_earned ? (
        <div className="ck-result__points">
          <Star size={20} /> +{result.points_earned} points
        </div>
      ) : (
        <div style={{ height: "1.6rem" }} />
      )}
      <button type="button" className="ck-btn ck-btn--primary ck-btn--block" onClick={() => navigate("/espace/candidat")}>
        Continuer
      </button>
      {!result.reussi ? (
        <Link to={`/espace/candidat/quiz/${id}`} className="ck-btn ck-btn--ghost ck-btn--block" style={{ marginTop: "1rem" }}>
          Réessayer
        </Link>
      ) : null}
    </div>
  );
}
