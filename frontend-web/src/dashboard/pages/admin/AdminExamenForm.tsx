import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Save, Trash2 } from "lucide-react";
import Loader from "../../../components/common/Loader";
import {
  createAdminExamen,
  deleteAdminExamen,
  fetchAdminExamen,
  fetchAdminQuestions,
  updateAdminExamen,
  type PedagogyQuestion,
} from "../../../lib/pedagogyApi";
import PageBack from "../../common/PageBack";
import ComponentCard from "../../common/ComponentCard";
import Button from "../../ui/Button";
import Input from "../../ui/Input";

export default function AdminExamenForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<PedagogyQuestion[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duree, setDuree] = useState("40");
  const [maxErreurs, setMaxErreurs] = useState("5");
  const [estActif, setEstActif] = useState(true);
  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const [nbFallback, setNbFallback] = useState(40);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [list, full] = await Promise.all([
          fetchAdminQuestions(),
          isNew ? Promise.resolve(null) : fetchAdminExamen(id),
        ]);
        if (cancelled) return;
        setQuestions(list);
        if (full) {
          setTitle(full.title);
          setDescription(full.description || "");
          setDuree(String(full.duree_minutes));
          setMaxErreurs(String(full.max_erreurs));
          setEstActif(full.est_actif);
          setQuestionIds(full.question_ids ?? []);
          setNbFallback(full.nb_questions || 40);
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

  function toggleQuestion(qid: string) {
    setQuestionIds((list) => (list.includes(qid) ? list.filter((x) => x !== qid) : [...list, qid]));
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        duree_minutes: Number(duree) || 40,
        max_erreurs: Number(maxErreurs) || 0,
        nb_questions: questionIds.length || nbFallback || 40,
        est_actif: estActif,
        question_ids: questionIds,
      };
      if (isNew) await createAdminExamen(payload);
      else await updateAdminExamen(id, payload);
      navigate("/espace/admin/contenu");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (isNew || !window.confirm("Supprimer cet examen ?")) return;
    setSaving(true);
    try {
      await deleteAdminExamen(id);
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
        <h2 className="ck-title">{isNew ? "Nouvel examen" : "Modifier l’examen"}</h2>
      </div>
      <ComponentCard title="Examen">
        <form className="ck-form ck-schools-profile__form space-y-3" onSubmit={(e) => void onSave(e)}>
          <Input label="Titre" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <label>
            Description
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
