import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronUp, Lock, RotateCcw, Star, TrafficCone } from "lucide-react";
import { chapterBannerColor } from "../../lib/chapterColors";
import type { RoadmapSection, RoadmapStep } from "../../lib/pedagogyApi";

type Props = {
  sections: RoadmapSection[];
  currentRef?: string | null;
  onOpenStep: (step: RoadmapStep) => void;
  intro?: { title: string; body: string };
  /** Un abonné ne voit aucune mention « Premium » sur le parcours. */
  isPremium?: boolean;
};

const ROAD_W = 58;
const ROAD_EDGE = 68;

/** Le zigzag boucle tous les 240 unités de viewBox, à partir du premier virage. */
const ROAD_FIRST_TURN_Y = 70;
const ROAD_PERIOD = 240;

/** Durée de ck-map-car-next / ck-map-car-prev : la pile attend la fin du trajet. */
const CAR_DRIVE_MS = 1250;

type DriveDirection = "next" | "prev";

/**
 * Tracé rectiligne à virages arrondis. Le premier segment part en dehors du
 * viewBox (x négatif) pour venir se glisser sous la carte de l’unité en cours,
 * puis le motif se répète autant de fois qu’il faut pour que la route descende
 * le long de toute la pile au lieu de s’arrêter derrière la deuxième carte.
 */
function buildRoadPath(periods: number): string {
  const parts = ["M -60 30", `H 112 Q 152 30, 152 ${ROAD_FIRST_TURN_Y}`];
  for (let k = 0; k < periods; k += 1) {
    const base = ROAD_FIRST_TURN_Y + k * ROAD_PERIOD;
    parts.push(
      `V ${base + 40} Q 152 ${base + 80}, 112 ${base + 80}`,
      `H 88 Q 48 ${base + 80}, 48 ${base + 120}`,
      `V ${base + 160} Q 48 ${base + 200}, 88 ${base + 200}`,
      `H 112 Q 152 ${base + 200}, 152 ${base + 240}`,
    );
  }
  // On prolonge sous le bord bas : la route paraît continuer plutôt que s’arrêter net.
  parts.push(`V ${ROAD_FIRST_TURN_Y + periods * ROAD_PERIOD + 60}`);
  return parts.join(" ");
}

function roadSigns(periods: number) {
  const signs: { key: string; kind: "diamond" | "danger" | "info"; x: number; y: number }[] = [];
  for (let k = 0; k < periods; k += 1) {
    const base = ROAD_FIRST_TURN_Y + k * ROAD_PERIOD;
    signs.push(
      k % 2 === 0
        ? { key: `a${k}`, kind: "diamond", x: 85, y: base + 20 }
        : { key: `a${k}`, kind: "danger", x: 80, y: base + 20 },
    );
    signs.push(
      k % 2 === 0
        ? { key: `b${k}`, kind: "info", x: 125, y: base + 140 }
        : { key: `b${k}`, kind: "diamond", x: 125, y: base + 140 },
    );
  }
  return signs;
}

