import { FileText, HelpCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { CoursePathStep, PedagogyTheme } from "../../../lib/pedagogyApi";

type CoursePlayerSidebarProps = {
  courseTitle: string;
  themeId: string;
  steps: CoursePathStep[];
  activeThemeId: string;
  allThemes: PedagogyTheme[];
  currentStepRef: string;
  completedIds: Set<string>;
  passedQuizIds: Set<string>;
  open: boolean;
  onToggle: () => void;
};

function StatusDot({ state }: { state: "current" | "done" | "todo" }) {
  return (
    <span
      className={`codakis-player-sidebar__dot codakis-player-sidebar__dot--${state}`}
      aria-hidden
    />
  );
}

export default function CoursePlayerSidebar({
  courseTitle,
  themeId,
  steps,
  activeThemeId,
  allThemes,
  currentStepRef,
  completedIds,
  passedQuizIds,
  open,
  onToggle,
}: CoursePlayerSidebarProps) {
  const { t, i18n } = useTranslation();

  const themeTitle = (theme: PedagogyTheme) =>
    i18n.language.startsWith("en") ? theme.title_en : theme.title_fr;

  const activeTheme = useMemo(
    () => allThemes.find((theme) => theme.id === activeThemeId) ?? null,
    [activeThemeId, allThemes],
  );

  const modulePercent = useMemo(() => {
    if (!steps.length) return 0;
    const done = steps.filter((step) => {
      if (step.type === "quiz") return passedQuizIds.has(step.id);
      return completedIds.has(step.id);
    }).length;
    return Math.round((done / steps.length) * 100);
  }, [completedIds, passedQuizIds, steps]);

  const playerBase = `/espace/candidat/cours/module/${themeId}/etape`;

  return (
    <>
      <aside
        className={`codakis-player-sidebar${open ? " is-open" : ""}`}
        aria-label={t("coursePlayer.moduleNav")}
        aria-hidden={!open}
      >
        <div className="codakis-player-sidebar__header">
          <h2>{activeTheme ? themeTitle(activeTheme) : courseTitle}</h2>
          <p>{t("coursePlayer.percentDone", { percent: modulePercent })}</p>
          <div className="codakis-player-sidebar__progress" aria-hidden>
            <span style={{ width: `${modulePercent}%` }} />
          </div>
        </div>

        <div className="codakis-player-sidebar__module-tabs" role="tablist" aria-label={t("candidat.pedagogy.modules")}>
          {allThemes.map((theme, index) => {
            const isActive = theme.id === activeThemeId;
            return (
              <Link
                key={theme.id}
                to={`/espace/candidat/cours/module/${theme.id}`}
                className={`codakis-player-sidebar__module-tab${isActive ? " is-active" : ""}`}
                title={themeTitle(theme)}
              >
                {String(index + 1).padStart(2, "0")}
                {isActive ? (
                  <motion.span
                    layoutId="codakis-player-module-tab"
                    className="codakis-player-sidebar__module-tab-indicator"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                ) : null}
              </Link>
            );
          })}
        </div>

        <nav className="codakis-player-sidebar__nav">
          <AnimatePresence mode="wait">
            <motion.ul
              key={activeThemeId}
              className="codakis-player-sidebar__lessons"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {steps.map((step) => {
                const isCurrent = step.ref === currentStepRef;
                const isQuiz = step.type === "quiz";
                const isDone = isQuiz ? passedQuizIds.has(step.id) : completedIds.has(step.id);
                const state = isCurrent ? "current" : isDone ? "done" : "todo";
                return (
                  <li key={step.ref}>
                    <Link
                      to={`${playerBase}/${step.ref}`}
                      className={`codakis-player-sidebar__lesson${isCurrent ? " is-current" : ""}${isQuiz ? " codakis-player-sidebar__lesson--quiz" : ""}`}
                      aria-current={isCurrent ? "page" : undefined}
                    >
                      {isQuiz ? (
                        <HelpCircle size={15} aria-hidden className="codakis-player-sidebar__lesson-icon" />
                      ) : (
                        <FileText size={15} aria-hidden className="codakis-player-sidebar__lesson-icon" />
                      )}
                      <span>{step.title}</span>
                      <StatusDot state={state} />
                    </Link>
                  </li>
                );
              })}
            </motion.ul>
          </AnimatePresence>
        </nav>
      </aside>

      {open ? (
        <button
          type="button"
          className="codakis-player-sidebar__backdrop"
          aria-label={t("coursePlayer.closeNav")}
          onClick={onToggle}
        />
      ) : null}
    </>
  );
}
