import { ArrowRight, Check, Info, X } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { isAuthenticatedForRole } from "../../auth/authStore";
import { confirmForfaitPurchase } from "../../auth/candidateEnrollment";
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
  signupHref: string;
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

export default function PackDetailDrawer({
  open,
  onClose,
  type,
  forfait,
  school,
  signupHref,
}: PackDetailDrawerProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language.startsWith("en") ? "en" : "fr";
  const isCandidat = isAuthenticatedForRole("candidat");

  useDrawerEffects(open, onClose);

  if (!open) return null;

  const featureKeys = getFeatureKeys(type, forfait);
  const hours = forfait.drivingHours ?? 20;

  function handleMockPayment() {
    if (!school) return;
    confirmForfaitPurchase(school.id, forfait.id, lang);
    onClose();
    navigate("/espace/candidat/auto-ecole");
  }

  return (
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
        </div>

        <footer className="fj-pack-drawer__footer">
          {isCandidat && school ? (
            <button
              type="button"
              className="fj-pack-drawer__cta fj-pack-drawer__cta--primary"
              onClick={handleMockPayment}
            >
              <span>{t("packs.payMobileMoney")}</span>
              <ArrowRight size={20} strokeWidth={1.5} aria-hidden />
            </button>
          ) : (
            <Link to={signupHref} className="fj-pack-drawer__cta fj-pack-drawer__cta--primary">
              <span>{school ? t("packs.loginToPay") : t("packs.signup")}</span>
              <ArrowRight size={20} strokeWidth={1.5} aria-hidden />
            </Link>
          )}
          <button type="button" className="fj-pack-drawer__cta fj-pack-drawer__cta--secondary" onClick={onClose}>
            {t("packs.detail.close")}
          </button>
        </footer>
      </aside>
    </div>
  );
}
