import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Check, Clock3, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import Loader from "../../components/common/Loader";
import { CodakisWordmark } from "../components/BrandLogo";
import { getSession } from "../../auth/authStore";
import { getRoleDashboardPath } from "../../auth/roles";
import { AUTH_PATHS } from "../../constants/authPaths";
import { getAccessToken } from "../../lib/authApi";
import { confirmPaymentWithRetry, getPaymentStatus, type PaymentStatusResult } from "../../lib/payment-api";

type ViewStatus = "loading" | "success" | "pending" | "rejected";

function formatAmount(amount?: number) {
  if (!amount) return null;
  return `${amount.toLocaleString("fr-FR")} FCFA`;
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
      setMessage("Connectez-vous pour voir le résultat de votre paiement.");
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
          setMessage("Le paiement a été refusé ou annulé. Aucun montant n'a été encaissé.");
          return;
        }
        const confirmed = await confirmPaymentWithRetry(token, ref);
        setPayment(confirmed);
        if (confirmed.status === "completed") {
          setStatus("success");
          setMessage("Votre paiement est confirmé. Un e-mail de reçu vient de vous être envoyé.");
        } else if (confirmed.status === "failed") {
          setStatus("rejected");
          setMessage("Le paiement a été refusé. Vous pouvez réessayer depuis les tarifs.");
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
  const spaceHref = session ? getRoleDashboardPath(session.role) : AUTH_PATHS.login;
  const amount = formatAmount(payment?.amount_fcfa);
  const title =
    status === "success" ? "Paiement confirmé" : status === "pending" ? "Paiement en attente" : "Paiement refusé";
  const Icon = status === "success" ? Check : status === "pending" ? Clock3 : X;

  return (
    <section className="ck-pay-result">
      <div className={`ck-pay-result__shell is-${status}`}>
        <aside className="ck-pay-result__brand" aria-hidden>
          <CodakisWordmark className="ck-pay-result__logo" />
          <img src="/images/auth/cartoon-red-car.png" alt="" className="ck-pay-result__car" width={280} height={200} />
          <p className="ck-pay-result__brand-text">Paiement sécurisé Mobile Money — CODAKIS</p>
        </aside>

        <article className="ck-pay-result__card">
          <span className="ck-pay-result__badge" aria-hidden>
            <Icon size={28} strokeWidth={2.6} />
          </span>
          <p className="ck-pay-result__eyebrow">CODAKIS</p>
          <h1>{title}</h1>
          <p className="ck-pay-result__lead">{message}</p>
          <dl className="ck-pay-result__meta">
            {amount ? (
              <div>
                <dt>Montant</dt>
                <dd>{amount}</dd>
              </div>
            ) : null}
            {ref ? (
              <div>
                <dt>Référence</dt>
                <dd>{ref}</dd>
              </div>
            ) : null}
            {payment?.channel ? (
              <div>
                <dt>Canal</dt>
                <dd>{payment.channel}</dd>
              </div>
            ) : null}
          </dl>
          <div className="ck-pay-result__actions">
            {status === "success" ? (
              <Link to={spaceHref} className="ck-public-btn ck-public-btn--primary">
                Accéder à mon espace
              </Link>
            ) : (
              <Link to="/tarifs" className="ck-public-btn ck-public-btn--primary">
                {status === "pending" ? "Retour aux tarifs" : "Réessayer le paiement"}
              </Link>
            )}
            <Link to="/" className="ck-public-btn ck-public-btn--ghost">
              Retour à l&apos;accueil
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
