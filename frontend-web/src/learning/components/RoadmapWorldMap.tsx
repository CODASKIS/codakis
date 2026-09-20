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
 * Tracé rectiligne à virages arrondis : la route démarre juste à droite de
 * la carte de l’unité en cours puis descend en zigzag jusqu’à l’unité 2.
 */
const ROAD_D =
  "M 40 30 " +
  "H 112 Q 152 30, 152 70 " +
  "V 110 Q 152 150, 112 150 " +
  "H 88 Q 48 150, 48 190 " +
  "V 230 Q 48 270, 88 270 " +
  "H 112 Q 152 270, 152 310 " +
  "V 350 Q 152 390, 112 390 " +
  "H 88 Q 48 390, 48 430";

const ROAD_W = 46;
const ROAD_EDGE = 54;

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
    <svg className="ck-duo-map__road" viewBox="0 0 200 460" preserveAspectRatio="xMinYMin meet" aria-hidden>
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
        strokeWidth="2.6"
        strokeLinecap="butt"
        strokeDasharray="11 13"
      />

      {/* Losange doré dans le premier virage */}
      <g transform="translate(85 90) rotate(45)">
        <rect x={-8} y={-8} width={16} height={16} rx={2} fill="#fbbf24" stroke="#d97706" strokeWidth="1.4" />
      </g>

      {/* Panneau bleu dans le deuxième virage */}
      <g transform="translate(125 210)">
        <line x1="0" y1="10" x2="0" y2="30" stroke="#64748b" strokeWidth="2.4" />
        <circle cx="0" cy="0" r="10" fill="#2563eb" stroke="#fff" strokeWidth="2.4" />
        <circle cx="0" cy="0" r="3.6" fill="#fff" />
      </g>

      {/* Panneau danger dans le troisième virage */}
      <g transform="translate(80 330)">
        <line x1="0" y1="8" x2="0" y2="28" stroke="#64748b" strokeWidth="2.4" />
        <polygon points="0,-11 12,10 -12,10" fill="#fff" stroke="#e11d48" strokeWidth="2.4" />
        <text x="0" y="8" textAnchor="middle" fill="#e11d48" fontSize="10" fontWeight="900">
          !
        </text>
      </g>

      {/* Voiture posée au départ de la route */}
      <image
        className="ck-duo-map__car"
        href="/images/auth/cartoon-red-car.png"
        x="22"
        y="2"
        width="76"
        height="56"
        preserveAspectRatio="xMidYMid meet"
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
