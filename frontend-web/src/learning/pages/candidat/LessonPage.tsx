import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ChevronLeft } from "lucide-react";
import Loader from "../../../components/common/Loader";
import {
  completeCandidatLecon,
  fetchCandidatCoursePath,
  fetchCandidatLecon,
  type PedagogyLecon,
} from "../../../lib/pedagogyApi";

export default function LessonPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [lecon, setLecon] = useState<PedagogyLecon | null>(null);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const lesson = await fetchCandidatLecon(id);
        if (cancelled) return;
        setLecon(lesson);
        const path = await fetchCandidatCoursePath(lesson.theme_id);
        if (cancelled) return;
        const idx = path.steps.findIndex((s) => s.type === "lecon" && s.id === id);
        const nextQuiz = path.steps.slice(idx + 1).find((s) => s.type === "quiz");
        setQuizId(nextQuiz?.id ?? null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Leçon introuvable");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleCompleteAndQuiz() {
    if (!lecon) return;
    setSaving(true);
    try {
      await completeCandidatLecon(lecon.id);
      if (quizId) navigate(`/espace/candidat/quiz/${quizId}`);
      else navigate("/espace/candidat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de valider la leçon");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader variant="page" />;
  if (!lecon) return <p className="ck-empty">{error || "Leçon introuvable"}</p>;

  return (
    <div className="ck-challenge">
      <article className="ck-challenge__body" style={{ justifyContent: "flex-start" }}>
        <Link to="/espace/candidat" className="ck-back">
          <ChevronLeft size={18} /> Retour
        </Link>
        <h1 className="ck-title">{lecon.title}</h1>
        <p className="ck-subtitle">
          Module {lecon.theme_code} · Leçon {lecon.sort_order}
        </p>
        {lecon.cover_image_url ? <img src={lecon.cover_image_url} alt="" className="ck-lesson__cover" /> : null}
        <div className="ck-lesson__body" dangerouslySetInnerHTML={{ __html: lecon.body || lecon.excerpt || "" }} />
        {error ? <p className="ck-empty">{error}</p> : null}
      </article>

      <footer className="ck-challenge__footer is-ready">
        <div className="ck-challenge__footer-inner">
          <div>
            <strong style={{ fontSize: "1.6rem" }}>Prêt pour le test ?</strong>
            <p className="ck-subtitle" style={{ margin: "0.4rem 0 0" }}>
              {quizId ? "Validez la leçon puis lancez le quiz." : "Marquez la leçon comme lue."}
            </p>
          </div>
          <button type="button" className="ck-btn ck-btn--primary" disabled={saving} onClick={() => void handleCompleteAndQuiz()}>
            {saving ? "Validation…" : quizId ? "Commencer" : "Terminer"}
          </button>
        </div>
      </footer>
    </div>
  );
}
