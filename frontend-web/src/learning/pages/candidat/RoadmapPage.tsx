import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Check, Crown, Lock, Star } from "lucide-react";
import PaywallModal from "../../components/PaywallModal";
import { fetchRoadmap, type RoadmapResponse, type RoadmapStep } from "../../../lib/pedagogyApi";
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

export default function RoadmapPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<RoadmapResponse | null>(null);
  const [error, setError] = useState("");
  const [paywall, setPaywall] = useState(false);
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

  const flatSteps = useMemo(() => data?.sections.flatMap((s) => s.steps) ?? [], [data]);

  function openStep(step: RoadmapStep) {
    if (step.status === "premium_locked") {
      setPaywall(true);
      return;
    }
    if (step.status === "locked") return;
    if (step.type === "lecon") navigate(`/espace/candidat/lecon/${step.id}`);
    else navigate(`/espace/candidat/quiz/${step.id}`);
  }

  if (loading) return <Loader variant="page" />;

  return (
    <div>
      {error ? <p className="ck-empty">{error}</p> : null}
      {data?.sections.map((section) => {
        const sectionSteps = section.steps;
        const current = sectionSteps.find((s) => s.status === "current");
        return (
          <section key={section.theme_id} style={{ marginBottom: "3.2rem" }}>
            <div className="ck-unit-banner">
              <div>
                <h2>
                  {toRoman(section.theme_index)}. {section.theme_title}
                </h2>
                <p>
                  {section.locked ? "Contenu premium — débloquez avec un forfait" : `${sectionSteps.length} étapes`}
                </p>
              </div>
              {current ? (
                <button
                  type="button"
                  className="ck-btn ck-btn--ghost"
                  style={{ background: "#fff", color: "var(--ck-green)", borderColor: "#fff", borderBottomColor: "rgba(255,255,255,0.55)" }}
                  onClick={() => openStep(current)}
                >
                  Continuer
                </button>
              ) : null}
            </div>

            <div className="ck-path">
              {sectionSteps.map((step, i) => {
                const globalIdx = flatSteps.findIndex((s) => s.ref === step.ref);
                const offset = pathOffset(Math.max(globalIdx, 0));
                const isCurrent = step.status === "current";
                const isDone = step.status === "done";
                const isLocked = step.status === "locked" || step.status === "premium_locked";
                const Icon = isDone ? Check : step.type === "quiz" ? Crown : isLocked ? Lock : Star;
                return (
                  <button
                    key={step.ref}
                    type="button"
                    className={[
                      "ck-path__item",
                      isCurrent ? "is-current" : "",
                      isDone ? "is-done" : "",
                      step.status === "locked" ? "is-locked" : "",
                      step.status === "premium_locked" ? "is-premium" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{ right: `${offset}rem` }}
                    disabled={step.status === "locked"}
                    onClick={() => openStep(step)}
                    aria-label={step.title}
                  >
                    {isCurrent ? <span className="ck-path__bubble">C&apos;est parti</span> : null}
                    <span className="ck-path__node">
                      <Icon size={32} strokeWidth={isDone ? 3 : 2} />
                    </span>
                    <span className="ck-path__label">{step.title}</span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
      <PaywallModal open={paywall} onClose={() => setPaywall(false)} />
    </div>
  );
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
