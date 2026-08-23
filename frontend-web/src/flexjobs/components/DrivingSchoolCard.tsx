import { Link } from "react-router";
import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DrivingSchool } from "../../data/mockDrivingSchools";
import { isDrivingSchoolNew } from "../../data/mockDrivingSchools";
import DrivingSchoolLogo from "./DrivingSchoolLogo";
import DrivingSchoolMeta from "./DrivingSchoolMeta";

type DrivingSchoolCardProps = {
  school: DrivingSchool;
  isNew?: boolean;
};

export default function DrivingSchoolCard({ school, isNew }: DrivingSchoolCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "fr";
  const location = `${school.city}${school.district ? `, ${school.district}` : ""}`;

  return (
    <article className="fj-job-card fj-school-card">
      <div className="fj-school-card__layout">
        <DrivingSchoolLogo school={school} size="md" className="fj-school-card__logo" />

        <div className="fj-school-card__body">
          <div className="fj-job-card__head">
            <h3>
              <Link to={`/auto-ecoles/${school.id}`}>{school.name}</Link>
            </h3>
          </div>

          <DrivingSchoolMeta
            school={school}
            isNew={isNew ?? isDrivingSchoolNew(school.id)}
            showPrice
          />

          <p className="fj-job-card__location">
            <MapPin size={14} aria-hidden />
            {location}
          </p>

          <p className="fj-job-card__excerpt">{school.description[lang]}</p>

          <Link to={`/auto-ecoles/${school.id}`} className="fj-job-card__cta">
            {t("schools.viewProfile")}
          </Link>
        </div>
      </div>
    </article>
  );
}
