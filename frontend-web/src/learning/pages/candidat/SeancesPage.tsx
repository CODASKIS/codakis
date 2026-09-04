import { useEffect, useState } from "react";
import { Link } from "react-router";
import Loader from "../../../components/common/Loader";
import { fetchCandidatSeances, type CandidatSeance } from "../../../lib/enrollmentsApi";

export default function SeancesPage() {
  const [items, setItems] = useState<CandidatSeance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetchCandidatSeances()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Impossible de charger");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Loader variant="page" />;

  return (
    <div className="ck-card">
      <h1 className="ck-title">Mes séances</h1>
      <p className="ck-subtitle">Séances planifiées par votre auto-école (consultation).</p>
      {error ? <p className="ck-empty">{error}</p> : null}
      {!items.length ? (
        <div className="ck-empty">
          <p>Aucune séance planifiée.</p>
          <Link to="/espace/candidat/auto-ecole" className="ck-btn ck-btn--ghost" style={{ marginTop: "1rem" }}>
            Voir mon auto-école
          </Link>
        </div>
      ) : (
        <div className="ck-list">
          {items.map((item) => (
            <div key={item.id} className="ck-list__row">
              <span style={{ flex: 1 }}>
                <strong>{new Date(item.starts_at).toLocaleString("fr-FR")}</strong>
                <small>
                  {item.school_name || "Auto-école"} · {item.moniteur_name || "Moniteur à confirmer"} · {item.statut}
                  {item.lieu ? ` · ${item.lieu}` : ""}
                </small>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
