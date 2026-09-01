import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getScenario, type DrivingScenario } from "./presets";

type Vec = { x: number; y: number };

type Props = {
  scenarioId?: string;
  scenario?: DrivingScenario;
  height?: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function dist(a: Vec, b: Vec) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function normalize(v: Vec): Vec {
  const len = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / len, y: v.y / len };
}

function lerpVec(from: Vec, to: Vec, t: number): Vec {
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
}

function segmentsFromRect(x: number, y: number, w: number, h: number) {
  return [
    { a: { x, y }, b: { x, y: y + h } },
    { a: { x, y: y + h }, b: { x: x + w, y: y + h } },
    { a: { x: x + w, y: y + h }, b: { x: x + w, y } },
    { a: { x: x + w, y }, b: { x, y } },
  ];
}

function rayIntersect(origin: Vec, end: Vec, seg: { a: Vec; b: Vec }) {
  const rd = { x: end.x - origin.x, y: end.y - origin.y };
  const sd = { x: seg.b.x - seg.a.x, y: seg.b.y - seg.a.y };
  const denom = rd.x * sd.y - rd.y * sd.x;
  if (Math.abs(denom) < 1e-6) return null;
  const diff = { x: seg.a.x - origin.x, y: seg.a.y - origin.y };
  const t = (diff.x * sd.y - diff.y * sd.x) / denom;
  const u = (diff.x * rd.y - diff.y * rd.x) / denom;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  return { point: { x: origin.x + rd.x * t, y: origin.y + rd.y * t }, t };
}

