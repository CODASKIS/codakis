import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createAdminQuiz,
  deleteAdminQuiz,
  fetchAdminQuestions,
  fetchAdminQuiz,
  fetchAdminThemes,
  updateAdminQuiz,
  type PedagogyQuestion,
  type PedagogyQuiz,
  type PedagogyTheme,
} from "../../../../lib/pedagogyApi";
import Button from "../../../ui/Button";
import Input from "../../../ui/Input";
import { Modal } from "../../../ui/Modal";

type Props = {
  open: boolean;
  quiz: PedagogyQuiz | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function QuizEditorModal({ open, quiz, onClose, onSaved }: Props) {
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    void Promise.all([
      fetchAdminThemes(),
      fetchAdminQuestions(),
      quiz ? fetchAdminQuiz(quiz.id) : Promise.resolve(null),
    ])
      .then(([themesData, questionsData, fullQuiz]) => {
        setThemes(themesData);
        setQuestions(questionsData);
        const source = fullQuiz ?? quiz;
        if (source) {
          setThemeId(source.theme_id);
          setTitle(source.title);
          setDescription(source.description || "");
          setDuree(String(source.duree_minutes));
          setSortOrder(String(source.sort_order));
          setEstActif(source.est_actif);
          setInCoursePath(source.in_course_path);
          setQuestionIds(source.question_ids ?? []);
        } else {
          setThemeId(themesData[0]?.id || "");
          setTitle("");
          setDescription("");
          setDuree("20");
          setSortOrder("0");
          setEstActif(true);
          setInCoursePath(false);
          setQuestionIds([]);
        }
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Chargement impossible"));
  }, [open, quiz]);

  const filtered = useMemo(() => {
    const selected = new Set(questionIds.map(String));
    const sameTheme = themeId
      ? questions.filter((q) => q.theme_id != null && String(q.theme_id) === String(themeId))
      : questions;
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

  function toggleQuestion(id: string) {
    setQuestionIds((list) =>
      list.some((x) => String(x) === String(id))
        ? list.filter((x) => String(x) !== String(id))
        : [...list, id],
    );
  }

  async function onSubmit(e: FormEvent) {
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
      if (quiz) await updateAdminQuiz(quiz.id, payload);
      else await createAdminQuiz(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!quiz) return;
    setSaving(true);
    try {
      await deleteAdminQuiz(quiz.id);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={open} onClose={() => !saving && onClose()} className="max-w-3xl p-6 sm:p-8">
      <h3 className="ck-title" style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        {quiz ? "Modifier le quiz" : "Nouveau quiz"}
      </h3>
      <form className="ck-form ck-schools-profile__form space-y-3" onSubmit={(e) => void onSubmit(e)}>
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
        <div className="ck-schools-profile__grid">
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
          <Button type="submit" disabled={saving}>
            {saving ? "…" : "Enregistrer"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          {quiz ? (
            <Button type="button" variant="danger" disabled={saving} onClick={() => void onDelete()}>
              Supprimer
            </Button>
          ) : null}
        </div>
      </form>
    </Modal>
  );
}
