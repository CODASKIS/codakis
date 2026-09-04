import { useCallback, useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Eye, RefreshCw } from "lucide-react";
import Loader from "../../../components/common/Loader";
import {
  fetchAdminPaymentStats,
  fetchAdminPayments,
  type AdminPaymentItem,
  type AdminPaymentStats,
} from "../../../lib/payment-api";
import { useTablePagination } from "../../../hooks/useTablePagination";
import ComponentCard from "../../common/ComponentCard";
import Button from "../../ui/Button";
import Pagination from "../../ui/Pagination";
import TableActions from "../../ui/TableActions";

const GREEN = "#00a859";
const AMBER = "#f59e0b";
const RED = "#ef4444";
const BLUE = "#0ea5e9";

function formatFcfa(value: number) {
  return `${Number(value || 0).toLocaleString("fr-FR")} FCFA`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("fr-FR");
}

function isPaid(status: string) {
  return status === "paid" || status === "completed" || status === "success";
}

export default function AdminPayments() {
  const [stats, setStats] = useState<AdminPaymentStats | null>(null);
  const [items, setItems] = useState<AdminPaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [purposeFilter, setPurposeFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const [s, list] = await Promise.all([
      fetchAdminPaymentStats(),
      fetchAdminPayments({
        status: statusFilter === "all" ? undefined : statusFilter,
        purpose: purposeFilter === "all" ? undefined : purposeFilter,
        limit: 200,
      }),
    ]);
    setStats(s);
    setItems(list);
  }, [statusFilter, purposeFilter]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
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
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [
        item.reference,
        item.payer_name,
        item.payer_email,
        item.school_name,
        item.context_label,
        item.forfait_label,
        item.receipt_number,
        item.phone,
      ]
        .filter(Boolean)
        .some((part) => String(part).toLowerCase().includes(q)),
    );
  }, [items, search]);

  const { paginatedItems, page, setPage, pageSize, total } = useTablePagination(filtered, {
    pageSize: 15,
    resetKey: `${search}|${statusFilter}|${purposeFilter}`,
  });

  const barOptions: ApexOptions = useMemo(
    () => ({
      chart: { type: "bar", toolbar: { show: false }, fontFamily: "Nunito, system-ui, sans-serif" },
      colors: [GREEN, AMBER, BLUE],
      plotOptions: { bar: { borderRadius: 5, columnWidth: "45%", borderRadiusApplication: "end" } },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 4, colors: ["transparent"] },
      xaxis: {
        categories: ["Complétés", "Attente", "Inscriptions", "Abonnements"],
        labels: { style: { fontWeight: 700, fontSize: "13px" } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { labels: { style: { fontWeight: 700 } } },
      grid: { strokeDashArray: 4 },
      tooltip: { theme: "light" },
      legend: { show: false },
    }),
    [],
  );

  const barSeries = useMemo(
    () => [
      {
        name: "Volume",
        data: [
          stats?.completed_count ?? 0,
          stats?.pending_count ?? 0,
          stats?.enrollment_count ?? 0,
          stats?.subscription_count ?? 0,
        ],
      },
    ],
    [stats],
  );

  const donutOptions: ApexOptions = useMemo(
    () => ({
      chart: { type: "donut", fontFamily: "Nunito, system-ui, sans-serif" },
      labels: ["OK", "Attente", "Échec"],
      colors: [GREEN, AMBER, RED],
      legend: { position: "bottom", fontWeight: 700 },
      plotOptions: {
        pie: {
          donut: {
            size: "62%",
            labels: { show: true, total: { show: true, label: "Tx", fontWeight: 800 } },
          },
        },
      },
      dataLabels: { enabled: false },
    }),
    [],
  );

  const donutSeries = useMemo(
    () => [stats?.completed_count ?? 0, stats?.pending_count ?? 0, stats?.failed_count ?? 0],
    [stats],
  );

  if (loading && !stats) return <Loader variant="page" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="ck-title">Paiements</h2>
          <p className="ck-subtitle">Mobile Money · volume et transactions</p>
        </div>
        <Button variant="ghost" startIcon={<RefreshCw size={16} strokeWidth={2.5} />} onClick={() => void load()}>
          Actualiser
        </Button>
      </div>

      {error ? <p className="ck-empty">{error}</p> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="ck-schools-panel" style={{ margin: 0 }}>
          <strong className="ck-title" style={{ display: "block" }}>
            {formatFcfa(stats?.total_volume_fcfa ?? 0)}
          </strong>
          <span className="ck-empty">Volume total</span>
        </article>
        <article className="ck-schools-panel" style={{ margin: 0 }}>
          <strong className="ck-title" style={{ display: "block" }}>
            {stats?.completed_count ?? 0}
          </strong>
          <span className="ck-empty">Complétés</span>
        </article>
        <article className="ck-schools-panel" style={{ margin: 0 }}>
          <strong className="ck-title" style={{ display: "block" }}>
            {(stats?.commission_total_fcfa ?? 0).toLocaleString("fr-FR")} FCFA
          </strong>
          <span className="ck-empty">Commissions</span>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ComponentCard title="Activité paiements" desc="Style graphique TailAdmin">
          <Chart options={barOptions} series={barSeries} type="bar" height={260} />
        </ComponentCard>
        <ComponentCard title="Répartition statut">
          <Chart options={donutOptions} series={donutSeries} type="donut" height={260} />
        </ComponentCard>
      </div>

      <ComponentCard title="Transactions">
        <div className="ta-toolbar">
          <input
            className="ta-toolbar__search"
            type="search"
            placeholder="Réf., payeur, école…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="ta-toolbar__select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filtrer par statut"
          >
            <option value="all">Tous les statuts</option>
            <option value="completed">Complétés</option>
            <option value="pending">En attente</option>
            <option value="failed">Échoués</option>
          </select>
          <select
            className="ta-toolbar__select"
            value={purposeFilter}
            onChange={(e) => setPurposeFilter(e.target.value)}
            aria-label="Filtrer par motif"
          >
            <option value="all">Tous les motifs</option>
            <option value="enrollment">Inscription</option>
            <option value="subscription">Abonnement</option>
          </select>
        </div>

        <div className="ck-schools-table-wrap">
          <table className="ck-schools-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Statut</th>
                <th>Montant</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((item) => (
                <tr key={item.reference}>
                  <td>
                    <div className="ta-cell-stack">
                      <p className="ta-cell-stack__title">{item.receipt_number || item.reference.slice(0, 12)}</p>
                      <p className="ta-cell-stack__sub">
                        {item.context_label || item.school_name || item.payer_name || "—"}
                      </p>
                    </div>
                  </td>
                  <td>
                    <span className={`ck-schools-pill${isPaid(item.status) ? " is-on" : ""}`}>{item.status}</span>
                  </td>
                  <td>{formatFcfa(item.amount_fcfa)}</td>
                  <td>
                    <span className="ta-cell-stack__sub">{formatDate(item.created_at)}</span>
                  </td>
                  <td>
                    <TableActions
                      actions={[
                        {
                          label: "Voir",
                          icon: Eye,
                          to: `/espace/admin/paiements/${encodeURIComponent(item.reference)}`,
                          variant: "primary",
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length ? <p className="ck-empty">Aucun paiement.</p> : null}
        </div>
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </ComponentCard>
    </div>
  );
}
