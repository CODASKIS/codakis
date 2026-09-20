import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ShieldCheck, ExternalLink, Globe, X } from "lucide-react";
import { createPortal } from "react-dom";
import { getAccessToken } from "../../lib/authApi";
import { initiatePayment } from "../../lib/payment-api";
import { SUPPORTED_COUNTRIES, type CountryCurrencyConfig } from "../../hooks/useCurrencyConversion";
import { CodakisWordmark } from "./BrandLogo";

type PricingModalCheckoutProps = {
  open: boolean;
  onClose: () => void;
  planId: string;
  planTitle: string;
  billingPeriod: "monthly" | "yearly";
  amountFcfa: number;
  selectedCountry: CountryCurrencyConfig;
  convertedPrice: { amountFormatted: string; symbol: string; rawAmount: number };
  onCountryChange: (countryCode: string) => void;
};

export default function PricingModalCheckout({
  open,
  onClose,
  planId,
  planTitle,
  billingPeriod,
  amountFcfa,
  selectedCountry,
  convertedPrice,
  onCountryChange,
}: PricingModalCheckoutProps) {
  const { t } = useTranslation();
  const [provider, setProvider] = useState<"orange" | "mtn">("orange");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) {
      setError(t("pricingCheckout.loginRequired", "Veuillez vous connecter pour procéder au paiement."));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await initiatePayment(token, {
        plan_id: planId,
        billing_period: billingPeriod,
        payment_method: provider,
        phone: phone.trim() || undefined,
        purpose: "subscription",
      });

      if (result.payment_url) {
        window.location.href = result.payment_url;
      } else {
        setError(result.message || t("pricingCheckout.initiated", "Demande initiée. Veuillez valider le paiement."));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("packs.checkout.error", "Une erreur est survenue."));
    } finally {
      setLoading(false);
    }
  }

  return createPortal(
    <div className="fj-mm-checkout-root fj-mm-checkout-root--duo" role="presentation">
      <button type="button" className="fj-pack-drawer-backdrop" aria-label={t("packs.detail.close", "Fermer")} onClick={onClose} />

      <div
        className="fj-mm-checkout fj-mm-checkout--duo"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pricing-checkout-title"
      >
        <header className="fj-mm-checkout__chrome">
          <button type="button" className="fj-mm-checkout__icon-btn" onClick={onClose} aria-label={t("packs.detail.close", "Retour")}>
            <ArrowLeft size={22} strokeWidth={2.4} aria-hidden />
          </button>
          <CodakisWordmark className="fj-mm-checkout__brand" />
          <button type="button" className="fj-mm-checkout__icon-btn" onClick={onClose} aria-label={t("packs.detail.close", "Fermer")}>
            <X size={22} strokeWidth={2.4} aria-hidden />
          </button>
        </header>

        <div className="fj-mm-checkout__body">
          <h2 id="pricing-checkout-title" className="fj-mm-checkout__question">
            {t("pricingCheckout.title", "Finaliser votre abonnement")}
          </h2>

          <div className="fj-mm-checkout__summary fj-mm-checkout__summary--card">
            <div className="fj-mm-checkout__plan-row">
              <span className="fj-mm-checkout__plan-badge">{planTitle}</span>
              <span className="fj-mm-checkout__plan-period">
                {billingPeriod === "yearly" ? t("pricing.yearly", "Annuel") : t("pricing.monthly", "Mensuel")}
              </span>
            </div>

            <div className="fj-mm-checkout__country">
              <label className="fj-mm-checkout__country-label">
                <Globe size={16} aria-hidden />
                <span>{t("pricingCheckout.countryCurrency", "Pays & devise")}</span>
              </label>
              <select
                value={selectedCountry.countryCode}
                onChange={(e) => onCountryChange(e.target.value)}
                className="fj-mm-checkout__country-select"
              >
                {SUPPORTED_COUNTRIES.map((c) => (
                  <option key={c.countryCode} value={c.countryCode}>
                    {c.flag} {c.countryName} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <p className="fj-mm-checkout__amount">
              {t("packs.checkout.amount", "Montant")} :{" "}
              <strong>
                {convertedPrice.amountFormatted} {convertedPrice.symbol}
              </strong>
              {selectedCountry.currency !== "XAF" ? (
                <small>(Soit environ {amountFcfa.toLocaleString("fr-FR")} FCFA)</small>
              ) : null}
            </p>
          </div>

          <form className="fj-mm-checkout__form" onSubmit={(e) => void handleSubmit(e)}>
            <div className="fj-mm-checkout__secure-banner">
              <p>
                <ShieldCheck size={18} aria-hidden />
                <span>Paiement sécurisé via PawaPay</span>
              </p>
              <p>
                Vous allez être redirigé vers la passerelle PawaPay pour finaliser votre règlement via Mobile Money
                (Orange, MTN, Moov) ou Carte.
              </p>
            </div>

            <fieldset className="fj-mm-checkout__providers">
              <legend>{t("packs.checkout.provider", "Moyen de paiement")}</legend>
              <label className={`fj-mm-checkout__provider${provider === "orange" ? " is-active" : ""}`}>
                <input
                  type="radio"
                  name="provider"
                  value="orange"
                  checked={provider === "orange"}
                  onChange={() => setProvider("orange")}
                />
                <span className="fj-mm-checkout__logo-chip fj-mm-checkout__logo--orange">Orange Money</span>
              </label>
              <label className={`fj-mm-checkout__provider${provider === "mtn" ? " is-active" : ""}`}>
                <input
                  type="radio"
                  name="provider"
                  value="mtn"
                  checked={provider === "mtn"}
                  onChange={() => setProvider("mtn")}
                />
                <span className="fj-mm-checkout__logo-chip fj-mm-checkout__logo--mtn">MTN MoMo / PawaPay</span>
              </label>
            </fieldset>

            <label className="fj-mm-checkout__field">
              <span>{t("packs.checkout.phone", "Numéro Mobile Money (optionnel)")}</span>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="6XX XX XX XX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <small>{t("packs.checkout.phoneHint", "Permet de pré-remplir le numéro sur la page PawaPay")}</small>
            </label>

            {error ? (
              <div className="fj-mm-checkout__error" role="alert">
                <p>{error}</p>
              </div>
            ) : null}

            <button type="submit" className="fj-mm-checkout__continue" disabled={loading}>
              <span>{loading ? t("packs.checkout.redirecting", "Redirection vers PawaPay…") : "Continuer"}</span>
              {!loading ? <ExternalLink size={18} aria-hidden /> : null}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
