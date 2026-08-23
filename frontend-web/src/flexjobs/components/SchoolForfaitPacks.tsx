import { ArrowRight, Check, Info, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { AUTH_PATHS } from "../../constants/authPaths";
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
}: PackCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "fr";
  const showHours = type === "conduiteSeule" || type === "complet";
  const showCodeMode = type === "codeSeul";
  const featured = Boolean(forfait.featured);

  const signupHref = school
    ? `${AUTH_PATHS.register.candidat}?school=${encodeURIComponent(school.id)}`
    : AUTH_PATHS.register.candidat;

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
        <Link
          to={signupHref}
          className={`fj-pricing-dark__btn${featured ? " is-featured" : ""}`}
        >
          <span>{t("packs.signup")}</span>
          <ArrowRight size={20} strokeWidth={1.5} className="fj-pricing-dark__btn-icon" aria-hidden />
        </Link>
        <button type="button" className="fj-btn fj-btn--outline fj-btn--block fj-school-pack-card__secondary" onClick={onViewDetails}>
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

export default function SchoolForfaitPacks({ school, title, subtitle, className }: SchoolForfaitPacksProps) {
  const { t } = useTranslation();
  const [selectedHours, setSelectedHours] = useState<DrivingHourOption>(20);
  const [codeMode, setCodeMode] = useState<"salle" | "online">("salle");
  const [detailPack, setDetailPack] = useState<DetailSelection | null>(null);

  const signupHref = school
    ? `${AUTH_PATHS.register.candidat}?school=${encodeURIComponent(school.id)}`
    : AUTH_PATHS.register.candidat;

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

  return (
    <section className={`fj-school-forfait-packs${className ? ` ${className}` : ""}`} id="forfaits">
      <div className="fj-school-forfait-packs__head">
        <h2 className="fj-school-formations__title">{title ?? t("packs.title")}</h2>
        {subtitle ? <p className="fj-school-forfait-packs__subtitle">{subtitle}</p> : null}
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
          signupHref={signupHref}
        />
      ) : null}
    </section>
  );
}
