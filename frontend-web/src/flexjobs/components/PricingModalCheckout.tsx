import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ShieldCheck, ExternalLink, Globe } from "lucide-react";
import { createPortal } from "react-dom";
import { getAccessToken } from "../../lib/authApi";
import { initiatePayment } from "../../lib/payment-api";
import { SUPPORTED_COUNTRIES, type CountryCurrencyConfig } from "../../hooks/useCurrencyConversion";

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
    <div className="fj-mm-checkout-root" role="presentation">
      <button type="button" className="fj-pack-drawer-backdrop" aria-label="Fermer" onClick={onClose} />

      <div className="fj-mm-checkout" role="dialog" aria-modal="true" aria-labelledby="pricing-checkout-title" style={{ maxWidth: "52rem" }}>
        <header className="fj-mm-checkout__head">
          <button type="button" className="fj-mm-checkout__back" onClick={onClose}>
            <ArrowLeft size={18} strokeWidth={2} aria-hidden />
            <span>{t("packs.detail.close", "Fermer")}</span>
          </button>
          <h2 id="pricing-checkout-title">
            {t("pricingCheckout.title", "Souscription Abonnement")}
          </h2>
        </header>

        <div className="fj-mm-checkout__summary">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
            <span style={{ fontSize: "1.4rem", fontWeight: 700, textTransform: "uppercase", color: "var(--ck-green, #158a4e)" }}>
              {planTitle}
            </span>
            <span style={{ fontSize: "1.3rem", fontWeight: 600, color: "var(--fj-text-muted)" }}>
              {billingPeriod === "yearly" ? t("pricing.yearly", "Annuel") : t("pricing.monthly", "Mensuel")}
            </span>
          </div>

          <div style={{ margin: "1.2rem 0", padding: "1rem 1.2rem", background: "#f8fafc", borderRadius: "0.8rem", border: "1px solid #e2e8f0" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.8rem", fontSize: "1.3rem", fontWeight: 600, color: "#334155", marginBottom: "0.6rem" }}>
              <Globe size={16} />
              <span>{t("pricingCheckout.countryCurrency", "Pays & Devise de facturation")} :</span>
            </label>
            <select
              value={selectedCountry.countryCode}
              onChange={(e) => onCountryChange(e.target.value)}
              style={{
                width: "100%",
                padding: "0.8rem 1rem",
                borderRadius: "0.6rem",
                border: "1px solid #cbd5e1",
                fontSize: "1.4rem",
                fontWeight: 600,
                background: "#fff",
              }}
            >
              {SUPPORTED_COUNTRIES.map((c) => (
                <option key={c.countryCode} value={c.countryCode}>
                  {c.flag} {c.countryName} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          <p className="fj-mm-checkout__amount" style={{ fontSize: "1.8rem", margin: "1.2rem 0 0" }}>
            {t("packs.checkout.amount", "Montant")} :{" "}
            <strong style={{ color: "var(--ck-green-dark, #158a4e)" }}>
              {convertedPrice.amountFormatted} {convertedPrice.symbol}
            </strong>
            {selectedCountry.currency !== "XAF" && (
              <small style={{ display: "block", fontSize: "1.2rem", color: "var(--fj-text-muted)", fontWeight: 400, marginTop: "0.2rem" }}>
                (Soit environ {amountFcfa.toLocaleString("fr-FR")} FCFA)
              </small>
            )}
          </p>
        </div>

        <form className="fj-mm-checkout__form" onSubmit={(e) => void handleSubmit(e)}>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "1.2rem", borderRadius: "0.8rem", marginBottom: "1.6rem" }}>
            <p style={{ margin: 0, fontSize: "1.35rem", fontWeight: 600, color: "#166534", display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <ShieldCheck size={18} />
              <span>Paiement sécurisé via PawaPay</span>
            </p>
            <p style={{ margin: "0.4rem 0 0", fontSize: "1.25rem", color: "#15803d" }}>
              Vous allez être redirigé vers la passerelle PawaPay pour finaliser votre règlement via Mobile Money (Orange, MTN, Moov) ou Carte.
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
              <span className="fj-mm-checkout__logo fj-mm-checkout__logo--orange">Orange Money</span>
            </label>
            <label className={`fj-mm-checkout__provider${provider === "mtn" ? " is-active" : ""}`}>
              <input
                type="radio"
                name="provider"
                value="mtn"
                checked={provider === "mtn"}
                onChange={() => setProvider("mtn")}
              />
              <span className="fj-mm-checkout__logo fj-mm-checkout__logo--mtn">MTN MoMo / PawaPay</span>
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

          {error && (
            <div className="fj-mm-checkout__error" role="alert" style={{ marginBottom: "1.2rem" }}>
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="ck-public-btn ck-public-btn--primary fj-pack-drawer__cta"
            disabled={loading}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.8rem", width: "100%" }}
          >
            <span>{loading ? t("packs.checkout.redirecting", "Redirection vers PawaPay…") : "Payer via PawaPay"}</span>
            <ExternalLink size={18} />
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
