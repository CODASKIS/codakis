import { ArrowRight, Check, Info, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { isAuthenticatedForRole } from "../../auth/authStore";
import { isCandidateEnrolled } from "../../auth/candidateEnrollment";
import {
  DRIVING_HOUR_OPTIONS,
  formatForfaitPrice,
  getFeaturedForfait,
  getMinCodeComparePrice,
  getMinCodePrice,
  getMinComparePrice,
  getMinForfaitPrice,
  pickCodeForfait,
  pickForfaitByHours,
  type DrivingHourOption,
  type DrivingSchool,
  type SchoolForfait,
  type SchoolForfaitType,
} from "../../data/mockDrivingSchools";
import PackDetailDrawer from "./PackDetailDrawer";

const PACK_TYPES: SchoolForfaitType[] = ["codeSeul", "conduiteSeule", "complet"];

type SchoolForfaitPacksProps = {
  school?: DrivingSchool;
  title?: string;
  subtitle?: string;
  className?: string;
  /** Ouvre le tiroir du forfait après connexion / inscription (query ?buy=). */
  initialBuyForfaitId?: string | null;
};

type PackCardProps = {
  type: SchoolForfaitType;
  forfait: SchoolForfait;
  school?: DrivingSchool;
  selectedHours: DrivingHourOption;
  onHoursChange: (hours: DrivingHourOption) => void;
  codeMode: "salle" | "online";
  onCodeModeChange: (mode: "salle" | "online") => void;
  onViewDetails: () => void;
  onBuyNow: () => void;
};

function PackCard({
  type,
  forfait,
  school,
  selectedHours,
  onHoursChange,
  codeMode,
  onCodeModeChange,
  onViewDetails,
  onBuyNow,
}: PackCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "fr";
  const showHours = type === "conduiteSeule" || type === "complet";
  const showCodeMode = type === "codeSeul";
  const featured = Boolean(forfait.featured);
  const isCandidat = isAuthenticatedForRole("candidat");
  const canPayNow = Boolean(school && isCandidat && !isCandidateEnrolled());

  return (
    <article
      className={`fj-pricing-dark__card fj-school-pack-card fj-school-pack-card--${type}${featured ? " is-featured" : ""}`}
      id={`forfaits-${type}`}
    >
      {featured ? (
        <span className="fj-pricing-plan__badge">
          <Star size={12} aria-hidden />
          {t("packs.featured")}
        </span>
      ) : null}

      <div className="fj-pricing-dark__header">
        <span className="fj-pricing-dark__tier">{t(`schoolDetail.tabs.${type}`)}</span>

        <div className="fj-pricing-dark__price-row">
          {forfait.comparePrice ? (
            <span className="fj-pricing-dark__price-compare">
              {formatForfaitPrice(forfait.comparePrice, i18n.language)} {t("common.currency")}
            </span>
          ) : null}
          <h2 className="fj-pricing-dark__price-title">
            {!school ? (
              <span className="fj-school-pack-card__from">{t("packs.from")} </span>
            ) : null}
            {formatForfaitPrice(forfait.price, i18n.language)}
          </h2>
          <span className="fj-pricing-dark__period">{t("common.currency")}</span>
        </div>

        <p className="fj-pricing-dark__price-note">{t("packs.schoolPrice")}</p>
        <p className="fj-pricing-dark__plan-name">{forfait.label[lang]}</p>
      </div>

      <ul className="fj-pricing-dark__features">
        <li>
          <Check size={20} strokeWidth={1.5} className="fj-pricing-dark__check" aria-hidden />
          <span>{forfait.description[lang]}</span>
        </li>
      </ul>

      {showCodeMode ? (
        <div
          className="fj-pricing-table__segments fj-school-pack-card__segments"
          role="group"
          aria-label={t("packs.codeModeAria")}
        >
          <button
            type="button"
            className={codeMode === "salle" ? "is-active" : undefined}
            onClick={() => onCodeModeChange("salle")}
          >
            {t("packs.codeSalle")}
          </button>
          <button
            type="button"
            className={codeMode === "online" ? "is-active" : undefined}
            onClick={() => onCodeModeChange("online")}
          >
            {t("packs.codeOnline")}
          </button>
        </div>
      ) : null}

      {showHours ? (
        <div
          className="fj-pricing-table__segments fj-school-pack-card__segments"
          role="group"
          aria-label={t("packs.hoursAria")}
        >
          {DRIVING_HOUR_OPTIONS.map((hours) => (
            <button
              key={hours}
              type="button"
              className={selectedHours === hours ? "is-active" : undefined}
              onClick={() => onHoursChange(hours)}
            >
              {hours} {t("packs.hoursShort")}
            </button>
          ))}
        </div>
      ) : null}

      <p className="fj-pricing-dark__price-note fj-school-pack-card__note">
        <Info size={14} aria-hidden />
        {school ? t("packs.noteSchool", { name: school.name }) : t("packs.noteOverview")}
      </p>

      <div className="fj-pricing-dark__footer fj-school-pack-card__footer">
        {school ? (
          <button
            type="button"
            className={`fj-pricing-dark__btn fj-pricing-dark__btn--as-button${featured ? " is-featured" : ""}`}
            onClick={canPayNow ? onBuyNow : onViewDetails}
          >
            <span>{canPayNow ? t("packs.buyForfait") : t("packs.chooseForfait")}</span>
            <ArrowRight size={20} strokeWidth={1.5} className="fj-pricing-dark__btn-icon" aria-hidden />
          </button>
        ) : (
          <Link
            to="/auto-ecoles"
            className={`fj-pricing-dark__btn${featured ? " is-featured" : ""}`}
          >
            <span>{t("packs.findSchool")}</span>
            <ArrowRight size={20} strokeWidth={1.5} className="fj-pricing-dark__btn-icon" aria-hidden />
          </Link>
        )}
        <button type="button" className="ck-public-btn ck-public-btn--ghost ck-public-btn--block fj-school-pack-card__secondary" onClick={onViewDetails}>
          {t("packs.viewContent")}
        </button>
      </div>
    </article>
  );
}

type DetailSelection = {
  type: SchoolForfaitType;
  forfait: SchoolForfait;
};

export default function SchoolForfaitPacks({
  school,
  title,
  subtitle,
  className,
  initialBuyForfaitId,
}: SchoolForfaitPacksProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const [selectedHours, setSelectedHours] = useState<DrivingHourOption>(20);
  const [codeMode, setCodeMode] = useState<"salle" | "online">("salle");
  const [detailPack, setDetailPack] = useState<DetailSelection | null>(null);

  useEffect(() => {
    setDetailPack(null);
  }, [location.pathname, location.search]);

  const packs = useMemo(() => {
    return PACK_TYPES.map((type) => {
      if (school) {
        const list = school.forfaits[type];
        if (type === "codeSeul") {
          return { type, forfait: pickCodeForfait(list, codeMode) };
        }
        if (type === "conduiteSeule" || type === "complet") {
          return { type, forfait: pickForfaitByHours(list, selectedHours) };
        }
        return { type, forfait: getFeaturedForfait(list) };
      }

      const price =
        type === "codeSeul"
          ? getMinCodePrice(codeMode)
          : getMinForfaitPrice(type, selectedHours);
      const comparePrice =
        type === "codeSeul"
          ? getMinCodeComparePrice(codeMode)
          : getMinComparePrice(type, selectedHours);
      const overviewForfait: SchoolForfait = {
        id: `overview-${type}`,
        label: { fr: t(`packs.overview.${type}.label`), en: t(`packs.overview.${type}.label`) },
        price,
        comparePrice,
        featured: type === "complet",
        drivingHours: type === "codeSeul" ? undefined : selectedHours,
        codeMode: type === "codeSeul" ? codeMode : undefined,
        description: {
          fr: t(`packs.overview.${type}.desc`),
          en: t(`packs.overview.${type}.desc`),
        },
      };
      return { type, forfait: overviewForfait };
    });
  }, [school, selectedHours, codeMode, t]);

  useEffect(() => {
    if (!detailPack) return;
    const updated = packs.find((pack) => pack.type === detailPack.type);
    if (updated) setDetailPack(updated);
  }, [packs, detailPack?.type]);

  useEffect(() => {
    if (!initialBuyForfaitId || detailPack) return;
    const match = packs.find((pack) => pack.forfait.id === initialBuyForfaitId);
    if (match) setDetailPack(match);
  }, [initialBuyForfaitId, packs, detailPack]);

  function handleBuyNow(type: SchoolForfaitType, forfait: SchoolForfait) {
    setDetailPack({ type, forfait });
  }

  return (
    <section className={`fj-school-forfait-packs${className ? ` ${className}` : ""}`} id="forfaits">
      <div className="fj-school-forfait-packs__head">
        <h2 className="fj-school-formations__title">{title ?? t("packs.title")}</h2>
        {subtitle ? <p className="fj-school-forfait-packs__subtitle">{subtitle}</p> : null}
        {school ? <p className="fj-school-forfait-packs__flow">{t("packs.purchaseFlowHint")}</p> : null}
      </div>

      <div className="fj-pricing-dark">
        <div className="fj-pricing-dark__row fj-pricing-dark__row--cols-3">
          {packs.map(({ type, forfait }) => (
            <PackCard
              key={type}
              type={type}
              forfait={forfait}
              school={school}
              selectedHours={selectedHours}
              onHoursChange={setSelectedHours}
              codeMode={codeMode}
              onCodeModeChange={setCodeMode}
              onViewDetails={() => setDetailPack({ type, forfait })}
              onBuyNow={() => handleBuyNow(type, forfait)}
            />
          ))}
        </div>
      </div>

      <p className="fj-pricing-table__footnote">{t("packs.footnote")}</p>

      {detailPack ? (
        <PackDetailDrawer
          open
          onClose={() => setDetailPack(null)}
          type={detailPack.type}
          forfait={detailPack.forfait}
          school={school}
        />
      ) : null}
    </section>
  );
}
