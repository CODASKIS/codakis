import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Save, Trash2 } from "lucide-react";
import Loader from "../../../components/common/Loader";
import {
  createAdminQuestion,
  deleteAdminQuestion,
  fetchAdminQuestions,
  fetchAdminThemes,
  updateAdminQuestion,
  type PedagogyTheme,
} from "../../../lib/pedagogyApi";
import PageBack from "../../common/PageBack";
import ComponentCard from "../../common/ComponentCard";
import Button from "../../ui/Button";
import Input from "../../ui/Input";

type Answer = { label: string; texte: string; est_correcte: boolean };

const emptyAnswers = (): Answer[] => [
  { label: "A", texte: "", est_correcte: true },
  { label: "B", texte: "", est_correcte: false },
  { label: "C", texte: "", est_correcte: false },
  { label: "D", texte: "", est_correcte: false },
];

export default function AdminQuestionForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const [themes, setThemes] = useState<PedagogyTheme[]>([]);
  const [themeId, setThemeId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [explanation, setExplanation] = useState("");
  const [difficulty, setDifficulty] = useState("1");
  const [estActif, setEstActif] = useState(true);
  const [answers, setAnswers] = useState<Answer[]>(emptyAnswers());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await fetchAdminThemes();
        if (cancelled) return;
        setThemes(list);
        if (isNew) {
          setThemeId(list[0]?.id || "");
        } else {
          const questions = await fetchAdminQuestions();
          if (cancelled) return;
          const question = questions.find((q) => q.id === id);
          if (!question) {
            setError("Question introuvable.");
            return;
          }
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

  function patchAnswer(index: number, patch: Partial<Answer>) {
    setAnswers((list) => list.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }

  function markCorrect(index: number) {
    setAnswers((list) => list.map((a, i) => ({ ...a, est_correcte: i === index })));
  }

  async function onSave(e: FormEvent) {
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
      if (isNew) await createAdminQuestion(payload);
      else await updateAdminQuestion(id, payload);
      navigate("/espace/admin/contenu");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (isNew || !window.confirm("Supprimer cette question ?")) return;
    setSaving(true);
    try {
      await deleteAdminQuestion(id);
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
        <h2 className="ck-title">{isNew ? "Nouvelle question" : "Modifier la question"}</h2>
      </div>
      <ComponentCard title="Question QCM">
        <form className="ck-form ck-schools-profile__form space-y-3" onSubmit={(e) => void onSave(e)}>
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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input
              label="Difficulté"
              type="number"
              min={1}
              max={5}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            />
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
