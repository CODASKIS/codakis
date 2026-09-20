import { useMemo } from "react";
import { Lock } from "lucide-react";
import type { RoadmapSection, RoadmapStep } from "../../lib/pedagogyApi";

type Props = {
  sections: RoadmapSection[];
  currentRef?: string | null;
  onOpenStep: (step: RoadmapStep) => void;
};

type Pt = { x: number; y: number };

type Node = {
  kind: "step";
  step: RoadmapStep;
  index: number;
  point: Pt;
};

type ChapterMark = {
  kind: "chapter";
  section: RoadmapSection;
  point: Pt;
};

const MAP_W = 420;
const PAD_X = 56;
const PAD_TOP = 72;
const PAD_BOTTOM = 96;
const STEP_GAP = 118;
const LINE_W = 28;
const NODE_R = 28;
/** Orange Fidélité */
const ORANGE = "#ff7900";

function cleanTitle(title: string) {
  return title.replace(/\s*[—–−]+\s*/g, " ").trim();
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

/** Zigzag gauche/droite comme OM Fidélité */
function nodeX(i: number): number {
  const left = PAD_X + NODE_R;
  const right = MAP_W - PAD_X - NODE_R;
  return i % 2 === 0 ? left : right;
}

function smoothPath(points: Pt[]): string {
  if (points.length < 2) return "";
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 5;
    const cp1y = p1.y + (p2.y - p0.y) / 5;
    const cp2x = p2.x - (p3.x - p1.x) / 5;
    const cp2y = p2.y - (p3.y - p1.y) / 5;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function statusClass(step: RoadmapStep): string {
  if (step.status === "done") return "is-done";
  if (step.status === "current") return "is-current";
  if (step.status === "failed") return "is-failed";
  if (step.status === "premium_locked") return "is-premium";
  if (step.status === "locked") return "is-locked";
  return "";
}

export default function RoadmapWorldMap({ sections, currentRef, onOpenStep }: Props) {
  const layout = useMemo(() => {
    const steps: RoadmapStep[] = [];
    const chapterStarts: { index: number; section: RoadmapSection }[] = [];
    sections.forEach((section) => {
      chapterStarts.push({ index: steps.length, section });
      section.steps.forEach((s) => steps.push(s));
    });

    const n = Math.max(steps.length, 1);
    const points: Pt[] = [];
    for (let i = 0; i < n; i++) {
      points.push({ x: nodeX(i), y: PAD_TOP + i * STEP_GAP });
    }
    // Petite extension de ligne après le dernier nœud
    if (points.length) {
      const last = points[points.length - 1];
      points.push({
        x: nodeX(n),
        y: last.y + STEP_GAP * 0.55,
      });
    }

    const nodes: Node[] = steps.map((step, index) => ({
      kind: "step",
      step,
      index,
      point: points[index],
    }));

    const chapters: ChapterMark[] = chapterStarts.map(({ index, section }) => {
      const p = points[Math.min(index, points.length - 1)];
      return {
        kind: "chapter",
        section,
        point: { x: MAP_W / 2, y: Math.max(28, p.y - STEP_GAP * 0.42) },
      };
    });

    const mapH = PAD_TOP + (n - 1) * STEP_GAP + PAD_BOTTOM;
    const pathD = smoothPath(points);

    return { nodes, chapters, pathD, mapH, points };
  }, [sections]);

  const { nodes, chapters, pathD, mapH } = layout;

  return (
    <div className="ck-om" aria-label="Parcours permis — feuille de route">
      <p className="ck-om__hint">Continuez vos cours et quiz pour avancer sur la route</p>

      <div className="ck-om__stage" style={{ ["--ck-om-h" as string]: `${mapH}` }}>
        <svg
          className="ck-om__svg"
          viewBox={`0 0 ${MAP_W} ${mapH}`}
          role="img"
          aria-hidden
        >
          {/* Déco légère */}
          <circle cx={MAP_W - 48} cy={36} r={18} fill="#ffc107" opacity={0.9} />
          <ellipse cx={70} cy={48} rx={36} ry={14} fill="#fff" opacity={0.85} />
          <ellipse cx={95} cy={42} rx={22} ry={10} fill="#fff" opacity={0.75} />
          <ellipse cx={MAP_W - 90} cy={mapH * 0.35} rx={40} ry={16} fill="#fff" opacity={0.7} />
          <ellipse cx={80} cy={mapH * 0.62} rx={34} ry={14} fill="#fff" opacity={0.65} />

          {/* Route = ligne orange */}
          <path
            d={pathD}
            fill="none"
            stroke={ORANGE}
            strokeWidth={LINE_W}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Liseré clair pour du relief */}
          <path
            d={pathD}
            fill="none"
            stroke="#fff"
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.35}
          />
        </svg>

        {chapters.map(({ section, point }) => {
          const done = section.steps.filter((s) => s.status === "done").length;
          return (
            <div
              key={`ch-${section.theme_id}`}
              className="ck-om__chapter"
              style={{
                left: `${(point.x / MAP_W) * 100}%`,
                top: `${(point.y / mapH) * 100}%`,
              }}
              data-chapter-id={section.theme_id}
            >
              Chapitre {toRoman(section.theme_index)} · {section.theme_title}
              {!section.locked ? ` · ${done}/${section.steps.length}` : " · Premium"}
            </div>
          );
        })}

        {nodes.map(({ step, index, point }) => {
          const title = cleanTitle(step.title);
          const isLocked = step.status === "locked" || step.status === "premium_locked";
          const isCurrent = step.ref === currentRef || step.status === "current";
          const side = index % 2 === 0 ? "left" : "right";

          return (
            <button
              key={step.ref}
              type="button"
              data-step-ref={step.ref}
              className={["ck-om__node", statusClass(step), isCurrent ? "is-focus" : "", `is-side-${side}`]
                .filter(Boolean)
                .join(" ")}
              style={{
                left: `${(point.x / MAP_W) * 100}%`,
                top: `${(point.y / mapH) * 100}%`,
              }}
              onClick={() => onOpenStep(step)}
              aria-label={title}
            >
              <span className="ck-om__bubble">
                {isLocked ? <Lock size={16} strokeWidth={2.5} /> : <span>{index + 1}</span>}
              </span>
              <span className="ck-om__caption">
                <span className="ck-om__caption-type">{step.type === "quiz" ? "Quiz" : "Cours"}</span>
                <span className="ck-om__caption-title">{title}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
