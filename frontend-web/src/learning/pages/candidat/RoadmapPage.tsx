import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { BookOpen, Lock, Star } from "lucide-react";
import LockedStepModal from "../../components/LockedStepModal";
import { chapterBannerColor } from "../../../lib/chapterColors";
import { fetchRoadmap, type RoadmapResponse, type RoadmapSection, type RoadmapStep } from "../../../lib/pedagogyApi";
import Loader from "../../../components/common/Loader";

/** Serpentin gauche/droite le long d'une seule route. */
function pathOffset(index: number): number {
  const cycle = index % 8;
  let level = 0;
  if (cycle <= 2) level = cycle;
  else if (cycle <= 4) level = 4 - cycle;
  else if (cycle <= 6) level = 4 - cycle;
  else level = cycle - 8;
  return level * 4.2;
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

function stepStatusLabel(step: RoadmapStep): string {
  if (step.status === "premium_locked") return "Premium";
  if (step.status === "locked") return "Bloquée";
  if (step.status === "failed") return "À reprendre";
  if (step.status === "current") return "En cours";
  if (step.status === "done") return "Validée";
  return "";
}

type RoadNode =
  | { kind: "chapter"; section: RoadmapSection }
  | { kind: "step"; step: RoadmapStep; index: number };

export default function RoadmapPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<RoadmapResponse | null>(null);
  const [error, setError] = useState("");
  const [lockedModal, setLockedModal] = useState<{ title: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState<RoadmapSection | null>(null);

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
  const roadNodes = useMemo<RoadNode[]>(() => {
    if (!data?.sections.length) return [];
    const nodes: RoadNode[] = [];
    let stepIndex = 0;
    data.sections.forEach((section) => {
      nodes.push({ kind: "chapter", section });
      section.steps.forEach((step) => {
        nodes.push({ kind: "step", step, index: stepIndex });
        stepIndex += 1;
      });
    });
    return nodes;
  }, [data]);

  const gamification = data?.gamification;
  const currentGlobal =
    flatSteps.find((s) => s.status === "current" || s.status === "failed") ?? null;

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

      <header className="ck-roadmap__hero">
        <div className="ck-roadmap__hero-copy">
          <p className="ck-roadmap__hero-eyebrow">Feuille de route</p>
          <h1>Votre parcours permis</h1>
          <p>
            Une seule route serpentine : chaque <strong>feu</strong> est un cours ou un quiz.
            Vert = validé, orange = en cours, rouge = à reprendre, éteint = bloqué.
          </p>
          {gamification ? (
            <div className="ck-roadmap__hero-stats">
              <span>Niveau {gamification.niveau}</span>
              <span>{gamification.points} pts</span>
              <span>
                {gamification.chapters_read}/{gamification.chapters_total} chapitres
              </span>
            </div>
          ) : null}
        </div>
        <div className="ck-roadmap__hero-art" aria-hidden>
          <img src="/images/auth/cartoon-red-car.png" alt="" width={220} height={160} />
        </div>
      </header>

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
              <button type="button" className="ck-locked-hint" onClick={() => openStep(stickyCurrent)}>
                <Star size={14} strokeWidth={2.5} aria-hidden />
                <span>Étape en cours : {stickyCurrent.title.replace(/\s*[—–−]+\s*/g, " ")}</span>
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

      <div className="ck-highway" aria-label="Parcours permis CODAKIS">
        <div className="ck-highway__asphalt" aria-hidden />
        <div className="ck-highway__edges" aria-hidden />
        <div className="ck-highway__center" aria-hidden />

        <div className="ck-path ck-path--highway">
          {roadNodes.map((node) => {
            if (node.kind === "chapter") {
              const { section } = node;
              const doneCount = section.steps.filter((s) => s.status === "done").length;
              const color = chapterBannerColor(section.theme_title, section.theme_index);
              return (
                <div
                  key={`chapter-${section.theme_id}`}
                  className="ck-highway__mile"
                  data-chapter-id={section.theme_id}
                  style={{ ["--ck-chapter-color" as string]: color }}
                >
                  <span className="ck-highway__mile-flag">Chapitre {toRoman(section.theme_index)}</span>
                  <strong className="ck-highway__mile-title">{section.theme_title}</strong>
                  <span className="ck-highway__mile-meta">
                    {section.locked
                      ? "Premium — débloquer"
                      : `${doneCount}/${section.steps.length} étapes`}
                  </span>
                </div>
              );
            }

            const { step, index } = node;
            const offset = pathOffset(index);
            const side = index % 2 === 0 ? "left" : "right";
            const isCurrent = step.status === "current";
            const isFailed = step.status === "failed";
            const isDone = step.status === "done";
            const isLocked = step.status === "locked" || step.status === "premium_locked";
            const showCar = Boolean(
              currentGlobal &&
                currentGlobal.ref === step.ref &&
                step.status !== "locked" &&
                step.status !== "premium_locked",
            );
            const cleanTitle = step.title.replace(/\s*[—–−]+\s*/g, " ").trim();

            return (
              <button
                key={step.ref}
                type="button"
                data-step-ref={step.ref}
                className={[
                  "ck-path__item",
                  `is-side-${side}`,
                  isCurrent ? "is-current" : "",
                  isFailed ? "is-failed" : "",
                  isDone ? "is-done" : "",
                  step.status === "locked" ? "is-locked" : "",
                  step.status === "premium_locked" ? "is-premium" : "",
                  showCar ? "has-car" : "",
                  step.type === "quiz" ? "is-quiz" : "is-lesson",
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
                    ? `${cleanTitle} — à reprendre`
                    : isLocked
                      ? `${cleanTitle} — bloquée`
                      : cleanTitle
                }
              >
                <span className="ck-path__flag" aria-hidden>
                  Étape {index + 1}
                </span>

                <span className={`ck-path__sign ck-path__sign--${side}`}>
                  <span className="ck-path__sign-type">{step.type === "quiz" ? "Quiz" : "Cours"}</span>
                  <span className="ck-path__sign-title">{cleanTitle}</span>
                  <span className="ck-path__sign-status">{stepStatusLabel(step)}</span>
                </span>

                {showCar ? (
                  <img
                    src="/images/auth/cartoon-red-car.png"
                    alt=""
                    className="ck-path__car"
                    width={88}
                    height={64}
                  />
                ) : null}

                <span className={`ck-path__feu ck-path__feu--${side}`} aria-hidden>
                  <span className="ck-path__feu-box">
                    <span className="ck-path__lamp ck-path__lamp--red" />
                    <span className="ck-path__lamp ck-path__lamp--amber" />
                    <span className="ck-path__lamp ck-path__lamp--green" />
                  </span>
                  <span className="ck-path__feu-pole" />
                  {isLocked ? (
                    <span className="ck-path__lock-badge">
                      <Lock size={14} strokeWidth={3} />
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <LockedStepModal
        open={Boolean(lockedModal)}
        title={lockedModal?.title}
        onClose={() => setLockedModal(null)}
        onContinue={stickyCurrent || activeChapter ? goToCurrentFromModal : undefined}
      />
    </div>
  );
}
