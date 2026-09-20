import { useEffect, useMemo, useRef } from "react";
import { Lock } from "lucide-react";
import { chapterBannerColor } from "../../lib/chapterColors";
import type { RoadmapSection, RoadmapStep } from "../../lib/pedagogyApi";
import {
  Point,
  drawBuilding,
  drawLight,
  drawRoadPath,
  drawTopCar,
  drawTree,
  hash,
  translate,
} from "../world/virtualWorldDraw";

type Props = {
  sections: RoadmapSection[];
  currentRef?: string | null;
  onOpenStep: (step: RoadmapStep) => void;
};

type MapStep = {
  step: RoadmapStep;
  index: number;
  point: Point;
  angle: number;
  side: "left" | "right";
};

/** Grande carte espacée — proportions proches de virtual-world */
const MAP_W = 980;
const ROAD_W = 108;
const STEP_GAP = 310;
const PAD_TOP = 160;
const PAD_BOTTOM = 180;
const AMP = 260;

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

function serpentineX(i: number) {
  return MAP_W / 2 + Math.sin(i * 0.9) * AMP + Math.sin(i * 0.32 + 0.4) * 55;
}

function angleAt(points: Point[], i: number) {
  const prev = points[Math.max(0, i - 1)];
  const next = points[Math.min(points.length - 1, i + 1)];
  return Math.atan2(next.y - prev.y, next.x - prev.x);
}

