import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import LockedStepModal from "../../components/LockedStepModal";
import RoadmapWorldMap from "../../components/RoadmapWorldMap";
import { fetchRoadmap, type RoadmapResponse, type RoadmapStep } from "../../../lib/pedagogyApi";
import Loader from "../../../components/common/Loader";
import { isPremiumUser } from "../../../auth/authStore";

export default function RoadmapPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<RoadmapResponse | null>(null);
  const [error, setError] = useState("");
  const [lockedModal, setLockedModal] = useState<{ title: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchRoadmap()
      .then((res) => {
        if (!cancelled) setData(res);
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

  const premium = useMemo(() => isPremiumUser(), []);
  const flatSteps = useMemo(() => data?.sections.flatMap((s) => s.steps) ?? [], [data]);
  const gamification = data?.gamification;
  const currentGlobal =
    flatSteps.find((s) => s.status === "current" || s.status === "failed") ?? null;

  useEffect(() => {
    if (!flatSteps.length) return;
    const current = flatSteps.find((s) => s.status === "current" || s.status === "failed");
    if (!current) return;
    const timer = window.setTimeout(() => {
      const node = document.querySelector(`[data-step-ref="${CSS.escape(current.ref)}"]`);
      node?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 180);
    return () => window.clearTimeout(timer);
  }, [flatSteps]);

  function openStep(step: RoadmapStep) {
    if (step.status === "premium_locked" && !premium) {
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

  function goToCurrentFromModal() {
    setLockedModal(null);
    if (currentGlobal) openStep(currentGlobal);
  }

  if (loading) return <Loader variant="page" />;

  return (
    <div className="ck-roadmap ck-roadmap--duo">
      {error ? <p className="ck-empty">{error}</p> : null}

      {data?.sections?.length ? (
        <RoadmapWorldMap
          sections={data.sections}
          currentRef={currentGlobal?.ref ?? null}
          onOpenStep={openStep}
          isPremium={premium}
          intro={{
            title: "Intro au code",
            body: [
              "Votre parcours permis. Route serpentine : validé, en cours, à reprendre.",
              gamification ? ` Niveau ${gamification.niveau}, ${gamification.points} points.` : "",
            ].join(""),
          }}
        />
      ) : null}

      <LockedStepModal
        open={Boolean(lockedModal)}
        title={lockedModal?.title}
        onClose={() => setLockedModal(null)}
        onContinue={currentGlobal ? goToCurrentFromModal : undefined}
      />
    </div>
  );
}
