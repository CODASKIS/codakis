import { ArrowRight, Check, Info, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { AUTH_PATHS } from "../../constants/authPaths";
import { getSession, isAuthenticatedForRole } from "../../auth/authStore";
import { isCandidateEnrolled } from "../../auth/candidateEnrollment";
import { getAccessToken } from "../../lib/authApi";
import { initiatePayment } from "../../lib/payment-api";
import {
  buildLoginUrlForPurchase,
  buildRegisterUrlForPurchase,
  purchaseIntentFromSchool,
  rememberPurchaseIntent,
} from "../../auth/purchaseIntent";
import {
  formatForfaitPrice,
  type DrivingSchool,
  type SchoolForfait,
  type SchoolForfaitType,
} from "../../data/mockDrivingSchools";

type PackDetailDrawerProps = {
  open: boolean;
  onClose: () => void;
  type: SchoolForfaitType;
  forfait: SchoolForfait;
  school?: DrivingSchool;
};

function useDrawerEffects(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);
}

function getFeatureKeys(type: SchoolForfaitType, forfait: SchoolForfait): string[] {
  if (type === "codeSeul") {
    return forfait.codeMode === "online"
      ? ["online1", "online2", "online3", "online4"]
      : ["salle1", "salle2", "salle3", "salle4"];
  }
  if (type === "conduiteSeule") {
    const keys = ["drive1", "drive2", "drive3"];
    if ((forfait.drivingHours ?? 0) >= 20) keys.push("drive4");
    return keys;
  }
  return ["full1", "full2", "full3", "full4", "full5"];
}

