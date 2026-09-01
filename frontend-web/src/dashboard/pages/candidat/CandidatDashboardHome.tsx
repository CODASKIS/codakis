import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../../components/common/PageMeta";
import Loader from "../../../components/common/Loader";
import { DashboardSection, StatCard } from "../../components/DashboardWidgets";
import { fetchCandidatDashboard, type CandidatDashboard } from "../../../lib/pedagogyApi";

function formatDate(value: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale.startsWith("en") ? "en-GB" : "fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function CandidatDashboardHome() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<CandidatDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetchCandidatDashboard()
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        if (!cancelled) setError(t("candidat.pedagogy.loadError"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  if (loading) return <Loader variant="page" message={t("common.loading")} />;

  const progressHint =
    data && data.total_lecons > 0
      ? `${data.completed_lecons}/${data.total_lecons} ${t("dashboard.candidat.stats.lessonsUnit")}`
      : "—";

  return (
    <>
      <PageMeta title={t("dashboard.candidat.metaTitle")} description={t("dashboard.candidat.metaDescription")} />
      <div className="codakis-dash-page">
        <h1 className="codakis-dash-page__title">{t("dashboard.candidat.title")}</h1>
        <p className="codakis-dash-page__lead">{t("dashboard.candidat.lead")}</p>

        {error ? <p className="text-danger">{error}</p> : null}

        <div className="codakis-dash-stats">
          <StatCard
            label={t("dashboard.candidat.stats.progress")}
            value={`${data?.progress_percent ?? 0} %`}
            hint={progressHint}
          />
          <StatCard
            label={t("dashboard.candidat.stats.quizzesPassed")}
            value={`${data?.quizzes_passed ?? 0}`}
            accent="blue"
          />
          <StatCard
            label={t("dashboard.candidat.stats.success")}
            value={`${data?.success_rate ?? 0} %`}
            accent="orange"
          />
          <StatCard
            label={t("dashboard.candidat.stats.examensPassed")}
            value={`${data?.examens_passed ?? 0}`}
            hint={t("dashboard.candidat.stats.examensHint")}
          />
        </div>

        <DashboardSection title={t("dashboard.candidat.historyTitle")}>
          {!data?.recent_attempts.length ? (
            <p className="text-muted mb-0">{t("dashboard.candidat.historyEmpty")}</p>
          ) : (
            <div className="codakis-dash-history">
              {data.recent_attempts.map((attempt) => (
                <article key={`${attempt.kind}-${attempt.id}`} className="codakis-dash-history__item">
                  <header className="codakis-dash-history__head">
                    <div>
                      <span className={`codakis-dash-history__badge codakis-dash-history__badge--${attempt.kind}`}>
                        {attempt.kind === "quiz" ? t("dashboard.candidat.kindQuiz") : t("dashboard.candidat.kindExam")}
                      </span>
                      <h3>{attempt.title}</h3>
                    </div>
                    <div className="codakis-dash-history__meta">
                      <strong className={attempt.reussi ? "text-success" : "text-danger"}>
                        {attempt.score} %
                        {attempt.reussi ? " ✓" : ""}
                      </strong>
                      <span>{formatDate(attempt.termine_le, i18n.language)}</span>
                    </div>
                  </header>
                  <p className="codakis-dash-history__score">
                    {t("dashboard.candidat.errorsCount", {
                      count: attempt.nb_erreurs,
                      total: attempt.nb_total,
                    })}
                  </p>
                  {attempt.errors.length > 0 ? (
                    <ul className="codakis-dash-history__errors">
                      {attempt.errors.slice(0, 5).map((err) => (
                        <li key={err.question_id}>
                          <strong>{err.prompt || t("dashboard.candidat.unknownQuestion")}</strong>
                          {err.explanation ? <span>{err.explanation}</span> : null}
                        </li>
                      ))}
                      {attempt.errors.length > 5 ? (
                        <li className="codakis-dash-history__more">
                          {t("dashboard.candidat.moreErrors", { count: attempt.errors.length - 5 })}
                        </li>
                      ) : null}
                    </ul>
                  ) : (
                    <p className="text-success mb-0">{t("dashboard.candidat.perfectAttempt")}</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </DashboardSection>

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
