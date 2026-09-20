import { useMemo } from "react";
import { Lock } from "lucide-react";
import { chapterBannerColor } from "../../lib/chapterColors";
import type { RoadmapSection, RoadmapStep } from "../../lib/pedagogyApi";

type Props = {
  sections: RoadmapSection[];
  currentRef?: string | null;
  onOpenStep: (step: RoadmapStep) => void;
};

type Pt = { x: number; y: number };

type MapStep = {
  step: RoadmapStep;
  index: number;
  point: Pt;
  angle: number;
  side: "left" | "right";
};

type MapChapter = {
  section: RoadmapSection;
  point: Pt;
};

const MAP_W = 720;
const ROAD_W = 78;
const STEP_GAP = 155;
const PAD_TOP = 90;
const PAD_BOTTOM = 120;

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

function cleanTitle(title: string) {
  return title.replace(/\s*[—–−]+\s*/g, " ").trim();
}

function stepStatusLabel(step: RoadmapStep): string {
  if (step.status === "premium_locked") return "Premium";
  if (step.status === "locked") return "Bloquée";
  if (step.status === "failed") return "À reprendre";
  if (step.status === "current") return "En cours";
  if (step.status === "done") return "Validée";
  return "";
}

function lightState(step: RoadmapStep): "green" | "yellow" | "red" | "off" {
  if (step.status === "done") return "green";
  if (step.status === "current") return "yellow";
  if (step.status === "failed") return "red";
  return "off";
}

