import { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { CalendarDays, CheckCircle2, Clock3, Users } from "lucide-react";
import Loader from "../../../components/common/Loader";
import { fetchMoniteurSeances, type MoniteurSeance } from "../../../lib/enrollmentsApi";
import ComponentCard from "../../common/ComponentCard";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";
import SeanceDetailModal from "./SeanceDetailModal";
import { formatDateTime, groupStudents, hoursBetween, statusBadgeColor } from "./moniteurUtils";

const GREEN = "#00a859";
const BLUE = "#0ba5ec";
const ORANGE = "#f79009";

export default function MoniteurHome() {
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

  const students = useMemo(() => groupStudents(items), [items]);
  const upcoming = useMemo(
    () =>
      items
        .filter((s) => s.statut !== "terminee")
        .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at)),
    [items],
  );
  const done = useMemo(() => items.filter((s) => s.statut === "terminee"), [items]);
  const plannedHours = useMemo(
    () => upcoming.reduce((sum, s) => sum + hoursBetween(s.starts_at, s.ends_at), 0),
    [upcoming],
  );
  const doneHours = useMemo(
    () => done.reduce((sum, s) => sum + hoursBetween(s.starts_at, s.ends_at), 0),
    [done],
  );

  const weekBuckets = useMemo(() => {
    const labels: string[] = [];
    const planifiee: number[] = [];
    const terminee: number[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const start = new Date(now);
      start.setDate(now.getDate() - i * 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      labels.push(start.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }));
      let p = 0;
      let t = 0;
      for (const s of items) {
        const d = +new Date(s.starts_at);
        if (d < +start || d >= +end) continue;
        if (s.statut === "terminee") t += 1;
        else p += 1;
      }
      planifiee.push(p);
      terminee.push(t);
    }
    return { labels, planifiee, terminee };
  }, [items]);

  const activityOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        stacked: true,
        toolbar: { show: false },
        fontFamily: "Nunito, system-ui, sans-serif",
      },
      colors: [GREEN, BLUE],
      plotOptions: { bar: { borderRadius: 8, columnWidth: "46%" } },
      dataLabels: { enabled: false },
      legend: { position: "top", fontWeight: 700, fontSize: "13px" },
      xaxis: {
        categories: weekBuckets.labels,
        labels: { style: { fontWeight: 700, fontSize: "12px" } },
      },
      yaxis: {
        labels: { style: { fontWeight: 700 } },
        forceNiceScale: true,
      },
      grid: { strokeDashArray: 4 },
      tooltip: { theme: "light" },
    }),
    [weekBuckets.labels],
  );

  const activitySeries = useMemo(
    () => [
      { name: "Terminées", data: weekBuckets.terminee },
      { name: "À venir", data: weekBuckets.planifiee },
    ],
    [weekBuckets],
  );

  const statusOptions: ApexOptions = useMemo(
    () => ({
      chart: { type: "donut", fontFamily: "Nunito, system-ui, sans-serif" },
      labels: ["Terminées", "À venir", "Autres"],
      colors: [GREEN, BLUE, ORANGE],
      legend: { position: "bottom", fontWeight: 700, fontSize: "13px" },
      dataLabels: { enabled: true },
      plotOptions: {
        pie: {
          donut: {
            size: "64%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Séances",
                fontWeight: 800,
                fontSize: "14px",
              },
            },
          },
        },
      },
      stroke: { width: 0 },
    }),
    [],
  );

  const otherCount = Math.max(items.length - done.length - upcoming.length, 0);
  const statusSeries = useMemo(
    () => [done.length, upcoming.length, otherCount],
    [done.length, upcoming.length, otherCount],
  );

  const hoursOptions: ApexOptions = useMemo(
    () => ({
      chart: { type: "radialBar", fontFamily: "Nunito, system-ui, sans-serif" },
      colors: [GREEN, ORANGE],
      labels: ["Heures faites", "Heures planifiées"],
      plotOptions: {
        radialBar: {
          hollow: { size: "28%" },
          dataLabels: {
            name: { fontSize: "12px", fontWeight: 700 },
            value: { fontSize: "16px", fontWeight: 800 },
            total: {
              show: true,
              label: "Total h",
              fontWeight: 800,
              formatter: () => `${(doneHours + plannedHours).toFixed(1)}`,
            },
          },
        },
      },
      legend: { show: true, position: "bottom", fontWeight: 700 },
    }),
    [doneHours, plannedHours],
  );

  const hoursMax = Math.max(doneHours + plannedHours, 1);
  const hoursSeries = useMemo(
    () => [Math.round((doneHours / hoursMax) * 100), Math.round((plannedHours / hoursMax) * 100)],
    [doneHours, plannedHours, hoursMax],
  );

  if (loading) return <Loader variant="page" />;

  const kpis = [
    { label: "Élèves affectés", value: students.length, icon: Users },
    { label: "Créneaux à venir", value: upcoming.length, icon: CalendarDays },
    { label: "Heures planifiées", value: plannedHours.toFixed(1), icon: Clock3 },
    { label: "Séances terminées", value: done.length, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="ck-title">Accueil</h2>
        <p className="ck-subtitle">Vue d’ensemble de vos séances pratiques.</p>
      </div>

      {error ? <p className="ck-empty">{error}</p> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="ta-kpi">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="ta-kpi-label">{kpi.label}</p>
                  <p className="ta-kpi-value">{kpi.value}</p>
                </div>
                <span
                  className="flex items-center justify-center"
                  style={{
                    width: "4.8rem",
                    height: "4.8rem",
                    borderRadius: "1.2rem",
                    background: "rgba(0, 168, 89, 0.12)",
                    color: "var(--ck-green)",
                  }}
                >
                  <Icon size={22} strokeWidth={2.4} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ComponentCard title="Activité (6 semaines)" desc="Séances terminées vs à venir" className="xl:col-span-2">
          {items.length ? (
            <Chart options={activityOptions} series={activitySeries} type="bar" height={300} />
          ) : (
            <p className="ta-muted">Pas encore de données à afficher.</p>
          )}
        </ComponentCard>
        <ComponentCard title="Répartition" desc="Statut des séances">
          {items.length ? (
            <Chart options={statusOptions} series={statusSeries} type="donut" height={300} />
          ) : (
            <p className="ta-muted">Aucune séance.</p>
          )}
        </ComponentCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ComponentCard title="Charge horaire" desc="Fait vs planifié">
          <Chart options={hoursOptions} series={hoursSeries} type="radialBar" height={300} />
        </ComponentCard>

        <ComponentCard
          title="Prochaines séances"
          desc="Cliquez pour voir le détail ou terminer."
          className="xl:col-span-2"
        >
          <div className="divide-y divide-gray-100">
            {upcoming.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => {
                    setConfirmOnly(false);
                    setSelected(item);
                  }}
                >
                  <p className="ta-strong">{item.candidat_name}</p>
                  <p className="ta-muted" style={{ marginTop: "0.2rem" }}>
                    {formatDateTime(item.starts_at)}
                    {item.lieu ? ` · ${item.lieu}` : ""}
                  </p>
                </button>
                <div className="flex items-center gap-2">
                  <Badge color={statusBadgeColor(item.statut)}>{item.statut}</Badge>
                  <Button
                    size="sm"
                    onClick={() => {
                      setConfirmOnly(true);
                      setSelected(item);
                    }}
                  >
                    Terminer
                  </Button>
                </div>
              </div>
            ))}
            {!upcoming.length ? <p className="ta-muted">Aucune séance à venir.</p> : null}
          </div>
        </ComponentCard>
      </div>

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
