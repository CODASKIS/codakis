import { useEffect, useState } from "react";
import Loader from "../../../components/common/Loader";
import { fetchGerantInscriptions, type GerantInscription } from "../../../lib/enrollmentsApi";

export default function GerantInscriptionsPage() {
  const [items, setItems] = useState<GerantInscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetchGerantInscriptions()
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
      <h1 className="ck-title">Inscriptions</h1>
      <p className="ck-subtitle">Élèves rattachés à votre établissement.</p>
      {error ? <p className="ck-empty">{error}</p> : null}
      <div className="ck-list">
        {items.map((item) => (
          <div key={item.id} className="ck-list__row">
            <span style={{ flex: 1 }}>
              <strong>{item.candidat_name}</strong>
              <small>
                {item.candidat_email} · {item.forfait_label} · {item.heures_conduite_restantes}h restantes ·{" "}
                {item.seances_count} séances
              </small>
            </span>
          </div>
        ))}
        {!items.length ? <p className="ck-empty">Aucune inscription.</p> : null}
      </div>
    </div>
  );
}
