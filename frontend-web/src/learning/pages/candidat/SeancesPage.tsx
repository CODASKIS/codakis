import { useEffect, useState } from "react";
import { Link } from "react-router";
import { CalendarClock, Car, CheckCircle2, MapPin, ThumbsDown, ThumbsUp, XCircle } from "lucide-react";
import Loader from "../../../components/common/Loader";
import {
  fetchCandidatSeances,
  respondCandidatSeance,
  type CandidatSeance,
} from "../../../lib/enrollmentsApi";

function seanceVisual(item: CandidatSeance): {
  Icon: typeof Car;
  color: string;
  progress: number;
  label: string;
} {
  const s = item.statut.trim().toLowerCase();
  if (item.participation === "refuse" || s.includes("annul")) {
    return { Icon: XCircle, color: "#ef4444", progress: 0, label: "Refusée / annulée" };
  }
  if (s.includes("termin") || s.includes("fait") || s.includes("complet") || s === "done") {
    return { Icon: CheckCircle2, color: "#00a859", progress: 100, label: "Terminée" };
  }
  if (item.participation === "accepte" || s.includes("confirm")) {
    return { Icon: ThumbsUp, color: "#00a859", progress: 55, label: "Participation confirmée" };
  }
  if (s.includes("cours") || s.includes("progress")) {
    return { Icon: Car, color: "#2563eb", progress: 50, label: "En cours" };
  }
  return { Icon: CalendarClock, color: "#f59e0b", progress: 15, label: "En attente de réponse" };
}

export default function SeancesPage() {
  const [items, setItems] = useState<CandidatSeance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

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

  async function respond(id: string, participation: "accepte" | "refuse") {
    setBusyId(id);
    setError("");
    try {
      const updated = await respondCandidatSeance(id, participation);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Réponse impossible");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <Loader variant="page" />;

  const doneCount = items.filter((item) => seanceVisual(item).progress === 100).length;
  const canRespond = (item: CandidatSeance) =>
    item.participation === "en_attente" &&
    !["terminee", "annulee"].includes(item.statut.trim().toLowerCase());

  return (
    <div className="ck-card">
      <h1 className="ck-title">Mes séances</h1>
      <p className="ck-subtitle">Séances planifiées par votre auto-école — confirmez ou refusez votre participation.</p>
      {error ? <p className="ck-empty">{error}</p> : null}
      {!items.length ? (
        <div className="ck-empty">
          <p>Aucune séance planifiée.</p>
          <Link to="/espace/candidat/auto-ecole" className="ck-btn ck-btn--ghost" style={{ marginTop: "1rem" }}>
            Voir mon auto-école
          </Link>
        </div>
      ) : (
        <>
          <div className="ck-stats-block__head">
            <h2 className="ck-stats-block__title">Planning</h2>
            <span className="ck-skill-card__count">
              {doneCount}/{items.length}
            </span>
          </div>
          <div className="ck-skill-grid">
            {items.map((item) => {
              const { Icon, color, progress, label } = seanceVisual(item);
              const when = new Date(item.starts_at).toLocaleString("fr-FR", {
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div key={item.id} className="ck-skill-card ck-seance-card">
                  <span className="ck-skill-card__icon" style={{ background: color }}>
                    <Icon size={26} color="#fff" strokeWidth={2.2} aria-hidden />
                  </span>
                  <span className="ck-skill-card__body">
                    <strong>{when}</strong>
                    <span className="ck-skill-card__meta">
                      <span className="ck-skill-card__bar" aria-hidden>
                        <span style={{ width: `${progress}%`, background: color }} />
                      </span>
                      <span className="ck-skill-card__count">{label}</span>
                    </span>
                    <span className="ck-skill-card__hint">
                      {item.school_name || "Auto-école"} · {item.moniteur_name || "Moniteur à confirmer"}
                      {item.lieu ? (
                        <>
                          {" · "}
                          <MapPin size={12} style={{ display: "inline", verticalAlign: "middle" }} aria-hidden />{" "}
                          {item.lieu}
                        </>
                      ) : null}
                    </span>
                    {canRespond(item) ? (
                      <span className="ck-seance-card__actions">
                        <button
                          type="button"
                          className="ck-btn ck-btn--primary ck-btn--sm"
                          disabled={busyId === item.id}
                          onClick={() => void respond(item.id, "accepte")}
                        >
                          <ThumbsUp size={14} aria-hidden /> Participer
                        </button>
                        <button
                          type="button"
                          className="ck-btn ck-btn--ghost ck-btn--sm"
                          disabled={busyId === item.id}
                          onClick={() => void respond(item.id, "refuse")}
                        >
                          <ThumbsDown size={14} aria-hidden /> Refuser
                        </button>
                      </span>
                    ) : null}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
