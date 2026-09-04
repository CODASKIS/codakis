import { useEffect, useState } from "react";
import Loader from "../../../components/common/Loader";
import {
  fetchAdminPaymentStats,
  fetchAdminPayments,
  type AdminPaymentItem,
  type AdminPaymentStats,
} from "../../../lib/payment-api";

export default function AdminPaymentsPage() {
  const [stats, setStats] = useState<AdminPaymentStats | null>(null);
  const [items, setItems] = useState<AdminPaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchAdminPaymentStats(), fetchAdminPayments({ limit: 40 })])
      .then(([s, list]) => {
        if (cancelled) return;
        setStats(s);
        setItems(list);
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

  if (loading) return <Loader variant="page" />;

  return (
    <div className="ck-schools-stack">
      <section className="ck-schools-panel">
        <div className="ck-schools-panel__head">
          <h2>Paiements</h2>
          <p>Vue d’ensemble Mobile Money</p>
        </div>
        {error ? <p className="ck-empty">{error}</p> : null}
        <div className="ck-schools-report-grid">
          <article className="ck-schools-report-card">
            <strong>{stats?.completed_count ?? 0}</strong>
            <span>Complétés</span>
          </article>
          <article className="ck-schools-report-card">
            <strong>{stats?.pending_count ?? 0}</strong>
            <span>En attente</span>
          </article>
          <article className="ck-schools-report-card">
            <strong>{(stats?.total_volume_fcfa ?? 0).toLocaleString("fr-FR")}</strong>
            <span>FCFA volume</span>
          </article>
        </div>
      </section>

      <section className="ck-schools-panel">
        <h3 className="ck-schools-subtitle">Dernières transactions</h3>
        <div className="ck-schools-table-wrap">
          <table className="ck-schools-table">
            <thead>
              <tr>
                <th>Réf.</th>
                <th>Statut</th>
                <th>Montant</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.reference}>
                  <td>
                    <strong>{item.receipt_number || item.reference.slice(0, 10)}</strong>
                    <div>
                      <small>{item.context_label || item.school_name || "—"}</small>
                    </div>
                  </td>
                  <td>
                    <span className={`ck-schools-pill${item.status === "paid" || item.status === "completed" || item.status === "success" ? " is-on" : ""}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{Number(item.amount_fcfa || 0).toLocaleString("fr-FR")} FCFA</td>
                  <td>{item.created_at ? new Date(item.created_at).toLocaleString("fr-FR") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!items.length ? <p className="ck-empty">Aucun paiement.</p> : null}
        </div>
      </section>
    </div>
  );
}
