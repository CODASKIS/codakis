import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  BadgeCheck,
  CircleAlert,
  Clock3,
  CreditCard,
  FileText,
  Hash,
  Mail,
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
import { CODAKIS_APP_VERSION } from "../../constants/appVersion";
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
    payment?.receipt_number
      ? { icon: FileText, label: "Reçu", value: payment.receipt_number }
      : null,
    payment?.channel ? { icon: CreditCard, label: "Canal", value: payment.channel } : null,
    {
      icon: ShieldCheck,
      label: "Statut",
      value: status === "success" ? "Validé" : status === "pending" ? "En attente" : "Refusé",
    },
  ].filter(Boolean) as { icon: typeof Wallet; label: string; value: string }[];

  return (
    <section className="ck-pay-result">
      <div className={`ck-pay-result__shell is-${status}`}>
        <aside className="ck-pay-result__brand">
          <CodakisWordmark className="ck-pay-result__logo" />
          <span className="ck-pay-result__version">v{CODAKIS_APP_VERSION}</span>
          <img
            src="/images/auth/cartoon-red-car.png"
            alt=""
            className="ck-pay-result__car"
            width={280}
            height={200}
          />
          <ul className="ck-pay-result__points">
            <li>
              <ShieldCheck size={18} aria-hidden />
              Paiement sécurisé Mobile Money
            </li>
            <li>
              <Mail size={18} aria-hidden />
              Confirmation par e-mail CODAKIS
            </li>
            <li>
              <BadgeCheck size={18} aria-hidden />
              Accès immédiat après validation
            </li>
          </ul>
        </aside>

        <article className="ck-pay-result__card">
          <span className={`ck-pay-result__badge is-${status}`} aria-hidden>
            <Icon size={32} strokeWidth={2.4} />
          </span>
          <p className="ck-pay-result__eyebrow">CODAKIS</p>
          <h1>{copy.title}</h1>
          <p className="ck-pay-result__lead">{message || copy.lead}</p>

          <div className="ck-pay-result__info">
            {rows.map(({ icon: RowIcon, label, value }) => (
              <div key={label} className="ck-pay-result__info-row">
                <span className="ck-pay-result__info-icon" aria-hidden>
                  <RowIcon size={18} strokeWidth={2.3} />
                </span>
                <div>
                  <span className="ck-pay-result__info-label">{label}</span>
                  <strong className="ck-pay-result__info-value">{value}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="ck-pay-result__actions">
            {status === "success" ? (
              <Link to={spaceHref} className="ck-public-btn ck-public-btn--primary">
                Accéder à mon espace
              </Link>
            ) : (
              <Link to="/tarifs" className="ck-public-btn ck-public-btn--primary">
                <RefreshCw size={18} aria-hidden />
                {status === "pending" ? "Retour aux tarifs" : "Réessayer le paiement"}
              </Link>
            )}
            <Link
              to={status === "rejected" && !token ? AUTH_PATHS.login : "/"}
              className="ck-public-btn ck-public-btn--ghost"
            >
              {status === "rejected" && !token ? "Se connecter" : "Retour à l'accueil"}
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