/** Pseudo-aléatoire stable (arbres / bâtiments). */
function hash(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function serpentineX(i: number): number {
  const cx = MAP_W / 2;
  const amp = 195;
  // Double onde pour un vrai serpentin (pas une ligne droite)
  return cx + Math.sin(i * 0.85) * amp + Math.sin(i * 0.28 + 0.6) * 42;
}

function angleAt(points: Pt[], i: number): number {
  const prev = points[Math.max(0, i - 1)];
  const next = points[Math.min(points.length - 1, i + 1)];
  return Math.atan2(next.y - prev.y, next.x - prev.x);
}

function offsetPoint(p: Pt, angle: number, dist: number, side: 1 | -1): Pt {
  const nx = Math.cos(angle + (Math.PI / 2) * side);
  const ny = Math.sin(angle + (Math.PI / 2) * side);
  return { x: p.x + nx * dist, y: p.y + ny * dist };
}

/** Courbe douce (Catmull-Rom → cubic bezier). */
function smoothPath(points: Pt[]): string {
  if (points.length < 2) return "";
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function Building({ x, y, w, h, roof, height = 18 }: { x: number; y: number; w: number; h: number; roof: string; height?: number }) {
  const skew = height * 0.35;
  return (
    <g className="ck-world__building" aria-hidden>
      <polygon
        points={`${x},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h}`}
        fill="#f5f5f5"
        stroke="#c8c8c8"
        strokeWidth={1.2}
      />
      <polygon
        points={`${x},${y} ${x + w},${y} ${x + w + skew},${y - height} ${x + skew},${y - height}`}
        fill={roof}
        stroke={roof}
        strokeWidth={1}
      />
      <polygon
        points={`${x + w},${y} ${x + w + skew},${y - height} ${x + w + skew},${y + h - height} ${x + w},${y + h}`}
        fill="#e8e8e8"
        stroke="#bbb"
        strokeWidth={0.8}
      />
      <rect x={x + w * 0.2} y={y + h * 0.25} width={w * 0.22} height={h * 0.35} fill="#9ec9ff" opacity={0.85} />
      <rect x={x + w * 0.55} y={y + h * 0.25} width={w * 0.22} height={h * 0.35} fill="#9ec9ff" opacity={0.85} />
    </g>
  );
}

function Tree({ x, y, size }: { x: number; y: number; size: number }) {
  const levels = 5;
  return (
    <g className="ck-world__tree" aria-hidden>
      <ellipse cx={x} cy={y + size * 0.15} rx={size * 0.28} ry={size * 0.12} fill="rgba(0,0,0,0.18)" />
      {Array.from({ length: levels }, (_, level) => {
        const t = level / (levels - 1);
        const r = size * (0.55 - t * 0.28);
        const cy = y - t * size * 0.55;
        const g = Math.round(50 + t * 140);
        return <circle key={level} cx={x} cy={cy} r={r} fill={`rgb(30,${g},70)`} />;
      })}
    </g>
  );
}

function TopCar({ x, y, angle, color }: { x: number; y: number; angle: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${(angle * 180) / Math.PI + 90})`} aria-hidden>
      <rect x={-9} y={-16} width={18} height={32} rx={4} fill={color} stroke="#0f172a" strokeWidth={1.2} />
      <rect x={-7} y={-10} width={14} height={10} rx={2} fill="#bfdbfe" opacity={0.9} />
      <rect x={-7} y={4} width={14} height={6} rx={1.5} fill="#1e3a5f" opacity={0.35} />
      <circle cx={-8} cy={-8} r={2.2} fill="#111" />
      <circle cx={8} cy={-8} r={2.2} fill="#111" />
      <circle cx={-8} cy={10} r={2.2} fill="#111" />
      <circle cx={8} cy={10} r={2.2} fill="#111" />
    </g>
  );
}

function TrafficLightMark({
  x,
  y,
  angle,
  side,
  state,
}: {
  x: number;
  y: number;
  angle: number;
  side: "left" | "right";
  state: "green" | "yellow" | "red" | "off";
}) {
  const shoulder = offsetPoint({ x, y }, angle, ROAD_W * 0.62, side === "left" ? -1 : 1);
  const rot = (angle * 180) / Math.PI;
  return (
    <g transform={`translate(${shoulder.x} ${shoulder.y}) rotate(${rot})`} aria-hidden>
      <rect x={-5} y={-16} width={10} height={32} rx={3} fill="#111827" stroke="#030712" strokeWidth={1} />
      <circle cx={0} cy={-9} r={3.2} fill={state === "red" ? "#ff0033" : "#4a1010"} />
      <circle cx={0} cy={0} r={3.2} fill={state === "yellow" ? "#ffe600" : "#4a4010"} />
      <circle cx={0} cy={9} r={3.2} fill={state === "green" ? "#22ff55" : "#0a3a18"} />
    </g>
  );
}

export default function RoadmapWorldMap({ sections, currentRef, onOpenStep }: Props) {
  const layout = useMemo(() => {
    const stepsFlat: RoadmapStep[] = [];
    const chapterAt: { afterIndex: number; section: RoadmapSection }[] = [];
    sections.forEach((section) => {
      chapterAt.push({ afterIndex: stepsFlat.length, section });
      section.steps.forEach((s) => stepsFlat.push(s));
    });

    const n = Math.max(stepsFlat.length, 1);
    const points: Pt[] = [];
    for (let i = 0; i < n; i++) {
      points.push({ x: serpentineX(i), y: PAD_TOP + i * STEP_GAP });
    }
    // Extra tail so the road continues past last step
    if (points.length) {
      const last = points[points.length - 1];
      points.push({ x: serpentineX(n), y: last.y + STEP_GAP * 0.7 });
    }

    const mapSteps: MapStep[] = stepsFlat.map((step, index) => {
      const point = points[index];
      const angle = angleAt(points, index);
      return {
        step,
        index,
        point,
        angle,
        side: index % 2 === 0 ? "left" : "right",
      };
    });

    const chapters: MapChapter[] = chapterAt.map(({ afterIndex, section }) => {
      const p =
        afterIndex < points.length
          ? {
              x: points[afterIndex].x,
              y: points[afterIndex].y - STEP_GAP * 0.42,
            }
          : points[0];
      return { section, point: p };
    });

    const pathD = smoothPath(points);
    const mapH = PAD_TOP + (n - 1) * STEP_GAP + PAD_BOTTOM;

    // Trees — positions stables hors chaussée
    const trees: { x: number; y: number; size: number }[] = [];
    for (let i = 0; i < n + 8; i++) {
      const baseY = PAD_TOP + i * (STEP_GAP * 0.55);
      for (const lane of [-1, 1] as const) {
        const hx = hash(i * 17 + lane * 9);
        if (hx < 0.22) continue;
        const roadX = serpentineX(Math.min(i, n - 1));
        const x = roadX + lane * (ROAD_W * 0.95 + 28 + hx * 90);
        if (x < 28 || x > MAP_W - 28) continue;
        trees.push({ x, y: baseY + hash(i + lane) * 40, size: 28 + hash(i * 3 + lane) * 22 });
      }
    }

    // Buildings le long des bas-côtés
    const roofs = ["#d44", "#c45c5c", "#6b7280", "#b45309", "#047857"];
    const buildings: { x: number; y: number; w: number; h: number; roof: string }[] = [];
    for (let i = 0; i < n; i += 2) {
      const p = points[Math.min(i, points.length - 1)];
      const ang = angleAt(points, Math.min(i, points.length - 1));
      const side = (i / 2) % 2 === 0 ? -1 : 1;
      const anchor = offsetPoint(p, ang, ROAD_W * 0.95 + 55, side as 1 | -1);
      const w = 46 + hash(i) * 28;
      const h = 38 + hash(i + 1) * 22;
      let bx = anchor.x - w / 2;
      let by = anchor.y - h / 2;
      bx = Math.max(12, Math.min(MAP_W - w - 12, bx));
      by = Math.max(20, by);
      buildings.push({ x: bx, y: by, w, h, roof: roofs[i % roofs.length] });
    }

    // Voitures décoratives sur la route
    const decoCars: { x: number; y: number; angle: number; color: string }[] = [];
    const colors = ["#2563eb", "#f59e0b", "#10b981", "#8b5cf6"];
    for (let i = 1; i < n; i += 3) {
      if (mapSteps[i]?.step.status === "current") continue;
      const p = points[i];
      const mid = {
        x: (points[i - 1].x + p.x) / 2,
        y: (points[i - 1].y + p.y) / 2,
      };
      decoCars.push({
        x: mid.x,
        y: mid.y,
        angle: angleAt(points, i),
        color: colors[i % colors.length],
      });
    }

    return { points, pathD, mapH, mapSteps, chapters, trees, buildings, decoCars };
  }, [sections]);

  const { pathD, mapH, mapSteps, chapters, trees, buildings, decoCars } = layout;

  return (
    <div className="ck-world" style={{ ["--ck-world-h" as string]: `${mapH}` }}>
      <svg
        className="ck-world__canvas"
        viewBox={`0 0 ${MAP_W} ${mapH}`}
        role="img"
        aria-label="Carte du parcours permis — route serpentine"
      >
        <defs>
          <pattern id="ck-grass" width="24" height="24" patternUnits="userSpaceOnUse">
            <rect width="24" height="24" fill="#3aaa3a" />
            <circle cx="6" cy="8" r="1.2" fill="#48b848" opacity="0.5" />
            <circle cx="18" cy="16" r="1" fill="#2f9a2f" opacity="0.45" />
          </pattern>
          <filter id="ck-road-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.28" />
          </filter>
        </defs>

        <rect width={MAP_W} height={mapH} fill="url(#ck-grass)" />

        {buildings.map((b, i) => (
          <Building key={`b-${i}`} {...b} />
        ))}

        {trees.map((t, i) => (
          <Tree key={`t-${i}`} {...t} />
        ))}

        {/* Chaussée (style virtual-world) */}
        <path
          d={pathD}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth={ROAD_W + 10}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#ck-road-shadow)"
        />
        <path
          d={pathD}
          fill="none"
          stroke="#444444"
          strokeWidth={ROAD_W}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Bandes blanches latérales */}
        <path
          d={pathD}
          fill="none"
          stroke="#f8fafc"
          strokeWidth={ROAD_W - 10}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.12}
        />
        <path
          d={pathD}
          fill="none"
          stroke="#444444"
          strokeWidth={ROAD_W - 14}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Ligne centrale pointillée */}
        <path
          d={pathD}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={3.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="18 16"
          opacity={0.95}
        />

        {/* Passages piétons aux chapitres */}
        {chapters.map((ch, i) => (
          <g key={`cross-${i}`} aria-hidden>
            {Array.from({ length: 5 }, (_, k) => (
              <rect
                key={k}
                x={ch.point.x - ROAD_W * 0.38 + k * 12}
                y={ch.point.y - 4}
                width={7}
                height={18}
                fill="#f8fafc"
                opacity={0.9}
                transform={`rotate(${(hash(i) - 0.5) * 8} ${ch.point.x} ${ch.point.y})`}
              />
            ))}
          </g>
        ))}

        {decoCars.map((c, i) => (
          <TopCar key={`car-${i}`} {...c} />
        ))}

        {mapSteps.map((ms) => (
          <TrafficLightMark
            key={`light-${ms.step.ref}`}
            x={ms.point.x}
            y={ms.point.y}
            angle={ms.angle}
            side={ms.side}
            state={lightState(ms.step)}
          />
        ))}

        {/* Voiture joueur (étape en cours) */}
        {mapSteps.map((ms) => {
          if (ms.step.ref !== currentRef) return null;
          if (ms.step.status === "locked" || ms.step.status === "premium_locked") return null;
          return (
            <g key="player-car">
              <image
                href="/images/auth/cartoon-red-car.png"
                x={ms.point.x - 28}
                y={ms.point.y - 52}
                width={56}
                height={42}
                className="ck-world__player-car"
              />
            </g>
          );
        })}
      </svg>

      {/* Jalons chapitres */}
      {chapters.map(({ section, point }) => {
        const done = section.steps.filter((s) => s.status === "done").length;
        const color = chapterBannerColor(section.theme_title, section.theme_index);
        return (
          <div
            key={`ch-${section.theme_id}`}
            className="ck-world__chapter"
            style={{
              left: `${(point.x / MAP_W) * 100}%`,
              top: `${(point.y / mapH) * 100}%`,
              ["--ck-chapter-color" as string]: color,
            }}
            data-chapter-id={section.theme_id}
          >
            <span className="ck-world__chapter-flag">Chapitre {toRoman(section.theme_index)}</span>
            <strong>{section.theme_title}</strong>
            <span className="ck-world__chapter-meta">
              {section.locked ? "Premium" : `${done}/${section.steps.length} étapes`}
            </span>
          </div>
        );
      })}

      {/* Panneaux cours / quiz à gauche ou droite */}
      {mapSteps.map((ms) => {
        const { step, point, side, index } = ms;
        const isLocked = step.status === "locked" || step.status === "premium_locked";
        const title = cleanTitle(step.title);
        const shoulder = offsetPoint(point, ms.angle, ROAD_W * 0.55 + 78, side === "left" ? -1 : 1);
        // Garde les panneaux dans le cadre
        const sx = Math.max(90, Math.min(MAP_W - 90, shoulder.x));
        const sy = shoulder.y;

        return (
          <button
            key={step.ref}
            type="button"
            data-step-ref={step.ref}
            className={[
              "ck-world__sign",
              `ck-world__sign--${side}`,
              `is-${step.status}`,
              step.type === "quiz" ? "is-quiz" : "is-lesson",
            ].join(" ")}
            style={{
              left: `${(sx / MAP_W) * 100}%`,
              top: `${(sy / mapH) * 100}%`,
            }}
            onClick={() => onOpenStep(step)}
            aria-label={title}
          >
            <span className="ck-world__sign-flag">Étape {index + 1}</span>
            <span className="ck-world__sign-type">{step.type === "quiz" ? "Quiz" : "Cours"}</span>
            <span className="ck-world__sign-title">{title}</span>
            <span className="ck-world__sign-status">
              {isLocked ? <Lock size={12} strokeWidth={2.5} /> : null}
              {stepStatusLabel(step)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
