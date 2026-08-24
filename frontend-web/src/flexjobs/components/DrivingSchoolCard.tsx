import { Link } from "react-router";
import { MapPin, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DrivingSchool } from "../../data/mockDrivingSchools";
import { formatForfaitPrice, isDrivingSchoolNew } from "../../data/mockDrivingSchools";
import DrivingSchoolLogo from "./DrivingSchoolLogo";
import DrivingSchoolMeta from "./DrivingSchoolMeta";

type DrivingSchoolCardProps = {
  school: DrivingSchool;
  isNew?: boolean;
  layout?: "list" | "grid";
};

function excerpt(text: string, max = 160): string {
  const clean = text.trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trimEnd()}…`;
}

export default function DrivingSchoolCard({
  school,
  isNew,
  layout = "list",
}: DrivingSchoolCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "fr";
  const location = `${school.city}${school.district ? `, ${school.district}` : ""}`;
  const showNew = isNew ?? isDrivingSchoolNew(school.id);
  const summary = excerpt(school.longDescription[lang] || school.description[lang]);

  if (layout === "grid") {
    return (
      <article className="fj-marketplace-card fj-marketplace-card--grid">
        <div className="fj-marketplace-card__preview">
          <DrivingSchoolLogo school={school} size="lg" className="fj-marketplace-card__logo" />
        </div>
        <div className="fj-marketplace-card__body">
          <h3>
            <Link to={`/auto-ecoles/${school.id}`}>{school.name}</Link>
          </h3>
          <DrivingSchoolMeta school={school} isNew={showNew} showPrice />
          <p className="fj-marketplace-card__location">
            <MapPin size={14} aria-hidden />
            {location}
          </p>
          <p className="fj-marketplace-card__excerpt">{summary}</p>
          <Link to={`/auto-ecoles/${school.id}`} className="fj-btn fj-btn--primary fj-btn--block">
            {t("schools.viewProfile")}
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="fj-marketplace-card fj-marketplace-card--list">
      <div className="fj-marketplace-card__preview">
        <DrivingSchoolLogo school={school} size="lg" className="fj-marketplace-card__logo" />
      </div>

      <div className="fj-marketplace-card__body">
        <div className="fj-marketplace-card__title-row">
          <h3>
            <Link to={`/auto-ecoles/${school.id}`}>{school.name}</Link>
          </h3>
          {showNew ? <span className="fj-marketplace-card__new">{t("schools.new")}</span> : null}
        </div>

        <p className="fj-marketplace-card__byline">
          {t("schools.certified")} · {location}
        </p>

        <p className="fj-marketplace-card__excerpt">{summary}</p>
        <p className="fj-marketplace-card__note">
          {t("schools.cardFeatureSuccess", { rate: school.successRate })} · {t("schools.cardFeaturePayment")}
        </p>
      </div>

      <aside className="fj-marketplace-card__aside">
        <p className="fj-marketplace-card__price">
          {t("schools.from")}{" "}
          <strong>
            {formatForfaitPrice(school.priceFrom, i18n.language)} {t("common.currency")}
          </strong>
        </p>

        <div className="fj-marketplace-card__rating" aria-label={t("schools.ratingAria", { rating: school.rating })}>
          <Star size={16} fill="currentColor" aria-hidden />
          <strong>{school.rating.toFixed(1)}</strong>
          <span>({school.reviewCount})</span>
        </div>

        <Link to={`/auto-ecoles/${school.id}`} className="fj-btn fj-btn--primary fj-marketplace-card__cta">
          {t("schools.viewProfile")}
        </Link>
      </aside>
    </article>
  );
}
