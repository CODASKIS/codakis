import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { getAccessToken } from "../../lib/authApi";
import {
  confirmPaymentWithRetry,
  getPlanPricing,
  initiatePayment,
  type InitiatePaymentResult,
} from "../../lib/payment-api";
import { formatForfaitPrice } from "../../data/mockDrivingSchools";

type MobileMoneyCheckoutProps = {
  open: boolean;
  onClose: () => void;
  amount: number;
  schoolId: string;
  schoolName: string;
  forfaitId: string;
  forfaitLabel: string;
  onSuccess: (paymentRef: string, receiptNumber?: string | null) => void;
};

type Provider = "orange" | "mtn";

export default function MobileMoneyCheckout({
  open,
  onClose,
  amount,
  schoolId,
  schoolName,
  forfaitId,
  forfaitLabel,
  onSuccess,
}: MobileMoneyCheckoutProps) {
  const { t, i18n } = useTranslation();
  const [provider, setProvider] = useState<Provider>("orange");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"form" | "pending" | "error">("form");
  const [loading, setLoading] = useState(false);
  const [initResult, setInitResult] = useState<InitiatePaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [commissionRate, setCommissionRate] = useState(10);

  useEffect(() => {
    if (!open) return;
    void getPlanPricing()
      .then((pricing) => setCommissionRate(pricing.platform_commission_rate_pct ?? 10))
      .catch(() => setCommissionRate(10));
  }, [open]);

  const estimatedCommission = Math.round(amount * commissionRate / 100);
  const estimatedPayout = amount - estimatedCommission;
  const split = initResult ?? {
    commission_rate_pct: commissionRate,
    commission_fcfa: estimatedCommission,
    school_payout_fcfa: estimatedPayout,
  };

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const token = getAccessToken();
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const result = await initiatePayment(token, {
        forfait_id: forfaitId,
        auto_ecole_id: schoolId,
        payment_method: provider,
        phone: phone.trim(),
        purpose: "enrollment",
      });
      setInitResult(result);
      if (result.payment_url) {
        window.location.href = result.payment_url;
        return;
      }
      setStep("pending");

      const confirmed = await confirmPaymentWithRetry(token, result.reference);
      onSuccess(result.reference, confirmed.message ?? null);
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

      <div className="fj-mm-checkout" role="dialog" aria-modal="true" aria-labelledby="fj-mm-checkout-title">
        <header className="fj-mm-checkout__head">
          <button type="button" className="fj-mm-checkout__back" onClick={onClose}>
            <ArrowLeft size={18} strokeWidth={2} aria-hidden />
            <span>{t("packs.detail.close")}</span>
          </button>
          <h2 id="fj-mm-checkout-title">{t("packs.checkout.title")}</h2>
        </header>

        <div className="fj-mm-checkout__summary">
          <p className="fj-mm-checkout__school">{schoolName}</p>
          <p className="fj-mm-checkout__forfait">{forfaitLabel}</p>
          <p className="fj-mm-checkout__amount">
            {t("packs.checkout.amount")} :{" "}
            <strong>
              {formatForfaitPrice(amount, i18n.language)} {t("common.currency")}
            </strong>
          </p>
          {split.commission_rate_pct != null && split.commission_fcfa != null ? (
            <div className="fj-mm-checkout__split">
              <p>
                {t("packs.checkout.schoolReceives")} :{" "}
                <strong>
                  {formatForfaitPrice(split.school_payout_fcfa ?? amount, i18n.language)}{" "}
                  {t("common.currency")}
                </strong>
              </p>
              <p className="fj-mm-checkout__commission">
                {t("packs.checkout.commissionNote", { rate: split.commission_rate_pct })}
              </p>
            </div>
          ) : null}
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
              {loading ? t("packs.checkout.confirming") : t("packs.checkout.submit")}
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
