import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../../components/common/PageMeta";
import { DashboardSection, StatCard } from "../../components/DashboardWidgets";

export default function CandidatDashboardHome() {
  const { t } = useTranslation();

  return (
    <>
      <PageMeta title={t("dashboard.candidat.metaTitle")} description={t("dashboard.candidat.metaDescription")} />
      <div className="codakis-dash-page">
        <h1 className="codakis-dash-page__title">{t("dashboard.candidat.title")}</h1>
        <p className="codakis-dash-page__lead">{t("dashboard.candidat.lead")}</p>

        <div className="codakis-dash-stats">
          <StatCard label={t("dashboard.candidat.stats.progress")} value="42 %" hint="6/10 thèmes" />
          <StatCard label={t("dashboard.candidat.stats.exams")} value="34/40" accent="blue" />
          <StatCard label={t("dashboard.candidat.stats.success")} value="72 %" accent="orange" />
          <StatCard label={t("dashboard.candidat.stats.consort")} value="4/6" hint={t("dashboard.candidat.stats.consortHint")} />
        </div>

        <DashboardSection title={t("dashboard.candidat.actionsTitle")}>
          <div className="codakis-dash-actions">
            <Link to="/themes" className="codakis-dash-action">
              {t("dashboard.candidat.actionCourses")}
            </Link>
            <Link to="/espace/candidat/examens" className="codakis-dash-action">
              {t("dashboard.candidat.actionExam")}
            </Link>
            <Link to="/espace/candidat/consort" className="codakis-dash-action">
              {t("dashboard.candidat.actionConsort")}
            </Link>
          </div>
        </DashboardSection>
      </div>
    </>
  );
}
