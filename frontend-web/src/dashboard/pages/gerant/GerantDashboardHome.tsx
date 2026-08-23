import { useTranslation } from "react-i18next";
import PageMeta from "../../../components/common/PageMeta";
import { DEFAULT_DRIVING_SCHOOL_LOGO } from "../../../constants/assets";
import { DashboardSection, PlaceholderPanel, StatCard } from "../../components/DashboardWidgets";

export default function GerantDashboardHome() {
  const { t } = useTranslation();

  return (
    <>
      <PageMeta title={t("dashboard.gerant.metaTitle")} description={t("dashboard.gerant.metaDescription")} />
      <div className="codakis-dash-page">
        <div className="codakis-dash-page__head-row">
          <div>
            <h1 className="codakis-dash-page__title">{t("dashboard.gerant.title")}</h1>
            <p className="codakis-dash-page__lead">{t("dashboard.gerant.lead")}</p>
          </div>
          <img src={DEFAULT_DRIVING_SCHOOL_LOGO} alt="" className="codakis-dash-school-logo" />
        </div>

        <div className="codakis-dash-stats">
          <StatCard label={t("dashboard.gerant.stats.enrollments")} value="37" hint="+5 ce mois" />
          <StatCard label={t("dashboard.gerant.stats.revenue")} value="2,8 M" hint="FCFA" accent="blue" />
          <StatCard label={t("dashboard.gerant.stats.instructors")} value="4" accent="orange" />
          <StatCard label={t("dashboard.gerant.stats.success")} value="80 %" />
        </div>

        <DashboardSection title={t("dashboard.gerant.inboxTitle")}>
          <PlaceholderPanel
            title={t("dashboard.gerant.inboxPlaceholder")}
            description={t("dashboard.gerant.inboxHint")}
          />
        </DashboardSection>
      </div>
    </>
  );
}
