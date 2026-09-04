import { useEffect, useState } from "react";
import { Link } from "react-router";
import Loader from "../../../components/common/Loader";
import { fetchCandidatInscriptions, type CandidatInscription } from "../../../lib/enrollmentsApi";

export default function SchoolPage() {
  const [items, setItems] = useState<CandidatInscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetchCandidatInscriptions()
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
      <h1 className="ck-title">Mon auto-école</h1>
      <p className="ck-subtitle">Inscriptions et forfaits liés à votre compte.</p>
      {error ? <p className="ck-empty">{error}</p> : null}
      {!items.length ? (
        <div className="ck-empty">
          <p>Aucune inscription pour le moment.</p>
          <Link to="/auto-ecoles" className="ck-btn ck-btn--primary" style={{ marginTop: "1rem" }}>
            Choisir une auto-école
          </Link>
        </div>
      ) : (
        <div className="ck-list">
          {items.map((item) => (
            <div key={item.id} className="ck-list__row">
              <span style={{ flex: 1 }}>
                <strong>{item.school_name}</strong>
                <small>
                  {item.forfait_label} · {item.statut} · {item.heures_conduite_restantes}h restantes
                </small>
              </span>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: "1.6rem" }}>
        <Link to="/espace/candidat/seances" className="ck-btn ck-btn--ghost ck-btn--block">
          Voir mes séances
        </Link>
      </div>
    </div>
  );
}
