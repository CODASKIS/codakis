import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  formatDrivingSchoolListLabel,
  groupDrivingSchoolsByCity,
  MOCK_DRIVING_SCHOOLS,
} from "../../data/mockDrivingSchools";
import Button from "./Button";
import Container from "./Container";

export default function HomeDrivingSchoolsSection() {
  const { t } = useTranslation();
  const cityGroups = groupDrivingSchoolsByCity(MOCK_DRIVING_SCHOOLS);

  return (
    <section className="fj-section fj-home-schools" aria-labelledby="home-schools-title">
      <Container>
        <div className="fj-home-schools__head">
          <div>
            <h2 id="home-schools-title">{t("home.schoolsTitle")}</h2>
            <p>{t("home.schoolsLead")}</p>
          </div>
          <Button href="/auto-ecoles" variant="outline">
            {t("nav.seeAllSchools")}
          </Button>
        </div>

        {cityGroups.length === 0 ? (
          <p className="fj-tech-empty">{t("home.schoolsEmpty")}</p>
        ) : (
          <div className="fj-home-schools__directory">
            {cityGroups.map((group) => (
              <div key={group.city} className="fj-home-schools__group">
                <h3 className="fj-home-schools__city">{group.city}</h3>
                <ul className="fj-home-schools__list">
                  {group.schools.map((school) => (
                    <li key={school.id}>
                      <Link to={`/auto-ecoles/${school.id}`}>
                        {formatDrivingSchoolListLabel(school)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="fj-home-schools__footer">
          <Link to="/auto-ecoles" className="fj-btn fj-btn--primary">
            {t("nav.seeAllSchools")}
          </Link>
        </div>
      </Container>
    </section>
  );
}
