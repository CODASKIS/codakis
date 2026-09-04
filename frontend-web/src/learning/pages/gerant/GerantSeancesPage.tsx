import { FormEvent, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Loader from "../../../components/common/Loader";
import { fetchGerantMoniteurs } from "../../../lib/authApi";
import {
  createGerantSeance,
  fetchGerantInscriptions,
  type GerantInscription,
} from "../../../lib/enrollmentsApi";

export default function GerantSeancesPage() {
  const [inscriptions, setInscriptions] = useState<GerantInscription[]>([]);
  const [moniteurs, setMoniteurs] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [inscriptionId, setInscriptionId] = useState("");
  const [moniteurId, setMoniteurId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [lieu, setLieu] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchGerantInscriptions(), fetchGerantMoniteurs()])
      .then(([ins, mons]) => {
        if (cancelled) return;
        setInscriptions(ins);
        setMoniteurs(mons.map((m) => ({ id: m.id, first_name: m.first_name, last_name: m.last_name })));
        if (ins[0]) setInscriptionId(ins[0].id);
        if (mons[0]) setMoniteurId(mons[0].id);
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

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await createGerantSeance({
        inscription_id: inscriptionId,
        moniteur_id: moniteurId || null,
        starts_at: new Date(startsAt).toISOString(),
        duration_minutes: 60,
        lieu: lieu || undefined,
      });
      setMessage("Séance créée.");
      setStartsAt("");
      setLieu("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Création impossible");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader variant="page" />;

  return (
    <div className="ck-card">
      <h1 className="ck-title">Planifier une séance</h1>
      <p className="ck-subtitle">Assignez une séance pratique à un élève inscrit.</p>
      <form className="ck-form" onSubmit={(e) => void onSubmit(e)}>
        <label>
          Élève / inscription
          <select value={inscriptionId} onChange={(e) => setInscriptionId(e.target.value)} required>
            {inscriptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.candidat_name} — {item.forfait_label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Moniteur
          <select value={moniteurId} onChange={(e) => setMoniteurId(e.target.value)}>
            <option value="">Non assigné</option>
            {moniteurs.map((m) => (
              <option key={m.id} value={m.id}>
                {m.first_name} {m.last_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Début
          <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
        </label>
        <label>
          Lieu
          <input value={lieu} onChange={(e) => setLieu(e.target.value)} placeholder="Parking, circuit…" />
        </label>
        {error ? <p className="ck-empty">{error}</p> : null}
        {message ? <p className="ck-empty" style={{ color: "var(--ck-green)" }}>{message}</p> : null}
        <button type="submit" className="ck-btn ck-btn--primary ck-btn--block" disabled={saving || !inscriptions.length}>
          <Plus size={16} strokeWidth={2.5} />
          {saving ? "Création…" : "Créer la séance"}
        </button>
      </form>
    </div>
  );
}