export default function RoadmapWorldMap({ sections, currentRef, onOpenStep }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const layout = useMemo(() => {
    const stepsFlat: RoadmapStep[] = [];
    const chapterAt: { afterIndex: number; section: RoadmapSection }[] = [];
    sections.forEach((section) => {
      chapterAt.push({ afterIndex: stepsFlat.length, section });
      section.steps.forEach((s) => stepsFlat.push(s));
    });

    const n = Math.max(stepsFlat.length, 1);
    const points: Point[] = [];
    for (let i = 0; i < n; i++) {
      points.push(new Point(serpentineX(i), PAD_TOP + i * STEP_GAP));
    }
    if (points.length) {
      points.push(new Point(serpentineX(n), points[points.length - 1].y + STEP_GAP * 0.75));
    }

    const mapSteps: MapStep[] = stepsFlat.map((step, index) => ({
      step,
      index,
      point: points[index],
      angle: angleAt(points, index),
      side: index % 2 === 0 ? "left" : "right",
    }));

    const chapters = chapterAt.map(({ afterIndex, section }) => {
      const p = points[Math.min(afterIndex, points.length - 1)];
      return {
        section,
        point: new Point(p.x, p.y - STEP_GAP * 0.38),
      };
    });

    const mapH = PAD_TOP + (n - 1) * STEP_GAP + PAD_BOTTOM;
    const viewPoint = new Point(MAP_W / 2, mapH * 0.35);

    const trees: { center: Point; size: number }[] = [];
    for (let i = 0; i < n + 12; i++) {
      const baseY = PAD_TOP * 0.4 + i * (STEP_GAP * 0.48);
      for (const lane of [-1, 1] as const) {
        const hx = hash(i * 19 + lane * 7);
        if (hx < 0.18) continue;
        const roadX = serpentineX(Math.min(Math.floor(i * 0.7), n - 1));
        const x = roadX + lane * (ROAD_W * 0.85 + 70 + hx * 110);
        if (x < 50 || x > MAP_W - 50) continue;
        trees.push({
          center: new Point(x, baseY + hash(i + lane) * 50),
          size: 70 + hash(i * 5 + lane) * 50,
        });
      }
    }

    const roofs = ["#D44", "#c45c5c", "#6b7280", "#b45309", "#047857"];
    const buildings: { base: Point[]; roof: string }[] = [];
    for (let i = 0; i < n; i += 2) {
      const p = points[Math.min(i, points.length - 1)];
      const ang = angleAt(points, Math.min(i, points.length - 1));
      const side = (i / 2) % 2 === 0 ? -1 : 1;
      const anchor = translate(p, ang + (Math.PI / 2) * side, ROAD_W * 0.85 + 95);
      const w = 70 + hash(i) * 40;
      const h = 58 + hash(i + 2) * 30;
      let bx = anchor.x - w / 2;
      let by = anchor.y - h / 2;
      bx = Math.max(24, Math.min(MAP_W - w - 24, bx));
      by = Math.max(40, by);
      buildings.push({
        base: [
          new Point(bx, by),
          new Point(bx + w, by),
          new Point(bx + w, by + h),
          new Point(bx, by + h),
        ],
        roof: roofs[i % roofs.length],
      });
    }

    const decoCars: { center: Point; angle: number; color: string }[] = [];
    const colors = ["#2563eb", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"];
    for (let i = 1; i < n; i += 2) {
      if (mapSteps[i]?.step.ref === currentRef) continue;
      const mid = new Point(
        (points[i - 1].x + points[i].x) / 2,
        (points[i - 1].y + points[i].y) / 2,
      );
      decoCars.push({
        center: mid,
        angle: angleAt(points, i),
        color: colors[i % colors.length],
      });
    }

    return { points, mapH, mapSteps, chapters, trees, buildings, decoCars, viewPoint };
  }, [sections, currentRef]);

  const { points, mapH, mapSteps, chapters, trees, buildings, decoCars, viewPoint } = layout;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = MAP_W * dpr;
    canvas.height = mapH * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Herbe (virtual-world)
    ctx.fillStyle = "#3aaa3a";
    ctx.fillRect(0, 0, MAP_W, mapH);
    ctx.fillStyle = "rgba(72,184,72,0.25)";
    for (let i = 0; i < 120; i++) {
      const x = hash(i * 3) * MAP_W;
      const y = hash(i * 7 + 1) * mapH;
      ctx.beginPath();
      ctx.arc(x, y, 1.5 + hash(i) * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bâtiments
    for (const b of buildings) {
      drawBuilding(ctx, b.base, viewPoint, 170 + hash(b.base[0].x) * 60, b.roof);
    }

    // Arbres (derrière / devant géré par y)
    const sortedTrees = [...trees].sort((a, b) => a.center.y - b.center.y);
    for (const t of sortedTrees) {
      drawTree(ctx, t.center, t.size, viewPoint, 140 + t.size);
    }

    // Route
    drawRoadPath(ctx, points, ROAD_W);

    // Passages piétons aux chapitres
    for (const ch of chapters) {
      ctx.save();
      ctx.translate(ch.point.x, ch.point.y);
      for (let k = 0; k < 6; k++) {
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(-ROAD_W * 0.4 + k * 14, -6, 8, 22);
      }
      ctx.restore();
    }

    // Voitures déco
    for (const c of decoCars) {
      drawTopCar(ctx, c.center, c.angle, c.color, 20, 36);
    }

    // Feux sur les bas-côtés
    for (const ms of mapSteps) {
      const shoulder = translate(
        ms.point,
        ms.angle + (Math.PI / 2) * (ms.side === "left" ? -1 : 1),
        ROAD_W * 0.58,
      );
      drawLight(ctx, shoulder, ms.angle, lightState(ms.step), 24);
    }

    // Voiture joueur
    const current = mapSteps.find((ms) => ms.step.ref === currentRef);
    if (current && current.step.status !== "locked" && current.step.status !== "premium_locked") {
      const img = new Image();
      img.src = "/images/auth/cartoon-red-car.png";
      img.onload = () => {
        ctx.drawImage(img, current.point.x - 36, current.point.y - 58, 72, 52);
      };
    }
  }, [buildings, chapters, currentRef, decoCars, mapH, mapSteps, points, trees, viewPoint]);

  return (
    <div className="ck-world" style={{ ["--ck-world-h" as string]: `${mapH}` }}>
      <canvas
        ref={canvasRef}
        className="ck-world__canvas"
        style={{ width: "100%", height: "auto", aspectRatio: `${MAP_W} / ${mapH}` }}
        aria-label="Carte du parcours permis — style virtual-world"
      />

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

      {mapSteps.map((ms) => {
        const { step, point, side, index, angle } = ms;
        const isLocked = step.status === "locked" || step.status === "premium_locked";
        const title = cleanTitle(step.title);
        const shoulder = translate(point, angle + (Math.PI / 2) * (side === "left" ? -1 : 1), ROAD_W * 0.55 + 130);
        const sx = Math.max(110, Math.min(MAP_W - 110, shoulder.x));
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
