import { useEffect, useState } from "react";
import Loader from "../../../components/common/Loader";
import { fetchMoniteurSeances, updateMoniteurSeance, type MoniteurSeance } from "../../../lib/enrollmentsApi";

export default function MoniteurHomePage() {
  const [items, setItems] = useState<MoniteurSeance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    const data = await fetchMoniteurSeances();
    setItems(data);
  }

  useEffect(() => {
    let cancelled = false;
    void load()
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

  async function markDone(id: string) {
    await updateMoniteurSeance(id, { statut: "terminee" });
    await load();
  }

  if (loading) return <Loader variant="page" />;

  return (
    <div className="ck-card">
      <h1 className="ck-title">Espace moniteur</h1>
      <p className="ck-subtitle">Vos séances pratiques.</p>
      {error ? <p className="ck-empty">{error}</p> : null}
      <div className="ck-list">
        {items.map((item) => (
          <div key={item.id} className="ck-list__row">
            <span style={{ flex: 1 }}>
              <strong>{item.candidat_name}</strong>
              <small>
                {new Date(item.starts_at).toLocaleString("fr-FR")} · {item.statut}
                {item.lieu ? ` · ${item.lieu}` : ""}
              </small>
            </span>
            {item.statut !== "terminee" ? (
              <button type="button" className="ck-btn ck-btn--primary" style={{ minHeight: "3.6rem" }} onClick={() => void markDone(item.id)}>
                Terminer
              </button>
            ) : null}
          </div>
        ))}
        {!items.length ? <p className="ck-empty">Aucune séance.</p> : null}
      </div>
    </div>
  );
}
