import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Banknote, CreditCard, Phone, Percent, Receipt } from "lucide-react";
import Loader from "../../../components/common/Loader";
import { fetchAdminPayments, type AdminPaymentItem } from "../../../lib/payment-api";
import PageBack from "../../common/PageBack";

function formatFcfa(n: number) {
  return `${n.toLocaleString("fr-FR")} FCFA`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("fr-FR");
}

function isPaid(status: string) {
  return status === "paid" || status === "completed" || status === "success";
}

export default function AdminPaymentDetail() {
  const { reference = "" } = useParams();
  const [item, setItem] = useState<AdminPaymentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchAdminPayments()
      .then((list) => {
        if (cancelled) return;
        setItem(list.find((p) => p.reference === decodeURIComponent(reference)) ?? null);
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
  }, [reference]);

  if (loading) return <Loader variant="page" />;
  if (!item) {
    return (
      <div className="space-y-4">
        <PageBack to="/espace/admin/paiements" />
        <p className="ck-empty">{error || "Paiement introuvable."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 ta-duo-detail">
      <div>
        <PageBack to="/espace/admin/paiements" label="Retour aux paiements" />
        <div className="ta-duo-detail__hero">
          <div className="ta-duo-detail__hero-icon" aria-hidden>
            <Receipt size={28} strokeWidth={2.4} />
          </div>
          <div className="ta-duo-detail__hero-text">
            <h2 className="ck-title">{item.receipt_number || item.reference}</h2>
            <div className="ta-duo-detail__meta">
              <span className={`ck-schools-pill${isPaid(item.status) ? " is-on" : " is-wait"}`}>{item.status}</span>
              <span className="ta-duo-detail__meta-sep">·</span>
              <span>{item.purpose}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ck-schools-metrics ta-duo-metrics">
        <div>
          <Banknote size={18} strokeWidth={2.4} aria-hidden />
          <strong>{formatFcfa(item.amount_fcfa)}</strong>
          <span>Montant</span>
        </div>
        <div>
          <CreditCard size={18} strokeWidth={2.4} aria-hidden />
          <strong>{item.channel || "—"}</strong>
          <span>Canal</span>
        </div>
        <div>
          <Phone size={18} strokeWidth={2.4} aria-hidden />
          <strong>{item.phone || "—"}</strong>
          <span>Téléphone</span>
        </div>
        <div>
          <Percent size={18} strokeWidth={2.4} aria-hidden />
          <strong>{formatFcfa(item.commission_fcfa ?? 0)}</strong>
          <span>Commission</span>
        </div>
      </div>

      <section className="ck-schools-panel">
        <div className="ck-schools-panel__head">
          <h2>Payeur</h2>
        </div>
        <ul className="ta-duo-facts">
          <li>
            <span>Nom</span>
            <strong>{item.payer_name || "—"}</strong>
          </li>
          <li>
            <span>E-mail</span>
            <strong>{item.payer_email || "—"}</strong>
          </li>
        </ul>
      </section>

      <section className="ck-schools-panel">
        <div className="ck-schools-panel__head">
          <h2>Contexte</h2>
        </div>
        <ul className="ta-duo-facts">
          <li>
            <span>École / forfait</span>
            <strong>
              {item.school_name || "—"}
              {item.forfait_label ? ` · ${item.forfait_label}` : ""}
            </strong>
          </li>
          <li>
            <span>Créé</span>
            <strong>{formatDate(item.created_at)}</strong>
          </li>
          <li>
            <span>Complété</span>
            <strong>{formatDate(item.completed_at)}</strong>
          </li>
          {item.message ? (
            <li>
              <span>Message</span>
              <strong>{item.message}</strong>
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
