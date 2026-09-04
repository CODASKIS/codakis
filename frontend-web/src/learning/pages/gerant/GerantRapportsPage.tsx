import { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import Loader from "../../../components/common/Loader";
import { fetchGerantMoniteurs } from "../../../lib/authApi";
import {
  fetchGerantForfaits,
  fetchGerantInscriptions,
  type GerantInscription,
} from "../../../lib/enrollmentsApi";

const GREEN = "#00a859";
const BLUE = "#38bdf8";
const ORANGE = "#f59e0b";
const PURPLE = "#8b5cf6";
const MUTED = "#94a3b8";

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

  const rows = useMemo(
    () => [
      { label: "Élèves inscrits", value: eleves },
      { label: "Séances planifiées", value: seances },
      { label: "Heures restantes", value: heures },
      { label: "Moniteurs", value: moniteurs },
      { label: "Forfaits actifs", value: `${actifs}/${forfaitsCount}` },
    ],
    [eleves, seances, heures, moniteurs, actifs, forfaitsCount],
  );

  const activityOptions: ApexOptions = useMemo(
    () => ({
      chart: { type: "bar", toolbar: { show: false }, fontFamily: "Nunito, system-ui, sans-serif" },
      colors: [GREEN],
      plotOptions: { bar: { borderRadius: 8, columnWidth: "48%" } },
      dataLabels: { enabled: false },
      xaxis: {
        categories: ["Élèves", "Séances", "Heures rest.", "Moniteurs"],
        labels: { style: { fontWeight: 700 } },
      },
      yaxis: { labels: { style: { fontWeight: 700 } } },
      grid: { strokeDashArray: 4 },
      tooltip: { theme: "light" },
    }),
    [],
  );

  const activitySeries = useMemo(
    () => [{ name: "Volume", data: [eleves, seances, heures, moniteurs] }],
    [eleves, seances, heures, moniteurs],
  );

  const forfaitOptions: ApexOptions = useMemo(
    () => ({
      chart: { type: "donut", fontFamily: "Nunito, system-ui, sans-serif" },
      labels: ["Actifs", "Inactifs"],
      colors: [GREEN, MUTED],
      legend: { position: "bottom", fontWeight: 700 },
      dataLabels: { enabled: true },
      plotOptions: {
        pie: {
          donut: {
            size: "62%",
            labels: {
              show: true,
              total: { show: true, label: "Forfaits", fontWeight: 800 },
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
      chart: { type: "radialBar", fontFamily: "Nunito, system-ui, sans-serif" },
      colors: [BLUE, ORANGE, PURPLE],
      labels: ["Avec conduite", "Avec séances", "Forfaits actifs"],
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: { fontWeight: 700 },
            value: { fontWeight: 800, formatter: (val) => `${Math.round(Number(val))}%` },
          },
        },
      },
      legend: { show: true, position: "bottom", fontWeight: 700 },
    }),
    [],
  );

  const mixSeries = useMemo(() => {
    const elevesSafe = Math.max(eleves, 1);
    const forfaitsSafe = Math.max(forfaitsCount, 1);
    const withSeances = inscriptions.filter((i) => i.seances_count > 0).length;
    return [
      Math.round((withHours / elevesSafe) * 100),
      Math.round((withSeances / elevesSafe) * 100),
      Math.round((actifs / forfaitsSafe) * 100),
    ];
  }, [eleves, withHours, inscriptions, actifs, forfaitsCount]);

  const topHours = useMemo(() => {
    return [...inscriptions]
      .filter((i) => i.heures_conduite_restantes > 0)
      .sort((a, b) => b.heures_conduite_restantes - a.heures_conduite_restantes)
      .slice(0, 8);
  }, [inscriptions]);

  const hoursOptions: ApexOptions = useMemo(
    () => ({
      chart: { type: "bar", toolbar: { show: false }, fontFamily: "Nunito, system-ui, sans-serif" },
      colors: [ORANGE],
      plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: "62%" } },
      dataLabels: { enabled: true, formatter: (val) => `${val}h` },
      xaxis: { labels: { style: { fontWeight: 700 } } },
      yaxis: {
        labels: {
          style: { fontWeight: 700 },
          maxWidth: 140,
        },
      },
      grid: { strokeDashArray: 4 },
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
    <div className="ck-schools-stack">
      <section className="ck-schools-panel">
        <div className="ck-schools-panel__head">
          <h2>Rapports</h2>
          <p>Vue d’ensemble et graphiques d’activité</p>
        </div>
        {error ? <p className="ck-empty">{error}</p> : null}
        <div className="ck-schools-report-grid">
          {rows.map((row) => (
            <article key={row.label} className="ck-schools-report-card">
              <strong>{row.value}</strong>
              <span>{row.label}</span>
            </article>
          ))}
        </div>
      </section>

      <div className="ck-schools-grid-2">
        <section className="ck-schools-panel">
          <h3 className="ck-schools-subtitle">Activité globale</h3>
          <Chart options={activityOptions} series={activitySeries} type="bar" height={280} />
        </section>
        <section className="ck-schools-panel">
          <h3 className="ck-schools-subtitle">Forfaits</h3>
          {forfaitsCount ? (
            <Chart options={forfaitOptions} series={forfaitSeries} type="donut" height={280} />
          ) : (
            <p className="ck-empty">Aucun forfait à afficher.</p>
          )}
        </section>
      </div>

      <div className="ck-schools-grid-2">
        <section className="ck-schools-panel">
          <h3 className="ck-schools-subtitle">Couverture</h3>
          <Chart options={mixOptions} series={mixSeries} type="radialBar" height={300} />
        </section>
        <section className="ck-schools-panel">
          <h3 className="ck-schools-subtitle">Heures restantes (top élèves)</h3>
          {topHours.length ? (
            <Chart options={hoursOptions} series={hoursSeries} type="bar" height={300} />
          ) : (
            <p className="ck-empty">Pas encore d’heures de conduite à suivre.</p>
          )}
        </section>
      </div>
    </div>
  );
}
