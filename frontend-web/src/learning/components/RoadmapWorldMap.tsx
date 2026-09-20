import { useMemo } from "react";
import { Check, Lock, Star, TrafficCone } from "lucide-react";
import { chapterBannerColor } from "../../lib/chapterColors";
import type { RoadmapSection, RoadmapStep } from "../../lib/pedagogyApi";

type Props = {
  sections: RoadmapSection[];
  currentRef?: string | null;
  onOpenStep: (step: RoadmapStep) => void;
  intro?: { title: string; body: string };
};

/**
 * Route carrée large : démarre à droite de l’unité 1, s’arrête à l’unité 2.
 * Pas de pont / tunnel.
 */
const ROAD_D =
  "M 80 48 " +
  "H 260 " +
  "V 200 " +
  "H 80 " +
  "V 360 " +
  "H 240 " +
  "V 500";

const ROAD_W = 68;
const ROAD_EDGE = 76;
const ROAD_INNER = 60;

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

function RoadSvg() {
  return (
    <svg className="ck-duo-map__road" viewBox="0 0 340 540" preserveAspectRatio="xMidYMin meet" aria-hidden>
      <path
        d={ROAD_D}
        fill="none"
        stroke="#c8ced6"
        strokeWidth={ROAD_EDGE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={ROAD_D}
        fill="none"
        stroke="#3a414d"
        strokeWidth={ROAD_W}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={ROAD_D}
        fill="none"
        stroke="#3a414d"
        strokeWidth={ROAD_INNER}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={ROAD_D}
        fill="none"
        stroke="#f8fafc"
        strokeWidth="3.2"
        strokeLinecap="butt"
        strokeLinejoin="round"
        strokeDasharray="14 15"
      />

      {/* Triangle */}
      <g transform="translate(278 110)">
        <line x1="0" y1="8" x2="0" y2="38" stroke="#64748b" strokeWidth="3" />
        <polygon points="0,0 17,30 -17,30" fill="#fff" stroke="#e11d48" strokeWidth="3" />
        <text x="0" y="23" textAnchor="middle" fill="#e11d48" fontSize="15" fontWeight="900">
          !
        </text>
      </g>

      {/* Feu */}
      <g transform="translate(80 260)">
        <rect x="-10" y="-26" width="20" height="46" rx="4" fill="#1e293b" />
        <circle cx="0" cy="-13" r="5" fill="#ef4444" />
        <circle cx="0" cy="0" r="5" fill="#fbbf24" />
        <circle cx="0" cy="13" r="5" fill="#22c55e" />
        <line x1="0" y1="20" x2="0" y2="40" stroke="#64748b" strokeWidth="3" />
      </g>

      {/* Stop */}
      <g transform="translate(258 420)">
        <line x1="0" y1="12" x2="0" y2="42" stroke="#64748b" strokeWidth="3" />
        <polygon
          points="0,-15 13,-5 13,10 0,20 -13,10 -13,-5"
          fill="#dc2626"
          stroke="#fff"
          strokeWidth="2"
        />
        <text
          x="0"
          y="6"
          textAnchor="middle"
          fill="#fff"
          fontSize="8"
          fontWeight="900"
          fontFamily="Nunito, system-ui, sans-serif"
        >
          STOP
        </text>
      </g>
    </svg>
  );
}

export default function RoadmapWorldMap({ sections, currentRef, onOpenStep, intro }: Props) {
  const pathHeight = useMemo(() => Math.max(720, sections.length * 360 + 160), [sections.length]);

  return (
    <div className="ck-duo-map">
      <div className="ck-duo-map__road-wrap" style={{ minHeight: pathHeight }}>
        {/* Route uniquement entre unité 1 et 2 */}
        <div className="ck-duo-map__road-layer" aria-hidden>
          <RoadSvg />
          <img
            className="ck-duo-map__car"
            src="/images/auth/cartoon-red-car.png"
            alt=""
            width={100}
            height={74}
          />
        </div>

        {intro ? (
          <aside className="ck-duo-map__intro">
            <h2>{intro.title}</h2>
            <p>{intro.body}</p>
          </aside>
        ) : null}

        <div className="ck-duo-map__units">
          {sections.map((section, sIdx) => {
            const status = unitStatus(section);
            const color = chapterBannerColor(section.theme_title, section.theme_index);
            const doneCount = section.steps.filter((s) => s.status === "done").length;
            const currentStep =
              section.steps.find((s) => s.ref === currentRef) ??
              section.steps.find((s) => s.status === "current" || s.status === "failed") ??
              section.steps.find((s) => s.status !== "locked" && s.status !== "premium_locked");
            const isUpcoming = status === "locked" || (sIdx > 0 && status !== "active" && status !== "done");
            const layout =
              sIdx === 0 ? "is-first" : isUpcoming || status === "locked" ? "is-upcoming" : "is-next";

            return (
              <article
                key={section.theme_id}
                className={`ck-unit-card is-${status} ${layout}`}
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
