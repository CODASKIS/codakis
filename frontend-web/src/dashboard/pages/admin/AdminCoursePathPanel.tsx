import { FileText, HelpCircle, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge, Form } from "react-bootstrap";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import Loader from "../../../components/common/Loader";
import {
  AuthApiError,
  fetchAdminCoursePath,
  type CoursePathStep,
  type PedagogyTheme,
} from "../../../lib/pedagogyApi";

type AdminCoursePathPanelProps = {
  themes: PedagogyTheme[];
  themeId?: string;
  onThemeChange?: (themeId: string) => void;
};

function nextSortOrder(steps: CoursePathStep[]) {
  if (!steps.length) return 10;
  return Math.max(...steps.map((step) => step.sort_order)) + 10;
}

export default function AdminCoursePathPanel({ themes, themeId: controlledThemeId, onThemeChange }: AdminCoursePathPanelProps) {
  const { t, i18n } = useTranslation();
  const [internalThemeId, setInternalThemeId] = useState(controlledThemeId ?? themes[0]?.id ?? "");
  const themeId = controlledThemeId ?? internalThemeId;
  const [steps, setSteps] = useState<CoursePathStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const themeTitle = (theme: PedagogyTheme) =>
    i18n.language.startsWith("en") ? theme.title_en : theme.title_fr;

  const load = useCallback(async () => {
    if (!themeId) return;
    setLoading(true);
    setError("");
    try {
      const path = await fetchAdminCoursePath(themeId);
      setSteps(path.steps);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("admin.pedagogy.loadError"));
    } finally {
      setLoading(false);
    }
  }, [themeId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  function handleThemeChange(nextThemeId: string) {
    if (!controlledThemeId) setInternalThemeId(nextThemeId);
    onThemeChange?.(nextThemeId);
  }

  const nextOrder = nextSortOrder(steps);
  const quizCreateHref = `/admin/contenu/quiz/nouveau?themeId=${encodeURIComponent(themeId)}&sortOrder=${nextOrder}&inCourse=1`;
  const leconCreateHref = `/admin/contenu/lecons/nouveau?themeId=${encodeURIComponent(themeId)}&sortOrder=${nextOrder}`;

  return (
    <div className="codakis-admin-course-path">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <Form.Select
            value={themeId}
            onChange={(event) => handleThemeChange(event.target.value)}
            style={{ minWidth: "16rem" }}
            aria-label={t("admin.pedagogy.coursePathTheme")}
          >
            {themes.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {themeTitle(theme)}
              </option>
            ))}
          </Form.Select>
          <span className="text-muted small">{t("admin.pedagogy.coursePathHint")}</span>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Link to={leconCreateHref} className="btn btn-outline-primary btn-sm">
            <Plus size={14} aria-hidden className="me-1" />
            {t("admin.pedagogy.addLeconSection")}
          </Link>
          <Link to={quizCreateHref} className="btn btn-primary btn-sm">
            <Plus size={14} aria-hidden className="me-1" />
            {t("admin.pedagogy.addQuizSection")}
          </Link>
        </div>
      </div>

      {error ? <div className="alert alert-danger py-2">{error}</div> : null}
      {loading ? <Loader variant="section" /> : null}

      {!loading && steps.length === 0 ? (
        <p className="text-muted mb-0">{t("admin.pedagogy.coursePathEmpty")}</p>
      ) : null}

      {!loading && steps.length > 0 ? (
        <ol className="codakis-admin-course-path__list">
          {steps.map((step, index) => {
            const isQuiz = step.type === "quiz";
            const editHref = isQuiz
              ? `/admin/contenu/quiz/${step.id}/modifier`
              : `/admin/contenu/lecons/${step.id}/modifier`;
            const status = step.status ?? (isQuiz ? "published" : "draft");
            return (
              <li key={step.ref} className="codakis-admin-course-path__item">
                <span className="codakis-admin-course-path__index">{index + 1}</span>
                {isQuiz ? (
                  <HelpCircle size={16} aria-hidden className="codakis-admin-course-path__icon" />
                ) : (
                  <FileText size={16} aria-hidden className="codakis-admin-course-path__icon" />
                )}
                <div className="codakis-admin-course-path__copy">
                  <strong>{step.title}</strong>
                  <span className="codakis-admin-course-path__meta">
                    {isQuiz ? t("admin.pedagogy.stepQuiz") : t("admin.pedagogy.stepLecon")}
                    {" · "}
                    {t("admin.pedagogy.sortOrder")} {step.sort_order}
                  </span>
                </div>
                <Badge bg={status === "published" ? "success" : "secondary"} className="codakis-admin-course-path__badge">
                  {status === "published" ? t("admin.pedagogy.statusPublished") : t("admin.pedagogy.statusDraft")}
                </Badge>
                <Link to={editHref} className="btn btn-outline-primary btn-sm">
                  {t("admin.pedagogy.edit")}
                </Link>
              </li>
            );
          })}
        </ol>
      ) : null}
    </div>
  );
}
