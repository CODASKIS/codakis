/**
 * Math & dessin adaptés de gniziemazity/virtual-world (MIT)
 * https://github.com/gniziemazity/virtual-world
 */

export class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}

  equals(p: Point) {
    return this.x === p.x && this.y === p.y;
  }
}

export function distance(p1: Point, p2: Point) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

export function add(p1: Point, p2: Point) {
  return new Point(p1.x + p2.x, p1.y + p2.y);
}

export function subtract(p1: Point, p2: Point) {
  return new Point(p1.x - p2.x, p1.y - p2.y);
}

export function scale(p: Point, scaler: number) {
  return new Point(p.x * scaler, p.y * scaler);
}

export function magnitude(p: Point) {
  return Math.hypot(p.x, p.y);
}

export function normalize(p: Point) {
  const m = magnitude(p) || 1;
  return scale(p, 1 / m);
}

export function translate(loc: Point, ang: number, offset: number) {
  return new Point(loc.x + Math.cos(ang) * offset, loc.y + Math.sin(ang) * offset);
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function lerp2D(A: Point, B: Point, t: number) {
  return new Point(lerp(A.x, B.x, t), lerp(A.y, B.y, t));
}

export function getFake3dPoint(point: Point, viewPoint: Point, height: number) {
  const dir = normalize(subtract(point, viewPoint));
  const dist = distance(point, viewPoint);
  const scaler = Math.atan(dist / 300) / (Math.PI / 2);
  return add(point, scale(dir, height * scaler));
}

export function hash(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** Arbre multi-niveaux (virtual-world Tree.draw) */
export function drawTree(
  ctx: CanvasRenderingContext2D,
  center: Point,
  size: number,
  viewPoint: Point,
  height = 160,
) {
  const top = getFake3dPoint(center, viewPoint, height);
  const levelCount = 7;

  // ombre
  ctx.beginPath();
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.ellipse(center.x, center.y + size * 0.12, size * 0.32, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let level = 0; level < levelCount; level++) {
    const t = level / (levelCount - 1);
    const point = lerp2D(center, top, t);
    const color = `rgb(30,${Math.round(lerp(50, 200, t))},70)`;
    const levelSize = lerp(size, 40, t);
    const rad = levelSize / 2;
    ctx.beginPath();
    ctx.fillStyle = color;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
      const kindOfRandom = Math.cos((a + center.x) * size) ** 2;
      const noisyRadius = rad * lerp(0.55, 1, kindOfRandom);
      const px = point.x + Math.cos(a) * noisyRadius;
      const py = point.y + Math.sin(a) * noisyRadius;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
}

/** Bâtiment fake-3D (virtual-world Building.draw simplifié) */
export function drawBuilding(
  ctx: CanvasRenderingContext2D,
  base: Point[],
  viewPoint: Point,
  height = 180,
  roofColor = "#D44",
) {
  const topPoints = base.map((p) => getFake3dPoint(p, viewPoint, height * 0.55));

  // base
  ctx.beginPath();
  ctx.moveTo(base[0].x, base[0].y);
  for (let i = 1; i < base.length; i++) ctx.lineTo(base[i].x, base[i].y);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  // côtés
  for (let i = 0; i < base.length; i++) {
    const next = (i + 1) % base.length;
    ctx.beginPath();
    ctx.moveTo(base[i].x, base[i].y);
    ctx.lineTo(base[next].x, base[next].y);
    ctx.lineTo(topPoints[next].x, topPoints[next].y);
    ctx.lineTo(topPoints[i].x, topPoints[i].y);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? "#f3f3f3" : "#e4e4e4";
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();
  }

  // toit
  ctx.beginPath();
  ctx.moveTo(topPoints[0].x, topPoints[0].y);
  for (let i = 1; i < topPoints.length; i++) ctx.lineTo(topPoints[i].x, topPoints[i].y);
  ctx.closePath();
  ctx.fillStyle = roofColor;
  ctx.strokeStyle = roofColor;
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
}

/** Feu tricolore style virtual-world Light.draw */
export function drawLight(
  ctx: CanvasRenderingContext2D,
  center: Point,
  angle: number,
  state: "green" | "yellow" | "red" | "off",
  height = 22,
) {
  const perp = angle + Math.PI / 2;
  const half = 14;
  const a = translate(center, perp, half);
  const b = translate(center, perp, -half);
  const green = lerp2D(a, b, 0.2);
  const yellow = lerp2D(a, b, 0.5);
  const red = lerp2D(a, b, 0.8);

  ctx.beginPath();
  ctx.lineWidth = height;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#111";
  ctx.moveTo(red.x, red.y);
  ctx.lineTo(green.x, green.y);
  ctx.stroke();

  const lamp = (p: Point, on: boolean, color: string, dim: string) => {
    ctx.beginPath();
    ctx.fillStyle = on ? color : dim;
    ctx.arc(p.x, p.y, height * 0.32, 0, Math.PI * 2);
    ctx.fill();
  };

  lamp(green, state === "green", "#0F0", "#060");
  lamp(yellow, state === "yellow", "#FF0", "#660");
  lamp(red, state === "red", "#F00", "#600");
}

/** Voiture vue de dessus */
export function drawTopCar(
  ctx: CanvasRenderingContext2D,
  center: Point,
  angle: number,
  color: string,
  w = 18,
  h = 32,
) {
  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.rotate(angle + Math.PI / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 1.2;
  roundRect(ctx, -w / 2, -h / 2, w, h, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#bfdbfe";
  roundRect(ctx, -w / 2 + 2, -h / 2 + 4, w - 4, 10, 2);
  ctx.fill();
  ctx.fillStyle = "#111";
  for (const [cx, cy] of [
    [-w / 2 + 1, -8],
    [w / 2 - 1, -8],
    [-w / 2 + 1, 10],
    [w / 2 - 1, 10],
  ] as const) {
    ctx.beginPath();
    ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Route style virtual-world : bordures + asphalte + pointillés */
export function drawRoadPath(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  roadWidth: number,
) {
  if (points.length < 2) return;

  const path = () => {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1 === 0 ? 0 : i - 2] ?? points[i - 1];
      const p1 = points[i - 1];
      const p2 = points[i];
      const p3 = points[i + 1] ?? p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
  };

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // bordure sombre
  path();
  ctx.strokeStyle = "#222";
  ctx.lineWidth = roadWidth + 14;
  ctx.stroke();

  // asphalte
  path();
  ctx.strokeStyle = "#444";
  ctx.lineWidth = roadWidth;
  ctx.stroke();

  // bords blancs (via masque large + asphalte interne)
  path();
  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = roadWidth - 12;
  ctx.stroke();

  path();
  ctx.strokeStyle = "#444";
  ctx.lineWidth = roadWidth - 20;
  ctx.stroke();

  // ligne centrale
  path();
  ctx.strokeStyle = "#f1f5f9";
  ctx.lineWidth = 3.5;
  ctx.setLineDash([18, 16]);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore();
}
