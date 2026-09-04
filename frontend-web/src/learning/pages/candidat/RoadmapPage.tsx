import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { BookOpen, Check, Crown, Lock, Star, X } from "lucide-react";
import LockedStepModal from "../../components/LockedStepModal";
import { chapterBannerColor } from "../../../lib/chapterColors";
import { fetchRoadmap, type RoadmapResponse, type RoadmapSection, type RoadmapStep } from "../../../lib/pedagogyApi";
import Loader from "../../../components/common/Loader";

function pathOffset(index: number): number {
  const cycle = index % 8;
  let level = 0;
  if (cycle <= 2) level = cycle;
  else if (cycle <= 4) level = 4 - cycle;
  else if (cycle <= 6) level = 4 - cycle;
  else level = cycle - 8;
  return level * 4;
}

function toRoman(n: number): string {
  const map: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let value = n;
  let out = "";
  for (const [num, roman] of map) {
    while (value >= num) {
      out += roman;
      value -= num;
    }
  }
  return out || String(n);
}

export default function RoadmapPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<RoadmapResponse | null>(null);
  const [error, setError] = useState("");
  const [lockedModal, setLockedModal] = useState<{ title: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState<RoadmapSection | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    let cancelled = false;
    void fetchRoadmap()
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setActiveChapter(res.sections[0] ?? null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Impossible de charger le parcours");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const flatSteps = useMemo(() => data?.sections.flatMap((s) => s.steps) ?? [], [data]);

  useEffect(() => {
    if (!flatSteps.length) return;
    const current = flatSteps.find((s) => s.status === "current" || s.status === "failed");
    if (!current) return;
    const section = data?.sections.find((s) => s.steps.some((st) => st.ref === current.ref));
    if (section) setActiveChapter(section);
    const timer = window.setTimeout(() => {
      const node = document.querySelector(`[data-step-ref="${CSS.escape(current.ref)}"]`);
      node?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [flatSteps, data]);

  useEffect(() => {
    if (!data?.sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const id = (visible.target as HTMLElement).dataset.chapterId;
        const section = data.sections.find((s) => s.theme_id === id);
        if (section) setActiveChapter(section);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.15, 0.35, 0.6] },
    );
    data.sections.forEach((section) => {
      const el = sectionRefs.current[section.theme_id];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [data]);

  function openStep(step: RoadmapStep) {
    if (step.status === "premium_locked") {
      navigate("/espace/candidat/super");
      return;
    }
    if (step.status === "locked") {
      setLockedModal({ title: step.title });
      return;
    }
    if (step.type === "lecon") navigate(`/espace/candidat/lecon/${step.id}`);
    else navigate(`/espace/candidat/quiz/${step.id}`);
  }

  function continueActive() {
    const globalCurrent =
      flatSteps.find((s) => s.status === "current" || s.status === "failed") ??
      activeChapter?.steps.find((s) => s.status === "current" || s.status === "failed") ??
      activeChapter?.steps.find((s) => s.status === "done");
    if (globalCurrent) openStep(globalCurrent);
  }

  function goToCurrentFromModal() {
    setLockedModal(null);
    continueActive();
  }

  if (loading) return <Loader variant="page" />;

  const stickyCurrent =
    flatSteps.find((s) => s.status === "current" || s.status === "failed") ??
    activeChapter?.steps.find((s) => s.status === "current" || s.status === "failed");
  const stickyHasLocked = Boolean(
    stickyCurrent
      ? flatSteps.some((s) => s.status === "locked" || s.status === "premium_locked")
      : activeChapter?.steps.some((s) => s.status === "locked" || s.status === "premium_locked"),
  );
  const stickyColor = activeChapter
    ? chapterBannerColor(activeChapter.theme_title, activeChapter.theme_index)
    : "#00a859";

  return (
    <div className="ck-roadmap">
      {error ? <p className="ck-empty">{error}</p> : null}

      {activeChapter ? (
        <div
          className="ck-chapter-sticky"
          aria-live="polite"
          style={{ ["--ck-chapter-color" as string]: stickyColor, background: stickyColor }}
        >
          <div className="ck-chapter-sticky__text">
            <span className="ck-chapter-sticky__eyebrow">
              Chapitre {toRoman(activeChapter.theme_index)} · Unité {activeChapter.theme_index}
            </span>
            <strong className="ck-chapter-sticky__title">{activeChapter.theme_title}</strong>
            {stickyCurrent ? (
              <button
                type="button"
                className="ck-locked-hint"
                onClick={() => openStep(stickyCurrent)}
              >
                <Star size={14} strokeWidth={2.5} aria-hidden />
                <span>Étape en cours : {stickyCurrent.title}</span>
              </button>
            ) : stickyHasLocked ? (
              <button
                type="button"
                className="ck-locked-hint"
                onClick={() =>
                  setLockedModal({
                    title: activeChapter.steps.find((s) => s.status === "locked")?.title ?? "Étape suivante",
                  })
                }
              >
                <Lock size={14} strokeWidth={2.5} aria-hidden />
                <span>Étapes suivantes bloquées</span>
              </button>
            ) : null}
          </div>
          <button
            type="button"
            className="ck-btn ck-btn--ghost ck-chapter-sticky__guide"
            style={{ color: stickyColor }}
            onClick={continueActive}
          >
            <BookOpen size={18} />
            {stickyCurrent?.status === "failed" ? "Réessayer" : stickyCurrent ? "Continuer" : "Guide"}
          </button>
        </div>
      ) : null}

      {data?.sections.map((section) => {
        const sectionSteps = section.steps;
        const current = sectionSteps.find((s) => s.status === "current" || s.status === "failed");
        const hasLocked = sectionSteps.some((s) => s.status === "locked" || s.status === "premium_locked");
        const bannerColor = chapterBannerColor(section.theme_title, section.theme_index);
        return (
          <section
            key={section.theme_id}
            className="ck-roadmap__section"
            data-chapter-id={section.theme_id}
            ref={(el) => {
              sectionRefs.current[section.theme_id] = el;
            }}
          >
            <div
              className="ck-unit-banner"
              style={{ ["--ck-chapter-color" as string]: bannerColor, background: bannerColor }}
            >
              <div>
                <p className="ck-unit-banner__eyebrow">Chapitre {toRoman(section.theme_index)}</p>
                <h2>{section.theme_title}</h2>
                <p>
                  {section.locked
                    ? "Contenu premium — débloquez avec un forfait"
                    : (() => {
                        const doneCount = sectionSteps.filter((s) => s.status === "done").length;
                        const total = sectionSteps.length;
                        const pending = sectionSteps.find((s) => s.status === "current" || s.status === "failed");
                        if (pending?.status === "failed") {
                          return `${doneCount}/${total} terminées · 1 à reprendre`;
                        }
                        if (pending?.status === "current") {
                          return `${doneCount}/${total} terminées · 1 en cours`;
                        }
                        return `${doneCount}/${total} étapes terminées`;
                      })()}
                </p>
                {current?.status === "failed" ? (
                  <button type="button" className="ck-locked-hint ck-locked-hint--fail" onClick={() => openStep(current)}>
                    <X size={14} strokeWidth={2.5} aria-hidden />
                    <span>Quiz raté — cliquez pour réessayer</span>
                  </button>
                ) : current?.status === "current" ? (
                  <button type="button" className="ck-locked-hint ck-locked-hint--current" onClick={() => openStep(current)}>
                    <Star size={14} strokeWidth={2.5} aria-hidden />
                    <span>À faire : {current.title}</span>
                  </button>
                ) : hasLocked && !section.locked ? (
                  <button
                    type="button"
                    className="ck-locked-hint"
                    onClick={() =>
                      setLockedModal({
                        title: sectionSteps.find((s) => s.status === "locked")?.title ?? "Étape suivante",
                      })
                    }
                  >
                    <Lock size={14} strokeWidth={2.5} aria-hidden />
                    <span>Étapes suivantes bloquées</span>
                  </button>
                ) : null}
                {section.locked ? (
                  <button type="button" className="ck-locked-hint" onClick={() => navigate("/espace/candidat/super")}>
                    <Lock size={14} strokeWidth={2.5} aria-hidden />
                    <span>Chapitre Super — débloquer</span>
                  </button>
                ) : null}
              </div>
              {current ? (
                <button
                  type="button"
                  className={`ck-btn ck-unit-banner__cta ${current.status === "failed" ? "ck-btn--danger" : "ck-btn--primary"}`}
                  style={current.status === "failed" ? undefined : { color: bannerColor }}
                  onClick={() => openStep(current)}
                >
                  {current.status === "failed" ? "Réessayer" : "Continuer"}
                </button>
              ) : null}
            </div>

            <div className="ck-path">
              {sectionSteps.map((step) => {
                const globalIdx = flatSteps.findIndex((s) => s.ref === step.ref);
                const offset = pathOffset(Math.max(globalIdx, 0));
                const isCurrent = step.status === "current";
                const isFailed = step.status === "failed";
                const isDone = step.status === "done";
                const isLocked = step.status === "locked" || step.status === "premium_locked";
                const Icon = isFailed
                  ? X
                  : isDone
                    ? Check
                    : step.type === "quiz"
                      ? Crown
                      : Star;
                return (
                  <button
                    key={step.ref}
                    type="button"
                    data-step-ref={step.ref}
                    className={[
                      "ck-path__item",
                      isCurrent ? "is-current" : "",
                      isFailed ? "is-failed" : "",
                      isDone ? "is-done" : "",
                      step.status === "locked" ? "is-locked" : "",
                      step.status === "premium_locked" ? "is-premium" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{ ["--ck-path-x" as string]: `${offset}rem` }}
                    onClick={(event) => {
                      event.preventDefault();
                      openStep(step);
                    }}
                    aria-label={
                      isFailed
                        ? `${step.title} — à reprendre`
                        : isLocked
                          ? `${step.title} — bloquée`
                          : step.title
                    }
                  >
                    <span className="ck-path__tip" role="tooltip">
                      <span className="ck-path__tip-title">{step.title}</span>
                      {isLocked ? (
                        <span className="ck-path__tip-lock">
                          <Lock size={12} strokeWidth={2.5} aria-hidden />
                          Bloquée — cliquez pour voir
                        </span>
                      ) : isFailed ? (
                        <span className="ck-path__tip-lock ck-path__tip-lock--fail">Ratée — à reprendre</span>
                      ) : isCurrent ? (
                        <span className="ck-path__tip-lock ck-path__tip-lock--current">En cours — à terminer</span>
                      ) : isDone ? (
                        <span className="ck-path__tip-lock ck-path__tip-lock--done">Terminée</span>
                      ) : null}
                    </span>
                    <span className="ck-path__node">
                      <Icon size={32} strokeWidth={isDone || isFailed ? 3 : 2} />
                      {isLocked ? (
                        <span className="ck-path__lock-badge" aria-hidden>
                          <Lock size={14} strokeWidth={3} />
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
      <LockedStepModal
        open={Boolean(lockedModal)}
        title={lockedModal?.title}
        onClose={() => setLockedModal(null)}
        onContinue={stickyCurrent || activeChapter ? goToCurrentFromModal : undefined}
      />
    </div>
  );
}
