import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import Loader from "../../../components/common/Loader";
import CmsCoverImage from "../../../components/common/CmsCoverImage";
import CourseMiniQuiz from "../../components/course/CourseMiniQuiz";
import CourseInlineQuiz from "../../components/course/CourseInlineQuiz";
import CoursePdfDownloads from "../../components/course/CoursePdfDownloads";
import ListenButton from "../../components/course/ListenButton";
import CoursePlayerSidebar from "../../components/course/CoursePlayerSidebar";
import { renderBlogBody } from "../../../lib/blog-content";
import {
  AuthApiError,
  completeCandidatLecon,
  fetchCandidatCoursePath,
  fetchCandidatLecon,
  fetchCandidatThemeCheckpoint,
  fetchCandidatThemes,
  parseStepRef,
  type CoursePathStep,
  type PedagogyLecon,
  type PedagogyTheme,
  type TakeQuestion,
} from "../../../lib/pedagogyApi";
import { ConfigContext } from "@/dashboardkit/contexts/ConfigContext";
import * as actionType from "@/dashboardkit/store/actions";

const UPGRADE_HREF = "/tarifs";

export default function CandidatModulePlayerPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { themeId = "", stepRef = "" } = useParams<{ themeId: string; stepRef: string }>();
  const configContext = useContext(ConfigContext) as {
    dispatch: (action: { type: string }) => void;
    state: { collapseLayout: boolean };
  };
  const { dispatch, state: configState } = configContext;

  const parsedStep = useMemo(() => parseStepRef(stepRef), [stepRef]);
  const isQuizStep = parsedStep.type === "quiz";

  const [lecon, setLecon] = useState<PedagogyLecon | null>(null);
  const [bodyHtml, setBodyHtml] = useState("");
  const [pathSteps, setPathSteps] = useState<CoursePathStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [passedQuizIds, setPassedQuizIds] = useState<Set<string>>(new Set());
  const [checkpoint, setCheckpoint] = useState<TakeQuestion | null>(null);
  const [quizPassed, setQuizPassed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth > 991 : true,
  );
  const [allThemes, setAllThemes] = useState<PedagogyTheme[]>([]);
  const [advancing, setAdvancing] = useState(false);
  const [quizStepPassed, setQuizStepPassed] = useState(false);

  useEffect(() => {
    document.body.classList.add("codakis-course-player-active");
    const wasCollapsed = configState.collapseLayout;
    if (!wasCollapsed && window.innerWidth > 992) {
      dispatch({ type: actionType.COLLAPSE_LAYOUT });
    }
    return () => {
      document.body.classList.remove("codakis-course-player-active");
      if (!wasCollapsed && window.innerWidth > 992) {
        dispatch({ type: actionType.COLLAPSE_LAYOUT });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchCandidatThemes()
      .then((themes) => {
        if (!cancelled) setAllThemes(themes.filter((item) => !item.locked));
      })
      .catch(() => {
        if (!cancelled) setAllThemes([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    if (!themeId || !stepRef) return;
    setLoading(true);
    setLocked(false);
    setQuizPassed(false);
    setError("");
    try {
      const coursePath = await fetchCandidatCoursePath(themeId);

      setPathSteps(coursePath.steps);
      setCompletedIds(new Set(coursePath.completed_lecon_ids));
      setPassedQuizIds(new Set(coursePath.passed_quiz_ids));

      if (parsedStep.type === "quiz") {
        setLecon(null);
        setBodyHtml("");
        setCheckpoint(null);
        setQuizStepPassed(coursePath.passed_quiz_ids.includes(parsedStep.id));
        setQuizPassed(true);
      } else {
        const [data, checkpointQuestion] = await Promise.all([
          fetchCandidatLecon(parsedStep.id),
          fetchCandidatThemeCheckpoint(themeId, parsedStep.id).catch(() => null),
        ]);
        setLecon(data);
        setBodyHtml(await renderBlogBody(data.body));
        setCheckpoint(checkpointQuestion);
        setQuizStepPassed(false);
        if (!checkpointQuestion) setQuizPassed(true);
      }
    } catch (err) {
      if (err instanceof AuthApiError && err.status === 403) {
        setLocked(true);
      } else {
        setError(err instanceof AuthApiError ? err.message : t("candidat.pedagogy.loadError"));
      }
    } finally {
      setLoading(false);
    }
  }, [parsedStep.id, parsedStep.type, stepRef, themeId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stepRef]);

  const { index, nextStep } = useMemo(() => {
    const position = pathSteps.findIndex((item) => item.ref === stepRef);
    return {
      index: position,
      nextStep: position >= 0 && position < pathSteps.length - 1 ? pathSteps[position + 1] : null,
    };
  }, [pathSteps, stepRef]);

  const playerPath = `/espace/candidat/cours/module/${themeId}/etape`;
  const courseTitle = t("coursePlayer.courseTitle");

  const handleNext = async () => {
    if (advancing) return;
    if (!isQuizStep && lecon) {
      if (checkpoint && !quizPassed) return;
      setAdvancing(true);
      try {
        const progress = await completeCandidatLecon(lecon.id);
        setCompletedIds(new Set(progress.completed_lecon_ids));
        setPassedQuizIds(new Set(progress.passed_quiz_ids));
      } catch {
        /* continue navigation even if save fails */
      } finally {
        setAdvancing(false);
      }
    }

    if (isQuizStep && !quizStepPassed) return;

    if (nextStep) {
      navigate(`${playerPath}/${nextStep.ref}`);
      return;
    }

    const themeIndex = allThemes.findIndex((item) => item.id === themeId);
    const nextTheme = themeIndex >= 0 ? allThemes[themeIndex + 1] : null;
    if (nextTheme) {
      navigate(`/espace/candidat/cours/module/${nextTheme.id}`);
    } else {
      navigate("/espace/candidat/cours");
    }
  };

  const canAdvance = isQuizStep ? quizStepPassed : !checkpoint || quizPassed;

  if (locked && !loading) {
    return (
      <div className="codakis-player codakis-player--locked">
        <div className="codakis-player__locked-card">
          <h1>{t("candidat.pedagogy.lockedTitle")}</h1>
          <p>{t("candidat.pedagogy.lockedLead")}</p>
          <div className="codakis-player__locked-actions">
            <Link to={UPGRADE_HREF} className="btn btn-primary">
              {t("dashboard.userMenu.upgradeCta")}
            </Link>
            <Link to="/espace/candidat/cours" className="btn btn-outline-secondary">
              {t("candidat.pedagogy.backCourses")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stepTitle = isQuizStep
    ? pathSteps.find((item) => item.ref === stepRef)?.title ?? t("coursePlayer.themeQuiz")
    : lecon?.title ?? "";

  return (
    <div className={`codakis-player${sidebarOpen ? " codakis-player--nav-open" : " codakis-player--nav-closed"}`}>
      <header className="codakis-player__topbar">
        <div className="codakis-player__topbar-start">
          <button
            type="button"
            className="codakis-player__menu-btn"
            onClick={() => setSidebarOpen((value) => !value)}
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? t("coursePlayer.closeNav") : t("coursePlayer.openNav")}
          >
            <Menu size={20} strokeWidth={2} aria-hidden />
          </button>
          <div className="codakis-player__topbar-title">
            <strong>{stepTitle}</strong>
          </div>
        </div>
        <Link to="/espace/candidat/cours" className="codakis-player__exit">
          <X size={16} aria-hidden />
          {t("coursePlayer.exitModule")}
        </Link>
      </header>

      <div className="codakis-player__shell">
        <CoursePlayerSidebar
          courseTitle={courseTitle}
          themeId={themeId}
          steps={pathSteps}
          activeThemeId={themeId}
          allThemes={allThemes}
          currentStepRef={stepRef}
          completedIds={completedIds}
          passedQuizIds={passedQuizIds}
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((value) => !value)}
        />

        <main className="codakis-player__main">
          {loading ? (
            <div className="codakis-player__content codakis-player__content--loading">
              <Loader variant="section" message={t("coursePlayer.loadingStep")} />
            </div>
          ) : null}

          {!loading && error ? <div className="alert alert-danger m-3">{error}</div> : null}

          {!loading && !error && index >= 0 ? (
            <p className="codakis-player__step">
              {t("coursePlayer.stepPosition", {
                current: index + 1,
                total: pathSteps.length,
              })}
            </p>
          ) : null}

          {!loading && !error && isQuizStep ? (
            <div className="codakis-player__content">
              <CourseInlineQuiz
                quizId={parsedStep.id}
                alreadyPassed={quizStepPassed}
                onPassed={() => {
                  setQuizStepPassed(true);
                  setPassedQuizIds((prev) => new Set([...prev, parsedStep.id]));
                }}
              />
            </div>
          ) : !loading && !error && lecon ? (
            <article className="codakis-player__content">
              {lecon.cover_image_url ? (
                <div className="codakis-player__hero">
                  <CmsCoverImage url={lecon.cover_image_url} alt={lecon.title} className="codakis-player__cover" />
                  <div className="codakis-player__hero-overlay">
                    <h1>{lecon.title}</h1>
                    {lecon.excerpt ? <p>{lecon.excerpt}</p> : null}
                  </div>
                </div>
              ) : (
                <header className="codakis-player__header">
                  <h1>{lecon.title}</h1>
                  {lecon.excerpt ? <p>{lecon.excerpt}</p> : null}
                </header>
              )}

              <ListenButton text={`${lecon.title}. ${lecon.excerpt ?? ""}. ${lecon.body}`} />

              <div
                className="fj-prose fj-wysiwyg codakis-player-body"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />

              <CoursePdfDownloads html={bodyHtml} />

              {checkpoint ? (
                <CourseMiniQuiz question={checkpoint} onValidated={(passed) => setQuizPassed(passed)} />
              ) : null}

              {!canAdvance && checkpoint ? (
                <p className="codakis-player__quiz-hint">{t("coursePlayer.quizRequired")}</p>
              ) : null}
            </article>
          ) : null}

          {!loading && !error ? (
          <footer className="codakis-player__footer">
            <button
              type="button"
              className="codakis-player__next"
              disabled={!canAdvance || advancing}
              onClick={() => void handleNext()}
            >
              {advancing
                ? t("coursePlayer.advancing")
                : nextStep
                  ? t("coursePlayer.next")
                  : t("coursePlayer.finish")}
            </button>
          </footer>
          ) : null}
        </main>
      </div>
    </div>
  );
}
