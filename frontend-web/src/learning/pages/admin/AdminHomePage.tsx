import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Building2, CreditCard, Users } from "lucide-react";
import Loader from "../../../components/common/Loader";
import { fetchAdminUsers, fetchPendingSchools } from "../../../lib/authApi";
import { fetchAdminPaymentStats, type AdminPaymentStats } from "../../../lib/payment-api";

export default function AdminHomePage() {
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(0);
  const [users, setUsers] = useState(0);
  const [pay, setPay] = useState<AdminPaymentStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetchPendingSchools().catch(() => []),
      fetchAdminUsers().catch(() => []),
      fetchAdminPaymentStats().catch(() => null),
    ])
      .then(([schools, userList, stats]) => {
        if (cancelled) return;
        setPending(schools.length);
        setUsers(userList.length);
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

  if (loading) return <Loader variant="page" />;

  return (
    <div className="ck-schools-stack">
      <section className="ck-schools-panel">
        <div className="ck-schools-panel__head">
          <h2>Console admin</h2>
          <p>Validation des auto-écoles, utilisateurs et paiements</p>
        </div>
        {error ? <p className="ck-empty">{error}</p> : null}
        <div className="ck-schools-report-grid">
          <article className="ck-schools-report-card">
            <strong>{pending}</strong>
            <span>Écoles à valider</span>
          </article>
          <article className="ck-schools-report-card">
            <strong>{users}</strong>
            <span>Utilisateurs</span>
          </article>
          <article className="ck-schools-report-card">
            <strong>{pay?.completed_count ?? 0}</strong>
            <span>Paiements OK</span>
          </article>
          <article className="ck-schools-report-card">
            <strong>{pay?.pending_count ?? 0}</strong>
            <span>Paiements en attente</span>
          </article>
        </div>
      </section>

      <div className="ck-schools-grid-2">
        <Link to="/espace/admin/ecoles" className="ck-schools-panel ck-pro__jump">
          <Building2 size={28} color="#f59e0b" />
          <div>
            <h3>Auto-écoles</h3>
            <p>Valider ou refuser les demandes d’agrément</p>
          </div>
        </Link>
        <Link to="/espace/admin/utilisateurs" className="ck-schools-panel ck-pro__jump">
          <Users size={28} color="#00a859" />
          <div>
            <h3>Utilisateurs</h3>
            <p>Comptes candidats, gérants et moniteurs</p>
          </div>
        </Link>
        <Link to="/espace/admin/paiements" className="ck-schools-panel ck-pro__jump">
          <CreditCard size={28} color="#0ea5e9" />
          <div>
            <h3>Paiements</h3>
            <p>Suivi Mobile Money et forfaits</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
