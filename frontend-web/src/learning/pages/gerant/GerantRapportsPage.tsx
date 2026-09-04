import { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import {
  Activity,
  BarChart3,
  Clock3,
  Package,
  PieChart,
  Target,
  Users,
  UserCheck,
} from "lucide-react";
import Loader from "../../../components/common/Loader";
import { fetchGerantMoniteurs } from "../../../lib/authApi";
import {
  fetchGerantForfaits,
  fetchGerantInscriptions,
  type GerantInscription,
} from "../../../lib/enrollmentsApi";
import ComponentCard from "../../../dashboard/common/ComponentCard";
import KpiCard from "../../../dashboard/common/KpiCard";

const GREEN = "#00a859";
const BLUE = "#0ea5e9";
const ORANGE = "#f59e0b";
const PURPLE = "#7c3aed";
const MUTED = "#94a3b8";

const chartFont = "Nunito, system-ui, sans-serif";

export default function GerantRapportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inscriptions, setInscriptions] = useState<GerantInscription[]>([]);
  const [forfaitsCount, setForfaitsCount] = useState(0);
  const [actifs, setActifs] = useState(0);
  const [moniteurs, setMoniteurs] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchGerantInscriptions(), fetchGerantForfaits(), fetchGerantMoniteurs()])
      .then(([ins, fors, mons]) => {
        if (cancelled) return;
        setInscriptions(ins);
        setForfaitsCount(fors.length);
        setActifs(fors.filter((f) => f.est_actif).length);
        setMoniteurs(mons.length);
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

  const eleves = inscriptions.length;
  const seances = useMemo(
    () => inscriptions.reduce((sum, i) => sum + (i.seances_count || 0), 0),
    [inscriptions],
  );
  const heures = useMemo(
    () => inscriptions.reduce((sum, i) => sum + (i.heures_conduite_restantes || 0), 0),
    [inscriptions],
  );
  const withHours = useMemo(
    () => inscriptions.filter((i) => i.heures_conduite_total > 0).length,
    [inscriptions],
  );
  const withSeances = useMemo(
    () => inscriptions.filter((i) => i.seances_count > 0).length,
    [inscriptions],
  );

  const activityOptions: ApexOptions = useMemo(
    () => ({
      chart: { type: "bar", toolbar: { show: false }, fontFamily: chartFont },
      colors: [GREEN],
      plotOptions: {
        bar: { borderRadius: 8, columnWidth: "42%", borderRadiusApplication: "end" },
      },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 4, colors: ["transparent"] },
      xaxis: {
        categories: ["Élèves", "Séances", "Heures rest.", "Moniteurs"],
        labels: { style: { fontWeight: 700, fontSize: "13px" } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { labels: { style: { fontWeight: 700 } } },
      grid: { strokeDashArray: 4, yaxis: { lines: { show: true } } },
      tooltip: { theme: "light" },
      fill: { opacity: 1 },
    }),
    [],
  );

  const activitySeries = useMemo(
    () => [{ name: "Volume", data: [eleves, seances, heures, moniteurs] }],
    [eleves, seances, heures, moniteurs],
  );

  const forfaitOptions: ApexOptions = useMemo(
    () => ({
      chart: { type: "donut", fontFamily: chartFont },
      labels: ["Actifs", "Inactifs"],
      colors: [GREEN, MUTED],
      legend: { position: "bottom", fontWeight: 700, fontSize: "13px" },
      dataLabels: { enabled: false },
      plotOptions: {
        pie: {
          donut: {
            size: "65%",
            labels: {
              show: true,
              total: { show: true, label: "Forfaits", fontWeight: 800, fontSize: "14px" },
            },
          },
        },
      },
    }),
    [],
  );

  const forfaitSeries = useMemo(
    () => [actifs, Math.max(forfaitsCount - actifs, 0)],
    [actifs, forfaitsCount],
  );

  const mixOptions: ApexOptions = useMemo(
    () => ({
      chart: { type: "radialBar", fontFamily: chartFont },
      colors: [BLUE, ORANGE, PURPLE],
      labels: ["Avec conduite", "Avec séances", "Forfaits actifs"],
      plotOptions: {
        radialBar: {
          hollow: { size: "28%" },
          track: { background: "#f1f5f9" },
          dataLabels: {
            name: { fontWeight: 700, fontSize: "12px" },
            value: { fontWeight: 800, fontSize: "16px", formatter: (val) => `${Math.round(Number(val))}%` },
          },
        },
      },
      legend: { show: true, position: "bottom", fontWeight: 700, fontSize: "13px" },
    }),
    [],
  );

  const mixSeries = useMemo(() => {
    const elevesSafe = Math.max(eleves, 1);
    const forfaitsSafe = Math.max(forfaitsCount, 1);
    return [
      Math.round((withHours / elevesSafe) * 100),
      Math.round((withSeances / elevesSafe) * 100),
      Math.round((actifs / forfaitsSafe) * 100),
    ];
  }, [eleves, withHours, withSeances, actifs, forfaitsCount]);

  const topHours = useMemo(() => {
    return [...inscriptions]
      .filter((i) => i.heures_conduite_restantes > 0)
      .sort((a, b) => b.heures_conduite_restantes - a.heures_conduite_restantes)
      .slice(0, 8);
  }, [inscriptions]);

  const hoursOptions: ApexOptions = useMemo(
    () => ({
      chart: { type: "bar", toolbar: { show: false }, fontFamily: chartFont },
      colors: [ORANGE],
      plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: "58%" } },
      dataLabels: { enabled: true, formatter: (val) => `${val}h`, style: { fontWeight: 700 } },
      xaxis: { labels: { style: { fontWeight: 700 } } },
      yaxis: { labels: { style: { fontWeight: 700 }, maxWidth: 140 } },
      grid: { strokeDashArray: 4 },
      tooltip: { theme: "light" },
    }),
    [],
  );

  const hoursSeries = useMemo(
    () => [
      {
        name: "Heures restantes",
        data: topHours.map((i) => ({
          x: i.candidat_name.split(" ")[0] || i.candidat_name,
          y: i.heures_conduite_restantes,
        })),
      },
    ],
    [topHours],
  );

  if (loading) return <Loader variant="page" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="ck-title">Rapports</h2>
          <p className="ck-subtitle">Indicateurs et graphiques de pilotage de votre auto-école.</p>
        </div>
        <span
          className="flex items-center gap-2"
          style={{
            padding: "0.7rem 1.2rem",
            borderRadius: "999px",
            background: "rgba(0, 168, 89, 0.1)",
            color: "var(--ck-green)",
            fontWeight: 700,
            fontSize: "1.3rem",
          }}
        >
          <BarChart3 size={18} strokeWidth={2.4} />
          Analytics
        </span>
      </div>

      {error ? <p className="ck-empty">{error}</p> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Élèves inscrits" value={eleves} icon={Users} tone="green" />
        <KpiCard label="Séances planifiées" value={seances} icon={Activity} tone="blue" />
        <KpiCard label="Heures restantes" value={heures} icon={Clock3} tone="amber" hint="Conduite à consommer" />
        <KpiCard label="Moniteurs" value={moniteurs} icon={UserCheck} tone="slate" />
        <KpiCard label="Forfaits actifs" value={`${actifs}/${forfaitsCount}`} icon={Package} tone="green" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ComponentCard
          title="Activité globale"
          desc="Volumes élèves, séances, heures et moniteurs"
          className="xl:col-span-2"
          action={<Activity size={20} color="#00a859" strokeWidth={2.4} aria-hidden />}
        >
          <Chart options={activityOptions} series={activitySeries} type="bar" height={300} />
        </ComponentCard>
        <ComponentCard
          title="Catalogue forfaits"
          desc="Répartition actifs / inactifs"
          action={<PieChart size={20} color="#00a859" strokeWidth={2.4} aria-hidden />}
        >
          {forfaitsCount ? (
            <Chart options={forfaitOptions} series={forfaitSeries} type="donut" height={300} />
          ) : (
            <p className="ck-empty">Aucun forfait à afficher.</p>
          )}
        </ComponentCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ComponentCard
          title="Couverture pédagogique"
          desc="% d’élèves en conduite, avec séances, forfaits actifs"
          action={<Target size={20} color="#0ea5e9" strokeWidth={2.4} aria-hidden />}
        >
          <Chart options={mixOptions} series={mixSeries} type="radialBar" height={320} />
        </ComponentCard>
        <ComponentCard
          title="Heures restantes"
          desc="Top élèves avec du crédit conduite"
          action={<Clock3 size={20} color="#d97706" strokeWidth={2.4} aria-hidden />}
        >
          {topHours.length ? (
            <Chart options={hoursOptions} series={hoursSeries} type="bar" height={320} />
          ) : (
            <p className="ck-empty">Pas encore d’heures de conduite à suivre.</p>
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
