import { FormEvent, useEffect, useState } from "react";
import Loader from "../../../components/common/Loader";
import {
  fetchPendingSchools,
  rejectSchool,
  validateSchool,
  type AutoEcolePending,
} from "../../../lib/authApi";

export default function AdminSchoolsPage() {
  const [items, setItems] = useState<AutoEcolePending[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function reload() {
    setItems(await fetchPendingSchools());
  }

  useEffect(() => {
    let cancelled = false;
    void reload()
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

  async function onValidate(id: string) {
    setBusyId(id);
    setError("");
    setMessage("");
    try {
      await validateSchool(id);
      setMessage("Auto-école validée.");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation impossible");
    } finally {
      setBusyId(null);
    }
  }

  async function onReject(event: FormEvent) {
    event.preventDefault();
    if (!rejectId) return;
    setBusyId(rejectId);
    setError("");
    setMessage("");
    try {
      await rejectSchool(rejectId, rejectReason || "Dossier incomplet");
      setMessage("Auto-école refusée.");
      setRejectId(null);
      setRejectReason("");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refus impossible");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <Loader variant="page" />;

  return (
    <section className="ck-schools-panel">
      <div className="ck-schools-panel__head">
        <h2>Auto-écoles en attente</h2>
        <p>Validation d’agrément CODAKIS</p>
      </div>
      {error ? <p className="ck-empty">{error}</p> : null}
      {message ? <p className="ck-empty" style={{ color: "var(--ck-green)" }}>{message}</p> : null}

      {rejectId ? (
        <form className="ck-form ck-schools-inline-form" onSubmit={(e) => void onReject(e)}>
          <h3 className="ck-schools-subtitle">Motif du refus</h3>
          <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} required />
          <div className="ck-schools-profile__actions">
            <button type="submit" className="ck-btn ck-btn--danger" disabled={busyId === rejectId}>
              Confirmer le refus
            </button>
            <button type="button" className="ck-btn ck-btn--ghost" onClick={() => setRejectId(null)}>
              Annuler
            </button>
          </div>
        </form>
      ) : null}

      <div className="ck-schools-cards">
        {items.map((item) => (
          <article key={item.id} className="ck-schools-card">
            <strong>{item.raison_sociale}</strong>
            <p>
              {item.ville || "—"} · Agrément {item.numero_agrement}
              {item.telephone ? ` · ${item.telephone}` : ""}
            </p>
            <div className="ck-schools-card__actions">
              <button
                type="button"
                className="ck-btn ck-btn--primary"
                disabled={busyId === item.id}
                onClick={() => void onValidate(item.id)}
              >
                Valider
              </button>
              <button type="button" className="ck-btn ck-btn--ghost" onClick={() => setRejectId(item.id)}>
                Refuser
              </button>
            </div>
          </article>
        ))}
        {!items.length ? <p className="ck-empty">Aucune demande en attente.</p> : null}
      </div>
    </section>
  );
}
