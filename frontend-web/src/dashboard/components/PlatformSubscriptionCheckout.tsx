import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { hydrateSessionFromApi } from "../../auth/authStore";
import { getAccessToken } from "../../lib/authApi";
import {
  confirmPaymentWithRetry,
  getPlanPricing,
  initiatePayment,
  type InitiatePaymentResult,
  type PlanPricing,
} from "../../lib/payment-api";

type PlatformSubscriptionCheckoutProps = {
  open: boolean;
  onClose: () => void;
  planId?: string;
  billingPeriod?: "monthly" | "yearly";
  onSuccess?: () => void;
};

type Provider = "orange" | "mtn";

const PLAN_LABELS: Record<string, string> = {
  pro: "Pro",
  premium: "Premium",
  entreprise: "Entreprise",
};

export default function PlatformSubscriptionCheckout({
  open,
  onClose,
  planId = "premium",
  billingPeriod = "monthly",
  onSuccess,
}: PlatformSubscriptionCheckoutProps) {
  const { t, i18n } = useTranslation();
  const [provider, setProvider] = useState<Provider>("orange");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"form" | "pending" | "error">("form");
  const [loading, setLoading] = useState(false);
  const [pricing, setPricing] = useState<PlanPricing | null>(null);
  const [initResult, setInitResult] = useState<InitiatePaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    void getPlanPricing().then(setPricing).catch(() => setPricing(null));
  }, [open]);

  if (!open) return null;

  const amount =
    billingPeriod === "yearly"
      ? (pricing?.[`${planId}_yearly` as keyof PlanPricing] as number | undefined) ??
        (planId === "pro" ? 50000 : 150000)
      : (pricing?.[planId as keyof PlanPricing] as number | undefined) ?? (planId === "pro" ? 5000 : 15000);

  const formatAmount = (value: number) =>
    new Intl.NumberFormat(i18n.language.startsWith("en") ? "en-GB" : "fr-FR", {
      maximumFractionDigits: 0,
    }).format(value);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const token = getAccessToken();
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const result = await initiatePayment(token, {
        plan_id: planId,
        payment_method: provider,
        phone: phone.trim(),
        purpose: "subscription",
        billing_period: billingPeriod,
      });
      setInitResult(result);
      setStep("pending");

      await confirmPaymentWithRetry(token, result.reference);
      await hydrateSessionFromApi();
      onSuccess?.();
      onClose();
    } catch (err) {
      setStep("error");
      setError(err instanceof Error ? err.message : t("packs.checkout.error"));
    } finally {
      setLoading(false);
    }
  }

  return createPortal(
    <div className="fj-mm-checkout-root" role="presentation">
      <button type="button" className="fj-pack-drawer-backdrop" aria-label={t("packs.detail.close")} onClick={onClose} />

      <div className="fj-mm-checkout" role="dialog" aria-modal="true" aria-labelledby="fj-sub-checkout-title">
        <header className="fj-mm-checkout__head">
          <button type="button" className="fj-mm-checkout__back" onClick={onClose}>
            <ArrowLeft size={18} strokeWidth={2} aria-hidden />
            <span>{t("packs.detail.close")}</span>
          </button>
          <h2 id="fj-sub-checkout-title">{t("dashboard.profile.subscriptionCheckoutTitle")}</h2>
        </header>

        <div className="fj-mm-checkout__summary">
          <p className="fj-mm-checkout__school">CODAKIS</p>
          <p className="fj-mm-checkout__forfait">
            {t("dashboard.profile.subscriptionPlan", { plan: PLAN_LABELS[planId] ?? planId })}
            {" · "}
            {billingPeriod === "yearly" ? t("pricing.yearly") : t("pricing.monthly")}
          </p>
          <p className="fj-mm-checkout__amount">
            {t("packs.checkout.amount")} :{" "}
            <strong>
              {formatAmount(amount)} {t("common.currency")}
            </strong>
          </p>
          <p className="small text-muted mb-0">{t("candidat.pedagogy.platformPaywallLead")}</p>
        </div>

        {step === "form" ? (
          <form className="fj-mm-checkout__form" onSubmit={(e) => void handleSubmit(e)}>
            <fieldset className="fj-mm-checkout__providers">
              <legend>{t("packs.checkout.provider")}</legend>
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
                <span className="fj-mm-checkout__logo fj-mm-checkout__logo--mtn">MTN MoMo</span>
              </label>
            </fieldset>

            <label className="fj-mm-checkout__field">
              <span>{t("packs.checkout.phone")}</span>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="6XX XX XX XX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                pattern="6[0-9]{8}"
              />
              <small>{t("packs.checkout.phoneHint")}</small>
            </label>

            <p className="fj-mm-checkout__secure">
              <ShieldCheck size={16} strokeWidth={2} aria-hidden />
              {t("packs.checkout.secure")}
            </p>

            <button type="submit" className="fj-pack-drawer__cta fj-pack-drawer__cta--primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="fj-spin" aria-hidden />
                  {t("packs.checkout.confirming")}
                </>
              ) : (
                t("packs.checkout.submit")
              )}
            </button>
          </form>
        ) : null}

        {step === "pending" && initResult ? (
          <div className="fj-mm-checkout__pending">
            <p className="fj-mm-checkout__ussd-title">{t("packs.checkout.ussdTitle")}</p>
            <p>{initResult.message}</p>
            {initResult.ussd_hint ? <p className="fj-mm-checkout__ussd">{initResult.ussd_hint}</p> : null}
            <p className="fj-mm-checkout__ref">
              Réf. <code>{initResult.reference}</code>
            </p>
          </div>
        ) : null}

        {step === "error" ? (
          <div className="fj-mm-checkout__error" role="alert">
            <p>{error ?? t("packs.checkout.error")}</p>
            <button type="button" className="fj-pack-drawer__cta fj-pack-drawer__cta--secondary" onClick={() => setStep("form")}>
              {t("common.retry")}
            </button>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
