import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { BarChart3, ClipboardList, Package, Users } from "lucide-react";
import Loader from "../../../components/common/Loader";
import { fetchGerantMoniteurs } from "../../../lib/authApi";
import {
  fetchGerantForfaits,
  fetchGerantInscriptions,
  type GerantInscription,
} from "../../../lib/enrollmentsApi";
import ComponentCard from "../../common/ComponentCard";
import KpiCard from "../../common/KpiCard";

const GREEN = "#00a859";
const MUTED = "#98a2b3";

export default function GerantHome() {
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

  const activityOptions: ApexOptions = useMemo(
    () => ({
      chart: { type: "bar", toolbar: { show: false }, fontFamily: "Nunito, system-ui, sans-serif" },
      colors: [GREEN],
      plotOptions: { bar: { borderRadius: 8, columnWidth: "48%" } },
      dataLabels: { enabled: false },
      xaxis: {
        categories: ["Élèves", "Séances", "Heures rest.", "Moniteurs"],
        labels: { style: { fontWeight: 700, fontSize: "13px" } },
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
      legend: { position: "bottom", fontWeight: 700, fontSize: "13px" },
      plotOptions: {
        pie: {
          donut: {
            size: "62%",
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

  if (loading) return <Loader variant="page" />;

  const kpis = [
    { label: "Élèves inscrits", value: eleves, icon: Users, tone: "green" as const },
    { label: "Séances planifiées", value: seances, icon: ClipboardList, tone: "blue" as const },
    { label: "Moniteurs", value: moniteurs, icon: Users, tone: "slate" as const },
    { label: "Forfaits actifs", value: `${actifs}/${forfaitsCount}`, icon: Package, tone: "amber" as const },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="ck-title">Accueil</h2>
        <p className="ck-subtitle">Pilotage de votre auto-école CODAKIS.</p>
      </div>

      {error ? <p className="ck-empty">{error}</p> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} tone={kpi.tone} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ComponentCard title="Activité" desc="Volume global de l’école" className="xl:col-span-2">
          <Chart options={activityOptions} series={activitySeries} type="bar" height={280} />
        </ComponentCard>
        <ComponentCard title="Forfaits" desc="Actifs vs inactifs">
          {forfaitsCount ? (
            <Chart options={forfaitOptions} series={forfaitSeries} type="donut" height={280} />
          ) : (
            <p className="ck-empty">Aucun forfait.</p>
          )}
        </ComponentCard>
      </div>

      <ComponentCard title="Actions rapides" desc="Accès directs">
        <div className="flex flex-wrap gap-3">
          <Link to="/espace/gerant/eleves" className="ck-btn ck-btn--primary">
            <Users size={16} /> Élèves
          </Link>
          <Link to="/espace/gerant/assigner" className="ck-btn ck-btn--ghost">
            <ClipboardList size={16} /> Assigner
          </Link>
          <Link to="/espace/gerant/rapports" className="ck-btn ck-btn--ghost">
            <BarChart3 size={16} /> Rapports
          </Link>
        </div>
      </ComponentCard>
    </div>
  );
}
