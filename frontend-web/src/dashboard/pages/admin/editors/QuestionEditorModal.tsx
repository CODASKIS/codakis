import { FormEvent, useEffect, useState } from "react";
import {
  createAdminQuestion,
  deleteAdminQuestion,
  fetchAdminThemes,
  updateAdminQuestion,
  type PedagogyQuestion,
  type PedagogyTheme,
} from "../../../../lib/pedagogyApi";
import Button from "../../../ui/Button";
import Input from "../../../ui/Input";
import { Modal } from "../../../ui/Modal";

type Answer = { label: string; texte: string; est_correcte: boolean };

type Props = {
  open: boolean;
  question: PedagogyQuestion | null;
  onClose: () => void;
  onSaved: () => void;
};

const emptyAnswers = (): Answer[] => [
  { label: "A", texte: "", est_correcte: true },
  { label: "B", texte: "", est_correcte: false },
  { label: "C", texte: "", est_correcte: false },
  { label: "D", texte: "", est_correcte: false },
];

export default function QuestionEditorModal({ open, question, onClose, onSaved }: Props) {
  const [themes, setThemes] = useState<PedagogyTheme[]>([]);
  const [themeId, setThemeId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [explanation, setExplanation] = useState("");
  const [difficulty, setDifficulty] = useState("1");
  const [estActif, setEstActif] = useState(true);
  const [answers, setAnswers] = useState<Answer[]>(emptyAnswers());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    void fetchAdminThemes()
      .then((list) => {
        setThemes(list);
        if (question) {
          setThemeId(question.theme_id || list[0]?.id || "");
          setPrompt(question.prompt);
          setExplanation(question.explanation || "");
          setDifficulty(String(question.difficulty));
          setEstActif(question.est_actif);
          setAnswers(
            question.reponses.length
              ? question.reponses.map((r) => ({
                  label: r.label,
                  texte: r.texte,
                  est_correcte: Boolean(r.est_correcte),
                }))
              : emptyAnswers(),
          );
        } else {
          setThemeId(list[0]?.id || "");
          setPrompt("");
          setExplanation("");
          setDifficulty("1");
          setEstActif(true);
          setAnswers(emptyAnswers());
        }
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Chargement impossible"));
  }, [open, question]);

  function patchAnswer(index: number, patch: Partial<Answer>) {
    setAnswers((list) => list.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }

  function markCorrect(index: number) {
    setAnswers((list) => list.map((a, i) => ({ ...a, est_correcte: i === index })));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        theme_id: themeId || null,
        prompt: prompt.trim(),
        explanation: explanation.trim() || null,
        difficulty: Number(difficulty) || 1,
        est_actif: estActif,
        reponses: answers.map((a, index) => ({
          label: a.label || String.fromCharCode(65 + index),
          texte: a.texte.trim(),
          est_correcte: a.est_correcte,
          sort_order: index,
        })),
      };
      if (question) await updateAdminQuestion(question.id, payload);
      else await createAdminQuestion(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!question) return;
    setSaving(true);
    try {
      await deleteAdminQuestion(question.id);
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
        {question ? "Modifier la question" : "Nouvelle question"}
      </h3>
      <form className="ck-form ck-schools-profile__form space-y-3" onSubmit={(e) => void onSubmit(e)}>
        <label>
          Thème
          <select value={themeId} onChange={(e) => setThemeId(e.target.value)}>
            {themes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title_fr}
              </option>
            ))}
          </select>
        </label>
        <label>
          Énoncé
          <textarea rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} required />
        </label>
        <label>
          Explication
          <textarea rows={2} value={explanation} onChange={(e) => setExplanation(e.target.value)} />
        </label>
        <div className="ck-schools-profile__grid">
          <Input label="Difficulté" type="number" min={1} max={5} value={difficulty} onChange={(e) => setDifficulty(e.target.value)} />
          <label className="ta-check-row" style={{ alignSelf: "end", marginBottom: "0.6rem" }}>
            <input type="checkbox" checked={estActif} onChange={(e) => setEstActif(e.target.checked)} />
            Active
          </label>
        </div>

        <div>
          <h4 className="ck-schools-detail__section">Réponses</h4>
          <div className="space-y-3">
            {answers.map((a, index) => (
              <div key={a.label} className="ta-kpi" style={{ minHeight: "auto", padding: "1.2rem", gap: "0.8rem" }}>
                <div className="flex flex-wrap items-center gap-3">
                  <strong>{a.label}</strong>
                  <label className="ta-check-row">
                    <input type="radio" name="correct" checked={a.est_correcte} onChange={() => markCorrect(index)} />
                    Correcte
                  </label>
                </div>
                <input
                  value={a.texte}
                  onChange={(e) => patchAnswer(index, { texte: e.target.value })}
                  placeholder={`Texte réponse ${a.label}`}
                  required
                />
              </div>
            ))}
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
          {question ? (
            <Button type="button" variant="danger" disabled={saving} onClick={() => void onDelete()}>
              Supprimer
            </Button>
          ) : null}
        </div>
      </form>
    </Modal>
  );
}
