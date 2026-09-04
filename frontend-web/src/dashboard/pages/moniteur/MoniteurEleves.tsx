import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { CheckCircle2, Circle, Clock3, Eye } from "lucide-react";
import Loader from "../../../components/common/Loader";
import { getUserAvatarUrl } from "../../../lib/uiAvatars";
import { fetchMoniteurSeances, type MoniteurSeance } from "../../../lib/enrollmentsApi";
import ComponentCard from "../../common/ComponentCard";
import PageBack from "../../common/PageBack";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";
import TableActions from "../../ui/TableActions";
import SeanceDetailModal from "./SeanceDetailModal";
import { formatDateTime, groupStudents, statusBadgeColor, type StudentGroup } from "./moniteurUtils";

export function MoniteurEleveDetail() {
  const { id = "" } = useParams();
  const [items, setItems] = useState<MoniteurSeance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeance, setSelectedSeance] = useState<MoniteurSeance | null>(null);
  const [confirmOnly, setConfirmOnly] = useState(false);

  async function load() {
    setItems(await fetchMoniteurSeances());
  }

  useEffect(() => {
    let cancelled = false;
    void load()
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const student = useMemo(() => groupStudents(items).find((s) => s.id === id) ?? null, [items, id]);

  if (loading) return <Loader variant="page" />;
  if (!student) {
    return (
      <div className="space-y-4">
        <PageBack to="/espace/moniteur/eleves" />
        <p className="ck-empty">Élève introuvable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <PageBack to="/espace/moniteur/eleves" label="Retour aux élèves" />
        <div className="flex items-center gap-4">
          <img src={getUserAvatarUrl(student.name, 64)} alt="" width={64} height={64} className="rounded-full" />
          <div>
            <h2 className="ck-title" style={{ marginBottom: 0 }}>
              {student.name}
            </h2>
            <p className="ck-subtitle">{student.phone || "Sans téléphone"}</p>
          </div>
        </div>
      </div>

      <ComponentCard title="Séances">
        <div className="space-y-3">
          {student.seances
            .slice()
            .sort((a, b) => +new Date(b.starts_at) - +new Date(a.starts_at))
            .map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-3"
                style={{ border: "0.2rem solid var(--ck-line)", borderRadius: "1.2rem" }}
              >
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => {
                    setConfirmOnly(false);
                    setSelectedSeance(s);
                  }}
                >
                  <p className="ta-strong">{formatDateTime(s.starts_at)}</p>
                  <p className="ta-muted">{s.lieu || s.forfait_label || "Séance pratique"}</p>
                </button>
                <div className="flex items-center gap-2">
                  <Badge color={statusBadgeColor(s.statut)}>{s.statut}</Badge>
                  {s.statut !== "terminee" ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        setConfirmOnly(true);
                        setSelectedSeance(s);
                      }}
                    >
                      Terminer
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
        </div>
      </ComponentCard>

      <SeanceDetailModal
        seance={selectedSeance}
        open={Boolean(selectedSeance)}
        confirmOnly={confirmOnly}
        onClose={() => setSelectedSeance(null)}
        onUpdated={async () => {
          await load();
        }}
      />
    </div>
  );
}

export default function MoniteurEleves() {
  const [items, setItems] = useState<MoniteurSeance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetchMoniteurSeances()
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

  const students = useMemo(() => groupStudents(items), [items]);

  if (loading) return <Loader variant="page" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="ck-title">Élèves</h2>
        <p className="ck-subtitle">{students.length} élèves suivis · séances qui vous sont assignées</p>
      </div>

      {error ? <p className="ck-empty">{error}</p> : null}

      <ComponentCard title="Liste des élèves">
        <div className="ck-schools-table-wrap">
          <table className="ck-schools-table">
            <thead>
              <tr>
                <th>Élève</th>
                <th>Téléphone</th>
                <th>Séances</th>
                <th>Prochaine</th>
                <th>Progression</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((row: StudentGroup) => {
                const upcoming =
                  row.seances
                    .filter((s) => s.statut !== "terminee")
                    .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at))[0] ?? null;
                const done = row.seances.filter((s) => s.statut === "terminee").length;
                const total = row.seances.length;
                return (
                  <tr key={row.id}>
                    <td>
                      <Link
                        to={`/espace/moniteur/eleves/${row.id}`}
                        className="ck-schools-person"
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <img src={getUserAvatarUrl(row.name, 36)} alt="" width={36} height={36} />
                        <div>
                          <strong>{row.name}</strong>
                        </div>
                      </Link>
                    </td>
                    <td>{row.phone || "—"}</td>
                    <td>{total}</td>
                    <td>{upcoming ? formatDateTime(upcoming.starts_at) : "—"}</td>
                    <td>
                      <span
                        className={`ck-schools-status ${
                          done === total && total ? "is-done" : done ? "is-progress" : "is-idle"
                        }`}
                      >
                        {done === total && total ? (
                          <CheckCircle2 size={14} />
                        ) : done ? (
                          <Clock3 size={14} />
                        ) : (
                          <Circle size={14} />
                        )}
                        {done}/{total}
                      </span>
                    </td>
                    <td>
                      <TableActions
                        actions={[
                          {
                            label: "Voir fiche",
                            icon: Eye,
                            to: `/espace/moniteur/eleves/${row.id}`,
                            variant: "primary",
                          },
                        ]}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!students.length ? <p className="ck-empty">Aucun élève assigné pour le moment.</p> : null}
        </div>
      </ComponentCard>
    </div>
  );
}
