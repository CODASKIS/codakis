import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Check, Minus, Sparkles, X } from "lucide-react";
import { AuthApiError, clearTokens, getAccessToken } from "../../../lib/authApi";
import { buildLoginUrl, rememberAuthRedirect } from "../../../auth/purchaseIntent";
import {
  detectVisitorCountry,
  getPlanPricing,
  initiatePayment,
  type PlanPricing,
} from "../../../lib/payment-api";
import { formatFcfa } from "../../../lib/planPricingDisplay";

const FREE_FEATURES = [
  { label: "3 premiers chapitres (Signalisation, Priorités, Circulation)", free: true, super: true },
  { label: "Quiz des modules gratuits", free: true, super: true },
  { label: "10 thèmes CEMAC complets", free: false, super: true },
  { label: "Examens blancs illimités", free: false, super: true },
  { label: "Cahier d’erreurs & stats avancées", free: false, super: true },
  { label: "Mode hors-ligne & révision ciblée", free: false, super: true },
] as const;

/** CODAKIS Super = abonnement candidat « pro » facturé au mois. */
const SUPER_PLAN_ID = "pro";
const SUPER_PATH = "/espace/candidat/super";

type Props = {
  embedded?: boolean;
};

export default function SuperUpgradePage({ embedded }: Props) {
  const navigate = useNavigate();
  const [pricing, setPricing] = useState<PlanPricing | null>(null);
  const [countryCode, setCountryCode] = useState("CM");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const country = await detectVisitorCountry().catch(() => "CM");
      if (cancelled) return;
      setCountryCode(country);
      try {
        const next = await getPlanPricing(country);
        if (!cancelled) setPricing(next);
      } catch {
        // Sans barème, on affiche le moyen de paiement sans le montant.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function goToLogin() {
    rememberAuthRedirect(SUPER_PATH);
    window.location.href = buildLoginUrl(SUPER_PATH);
  }

  /** Envoie directement sur la page de paiement de l’opérateur. */
  async function goToPayment() {
    const token = getAccessToken();
    if (!token) {
      goToLogin();
      return;
    }

    setPaying(true);
    setError("");
    try {
      const result = await initiatePayment(token, {
        plan_id: SUPER_PLAN_ID,
        billing_period: "monthly",
        payment_method: "orange",
        purpose: "subscription",
        country_code: countryCode,
      });
      if (result.payment_url) {
        window.location.href = result.payment_url;
        return;
      }
      setError(result.redirect_error || result.message || "Paiement indisponible pour le moment.");
    } catch (err) {
      if (err instanceof AuthApiError && err.status === 401) {
        clearTokens();
        goToLogin();
        return;
      }
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className={`ck-super${embedded ? " is-embedded" : ""}`}>
      <section className="ck-super__hero">
        {!embedded ? (
          <button type="button" className="ck-super__close" onClick={() => navigate(-1)} aria-label="Fermer">
            <X size={22} />
          </button>
        ) : null}
        <div className="ck-super__badge" aria-hidden>
          <Sparkles size={18} /> SUPER
        </div>
        <h1>
          Tu as <span>4×</span> plus de chances de réussir ton code au Cameroun !
        </h1>
        <p>Passe à CODAKIS Super pour débloquer tous les chapitres, les examens blancs et le suivi premium.</p>
        <div className="ck-super__mascot" aria-hidden>
          <Sparkles size={56} strokeWidth={1.5} />
        </div>
        <div className="ck-super__wave" aria-hidden />
      </section>

      <section className="ck-super__compare">
        <div className="ck-super__compare-head">
          <span />
          <strong>Gratuit</strong>
          <strong className="is-super">Super</strong>
        </div>
        <ul className="ck-super__rows">
          {FREE_FEATURES.map((row) => (
            <li key={row.label}>
              <span className="ck-super__feature">{row.label}</span>
              <span className="ck-super__cell" aria-label={row.free ? "Inclus" : "Non inclus"}>
                {row.free ? <Check size={20} className="is-ok" /> : <Minus size={18} className="is-no" />}
              </span>
              <span className="ck-super__cell is-highlight" aria-label="Inclus Super">
                <Check size={20} className="is-super-check" />
              </span>
            </li>
          ))}
        </ul>
        <p className="ck-super__price">
          {pricing ? (
            <>
              <strong>
                {formatFcfa(pricing.pro)} {pricing.symbol ?? "FCFA"} / mois
              </strong>{" "}
              —{" "}
            </>
          ) : null}
          Orange Money & MTN MoMo
        </p>
        <button
          type="button"
          className="ck-btn ck-btn--primary ck-btn--block ck-super__cta"
          onClick={() => void goToPayment()}
          disabled={paying}
        >
          {paying ? "Redirection vers le paiement…" : "Passer à Super"}
        </button>
        {error ? (
          <p className="ck-super__error" role="alert">
            {error}
          </p>
        ) : null}
        <button type="button" className="ck-super__skip" onClick={() => navigate("/espace/candidat")}>
          Non merci
        </button>
      </section>
    </div>
  );
}
