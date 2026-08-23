import { Card } from "react-bootstrap";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import ProfileEditor, { useProfileUser } from "../../components/ProfileEditor";

export default function GerantProfilePage() {
  const { t } = useTranslation();
  const user = useProfileUser();

  const sidebar = (
    <>
      <Card className="mb-4">
        <Card.Body>
          <h6 className="mb-2">{t("dashboard.nav.schoolProfile")}</h6>
          <p className="text-muted small mb-3">{t("dashboard.profile.gerantSchoolCardHint")}</p>
          <Link to="/espace/gerant/etablissement" className="btn btn-outline-primary btn-sm">
            {t("dashboard.profile.openSchoolProfile")}
          </Link>
        </Card.Body>
      </Card>
      {user?.school_name ? (
        <Card>
          <Card.Body>
            <h6 className="mb-2">{user.school_name}</h6>
            <p className="text-muted small mb-0">{t("dashboard.profile.gerantSchoolStatusHint")}</p>
          </Card.Body>
        </Card>
      ) : null}
    </>
  );

  return (
    <ProfileEditor
      title={t("dashboard.profile.title")}
      subtitle={t("dashboard.profile.gerantProfileSubtitle")}
      sidebar={sidebar}
    />
  );
}
