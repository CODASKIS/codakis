import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Save, Trash2 } from "lucide-react";
import Loader from "../../../components/common/Loader";
import {
  createAdminQuiz,
  deleteAdminQuiz,
  fetchAdminQuestions,
  fetchAdminQuiz,
  fetchAdminThemes,
  updateAdminQuiz,
  type PedagogyQuestion,
  type PedagogyTheme,
} from "../../../lib/pedagogyApi";
import PageBack from "../../common/PageBack";
import ComponentCard from "../../common/ComponentCard";
import Button from "../../ui/Button";
import Input from "../../ui/Input";

export default function AdminQuizForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const [themes, setThemes] = useState<PedagogyTheme[]>([]);
  const [questions, setQuestions] = useState<PedagogyQuestion[]>([]);
  const [themeId, setThemeId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duree, setDuree] = useState("20");
  const [sortOrder, setSortOrder] = useState("0");
  const [estActif, setEstActif] = useState(true);
  const [inCoursePath, setInCoursePath] = useState(false);
  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [themesData, questionsData, fullQuiz] = await Promise.all([
          fetchAdminThemes(),
          fetchAdminQuestions(),
          isNew ? Promise.resolve(null) : fetchAdminQuiz(id),
        ]);
        if (cancelled) return;
        setThemes(themesData);
        setQuestions(questionsData);
        if (fullQuiz) {
          setThemeId(fullQuiz.theme_id);
          setTitle(fullQuiz.title);
          setDescription(fullQuiz.description || "");
          setDuree(String(fullQuiz.duree_minutes));
          setSortOrder(String(fullQuiz.sort_order));
          setEstActif(fullQuiz.est_actif);
          setInCoursePath(fullQuiz.in_course_path);
          setQuestionIds(fullQuiz.question_ids ?? []);
        } else {
          setThemeId(themesData[0]?.id || "");
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Chargement impossible");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isNew]);

  const filtered = useMemo(() => {
    const selected = new Set(questionIds.map(String));
    const sameTheme = themeId
      ? questions.filter((q) => q.theme_id != null && String(q.theme_id) === String(themeId))
      : questions;
    // Pas de questions pour ce thème → toute la banque (pas seulement les déjà cochées)
    const pool =
      themeId && sameTheme.length === 0
        ? questions
        : [
            ...sameTheme,
            ...questions.filter(
              (q) => selected.has(String(q.id)) && !sameTheme.some((item) => String(item.id) === String(q.id)),
            ),
          ];
    return [...pool].sort((a, b) => {
      const aSel = selected.has(String(a.id)) ? 0 : 1;
      const bSel = selected.has(String(b.id)) ? 0 : 1;
      if (aSel !== bSel) return aSel - bSel;
      return a.prompt.localeCompare(b.prompt, "fr");
    });
  }, [questions, themeId, questionIds]);

  const showingAllBank =
    Boolean(themeId) &&
    questions.length > 0 &&
    !questions.some((q) => q.theme_id != null && String(q.theme_id) === String(themeId));

  function toggleQuestion(qid: string) {
    setQuestionIds((list) =>
      list.some((id) => String(id) === String(qid))
        ? list.filter((x) => String(x) !== String(qid))
        : [...list, qid],
    );
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        theme_id: themeId,
        title: title.trim(),
        description: description.trim() || null,
        duree_minutes: Number(duree) || 20,
        sort_order: Number(sortOrder) || 0,
        est_actif: estActif,
        in_course_path: inCoursePath,
        question_ids: questionIds,
        question_count: questionIds.length,
      };
      if (isNew) await createAdminQuiz(payload);
      else await updateAdminQuiz(id, payload);
      navigate("/espace/admin/contenu");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (isNew || !window.confirm("Supprimer ce quiz ?")) return;
    setSaving(true);
    try {
      await deleteAdminQuiz(id);
      navigate("/espace/admin/contenu");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible");
      setSaving(false);
    }
  }

  if (loading) return <Loader variant="page" />;

  return (
    <div className="space-y-6">
      <div>
        <PageBack to="/espace/admin/contenu" label="Retour au contenu" />
        <h2 className="ck-title">{isNew ? "Nouveau quiz" : "Modifier le quiz"}</h2>
      </div>
      <ComponentCard title="Quiz">
        <form className="ck-form ck-schools-profile__form space-y-3" onSubmit={(e) => void onSave(e)}>
          <label>
            Thème
            <select
              value={themeId}
              onChange={(e) => {
                setThemeId(e.target.value);
                setQuestionIds([]);
              }}
              required
            >
              {themes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title_fr}
                </option>
              ))}
            </select>
          </label>
          <Input label="Titre" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <label>
            Description
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input label="Durée (min)" type="number" min={1} value={duree} onChange={(e) => setDuree(e.target.value)} />
            <Input label="Ordre" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </div>
          <label className="ta-check-row">
            <input type="checkbox" checked={estActif} onChange={(e) => setEstActif(e.target.checked)} />
            Quiz actif
          </label>
          <label className="ta-check-row">
            <input type="checkbox" checked={inCoursePath} onChange={(e) => setInCoursePath(e.target.checked)} />
            Inclure dans le parcours
          </label>
          <div>
            <h4 className="ck-schools-detail__section">Questions ({questionIds.length})</h4>
            {showingAllBank ? (
              <p className="ck-empty" style={{ marginBottom: "0.8rem", textAlign: "left" }}>
                Aucune question rattachée à ce thème — {filtered.length} question(s) de la banque affichée(s) pour
                sélection.
              </p>
            ) : null}
            <div className="ck-schools-table-wrap" style={{ maxHeight: "28rem", overflow: "auto" }}>
              {filtered.map((q) => (
                <label
                  key={q.id}
                  className="ta-check-row"
                  style={{ padding: "0.8rem 0", borderBottom: "0.1rem solid #f2f4f7", width: "100%", alignItems: "flex-start" }}
                >
                  <input
                    type="checkbox"
                    checked={questionIds.some((id) => String(id) === String(q.id))}
                    onChange={() => toggleQuestion(q.id)}
                  />
                  <span style={{ fontSize: "1.4rem", fontWeight: 700 }}>
                    {q.prompt}
                    {q.theme_code ? (
                      <span style={{ display: "block", marginTop: "0.2rem", fontSize: "1.2rem", fontWeight: 600, color: "#667085" }}>
                        {q.theme_code}
                      </span>
                    ) : null}
                  </span>
                </label>
              ))}
              {!filtered.length ? <p className="ck-empty">Aucune question disponible.</p> : null}
            </div>
          </div>
          {error ? <p className="ck-empty">{error}</p> : null}
          <div className="ck-schools-profile__actions flex-wrap">
            <Button type="submit" disabled={saving} startIcon={<Save size={16} strokeWidth={2.5} />}>
              {saving ? "…" : "Enregistrer"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate("/espace/admin/contenu")}>
              Annuler
            </Button>
            {!isNew ? (
              <Button
                type="button"
                variant="danger"
                disabled={saving}
                startIcon={<Trash2 size={16} strokeWidth={2.5} />}
                onClick={() => void onDelete()}
              >
                Supprimer
              </Button>
            ) : null}
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}
