import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Building2, Landmark, School } from "lucide-react";
import Loader from "../../../components/common/Loader";
import { fetchCandidatInscriptions, type CandidatInscription } from "../../../lib/enrollmentsApi";

const SCHOOL_ICONS = [Landmark, Building2, School] as const;
const SCHOOL_COLORS = ["#f59e0b", "#00a859", "#2563eb", "#8b5cf6", "#ef4444", "#0ea5e9"];

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
          {items.map((item, index) => {
            const Icon = SCHOOL_ICONS[index % SCHOOL_ICONS.length];
            const color = SCHOOL_COLORS[index % SCHOOL_COLORS.length];
            return (
              <Link
                key={item.id}
                to={`/auto-ecoles/${item.auto_ecole_id}`}
                className="ck-list__row"
              >
                <span className="ck-list__icon ck-list__icon--solid" style={{ background: color }}>
                  <Icon size={22} color="#fff" strokeWidth={2.2} aria-hidden />
                </span>
                <span style={{ flex: 1 }}>
                  <strong>{item.school_name}</strong>
                  <small>
                    {item.forfait_label} · {item.statut} · {item.heures_conduite_restantes}h restantes
                  </small>
                </span>
              </Link>
            );
          })}
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
