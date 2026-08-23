import { useTranslation } from "react-i18next";
import ProfileEditor from "../../components/ProfileEditor";

export default function AdminProfilePage() {
  const { t } = useTranslation();

  return (
    <ProfileEditor
      title={t("dashboard.profile.title")}
      subtitle={t("dashboard.profile.adminProfileSubtitle")}
      showLanguage
    />
  );
}
