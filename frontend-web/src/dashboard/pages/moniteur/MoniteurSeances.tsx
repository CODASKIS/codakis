import { useEffect, useMemo, useState } from "react";
import Loader from "../../../components/common/Loader";
import { fetchMoniteurSeances, type MoniteurSeance } from "../../../lib/enrollmentsApi";
import ComponentCard from "../../common/ComponentCard";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";
import SeanceDetailModal from "./SeanceDetailModal";
import { formatDateTime, statusBadgeColor } from "./moniteurUtils";

export default function MoniteurSeances() {
  const [items, setItems] = useState<MoniteurSeance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<MoniteurSeance | null>(null);
  const [confirmOnly, setConfirmOnly] = useState(false);

  async function load() {
    setItems(await fetchMoniteurSeances());
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

  const upcoming = useMemo(
    () =>
      items
        .filter((i) => i.statut !== "terminee")
        .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at)),
    [items],
  );
  const past = useMemo(
    () =>
      items
        .filter((i) => i.statut === "terminee")
        .sort((a, b) => +new Date(b.starts_at) - +new Date(a.starts_at)),
    [items],
  );

  if (loading) return <Loader variant="page" />;

  function SeanceRow({ item, canFinish }: { item: MoniteurSeance; canFinish?: boolean }) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={() => {
            setConfirmOnly(false);
            setSelected(item);
          }}
        >
          <p className="font-semibold text-gray-800">{item.candidat_name}</p>
          <p className="mt-0.5 text-sm text-gray-500">
            {formatDateTime(item.starts_at)}
            {item.lieu ? ` · ${item.lieu}` : ""}
          </p>
        </button>
        <div className="flex items-center gap-2">
          <Badge color={statusBadgeColor(item.statut)}>{item.statut}</Badge>
          {canFinish ? (
            <Button
              size="sm"
              onClick={() => {
                setConfirmOnly(true);
                setSelected(item);
              }}
            >
              Terminer
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="ta-page-title">Séances</h2>
        <p className="ta-page-sub">À venir et historique de vos leçons de conduite.</p>
      </div>

      {error ? <p className="text-sm text-error-500">{error}</p> : null}

      <ComponentCard title="Séances à venir" desc="Vos prochaines leçons de conduite">
        <div className="space-y-3">
          {upcoming.map((item) => (
            <SeanceRow key={item.id} item={item} canFinish />
          ))}
          {!upcoming.length ? <p className="text-sm text-gray-500">Aucune séance à venir.</p> : null}
        </div>
      </ComponentCard>

      <ComponentCard title="Séances passées" desc="Historique récent">
        <div className="space-y-3">
          {past.map((item) => (
            <SeanceRow key={item.id} item={item} />
          ))}
          {!past.length ? <p className="text-sm text-gray-500">Pas encore d’historique.</p> : null}
        </div>
      </ComponentCard>

      <SeanceDetailModal
        seance={selected}
        open={Boolean(selected)}
        confirmOnly={confirmOnly}
        onClose={() => setSelected(null)}
        onUpdated={load}
      />
    </div>
  );
}
