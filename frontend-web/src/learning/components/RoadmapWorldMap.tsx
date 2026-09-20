import { useMemo } from "react";
import { Check, Lock, Star, TrafficCone } from "lucide-react";
import { chapterBannerColor } from "../../lib/chapterColors";
import type { RoadmapSection, RoadmapStep } from "../../lib/pedagogyApi";

type Props = {
  sections: RoadmapSection[];
  currentRef?: string | null;
  onOpenStep: (step: RoadmapStep) => void;
};

function cleanTitle(title: string) {
  return title.replace(/\s*[—–−]+\s*/g, " ").trim();
}

function shortTitle(title: string, max = 18) {
  const t = cleanTitle(title);
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

function unitStatus(section: RoadmapSection): "active" | "done" | "locked" {
  if (section.locked) return "locked";
  const allDone = section.steps.length > 0 && section.steps.every((s) => s.status === "done");
  if (allDone) return "done";
  const hasProgress = section.steps.some(
    (s) => s.status === "done" || s.status === "current" || s.status === "failed",
  );
  if (hasProgress || section.steps.some((s) => s.status !== "locked" && s.status !== "premium_locked")) {
    return "active";
  }
  return "locked";
}

function stepProgress(step: RoadmapStep): number {
  if (step.status === "done") return 100;
  if (step.status === "current" || step.status === "failed") return 45;
  return 0;
}

export default function RoadmapWorldMap({ sections, currentRef, onOpenStep }: Props) {
  const pathHeight = useMemo(() => Math.max(640, sections.length * 420 + 200), [sections.length]);

  return (
    <div className="ck-duo-map">
      <div className="ck-duo-map__decor" aria-hidden />

      <div className="ck-duo-map__road-wrap" style={{ minHeight: pathHeight }}>
        <svg className="ck-duo-map__road" viewBox="0 0 320 1200" preserveAspectRatio="none" aria-hidden>
          <path
            className="ck-duo-map__asphalt"
            d="M 210 0
               C 210 80, 90 120, 90 220
               C 90 320, 230 360, 230 460
               C 230 560, 80 600, 80 720
               C 80 840, 240 880, 240 1000
               C 240 1100, 160 1140, 160 1200"
            fill="none"
            stroke="#3f4654"
            strokeWidth="54"
            strokeLinecap="round"
          />
          <path
            d="M 210 0
               C 210 80, 90 120, 90 220
               C 90 320, 230 360, 230 460
               C 230 560, 80 600, 80 720
               C 80 840, 240 880, 240 1000
               C 240 1100, 160 1140, 160 1200"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="14 16"
            opacity="0.95"
          />
          <path
            d="M 210 0
               C 210 80, 90 120, 90 220
               C 90 320, 230 360, 230 460
               C 230 560, 80 600, 80 720
               C 80 840, 240 880, 240 1000
               C 240 1100, 160 1140, 160 1200"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="2"
            strokeLinecap="round"
            transform="translate(-18 0)"
            opacity="0.55"
          />
          <path
            d="M 210 0
               C 210 80, 90 120, 90 220
               C 90 320, 230 360, 230 460
               C 230 560, 80 600, 80 720
               C 80 840, 240 880, 240 1000
               C 240 1100, 160 1140, 160 1200"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="2"
            strokeLinecap="round"
            transform="translate(18 0)"
            opacity="0.55"
          />
        </svg>

        <img
          className="ck-duo-map__car"
          src="/images/auth/cartoon-red-car.png"
          alt=""
          width={88}
          height={64}
        />

        <div className="ck-duo-map__units">
          {sections.map((section, sIdx) => {
            const status = unitStatus(section);
            const color = chapterBannerColor(section.theme_title, section.theme_index);
            const doneCount = section.steps.filter((s) => s.status === "done").length;
            const currentStep =
              section.steps.find((s) => s.ref === currentRef) ??
              section.steps.find((s) => s.status === "current" || s.status === "failed") ??
              section.steps.find((s) => s.status !== "locked" && s.status !== "premium_locked");
            const side = sIdx % 2 === 0 ? "left" : "right";

            return (
              <article
                key={section.theme_id}
                className={`ck-unit-card is-${status} is-${side}`}
                style={{ ["--ck-unit-color" as string]: color }}
                data-chapter-id={section.theme_id}
              >
                <header className="ck-unit-card__head">
                  <span>Unité {section.theme_index}</span>
                  <strong>{section.theme_title}</strong>
                </header>

                {status === "locked" ? (
                  <div className="ck-unit-card__locked">
                    <span className="ck-unit-card__lock">
                      <Lock size={28} strokeWidth={2.5} />
                    </span>
                    <p>{section.is_premium ? "Contenu Premium" : "Unité verrouillée"}</p>
                    <small>Terminez l’unité précédente pour débloquer</small>
                  </div>
                ) : (
                  <>
                    <div className="ck-unit-card__hero" aria-hidden>
                      <span className="ck-unit-card__hero-ring">
                        <TrafficCone size={36} strokeWidth={2} />
                      </span>
                      {doneCount === section.steps.length && section.steps.length > 0 ? (
                        <span className="ck-unit-card__star">
                          <Star size={16} fill="currentColor" />
                        </span>
                      ) : null}
                    </div>

                    <ul className="ck-unit-card__steps">
                      {section.steps.map((step) => {
                        const pct = stepProgress(step);
                        const locked = step.status === "locked" || step.status === "premium_locked";
                        const isCurrent = step.ref === currentRef || step.status === "current";
                        return (
                          <li key={step.ref}>
                            <button
                              type="button"
                              data-step-ref={step.ref}
                              className={[
                                "ck-unit-step",
                                `is-${step.status}`,
                                isCurrent ? "is-focus" : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              onClick={() => onOpenStep(step)}
                              aria-label={cleanTitle(step.title)}
                            >
                              <span className="ck-unit-step__circle">
                                {step.status === "done" ? (
                                  <Check size={18} strokeWidth={3} />
                                ) : locked ? (
                                  <Lock size={16} strokeWidth={2.5} />
                                ) : (
                                  <span>{step.type === "quiz" ? "Q" : "C"}</span>
                                )}
                              </span>
                              <span className="ck-unit-step__label">{shortTitle(step.title)}</span>
                              <span className="ck-unit-step__bar" aria-hidden>
                                <i style={{ width: `${pct}%` }} />
                              </span>
                              {step.status === "done" ? (
                                <Star className="ck-unit-step__star" size={12} fill="currentColor" />
                              ) : null}
                            </button>
                          </li>
                        );
                      })}
                    </ul>

                    {currentStep ? (
                      <div className="ck-unit-card__checkpoint">
                        <span>Check-point</span>
                        <button
                          type="button"
                          className="ck-unit-card__unlock"
                          data-step-ref={currentStep.ref}
                          onClick={() => onOpenStep(currentStep)}
                        >
                          {currentStep.status === "failed"
                            ? "Réessayer"
                            : currentStep.status === "done"
                              ? "Revoir"
                              : "Continuer"}
                        </button>
                      </div>
                    ) : null}
                  </>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
