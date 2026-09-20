import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { BookOpen, Lock, Star } from "lucide-react";
import LockedStepModal from "../../components/LockedStepModal";
import RoadmapWorldMap from "../../components/RoadmapWorldMap";
import { chapterBannerColor } from "../../../lib/chapterColors";
import { fetchRoadmap, type RoadmapResponse, type RoadmapSection, type RoadmapStep } from "../../../lib/pedagogyApi";
import Loader from "../../../components/common/Loader";

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
    }, 180);
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

  const nextPts = gamification?.points_to_next_level ?? 0;
  const pts = gamification?.points ?? 0;
  const nextAt = gamification?.next_level_at ?? 150;
  const progressPct = Math.min(100, Math.round((pts / Math.max(1, nextAt)) * 100));

  return (
    <div className="ck-roadmap">
      {error ? <p className="ck-empty">{error}</p> : null}

      <header className="ck-om-head">
        <h1 className="ck-om-head__title">Feuille de route</h1>
        {gamification ? (
          <div className="ck-om-head__stats">
            <div className="ck-om-head__stat">
              <span className="ck-om-head__label">Niveau</span>
              <strong>{gamification.niveau}</strong>
            </div>
            <div className="ck-om-head__divider" aria-hidden />
            <div className="ck-om-head__stat">
              <span className="ck-om-head__label">Points</span>
              <strong>{gamification.points}</strong>
            </div>
          </div>
        ) : null}
        {gamification ? (
          <div className="ck-om-head__progress">
            <p>
              {nextPts > 0
                ? `Plus que ${nextPts} pts avant le niveau ${gamification.niveau + 1}`
                : "Niveau max atteint pour l’instant"}
            </p>
            <div className="ck-om-head__bar" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
              <span style={{ width: `${progressPct}%` }} />
            </div>
            <small>{progressPct}%</small>
          </div>
        ) : null}
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

      {data?.sections?.length ? (
        <RoadmapWorldMap
          sections={data.sections}
          currentRef={currentGlobal?.ref ?? null}
          onOpenStep={openStep}
        />
      ) : null}

      <LockedStepModal
        open={Boolean(lockedModal)}
        title={lockedModal?.title}
        onClose={() => setLockedModal(null)}
        onContinue={stickyCurrent || activeChapter ? goToCurrentFromModal : undefined}
      />
    </div>
  );
}