function cleanTitle(title: string) {
  return title.replace(/\s*[—–−]+\s*/g, " ").trim();
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Libellé d’étape homogène : on retire le nom du thème déjà porté par
 * l’en-tête de la carte, puis on ramène tout au même gabarit court.
 */
function stepLabel(title: string, themeTitle: string, max = 22) {
  const clean = cleanTitle(title);
  const themeWords = normalize(themeTitle)
    .split(/[\s'’-]+/)
    .filter((w) => w.length > 3);

  const kept = clean
    .split(/\s+/)
    .filter((word, idx) => idx === 0 || !themeWords.includes(normalize(word).replace(/[^a-z]/g, "")));

  const label = (kept.join(" ") || clean).replace(/\s*[:–-]\s*$/, "").trim();
  return label.length > max ? `${label.slice(0, max - 1).trimEnd()}…` : label;
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

function RoadSvg({
  driveKey,
  driveDir,
  periods,
}: {
  driveKey: number;
  driveDir?: DriveDirection;
  periods: number;
}) {
  const roadD = buildRoadPath(periods);
  const height = ROAD_FIRST_TURN_Y + periods * ROAD_PERIOD + 60;

  return (
    <svg
      className="ck-duo-map__road"
      viewBox={`0 0 200 ${height}`}
      preserveAspectRatio="xMinYMin meet"
      aria-hidden
    >
      {/* Bords clairs */}
      <path
        d={roadD}
        fill="none"
        stroke="#ccd3da"
        strokeWidth={ROAD_EDGE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Asphalte */}
      <path
        d={roadD}
        fill="none"
        stroke="#3a414d"
        strokeWidth={ROAD_W}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Ligne centrale pointillée */}
      <path
        d={roadD}
        fill="none"
        stroke="#f8fafc"
        strokeWidth="2.6"
        strokeLinecap="butt"
        strokeDasharray="11 13"
      />

      {/* Panneaux semés le long du parcours, un motif par boucle */}
      {roadSigns(periods).map((sign) => {
        if (sign.kind === "diamond") {
          return (
            <g key={sign.key} transform={`translate(${sign.x} ${sign.y}) rotate(45)`}>
              <rect x={-8} y={-8} width={16} height={16} rx={2} fill="#fbbf24" stroke="#d97706" strokeWidth="1.4" />
            </g>
          );
        }
        if (sign.kind === "info") {
          return (
            <g key={sign.key} transform={`translate(${sign.x} ${sign.y})`}>
              <line x1="0" y1="10" x2="0" y2="30" stroke="#64748b" strokeWidth="2.4" />
              <circle cx="0" cy="0" r="10" fill="#2563eb" stroke="#fff" strokeWidth="2.4" />
              <circle cx="0" cy="0" r="3.6" fill="#fff" />
            </g>
          );
        }
        return (
          <g key={sign.key} transform={`translate(${sign.x} ${sign.y})`}>
            <line x1="0" y1="8" x2="0" y2="28" stroke="#64748b" strokeWidth="2.4" />
            <polygon points="0,-11 12,10 -12,10" fill="#fff" stroke="#e11d48" strokeWidth="2.4" />
            <text x="0" y="8" textAnchor="middle" fill="#e11d48" fontSize="10" fontWeight="900">
              !
            </text>
          </g>
        );
      })}

      {/* Voiture posée au départ de la route ; roule lors d’un changement d’unité */}
      <g
        key={driveKey}
        className={`ck-duo-map__car-track${driveDir ? ` is-driving-${driveDir}` : ""}`}
      >
        <image
          className="ck-duo-map__car"
          href="/images/auth/cartoon-red-car.png"
          x="-38"
          y="-28"
          width="76"
          height="56"
          preserveAspectRatio="xMidYMid meet"
        />
      </g>
    </svg>
  );
}

/**
 * Unité mise en avant par défaut : la première non terminée, pour que l’unité
 * bouclée laisse sa place à la suivante.
 */
function defaultActiveIndex(sections: RoadmapSection[], currentRef?: string | null) {
  const byProgress = sections.findIndex((s) => unitStatus(s) === "active");
  if (byProgress >= 0) return byProgress;
  const byRef = sections.findIndex((s) => s.steps.some((step) => step.ref === currentRef));
  if (byRef >= 0) return byRef;
  const firstOpen = sections.findIndex((s) => unitStatus(s) !== "done");
  return firstOpen >= 0 ? firstOpen : 0;
}

export default function RoadmapWorldMap({
  sections,
  currentRef,
  onOpenStep,
  intro,
  isPremium = false,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(() => defaultActiveIndex(sections, currentRef));
  const [drive, setDrive] = useState<{ dir: DriveDirection; n: number } | null>(null);
  const [driving, setDriving] = useState(false);
  const driveTimer = useRef<number | null>(null);

  function clearDriveTimer() {
    if (driveTimer.current !== null) {
      window.clearTimeout(driveTimer.current);
      driveTimer.current = null;
    }
  }

  useEffect(() => {
    clearDriveTimer();
    setActiveIndex(defaultActiveIndex(sections, currentRef));
    setDrive(null);
    setDriving(false);
  }, [sections, currentRef]);

  useEffect(() => clearDriveTimer, []);

  /** La voiture parcourt la route en entier, puis seulement la pile se réorganise. */
  function goToUnit(index: number) {
    if (driving || index === activeIndex || index < 0 || index >= sections.length) return;
    const dir: DriveDirection = index > activeIndex ? "next" : "prev";
    setDrive((prev) => ({ dir, n: (prev?.n ?? 0) + 1 }));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActiveIndex(index);
      return;
    }

    setDriving(true);
    driveTimer.current = window.setTimeout(() => {
      driveTimer.current = null;
      setDriving(false);
      setActiveIndex(index);
    }, CAR_DRIVE_MS);
  }

  const activeSection = sections[activeIndex];

  /** Les unités dépassées sortent de la pile et se replient en pastilles dans la colonne de gauche. */
  const passedChips = sections
    .map((section, index) => ({ section, index }))
    .filter(({ index }) => index < activeIndex);

  /** L’unité en cours occupe toujours le premier emplacement, la suite se décale sous elle. */
  const stackedSections = sections
    .map((section, index) => ({ section, index }))
    .filter(({ index }) => index >= activeIndex);

  const minHeight = Math.max(680, stackedSections.length * 340 + 180);

  /** Assez de boucles pour dépasser la pile ; le trop-plein est rogné par le calque. */
  const roadPeriods = Math.max(3, Math.ceil(stackedSections.length * 0.9));

  return (
    <div className="ck-duo-map">
      <div className="ck-duo-map__grid">
        <div className="ck-duo-map__aside">
          {intro ? (
            <aside className="ck-duo-map__intro">
              <h2>{intro.title}</h2>
              <p>{intro.body}</p>
            </aside>
          ) : null}

          {sections.length > 1 ? (
            <nav className="ck-duo-map__nav" aria-label="Navigation entre les unités">
              <button
                type="button"
                className="ck-duo-map__nav-btn"
                onClick={() => goToUnit(activeIndex - 1)}
                disabled={driving || activeIndex === 0}
                aria-label="Unité précédente"
              >
                <ChevronUp size={18} strokeWidth={3} />
              </button>

              <span className="ck-duo-map__nav-label">
                <small>Unité {activeSection?.theme_index ?? activeIndex + 1}</small>
                <strong>{activeSection?.theme_title ?? ""}</strong>
              </span>

              <button
                type="button"
                className="ck-duo-map__nav-btn"
                onClick={() => goToUnit(activeIndex + 1)}
                disabled={driving || activeIndex >= sections.length - 1}
                aria-label="Unité suivante"
              >
                <ChevronDown size={18} strokeWidth={3} />
              </button>
            </nav>
          ) : null}

          {passedChips.length ? (
            <div className="ck-duo-map__done" role="list">
              {passedChips.map(({ section, index }) => {
                const done = unitStatus(section) === "done";
                return (
                  <button
                    key={section.theme_id}
                    type="button"
                    role="listitem"
                    className={`ck-duo-map__done-chip${done ? "" : " is-todo"}`}
                    onClick={() => goToUnit(index)}
                    disabled={driving}
                  >
                    {done ? (
                      <Check size={14} strokeWidth={3} />
                    ) : (
                      <RotateCcw size={14} strokeWidth={3} />
                    )}
                    <span>Unité {section.theme_index}</span>
                    <small>{done ? "terminée" : "à reprendre"}</small>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="ck-duo-map__path" style={{ minHeight }}>
          <div className="ck-duo-map__road-layer" aria-hidden>
            <RoadSvg driveKey={drive?.n ?? 0} driveDir={drive?.dir} periods={roadPeriods} />
          </div>

          <div className="ck-duo-map__units">
            {stackedSections.map(({ section, index: sIdx }) => {
              const status = unitStatus(section);
              const color = chapterBannerColor(section.theme_title, section.theme_index);
              const doneCount = section.steps.filter((s) => s.status === "done").length;
              const currentStep =
                section.steps.find((s) => s.ref === currentRef) ??
                section.steps.find((s) => s.status === "current" || s.status === "failed") ??
                section.steps.find((s) => s.status !== "locked" && s.status !== "premium_locked");
              const isActive = sIdx === activeIndex;
              const layout = isActive
                ? `is-first${drive ? ` is-promote-${drive.dir}` : ""}`
                : "is-upcoming";

              return (
                <article
                  key={section.theme_id}
                  className={`ck-unit-card is-${status} ${layout}`}
                  style={{ ["--ck-unit-color" as string]: color }}
                  data-chapter-id={section.theme_id}
                >
                  <header className="ck-unit-card__head">
                    <button
                      type="button"
                      className="ck-unit-card__jump"
                      onClick={() => goToUnit(sIdx)}
                      aria-pressed={isActive}
                      aria-label={`Afficher l’unité ${section.theme_index}`}
                    >
                      <span>Unité {section.theme_index}</span>
                      <strong>{section.theme_title}</strong>
                    </button>
                  </header>

                  {status === "locked" ? (
                    <div className="ck-unit-card__locked">
                      <span className="ck-unit-card__lock">
                        <Lock size={28} strokeWidth={2.5} />
                      </span>
                      <p>{section.is_premium && !isPremium ? "Contenu Premium" : "Unité verrouillée"}</p>
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
                                <span className="ck-unit-step__label">
                                  {stepLabel(step.title, section.theme_title)}
                                </span>
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
