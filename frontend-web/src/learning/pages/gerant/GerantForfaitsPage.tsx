import { useEffect, useState } from "react";
import Loader from "../../../components/common/Loader";
import { fetchGerantForfaits, type GerantForfait } from "../../../lib/enrollmentsApi";

export default function GerantForfaitsPage() {
  const [items, setItems] = useState<GerantForfait[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetchGerantForfaits()
      .then((data) => {
        if (!cancelled) setItems(data);
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

  if (loading) return <Loader variant="page" />;

  return (
    <div className="ck-card">
      <h1 className="ck-title">Forfaits</h1>
      <p className="ck-subtitle">Offres de votre auto-école.</p>
      {error ? <p className="ck-empty">{error}</p> : null}
      <div className="ck-list">
        {items.map((item) => (
          <div key={item.id} className="ck-list__row">
            <span style={{ flex: 1 }}>
              <strong>{item.label_fr}</strong>
              <small>
                {item.type} · {item.prix.toLocaleString("fr-FR")} FCFA
                {item.heures_conduite ? ` · ${item.heures_conduite}h` : ""}
                {item.est_actif ? "" : " · inactif"}
              </small>
            </span>
          </div>
        ))}
        {!items.length ? <p className="ck-empty">Aucun forfait.</p> : null}
      </div>
    </div>
  );
}