export default function PackDetailDrawer({ open, onClose, type, forfait, school }: PackDetailDrawerProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language.startsWith("en") ? "en" : "fr";
  const isCandidat = isAuthenticatedForRole("candidat");
  const session = getSession();
  const alreadyEnrolled = isCandidateEnrolled();
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useDrawerEffects(open, onClose);

  if (!open) return null;

  const featureKeys = getFeatureKeys(type, forfait);
  const hours = forfait.drivingHours ?? 20;

  const purchaseIntent =
    school && forfait.id
      ? purchaseIntentFromSchool(school.id, forfait.id, type)
      : null;

  async function handleStartPayment() {
    if (!school) return;
    const token = getAccessToken();
    if (!token) return;

    setPaying(true);
    setPaymentError(null);
    try {
      const result = await initiatePayment(token, {
        forfait_id: forfait.id,
        auto_ecole_id: school.id,
        payment_method: "orange",
        phone: session?.phone?.replace(/\D/g, "").slice(-9) ?? "",
        purpose: "enrollment",
      });
      if (result.payment_url) {
        window.location.href = result.payment_url;
        return;
      }
      setPaymentError(result.redirect_error ?? result.message ?? t("packs.checkout.redirectMissing"));
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : t("packs.checkout.error"));
    } finally {
      setPaying(false);
    }
  }

  function handleRememberAndNavigate(href: string) {
    if (purchaseIntent) rememberPurchaseIntent(purchaseIntent);
    onClose();
    navigate(href);
  }

  let primaryAction: ReactNode;

  if (!school) {
    primaryAction = (
      <Link to={AUTH_PATHS.register.candidat} className="fj-pack-drawer__cta fj-pack-drawer__cta--primary">
        <span>{t("packs.createFreeAccount")}</span>
        <ArrowRight size={20} strokeWidth={1.5} aria-hidden />
      </Link>
    );
  } else if (session && session.role !== "candidat") {
    primaryAction = (
      <p className="fj-pack-drawer__role-note">{t("packs.wrongRoleHint")}</p>
    );
  } else if (isCandidat && alreadyEnrolled) {
    primaryAction = (
      <Link to="/" className="fj-pack-drawer__cta fj-pack-drawer__cta--primary">
        <span>{t("packs.viewMySchool")}</span>
        <ArrowRight size={20} strokeWidth={1.5} aria-hidden />
      </Link>
    );
  } else if (isCandidat) {
    primaryAction = (
      <button
        type="button"
        className="fj-pack-drawer__cta fj-pack-drawer__cta--primary"
        onClick={handleStartPayment}
        disabled={paying}
      >
        <span>{paying ? t("packs.checkout.redirecting") : t("packs.payMobileMoney")}</span>
        <ArrowRight size={20} strokeWidth={1.5} aria-hidden />
      </button>
    );
  } else if (purchaseIntent) {
    primaryAction = (
      <>
        <button
          type="button"
          className="fj-pack-drawer__cta fj-pack-drawer__cta--primary"
          onClick={() => handleRememberAndNavigate(buildRegisterUrlForPurchase(purchaseIntent))}
        >
          <span>{t("packs.createFreeAccountAndPay")}</span>
          <ArrowRight size={20} strokeWidth={1.5} aria-hidden />
        </button>
        <button
          type="button"
          className="fj-pack-drawer__cta fj-pack-drawer__cta--secondary"
          onClick={() => handleRememberAndNavigate(buildLoginUrlForPurchase(purchaseIntent))}
        >
          {t("packs.loginToPay")}
        </button>
      </>
    );
  } else {
    primaryAction = (
      <Link to={AUTH_PATHS.register.candidat} className="fj-pack-drawer__cta fj-pack-drawer__cta--primary">
        <span>{t("packs.createFreeAccount")}</span>
        <ArrowRight size={20} strokeWidth={1.5} aria-hidden />
      </Link>
    );
  }

  return createPortal(
    <>
    <div className="fj-pack-drawer-root" role="presentation">
      <button type="button" className="fj-pack-drawer-backdrop" aria-label={t("packs.detail.close")} onClick={onClose} />

      <aside
        className={`fj-pack-drawer fj-pack-drawer--${type}${forfait.featured ? " is-featured" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fj-pack-drawer-title"
      >
        <header className="fj-pack-drawer__header">
          <button type="button" className="fj-pack-drawer__close" onClick={onClose} aria-label={t("packs.detail.close")}>
            <X size={22} strokeWidth={2} aria-hidden />
          </button>
        </header>

        <div className="fj-pack-drawer__body">
          <h2 id="fj-pack-drawer-title" className="fj-pack-drawer__title">
            {t(`schoolDetail.tabs.${type}`)}
          </h2>

          <p className="fj-pack-drawer__subtitle">
            <span>{forfait.label[lang]}</span>
            <Info size={16} aria-hidden className="fj-pack-drawer__subtitle-icon" />
          </p>

          {forfait.featured ? (
            <p className="fj-pack-drawer__badge">{t("packs.detail.bestOffer")}</p>
          ) : null}

          <div className="fj-pack-drawer__price-block">
            <p className="fj-pack-drawer__price">
              {formatForfaitPrice(forfait.price, i18n.language)}
              <span className="fj-pack-drawer__currency"> {t("common.currency")}</span>
            </p>
            {forfait.comparePrice ? (
              <p className="fj-pack-drawer__compare">
                <s>
                  {formatForfaitPrice(forfait.comparePrice, i18n.language)} {t("common.currency")}
                </s>
                <span>{t("packs.publicPrice")}</span>
              </p>
            ) : null}
          </div>

          <p className="fj-pack-drawer__flow-hint">{t("packs.purchaseFlowHint")}</p>

          <p className="fj-pack-drawer__includes">{t("packs.detail.includes")}</p>

          <ul className="fj-pack-drawer__features">
            {featureKeys.map((key) => (
              <li key={key}>
                <span className="fj-pack-drawer__check" aria-hidden>
                  <Check size={14} strokeWidth={2.5} />
                </span>
                <span>{t(`packs.detail.features.${type}.${key}`, { hours })}</span>
              </li>
            ))}
          </ul>

          {school ? (
            <p className="fj-pack-drawer__school">
              {t("packs.detail.schoolNote", { name: school.name })}
            </p>
          ) : null}

          {paymentError ? (
            <p className="fj-pack-drawer__payment-error" role="alert">
              {paymentError}
            </p>
          ) : null}
        </div>

        <footer className="fj-pack-drawer__footer">
          {primaryAction}
          <button type="button" className="fj-pack-drawer__cta fj-pack-drawer__cta--secondary" onClick={onClose}>
            {t("packs.detail.close")}
          </button>
        </footer>
      </aside>
    </div>
    </>,
    document.body,
  );
}
