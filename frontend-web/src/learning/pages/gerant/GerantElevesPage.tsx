import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Circle, Clock3, Eye, FileCheck2, Timer, Users } from "lucide-react";
import Loader from "../../../components/common/Loader";
import { getUserAvatarUrl } from "../../../lib/uiAvatars";
import { fetchGerantInscriptions, type GerantInscription } from "../../../lib/enrollmentsApi";
import ComponentCard from "../../../dashboard/common/ComponentCard";
import KpiCard from "../../../dashboard/common/KpiCard";
import TableActions from "../../../dashboard/ui/TableActions";

function hoursLabel(item: GerantInscription) {
  if (!item.heures_conduite_total) return "Code / théorie";
  return `${item.heures_conduite_restantes}h / ${item.heures_conduite_total}h`;
}

export default function GerantElevesPage() {
  const [items, setItems] = useState<GerantInscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetchGerantInscriptions()
      .then((data) => {
        if (cancelled) return;
        setItems(data);
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

  const overview = useMemo(() => {
    const total = items.length;
    const withHours = items.filter((i) => i.heures_conduite_total > 0);
    const hoursLeft = items.reduce((sum, i) => sum + (i.heures_conduite_restantes || 0), 0);
    const seances = items.reduce((sum, i) => sum + (i.seances_count || 0), 0);
    return { total, withHours: withHours.length, hoursLeft, seances };
  }, [items]);

  if (loading) return <Loader variant="page" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="ck-title">Élèves</h2>
        <p className="ck-subtitle">Inscriptions, séances et dossiers consort.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="Élèves inscrits" value={overview.total} icon={Users} tone="green" />
        <KpiCard label="En conduite" value={overview.withHours} icon={Timer} tone="blue" />
        <KpiCard label="Heures restantes" value={overview.hoursLeft} icon={Timer} tone="amber" />
        <KpiCard label="Séances" value={overview.seances} icon={FileCheck2} tone="slate" />
      </div>

      <ComponentCard title="Liste des inscrits" desc="Ouvrir la fiche pour le dossier et les séances">
        {error ? <p className="ck-empty">{error}</p> : null}
        <div className="ck-schools-table-wrap">
          <table className="ck-schools-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Forfait</th>
                <th>Heures</th>
                <th>Séances</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link
                      to={`/espace/gerant/eleves/${item.id}`}
                      className="ck-schools-person"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <img src={getUserAvatarUrl(item.candidat_name, 36)} alt="" width={36} height={36} />
                      <div>
                        <strong>{item.candidat_name}</strong>
                        <small>{item.candidat_email}</small>
                      </div>
                    </Link>
                  </td>
                  <td>{item.forfait_label}</td>
                  <td>{hoursLabel(item)}</td>
                  <td>
                    <span className={`ck-schools-status ${item.seances_count ? "is-progress" : "is-idle"}`}>
                      {item.seances_count ? <Clock3 size={14} /> : <Circle size={14} />}
                      {item.seances_count}
                    </span>
                  </td>
                  <td>
                    <TableActions
                      actions={[
                        {
                          label: "Voir fiche",
                          icon: Eye,
                          to: `/espace/gerant/eleves/${item.id}`,
                          variant: "primary",
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!items.length ? <p className="ck-empty">Aucun élève inscrit pour le moment.</p> : null}
        </div>
      </ComponentCard>
    </div>
  );
}