export default function DrivingSimulator({ scenarioId = "draft", scenario, height = 420 }: Props) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(true);
  const [debug, setDebug] = useState(false);
  const runningRef = useRef(running);
  const debugRef = useRef(debug);
  const active = scenario ?? getScenario(scenarioId);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    debugRef.current = debug;
  }, [debug]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return undefined;

    let raf = 0;
    const width = canvas.clientWidth;
    const roadY = Math.round(height * 0.55);
    const roadH = 70;

    const player = {
      pos: { ...active.player },
      target: { x: active.player.tx, y: active.player.ty },
      dir: normalize({ x: active.player.tx - active.player.x, y: active.player.ty - active.player.y }),
      speed: 0,
      w: 28,
      h: 14,
    };

    const aiCars = (active.vehicles ?? []).map((v) => ({
      ...v,
      pos: { x: v.x, y: v.y },
      target: { x: v.tx, y: v.ty },
      dir: normalize({ x: v.tx - v.x, y: v.ty - v.y }),
      speed: 0.8,
      w: 26,
      h: 13,
    }));

    const peds = (active.pedestrians ?? []).map((p) => ({ ...p, y: roadY - 38 }));

    const buildingCount = active.buildings ?? 8;
    const buildings = Array.from({ length: buildingCount }, (_, i) => ({
      x: 40 + i * ((width - 80) / buildingCount),
      w: 55 + (i % 3) * 18,
      h: 80 + (i % 4) * 35,
      top: roadY - 120 - (i % 5) * 12,
      shade: i % 2 === 0 ? "#cbd5e1" : "#94a3b8",
    }));

    function allSegments() {
      const segs: Array<{ a: Vec; b: Vec }> = [];
      for (const o of active.obstacles ?? []) {
        segs.push(...segmentsFromRect(o.x, o.y, o.w, o.h));
      }
      for (const car of aiCars) {
        segs.push(...segmentsFromRect(car.pos.x, car.pos.y, car.w, car.h));
      }
      return segs;
    }

    function drawEnvironment() {
      const sky = ctx.createLinearGradient(0, 0, 0, roadY);
      sky.addColorStop(0, "#87ceeb");
      sky.addColorStop(1, "#dbeafe");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      for (const b of buildings) {
        ctx.fillStyle = b.shade;
        ctx.fillRect(b.x, b.top, b.w, roadY - b.top - 8);
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        for (let row = 0; row < 4; row += 1) {
          for (let col = 0; col < 3; col += 1) {
            if ((row + col) % 2 === 0) {
              ctx.fillRect(b.x + 8 + col * 14, b.top + 10 + row * 16, 8, 10);
            }
          }
        }
      }

      ctx.fillStyle = "#6b7280";
      ctx.fillRect(0, roadY + roadH, width, height - roadY - roadH);

      ctx.fillStyle = "#374151";
      ctx.fillRect(0, roadY, width, roadH);

      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2;
      ctx.setLineDash([18, 14]);
      ctx.beginPath();
      ctx.moveTo(0, roadY + roadH / 2);
      ctx.lineTo(width, roadY + roadH / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#e5e7eb";
      ctx.fillRect(0, roadY - 8, width, 8);
      ctx.fillRect(0, roadY + roadH, width, 8);

      const treePoints =
        active.trees && active.trees.length > 0
          ? active.trees.map((t) => t.x)
          : [90, 260, 430, 620, 790, 960].filter((x) => x < width - 20);
      for (const treeX of treePoints) {
        ctx.fillStyle = "#78350f";
        ctx.fillRect(treeX, roadY - 28, 6, 22);
        ctx.fillStyle = "#15803d";
        ctx.beginPath();
        ctx.arc(treeX + 3, roadY - 32, 14, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawTrafficLights() {
      for (const light of active.trafficLights ?? []) {
        ctx.fillStyle = "#1f2937";
        ctx.fillRect(light.x, light.y, 12, 34);
        const colors =
          light.state === "green"
            ? ["#374151", "#22c55e", "#374151"]
            : light.state === "amber"
              ? ["#374151", "#f59e0b", "#374151"]
              : ["#ef4444", "#374151", "#374151"];
        colors.forEach((color, index) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(light.x + 6, light.y + 8 + index * 10, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }

    function drawObstacles() {
      for (const o of active.obstacles ?? []) {
        if (o.kind === "building") {
          ctx.fillStyle = "#64748b";
        } else if (o.kind === "parked") {
          ctx.fillStyle = "#475569";
        } else {
          ctx.fillStyle = "#ef4444";
        }
        ctx.fillRect(o.x, o.y, o.w, o.h);
      }
    }

    function drawPedestrians(time: number) {
      for (const p of peds) {
        const walk = p.x + Math.sin(time * 0.002 * p.speed * 60) * 18 * p.dir;
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.arc(walk, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#1d2630";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(walk, p.y + 5);
        ctx.lineTo(walk, p.y + 16);
        ctx.stroke();
      }
    }

    function drawCar(x: number, y: number, dir: Vec, color: string, label?: string) {
      const angle = Math.atan2(dir.y, dir.x);
      ctx.save();
      ctx.translate(x + 14, y + 7);
      ctx.rotate(angle);
      ctx.fillStyle = color;
      ctx.fillRect(-14, -7, 28, 14);
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fillRect(2, -4, 8, 8);
      ctx.restore();
      if (label && debugRef.current) {
        ctx.fillStyle = "#111";
        ctx.font = "10px sans-serif";
        ctx.fillText(label, x, y - 4);
      }
    }

    function updatePlayer() {
      const goalDir = normalize({ x: player.target.x - player.pos.x, y: player.target.y - player.pos.y });
      player.dir = normalize(lerpVec(player.dir, goalDir, 0.08));
      player.speed = dist(player.pos, player.target) <= 2 ? 0 : 1.6;
      player.pos.x += player.dir.x * player.speed;
      player.pos.y += player.dir.y * player.speed;

      const center = { x: player.pos.x + 14, y: player.pos.y + 7 };
      const segments = allSegments();
      let closest: number | null = null;
      const radar = 110;

      for (let angle = -45; angle <= 45; angle += 3) {
        const rad = (angle * Math.PI) / 180 + Math.atan2(player.dir.y, player.dir.x);
        const end = { x: Math.cos(rad) * radar + center.x, y: Math.sin(rad) * radar + center.y };
        let hit: Vec | null = null;
        for (const seg of segments) {
          const inter = rayIntersect(center, end, seg);
          if (inter && (!hit || inter.t < (rayIntersect(center, hit, seg)?.t ?? 999))) {
            hit = inter.point;
          }
        }
        if (debugRef.current) {
          ctx.strokeStyle = hit ? "rgba(239,68,68,0.35)" : "rgba(29,185,106,0.18)";
          ctx.beginPath();
          ctx.moveTo(center.x, center.y);
          ctx.lineTo(hit?.x ?? end.x, hit?.y ?? end.y);
          ctx.stroke();
        }
        if (hit) {
          const d = dist(center, hit);
          if (closest == null || d < closest) closest = d;
        }
      }

      if (closest != null && closest < 40) {
        player.speed *= clamp((closest - 20) / 60, 0.1, 1);
      }
    }

    function updateAi() {
      for (const car of aiCars) {
        const goal = normalize({ x: car.target.x - car.pos.x, y: car.target.y - car.pos.y });
        car.dir = normalize(lerpVec(car.dir, goal, 0.04));
        car.pos.x += car.dir.x * car.speed;
        car.pos.y += car.dir.y * car.speed;
        if (dist(car.pos, { x: car.target.x, y: car.target.y }) < 4) car.speed = 0;
      }
    }

    function frame(time: number) {
      if (runningRef.current) {
        updatePlayer();
        updateAi();
      }

      ctx.clearRect(0, 0, width, height);
      drawEnvironment();
      drawTrafficLights();
      drawObstacles();
      drawPedestrians(time);

      for (const car of aiCars) {
        drawCar(car.pos.x, car.pos.y, car.dir, "#2563eb", car.id);
      }
      drawCar(player.pos.x, player.pos.y, player.dir, "#1db96a", "VOUS");

      if (debugRef.current) {
        ctx.strokeStyle = "#1db96a";
        ctx.beginPath();
        ctx.moveTo(player.pos.x + 14, player.pos.y + 7);
        ctx.lineTo(player.target.x, player.target.y);
        ctx.stroke();
      }

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [active, height]);

  return (
    <section className="codakis-driving-sim">
      <header className="codakis-driving-sim__head">
        <div>
          <strong>{active.label}</strong>
          <p>{active.description}</p>
        </div>
        <div className="codakis-driving-sim__controls">
          <button type="button" className="btn btn-sm btn-primary" onClick={() => setRunning((v) => !v)}>
            {running ? t("simulation.pause") : t("simulation.start")}
          </button>
          <label className="codakis-driving-sim__debug">
            <input type="checkbox" checked={debug} onChange={(e) => setDebug(e.target.checked)} />
            {t("simulation.debug")}
          </label>
        </div>
      </header>
      <div className="codakis-driving-sim__canvas-wrap">
        <canvas ref={canvasRef} className="codakis-driving-sim__canvas" width={1100} height={height} />
      </div>
      <p className="codakis-driving-sim__hint">{t("simulation.hint")}</p>
    </section>
  );
}
