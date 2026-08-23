import { Star, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DrivingSchool } from "../../data/mockDrivingSchools";
import { isDrivingSchoolNew } from "../../data/mockDrivingSchools";

type DrivingSchoolMetaProps = {
  school: DrivingSchool;
  isNew?: boolean;
  showExcerpt?: boolean;
  showPrice?: boolean;
  showCertifiedSince?: boolean;
};

export function DrivingSchoolTags({ school, isNew }: Pick<DrivingSchoolMetaProps, "school" | "isNew">) {
  const { t } = useTranslation();
  const showNew = isNew ?? isDrivingSchoolNew(school.id);

  return (
    <div className="fj-job-card__tags">
      <span className="fj-job-card__tag fj-job-card__tag--brand">{t("schools.certified")}</span>
      {school.available ? (
        <span className="fj-job-card__tag fj-job-card__tag--success">{t("schools.available")}</span>
      ) : null}
      {showNew ? <span className="fj-job-card__tag fj-job-card__tag--new">{t("schools.new")}</span> : null}
      {school.reviewCount > 0 ? (
        <span className="fj-job-card__tag fj-job-card__tag--muted">
          <Star size={12} aria-hidden />
          {school.rating.toFixed(1)} ({school.reviewCount})
        </span>
      ) : null}
      <span className="fj-job-card__tag fj-job-card__tag--accent">
        <TrendingUp size={12} aria-hidden />
        {school.successRate}% {t("home.schoolsSuccessRate")}
      </span>
    </div>
  );
}

export function DrivingSchoolStarRating({ school }: Pick<DrivingSchoolMetaProps, "school">) {
  const { t } = useTranslation();

  if (school.reviewCount <= 0) {
    return null;
  }

  const stars = Array.from({ length: 5 }, (_, index) => {
    const threshold = index + 1;
    if (school.rating >= threshold) return "full";
    if (school.rating >= threshold - 0.5) return "half";
    return "empty";
  });

  return (
    <div
      className="fj-school-stars"
      aria-label={t("schoolDetail.ratingAria", {
        rating: school.rating.toFixed(1),
        count: school.reviewCount,
      })}
    >
      <span className="fj-school-stars__icons" aria-hidden>
        {stars.map((state, index) => (
          <Star
            key={index}
            size={16}
            className={`fj-school-stars__icon fj-school-stars__icon--${state}`}
          />
        ))}
      </span>
      <span className="fj-school-stars__score">{school.rating.toFixed(1)}</span>
      <span className="fj-school-stars__count">
        ({t("schoolDetail.reviews", { count: school.reviewCount })})
      </span>
    </div>
  );
}

export function DrivingSchoolPrice({ school }: Pick<DrivingSchoolMetaProps, "school">) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "fr";

  return (
    <p className="fj-school-card__price">
      {t("home.schoolsFrom")}{" "}
      <strong>
        {school.priceFrom.toLocaleString(lang === "en" ? "en-US" : "fr-FR")} {t("common.currency")}
      </strong>
    </p>
  );
}

export function DrivingSchoolCertifiedSince({ school }: Pick<DrivingSchoolMetaProps, "school">) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "fr";
  const date = new Date(school.certifiedSince).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", {
    month: "long",
    year: "numeric",
  });

  return <p className="fj-school-certified-since">{t("schoolDetail.certifiedSince", { date })}</p>;
}

export default function DrivingSchoolMeta({
  school,
  isNew,
  showExcerpt = false,
  showPrice = true,
  showCertifiedSince = false,
}: DrivingSchoolMetaProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "fr";

  return (
    <div className="fj-school-meta">
      <DrivingSchoolTags school={school} isNew={isNew} />
      <DrivingSchoolStarRating school={school} />
      {showPrice ? <DrivingSchoolPrice school={school} /> : null}
      {showExcerpt ? <p className="fj-job-card__excerpt fj-school-meta__excerpt">{school.description[lang]}</p> : null}
      {showCertifiedSince ? <DrivingSchoolCertifiedSince school={school} /> : null}
    </div>
  );
}
