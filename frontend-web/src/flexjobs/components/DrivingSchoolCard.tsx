import { Link } from "react-router";
import { MapPin, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DrivingSchool } from "../../data/mockDrivingSchools";
import { isDrivingSchoolNew } from "../../data/mockDrivingSchools";
import DrivingSchoolLogo from "./DrivingSchoolLogo";

type DrivingSchoolCardProps = {
  school: DrivingSchool;
  isNew?: boolean;
  layout?: "list" | "grid";
};

export default function DrivingSchoolCard({
  school,
  isNew,
  layout = "list",
}: DrivingSchoolCardProps) {
  const { t } = useTranslation();
  const location = `${school.city}${school.district ? `, ${school.district}` : ""}`;
  const showNew = isNew ?? isDrivingSchoolNew(school.id);

  return (
    <article className={`ck-school-card${layout === "grid" ? " ck-school-card--grid" : ""}`}>
      <div className="ck-school-card__logo">
        <DrivingSchoolLogo school={school} size="md" />
      </div>
      <div>
        <h3>
          <Link to={`/auto-ecoles/${school.id}`}>{school.name}</Link>
        </h3>
        <p className="ck-school-card__meta">
          <span>
            <MapPin size={14} aria-hidden /> {location}
          </span>
          {showNew ? <span>{t("schools.new")}</span> : null}
          <span className="ck-school-card__rating">
            <Star size={14} fill="currentColor" aria-hidden />
            {school.rating.toFixed(1)}
          </span>
        </p>
      </div>
      <div className="ck-school-card__cta">
        <Link to={`/auto-ecoles/${school.id}`} className="ck-public-btn ck-public-btn--primary">
          {t("schools.viewProfile")}
        </Link>
      </div>
    </article>
  );
}
