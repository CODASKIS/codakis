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

  const failed = !result.reussi;

  return (
    <div className={`ck-result${failed ? " is-fail" : ""}`}>
      <div className={`ck-result__badge${failed ? " is-fail" : ""}`} aria-hidden>
        {result.reussi ? <Trophy size={56} /> : "%"}
      </div>
      <h1 className="ck-title">{result.reussi ? "Quiz réussi !" : "Quiz non réussi"}</h1>
      <div className={`ck-result__score${failed ? " is-fail" : ""}`}>{result.score}%</div>
      <p className="ck-subtitle">
        {result.nb_correctes}/{result.nb_total} réponses correctes
        {state.title ? ` · ${state.title}` : ""}
      </p>
      {failed ? (
        <p className="ck-result__fail-hint">Reprenez le quiz pour débloquer la suite du parcours.</p>
      ) : null}
      {result.points_earned ? (
        <div className="ck-result__points">
          <Star size={20} /> +{result.points_earned} points
        </div>
      ) : (
        <div style={{ height: "1.6rem" }} />
      )}
      {failed ? (
        <>
          <Link to={`/espace/candidat/quiz/${id}`} className="ck-btn ck-btn--danger ck-btn--block">
            Réessayer
          </Link>
          <button
            type="button"
            className="ck-btn ck-btn--ghost ck-btn--block"
            style={{ marginTop: "1rem" }}
            onClick={() => navigate("/espace/candidat")}
          >
            Retour au parcours
          </button>
        </>
      ) : (
        <button type="button" className="ck-btn ck-btn--primary ck-btn--block" onClick={() => navigate("/espace/candidat")}>
          Continuer
        </button>
      )}
    </div>
  );
}
