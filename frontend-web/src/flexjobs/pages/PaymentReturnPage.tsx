import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import Loader from "../../components/common/Loader";
import { getAccessToken } from "../../lib/authApi";
import { confirmPaymentWithRetry, getPaymentStatus } from "../../lib/payment-api";

export default function PaymentReturnPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const ref = params.get("ref") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "pending" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!ref) {
      setStatus("error");
      setMessage("Référence de paiement manquante.");
      return;
    }
    const token = getAccessToken();
    if (!token) {
      setStatus("error");
      setMessage("Connectez-vous pour finaliser votre paiement.");
      return;
    }

    void (async () => {
      try {
        const current = await getPaymentStatus(token, ref);
        if (current.status === "completed") {
          setStatus("success");
          setMessage("Paiement confirmé. Merci !");
          return;
        }
        const confirmed = await confirmPaymentWithRetry(token, ref);
        if (confirmed.status === "completed") {
          setStatus("success");
          setMessage("Paiement confirmé. Merci !");
        } else {
          setStatus("pending");
          setMessage("Paiement en cours de validation. Revenez dans quelques instants.");
        }
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Impossible de valider le paiement.");
      }
    })();
  }, [ref]);

  if (status === "loading") return <Loader variant="page" message={t("common.loading")} />;

  return (
    <div className="container py-5 text-center" style={{ maxWidth: 560, margin: "0 auto" }}>
      <h1 className="mb-3">
        {status === "success" ? "Paiement réussi" : status === "pending" ? "Paiement en attente" : "Paiement"}
      </h1>
      <p className="mb-4">{message}</p>
      {ref ? (
        <p className="text-muted small">
          Réf. <code>{ref}</code>
        </p>
      ) : null}
      <Link to="/" className="btn btn-success">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
