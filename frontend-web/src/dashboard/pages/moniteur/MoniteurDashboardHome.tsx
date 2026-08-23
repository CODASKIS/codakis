import { useTranslation } from "react-i18next";
import PageMeta from "../../../components/common/PageMeta";
import { DashboardSection, PlaceholderPanel, StatCard } from "../../components/DashboardWidgets";

export default function MoniteurDashboardHome() {
  const { t } = useTranslation();

  return (
    <>
      <PageMeta title={t("dashboard.moniteur.metaTitle")} description={t("dashboard.moniteur.metaDescription")} />
      <div className="codakis-dash-page">
        <h1 className="codakis-dash-page__title">{t("dashboard.moniteur.title")}</h1>
        <p className="codakis-dash-page__lead">{t("dashboard.moniteur.lead")}</p>

        <div className="codakis-dash-stats">
          <StatCard label={t("dashboard.moniteur.stats.students")} value="12" />
          <StatCard label={t("dashboard.moniteur.stats.slots")} value="8" hint={t("dashboard.moniteur.stats.slotsHint")} accent="blue" />
          <StatCard label={t("dashboard.moniteur.stats.week")} value="18 h" accent="orange" />
          <StatCard label={t("dashboard.moniteur.stats.rate")} value="85 %" />
        </div>

        <DashboardSection title={t("dashboard.moniteur.scheduleTitle")}>
          <PlaceholderPanel
            title={t("dashboard.moniteur.schedulePlaceholder")}
            description={t("dashboard.moniteur.scheduleHint")}
          />
        </DashboardSection>
      </div>
    </>
  );
}
