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
 * Tracé calqué sur la maquette Code de la route :
 * entrée haut-droite → épingle gauche → horizontale → épingle droite →
 * tunnel → épingle gauche → courbe bas → croisement en X.
 * viewBox 640×1180 — route large (~72).
 */
const ROAD_D =
  "M 610 78 " +
  "L 340 78 " +
  "C 250 78, 198 118, 198 178 " +
  "C 198 238, 250 278, 340 278 " +
  "L 520 278 " +
  "C 590 278, 638 328, 638 390 " +
  "C 638 452, 590 502, 520 502 " +
  "L 300 502 " +
  "C 220 502, 168 552, 168 618 " +
  "C 168 684, 220 734, 300 734 " +
  "L 470 734 " +
  "C 540 734, 575 790, 545 860 " +
  "C 520 910, 430 945, 340 980 " +
  "C 290 1000, 270 1040, 300 1080";

const ROAD_W = 72;
const ROAD_EDGE = 78;
const ROAD_INNER = 64;

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
    <svg className="ck-duo-map__road" viewBox="0 0 640 1180" preserveAspectRatio="xMidYMin meet" aria-hidden>
      {/* Motif fond : silhouettes panneaux / bâtiments (gris très clair) */}
      <g className="ck-duo-map__silhouettes" fill="none" stroke="#b7d4c8" strokeWidth="2.2" opacity="0.55">
        <path d="M48 120 h36 v48 h-36 z M54 140 h10 M72 140 h10" />
        <path d="M560 160 l18 -28 l18 28 h-10 v22 h-16 v-22 z" />
        <circle cx="90" cy="420" r="16" />
        <path d="M82 420 h16 M90 412 v16" />
        <path d="M520 640 l22 -36 l22 36 z" />
        <path d="M40 700 h28 v40 h-28 z M48 714 h12 M60 714 h6" />
        <path d="M580 880 h32 v28 h-10 v18 h-12 v-18 h-10 z" />
        <path d="M70 980 l14 -22 l14 22 z" />
        <circle cx="560" cy="320" r="14" />
        <rect x="552" y="314" width="16" height="5" rx="1" />
      </g>

      {/* Bords gris clair */}
      <path
        d={ROAD_D}
        fill="none"
        stroke="#c8ced6"
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
      {/* Bande intérieure pour netteté des bords */}
      <path
        d={ROAD_D}
        fill="none"
        stroke="#3a414d"
        strokeWidth={ROAD_INNER}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Ligne centrale blanche pointillée */}
      <path
        d={ROAD_D}
        fill="none"
        stroke="#f8fafc"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="14 16"
      />

      {/* Tunnel (segment horizontal après 2ᵉ épingle) */}
      <g transform="translate(400 502)">
        <path
          d="M -56 26 Q 0 -58 56 26 L 56 36 Q 0 -42 -56 36 Z"
          fill="#8b6914"
          stroke="#6b5010"
          strokeWidth="3"
        />
        <path d="M -40 28 Q 0 -32 40 28" fill="none" stroke="#a67c1a" strokeWidth="7" strokeLinecap="round" />
        <ellipse cx="0" cy="30" rx="34" ry="13" fill="#1a1f28" />
      </g>

      {/* Triangle intersection — juste avant la boucle / tunnel */}
      <g transform="translate(250 430)">
        <line x1="0" y1="10" x2="0" y2="46" stroke="#64748b" strokeWidth="3.5" />
        <polygon points="0,0 20,34 -20,34" fill="#fff" stroke="#e11d48" strokeWidth="3.5" />
        <path d="M0 12 L8 26 L-8 26 Z" fill="#e11d48" />
        <path d="M-3 18 h6 M0 15 v8" stroke="#fff" strokeWidth="1.6" />
      </g>

      {/* Feu tricolore — centre de la boucle */}
      <g transform="translate(360 560)">
        <rect x="-10" y="-28" width="20" height="48" rx="5" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
        <circle cx="0" cy="-14" r="5" fill="#ef4444" />
        <circle cx="0" cy="0" r="5" fill="#fbbf24" />
        <circle cx="0" cy="14" r="5" fill="#22c55e" />
        <line x1="0" y1="20" x2="0" y2="42" stroke="#64748b" strokeWidth="3.5" />
      </g>

      {/* Stop — fin de boucle */}
      <g transform="translate(500 780)">
        <line x1="0" y1="14" x2="0" y2="48" stroke="#64748b" strokeWidth="3.5" />
        <polygon
          points="0,-16 14,-6 14,10 0,20 -14,10 -14,-6"
          fill="#dc2626"
          stroke="#fff"
          strokeWidth="2.5"
        />
        <text
          x="0"
          y="5"
          textAnchor="middle"
          fill="#fff"
          fontSize="9"
          fontWeight="900"
          fontFamily="Nunito, system-ui, sans-serif"
        >
          STOP
        </text>
      </g>

      {/* Croisement en X en bas */}
      <g transform="translate(300 1085)" opacity="0.85">
        <path
          d="M -110 -18 L 110 18 M -110 18 L 110 -18"
          fill="none"
          stroke="#c8ced6"
          strokeWidth="50"
          strokeLinecap="round"
        />
        <path
          d="M -110 -18 L 110 18 M -110 18 L 110 -18"
          fill="none"
          stroke="#3a414d"
          strokeWidth="42"
          strokeLinecap="round"
        />
        <path
          d="M -100 -16 L 100 16 M -100 16 L 100 -16"
          fill="none"
          stroke="#f8fafc"
          strokeWidth="2.4"
          strokeDasharray="10 12"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export default function RoadmapWorldMap({ sections, currentRef, onOpenStep, intro }: Props) {
  const pathHeight = useMemo(() => Math.max(820, sections.length * 420 + 360), [sections.length]);

  return (
    <div className="ck-duo-map">
      <div className="ck-duo-map__road-wrap" style={{ minHeight: pathHeight }}>
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
            const side = "left";

            return (
              <article
                key={section.theme_id}
                className={`ck-unit-card is-${status} is-${side}${sIdx === 0 ? " is-first" : ""}${sIdx === 1 ? " is-second" : ""}`}
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
