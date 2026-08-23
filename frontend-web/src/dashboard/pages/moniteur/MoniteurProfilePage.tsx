import { Badge, Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import ProfileEditor, { useProfileUser } from "../../components/ProfileEditor";

export default function MoniteurProfilePage() {
  const { t } = useTranslation();
  const user = useProfileUser();

  const sidebar = user?.school_name ? (
    <Card>
      <Card.Body>
        <h6 className="mb-3">{t("dashboard.profile.schoolAffiliation")}</h6>
        <p className="fw-semibold mb-2">{user.school_name}</p>
        <Badge bg={user.school_validated ? "success" : "warning"}>
          {user.school_validated
            ? t("dashboard.profile.schoolValidated")
            : t("dashboard.profile.schoolPending")}
        </Badge>
        <p className="text-muted small mt-3 mb-0">{t("dashboard.profile.moniteurSchoolHint")}</p>
      </Card.Body>
    </Card>
  ) : (
    <Card>
      <Card.Body>
        <h6 className="mb-2">{t("dashboard.profile.schoolAffiliation")}</h6>
        <p className="text-muted small mb-0">{t("dashboard.profile.moniteurNoSchool")}</p>
      </Card.Body>
    </Card>
  );

  return (
    <ProfileEditor
      title={t("dashboard.profile.title")}
      subtitle={t("dashboard.profile.moniteurSubtitle")}
      sidebar={sidebar}
    />
  );
}
