import { FormEvent, useEffect, useState } from "react";
import {
  createAdminExamen,
  deleteAdminExamen,
  fetchAdminExamen,
  fetchAdminQuestions,
  updateAdminExamen,
  type PedagogyExamen,
  type PedagogyQuestion,
} from "../../../../lib/pedagogyApi";
import Button from "../../../ui/Button";
import Input from "../../../ui/Input";
import { Modal } from "../../../ui/Modal";

type Props = {
  open: boolean;
  examen: PedagogyExamen | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function ExamenEditorModal({ open, examen, onClose, onSaved }: Props) {
  const [questions, setQuestions] = useState<PedagogyQuestion[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duree, setDuree] = useState("40");
  const [maxErreurs, setMaxErreurs] = useState("5");
  const [estActif, setEstActif] = useState(true);
  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    void Promise.all([fetchAdminQuestions(), examen ? fetchAdminExamen(examen.id) : Promise.resolve(null)])
      .then(([list, full]) => {
        setQuestions(list);
        const source = full ?? examen;
        if (source) {
          setTitle(source.title);
          setDescription(source.description || "");
          setDuree(String(source.duree_minutes));
          setMaxErreurs(String(source.max_erreurs));
          setEstActif(source.est_actif);
          setQuestionIds(source.question_ids ?? []);
        } else {
          setTitle("");
          setDescription("");
          setDuree("40");
          setMaxErreurs("5");
          setEstActif(true);
          setQuestionIds([]);
        }
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Chargement impossible"));
  }, [open, examen]);

  function toggleQuestion(id: string) {
    setQuestionIds((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        duree_minutes: Number(duree) || 40,
        max_erreurs: Number(maxErreurs) || 0,
        nb_questions: questionIds.length || examen?.nb_questions || 40,
        est_actif: estActif,
        question_ids: questionIds,
      };
      if (examen) await updateAdminExamen(examen.id, payload);
      else await createAdminExamen(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!examen) return;
    setSaving(true);
    try {
      await deleteAdminExamen(examen.id);
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
        {examen ? "Modifier l’examen" : "Nouvel examen"}
      </h3>
      <form className="ck-form ck-schools-profile__form space-y-3" onSubmit={(e) => void onSubmit(e)}>
        <Input label="Titre" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <label>
          Description
          <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="ck-schools-profile__grid">
          <Input label="Durée (min)" type="number" min={5} value={duree} onChange={(e) => setDuree(e.target.value)} />
          <Input
            label="Max erreurs"
            type="number"
            min={0}
            value={maxErreurs}
            onChange={(e) => setMaxErreurs(e.target.value)}
          />
        </div>
        <label className="ta-check-row">
          <input type="checkbox" checked={estActif} onChange={(e) => setEstActif(e.target.checked)} />
          Examen actif
        </label>

        <div>
          <h4 className="ck-schools-detail__section">Banque de questions ({questionIds.length})</h4>
          <div className="ck-schools-table-wrap" style={{ maxHeight: "28rem", overflow: "auto" }}>
            {questions.map((q) => (
              <label
                key={q.id}
                className="ta-check-row"
                style={{ padding: "0.8rem 0", borderBottom: "0.1rem solid #f2f4f7", width: "100%", alignItems: "flex-start" }}
              >
                <input type="checkbox" checked={questionIds.includes(q.id)} onChange={() => toggleQuestion(q.id)} />
                <span style={{ fontSize: "1.4rem", fontWeight: 700 }}>{q.prompt}</span>
              </label>
            ))}
            {!questions.length ? <p className="ck-empty">Aucune question disponible.</p> : null}
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
          {examen ? (
            <Button type="button" variant="danger" disabled={saving} onClick={() => void onDelete()}>
              Supprimer
            </Button>
          ) : null}
        </div>
      </form>
    </Modal>
  );
}
