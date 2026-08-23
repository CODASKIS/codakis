import { useTranslation } from "react-i18next";
import PageMeta from "../../../components/common/PageMeta";
import { DashboardSection, PlaceholderPanel, StatCard } from "../../components/DashboardWidgets";

export default function AdminDashboardHome() {
  const { t } = useTranslation();

  return (
    <>
      <PageMeta title={t("dashboard.admin.metaTitle")} description={t("dashboard.admin.metaDescription")} />
      <div className="codakis-dash-page">
        <h1 className="codakis-dash-page__title">{t("dashboard.admin.title")}</h1>
        <p className="codakis-dash-page__lead">{t("dashboard.admin.lead")}</p>

        <div className="codakis-dash-stats">
          <StatCard label={t("dashboard.admin.stats.schools")} value="24" hint="+3 ce mois" />
          <StatCard label={t("dashboard.admin.stats.candidates")} value="1 842" accent="blue" />
          <StatCard label={t("dashboard.admin.stats.payments")} value="12,4 M" hint="FCFA" accent="orange" />
          <StatCard label={t("dashboard.admin.stats.success")} value="78 %" />
        </div>

        <DashboardSection title={t("dashboard.admin.recentTitle")}>
          <PlaceholderPanel
            title={t("dashboard.admin.recentPlaceholder")}
            description={t("dashboard.admin.recentHint")}
          />
        </DashboardSection>
      </div>
    </>
  );
}
