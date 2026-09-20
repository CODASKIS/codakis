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
 * Serpentine calquée sur la maquette : la route occupe la colonne à droite
 * de l’unité 1 et descend jusqu’au croisement placé sur l’unité 2.
 */
const ROAD_D =
  "M 100 16 " +
  "C 160 32, 176 70, 140 100 " +
  "C 104 130, 46 146, 40 182 " +
  "C 34 218, 96 236, 136 262 " +
  "C 170 284, 176 320, 140 346 " +
  "C 104 372, 46 388, 42 422 " +
  "C 39 454, 100 472, 128 496 " +
  "C 150 514, 150 538, 140 560";

const ROAD_W = 50;
const ROAD_EDGE = 58;

const DIAMONDS: ReadonlyArray<readonly [number, number]> = [
  [172, 74],
  [170, 330],
  [22, 452],
];

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
    <svg className="ck-duo-map__road" viewBox="0 0 200 600" preserveAspectRatio="xMidYMid meet" aria-hidden>
      {/* Bords clairs */}
      <path
        d={ROAD_D}
        fill="none"
        stroke="#ccd3da"
        strokeWidth={ROAD_EDGE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Asphalte */}
      <path
        d={ROAD_D}
        fill="none"
        stroke="#3a414d"
        strokeWidth={ROAD_W}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Ligne centrale pointillée */}
      <path
        d={ROAD_D}
        fill="none"
        stroke="#f8fafc"
        strokeWidth="2.8"
        strokeLinecap="butt"
        strokeDasharray="12 14"
      />

      {/* Losanges dorés le long du tracé */}
      {DIAMONDS.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(45)`}>
          <rect x={-8} y={-8} width={16} height={16} rx={2} fill="#fbbf24" stroke="#d97706" strokeWidth="1.4" />
        </g>
      ))}

      {/* Panneau danger (gauche) */}
      <g transform="translate(20 198)">
        <line x1="0" y1="6" x2="0" y2="30" stroke="#64748b" strokeWidth="2.6" />
        <polygon points="0,-10 13,12 -13,12" fill="#fff" stroke="#e11d48" strokeWidth="2.6" />
        <text x="0" y="9" textAnchor="middle" fill="#e11d48" fontSize="11" fontWeight="900">
          !
        </text>
      </g>

      {/* Panneau bleu (droite) */}
      <g transform="translate(180 250)">
        <line x1="0" y1="10" x2="0" y2="34" stroke="#64748b" strokeWidth="2.6" />
        <circle cx="0" cy="0" r="11" fill="#2563eb" stroke="#fff" strokeWidth="2.6" />
        <circle cx="0" cy="0" r="4" fill="#fff" />
      </g>

      {/* Panneau stop (bas) */}
      <g transform="translate(24 512)">
        <line x1="0" y1="10" x2="0" y2="34" stroke="#64748b" strokeWidth="2.6" />
        <polygon points="0,-12 11,-4 11,8 0,16 -11,8 -11,-4" fill="#dc2626" stroke="#fff" strokeWidth="2" />
      </g>
    </svg>
  );
}

/** Croisement en X posé au niveau de l’unité 2, comme sur la maquette. */
function CrossingSvg() {
  return (
    <svg className="ck-duo-map__crossing" viewBox="0 0 220 160" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <path
        d="M 20 20 L 200 140 M 200 20 L 20 140"
        fill="none"
        stroke="#c6ccd4"
        strokeWidth="34"
        strokeLinecap="round"
      />
      <path
        d="M 20 20 L 200 140 M 200 20 L 20 140"
        fill="none"
        stroke="#b9c0c9"
        strokeWidth="26"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function RoadmapWorldMap({ sections, currentRef, onOpenStep, intro }: Props) {
  const minHeight = useMemo(() => Math.max(680, sections.length * 340 + 180), [sections.length]);

  return (
    <div className="ck-duo-map">
      <div className="ck-duo-map__grid">
        {intro ? (
          <aside className="ck-duo-map__intro">
            <h2>{intro.title}</h2>
            <p>{intro.body}</p>
          </aside>
        ) : null}

        <div className="ck-duo-map__path" style={{ minHeight }}>
          <div className="ck-duo-map__road-layer" aria-hidden>
            <RoadSvg />
            <img
              className="ck-duo-map__car"
              src="/images/auth/cartoon-red-car.png"
              alt=""
              width={96}
              height={70}
            />
          </div>

          <div className="ck-duo-map__crossing-layer" aria-hidden>
            <CrossingSvg />
          </div>

          <div className="ck-duo-map__units">
            {sections.map((section, sIdx) => {
              const status = unitStatus(section);
              const color = chapterBannerColor(section.theme_title, section.theme_index);
              const doneCount = section.steps.filter((s) => s.status === "done").length;
              const currentStep =
                section.steps.find((s) => s.ref === currentRef) ??
                section.steps.find((s) => s.status === "current" || s.status === "failed") ??
                section.steps.find((s) => s.status !== "locked" && s.status !== "premium_locked");
              const layout = sIdx === 0 ? "is-first" : "is-upcoming";

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
    </div>
  );
}
