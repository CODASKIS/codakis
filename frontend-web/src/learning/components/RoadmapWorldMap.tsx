import { useMemo } from "react";
import { Check, Lock, Star, TrafficCone } from "lucide-react";
import { chapterBannerColor } from "../../lib/chapterColors";
import type { RoadmapSection, RoadmapStep } from "../../lib/pedagogyApi";

type Props = {
  sections: RoadmapSection[];
  currentRef?: string | null;
  onOpenStep: (step: RoadmapStep) => void;
};

/**
 * Trajectoire calquée sur la maquette (route centre-droite) :
 * bas → droite → U gauche → U droite (tunnel) → U gauche → bas.
 * Coordonnées viewBox 0 0 420 1260.
 */
const ROAD_D =
  "M 255 18 " +
  "C 292 34, 348 52, 362 96 " +
  "C 378 148, 348 178, 292 198 " +
  "C 210 226, 138 258, 142 318 " +
  "C 146 372, 210 402, 278 428 " +
  "C 348 456, 388 498, 378 552 " +
  "C 366 612, 292 642, 220 668 " +
  "C 142 698, 112 748, 128 804 " +
  "C 148 872, 232 902, 308 934 " +
  "C 372 962, 398 1018, 372 1072 " +
  "C 348 1120, 268 1152, 228 1198 " +
  "C 208 1224, 218 1248, 240 1260";

const DIAMONDS: ReadonlyArray<readonly [number, number]> = [
  [355, 110],
  [155, 310],
  [365, 520],
  [145, 780],
  [340, 960],
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
    <svg className="ck-duo-map__road" viewBox="0 0 420 1260" preserveAspectRatio="xMidYMin meet" aria-hidden>
      {/* Asphalte charcoal — pas de filter url(#…) : Firefox résout ça en file:/// */}
      <path
        d={ROAD_D}
        fill="none"
        stroke="#3d4450"
        strokeWidth="54"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bords gris clair fins */}
      <path
        d={ROAD_D}
        fill="none"
        stroke="#c5cad3"
        strokeWidth="54"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <path
        d={ROAD_D}
        fill="none"
        stroke="#3d4450"
        strokeWidth="48"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Ligne centrale blanche pointillée */}
      <path
        d={ROAD_D}
        fill="none"
        stroke="#f8fafc"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="11 13"
        opacity="0.95"
      />

      {/* Tunnel / arche sur le segment qui va à droite */}
      <g className="ck-duo-map__tunnel" transform="translate(318 445)">
        <path
          d="M -48 20 Q 0 -54 48 20 L 48 30 Q 0 -40 -48 30 Z"
          fill="#8b6914"
          stroke="#6b5010"
          strokeWidth="3"
        />
        <path d="M -36 22 Q 0 -30 36 22" fill="none" stroke="#a67c1a" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="0" cy="24" rx="30" ry="11" fill="#1f2430" />
      </g>

      {/* Losanges jaunes aux sommets des virages */}
      {DIAMONDS.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(45)`}>
          <rect x={-8.5} y={-8.5} width={17} height={17} rx={2} fill="#fbbf24" stroke="#d97706" strokeWidth="1.4" />
        </g>
      ))}

      {/* Panneaux décoratifs le long de la route */}
      <g transform="translate(392 148)">
        <line x1="0" y1="8" x2="0" y2="42" stroke="#64748b" strokeWidth="3" />
        <polygon points="0,-2 16,26 -16,26" fill="#ef4444" stroke="#fff" strokeWidth="2" />
        <polygon points="0,4 10,22 -10,22" fill="#fff" />
      </g>
      <g transform="translate(96 500)">
        <line x1="0" y1="10" x2="0" y2="44" stroke="#64748b" strokeWidth="3" />
        <circle cx="0" cy="0" r="16" fill="#2563eb" stroke="#fff" strokeWidth="3" />
        <circle cx="0" cy="0" r="7" fill="#fff" />
      </g>
      <g transform="translate(388 820)">
        <line x1="0" y1="8" x2="0" y2="40" stroke="#64748b" strokeWidth="3" />
        <polygon points="0,-2 15,24 -15,24" fill="#ef4444" stroke="#fff" strokeWidth="2" />
      </g>
      <g transform="translate(88 900)">
        <line x1="0" y1="8" x2="0" y2="38" stroke="#64748b" strokeWidth="3" />
        <circle cx="0" cy="0" r="14" fill="#dc2626" stroke="#fff" strokeWidth="3" />
        <rect x="-7" y="-2.5" width="14" height="5" rx="1" fill="#fff" />
      </g>

      {/* Amorce croisement bas (comme maquette) */}
      <path
        d="M 130 1235 H 330"
        fill="none"
        stroke="#3d4450"
        strokeWidth="42"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M 130 1235 H 330"
        fill="none"
        stroke="#f8fafc"
        strokeWidth="2.5"
        strokeDasharray="10 12"
        opacity="0.45"
      />
    </svg>
  );
}

export default function RoadmapWorldMap({ sections, currentRef, onOpenStep }: Props) {
  const pathHeight = useMemo(() => Math.max(760, sections.length * 460 + 300), [sections.length]);

  return (
    <div className="ck-duo-map">
      <div className="ck-duo-map__decor" aria-hidden />

      <div className="ck-duo-map__road-wrap" style={{ minHeight: pathHeight }}>
        <div className="ck-duo-map__road-layer" aria-hidden>
          <RoadSvg />
          <img
            className="ck-duo-map__car"
            src="/images/auth/cartoon-red-car.png"
            alt=""
            width={92}
            height={68}
          />
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

            return (
              <article
                key={section.theme_id}
                className={`ck-unit-card is-${status} is-left${sIdx === 0 ? " is-first" : ""}`}
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
