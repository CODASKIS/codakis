import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  BadgeCheck,
  CircleAlert,
  Clock3,
  CreditCard,
  FileText,
  Hash,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Loader from "../../components/common/Loader";
import { CodakisWordmark } from "../components/BrandLogo";
import { getSession } from "../../auth/authStore";
import { getRoleDashboardPath } from "../../auth/roles";
import { AUTH_PATHS } from "../../constants/authPaths";
import { getAccessToken } from "../../lib/authApi";
import { confirmPaymentWithRetry, getPaymentStatus, type PaymentStatusResult } from "../../lib/payment-api";

type ViewStatus = "loading" | "success" | "pending" | "rejected";

function formatAmount(amount?: number | null) {
  if (amount == null || Number.isNaN(amount)) return null;
  return `${amount.toLocaleString("fr-FR")} FCFA`;
}

function statusCopy(status: Exclude<ViewStatus, "loading">) {
  if (status === "success") {
    return {
      title: "Paiement validé",
      lead: "Votre règlement a bien été reçu. Un e-mail de confirmation vient de partir.",
      Icon: BadgeCheck,
    };
  }
  if (status === "pending") {
    return {
      title: "Paiement en cours",
      lead: "La validation Mobile Money n'est pas encore finalisée. Vous recevrez un e-mail dès le résultat.",
      Icon: Clock3,
    };
  }
  return {
    title: "Paiement refusé",
    lead: "Le paiement n'a pas abouti. Aucun montant n'a été encaissé sur votre compte.",
    Icon: CircleAlert,
  };
}

export default function PaymentReturnPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const ref = params.get("ref") ?? "";
  const [status, setStatus] = useState<ViewStatus>("loading");
  const [message, setMessage] = useState("");
  const [payment, setPayment] = useState<PaymentStatusResult | null>(null);

  useEffect(() => {
    if (!ref) {
      setStatus("rejected");
      setMessage("La référence de paiement est manquante. Reprenez depuis la page des tarifs.");
      return;
    }
    const token = getAccessToken();
    if (!token) {
      setStatus("rejected");
      setMessage("Connectez-vous pour voir le résultat de votre paiement CODAKIS.");
      return;
    }

    void (async () => {
      try {
        const current = await getPaymentStatus(token, ref);
        setPayment(current);
        if (current.status === "completed") {
          setStatus("success");
          setMessage("Votre paiement est confirmé. Un e-mail de reçu vient de vous être envoyé.");
          return;
        }
        if (current.status === "failed") {
          setStatus("rejected");
          setMessage(current.message || "Le paiement a été refusé ou annulé. Aucun montant n'a été encaissé.");
          return;
        }
        const confirmed = await confirmPaymentWithRetry(token, ref);
        setPayment(confirmed);
        if (confirmed.status === "completed") {
          setStatus("success");
          setMessage("Votre paiement est confirmé. Un e-mail de reçu vient de vous être envoyé.");
        } else if (confirmed.status === "failed") {
          setStatus("rejected");
          setMessage(confirmed.message || "Le paiement a été refusé. Vous pouvez réessayer depuis les tarifs.");
        } else {
          setStatus("pending");
          setMessage("Le paiement est en cours de validation. Vous recevrez un e-mail dès qu'il sera confirmé ou refusé.");
        }
      } catch (err) {
        const text = err instanceof Error ? err.message : "Impossible de valider le paiement.";
        if (/échou/i.test(text) || /refus/i.test(text) || /fail/i.test(text)) {
          setStatus("rejected");
          setMessage("Le paiement a été refusé. Vous pouvez réessayer sans perdre votre compte.");
          return;
        }
        setStatus("rejected");
        setMessage(text);
      }
    })();
  }, [ref]);

  if (status === "loading") return <Loader variant="page" message={t("common.loading")} />;

  const session = getSession();
  const token = getAccessToken();
  const spaceHref = session ? getRoleDashboardPath(session.role) : AUTH_PATHS.login;
  const copy = statusCopy(status);
  const Icon = copy.Icon;
  const amount = formatAmount(payment?.amount_fcfa);
  const rows = [
    amount ? { icon: Wallet, label: "Montant", value: amount } : null,
    ref ? { icon: Hash, label: "Référence", value: ref } : null,
    payment?.receipt_number ? { icon: FileText, label: "Reçu", value: payment.receipt_number } : null,
    payment?.channel ? { icon: CreditCard, label: "Canal", value: payment.channel } : null,
    {
      icon: ShieldCheck,
      label: "Statut",
      value: status === "success" ? "Validé" : status === "pending" ? "En attente" : "Refusé",
    },
  ].filter(Boolean) as { icon: typeof Wallet; label: string; value: string }[];

  return (
    <section className={`ck-checkout ck-checkout--${status}`}>
      <header className="ck-checkout__top">
        <Link to="/" className="ck-checkout__brand" aria-label="CODAKIS">
          <CodakisWordmark className="ck-checkout__logo" />
        </Link>
      </header>

      <div className="ck-checkout__layout">
        <article className="ck-checkout__main">
          <div className={`ck-checkout__status is-${status}`}>
            <span className="ck-checkout__status-icon" aria-hidden>
              <Icon size={36} strokeWidth={2.4} />
            </span>
            <img
              src="/images/auth/cartoon-red-car.png"
              alt=""
              className="ck-checkout__car"
              width={160}
              height={114}
            />
            <h1>{copy.title}</h1>
            <p>{message || copy.lead}</p>
          </div>

          <div className="ck-checkout__actions">
            {status === "success" ? (
              <Link to={spaceHref} className="ck-checkout__btn ck-checkout__btn--primary">
                Accéder à mon espace
              </Link>
            ) : (
              <Link to="/tarifs" className="ck-checkout__btn ck-checkout__btn--primary">
                <RefreshCw size={18} aria-hidden />
                {status === "pending" ? "Retour aux tarifs" : "Réessayer le paiement"}
              </Link>
            )}
            <Link
              to={status === "rejected" && !token ? AUTH_PATHS.login : "/"}
              className="ck-checkout__btn ck-checkout__btn--ghost"
            >
              {status === "rejected" && !token ? "Se connecter" : "Retour à l'accueil"}
            </Link>
          </div>
        </article>

        <aside className="ck-checkout__aside">
          <h2>Détails de la commande</h2>
          <ul className="ck-checkout__lines">
            {rows.map(({ icon: RowIcon, label, value }) => (
              <li key={label}>
                <span className="ck-checkout__line-label">
                  <RowIcon size={16} aria-hidden />
                  {label}
                </span>
                <strong>{value}</strong>
              </li>
            ))}
          </ul>
          <div className="ck-checkout__total">
            <span>Total</span>
            <strong>{amount || "—"}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}
