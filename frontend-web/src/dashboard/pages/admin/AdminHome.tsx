import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Building2, CreditCard, Newspaper, Users } from "lucide-react";
import Loader from "../../../components/common/Loader";
import { fetchAdminUsers, fetchAllSchools } from "../../../lib/authApi";
import { fetchAdminPaymentStats, type AdminPaymentStats } from "../../../lib/payment-api";
import ComponentCard from "../../common/ComponentCard";
import KpiCard from "../../common/KpiCard";

const GREEN = "#00a859";
const AMBER = "#f59e0b";
const BLUE = "#0ea5e9";
const MUTED = "#98a2b3";
const RED = "#ef4444";

export default function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingSchools, setPendingSchools] = useState(0);
  const [schoolsTotal, setSchoolsTotal] = useState(0);
  const [users, setUsers] = useState(0);
  const [byRole, setByRole] = useState({ candidat: 0, gerant: 0, moniteur: 0, admin: 0 });
  const [pay, setPay] = useState<AdminPaymentStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetchAllSchools().catch(() => []),
      fetchAdminUsers().catch(() => []),
      fetchAdminPaymentStats().catch(() => null),
    ])
      .then(([schools, userList, stats]) => {
        if (cancelled) return;
        setSchoolsTotal(schools.length);
        setPendingSchools(schools.filter((s) => s.status === "pending").length);
        setUsers(userList.length);
        setByRole({
          candidat: userList.filter((u) => u.role === "candidat").length,
          gerant: userList.filter((u) => u.role === "gerant").length,
          moniteur: userList.filter((u) => u.role === "moniteur").length,
          admin: userList.filter((u) => u.role === "admin").length,
        });
        setPay(stats);
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

  const barOptions: ApexOptions = useMemo(
    () => ({
      chart: { type: "bar", toolbar: { show: false }, fontFamily: "Nunito, system-ui, sans-serif" },
      colors: [GREEN],
      plotOptions: {
        bar: { borderRadius: 5, columnWidth: "39%", borderRadiusApplication: "end" },
      },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 4, colors: ["transparent"] },
      xaxis: {
        categories: ["Candidats", "Gérants", "Moniteurs", "Admins"],
        labels: { style: { fontWeight: 700, fontSize: "13px" } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { labels: { style: { fontWeight: 700 } } },
      grid: { yaxis: { lines: { show: true } }, strokeDashArray: 4 },
      tooltip: { theme: "light" },
      fill: { opacity: 1 },
    }),
    [],
  );

  const barSeries = useMemo(
    () => [{ name: "Comptes", data: [byRole.candidat, byRole.gerant, byRole.moniteur, byRole.admin] }],
    [byRole],
  );

  const donutOptions: ApexOptions = useMemo(
    () => ({
      chart: { type: "donut", fontFamily: "Nunito, system-ui, sans-serif" },
      labels: ["Complétés", "En attente", "Échoués"],
      colors: [GREEN, AMBER, RED],
      legend: { position: "bottom", fontWeight: 700, fontSize: "13px" },
      plotOptions: {
        pie: {
          donut: {
            size: "65%",
            labels: {
              show: true,
              total: { show: true, label: "Paiements", fontWeight: 800, fontSize: "14px" },
            },
          },
        },
      },
      dataLabels: { enabled: false },
    }),
    [],
  );

  const donutSeries = useMemo(
    () => [pay?.completed_count ?? 0, pay?.pending_count ?? 0, pay?.failed_count ?? 0],
    [pay],
  );

  if (loading) return <Loader variant="page" />;

  const kpis = [
    { label: "Écoles à valider", value: pendingSchools, hint: `${schoolsTotal} au total`, icon: Building2, tone: "amber" as const },
    { label: "Utilisateurs", value: users, hint: "Tous rôles", icon: Users, tone: "green" as const },
    {
      label: "Volume FCFA",
      value: (pay?.total_volume_fcfa ?? 0).toLocaleString("fr-FR"),
      hint: `${pay?.completed_count ?? 0} OK`,
      icon: CreditCard,
      tone: "blue" as const,
    },
    {
      label: "En attente paiement",
      value: pay?.pending_count ?? 0,
      hint: `${pay?.failed_count ?? 0} échoués`,
      icon: Newspaper,
      tone: "slate" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="ck-title">Console admin</h2>
        <p className="ck-subtitle">Écoles, utilisateurs, contenu pédagogique et paiements.</p>
      </div>
      {error ? <p className="ck-empty">{error}</p> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} hint={kpi.hint} tone={kpi.tone} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ComponentCard title="Répartition des comptes" desc="Volumes par rôle (style TailAdmin)">
          <Chart options={barOptions} series={barSeries} type="bar" height={280} />
        </ComponentCard>
        <ComponentCard title="Statut des paiements" desc="Mobile Money plateforme">
          <Chart options={donutOptions} series={donutSeries} type="donut" height={280} />
        </ComponentCard>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { to: "/espace/admin/ecoles", title: "Auto-écoles", desc: "Valider les agréments", icon: Building2, color: AMBER },
          { to: "/espace/admin/utilisateurs", title: "Utilisateurs", desc: "Créer, éditer, suspendre", icon: Users, color: GREEN },
          { to: "/espace/admin/paiements", title: "Paiements", desc: "Transactions & volume", icon: CreditCard, color: BLUE },
          { to: "/espace/admin/contenu", title: "Contenu", desc: "Thèmes & pédagogie", icon: Newspaper, color: MUTED },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="ck-schools-panel ck-pro__jump" style={{ textDecoration: "none" }}>
            <item.icon size={28} color={item.color} />
            <div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
