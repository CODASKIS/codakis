export type SimObstacle = { x: number; y: number; w: number; h: number; kind?: "barrier" | "parked" | "building" };
export type SimVehicle = { id: string; x: number; y: number; tx: number; ty: number; ai?: boolean };
export type SimPedestrian = { x: number; y: number; dir: 1 | -1; speed: number };
export type SimTrafficLight = { x: number; y: number; state: "red" | "green" | "amber" };
export type SimTree = { x: number; y: number };

export type DrivingScenario = {
  id: string;
  label: string;
  description: string;
  player: { x: number; y: number; tx: number; ty: number };
  vehicles?: SimVehicle[];
  obstacles?: SimObstacle[];
  pedestrians?: SimPedestrian[];
  trafficLights?: SimTrafficLight[];
  trees?: SimTree[];
  buildings?: number;
};

export const DRIVING_SCENARIOS: Record<string, DrivingScenario> = {
  "heavy-traffic": {
    id: "heavy-traffic",
    label: "Circulation dense",
    description: "Franchissez une route avec plusieurs véhicules devant vous.",
    player: { x: 50, y: 230, tx: 980, ty: 230 },
    vehicles: [
      { id: "V1", x: 350, y: 230, tx: 980, ty: 230, ai: true },
      { id: "V2", x: 210, y: 230, tx: 980, ty: 230, ai: true },
      { id: "V3", x: 155, y: 230, tx: 980, ty: 230, ai: true },
      { id: "V4", x: 600, y: 150, tx: 600, ty: 520, ai: true },
      { id: "V5", x: 750, y: 400, tx: 0, ty: 400, ai: true },
    ],
    pedestrians: [
      { x: 420, y: 195, dir: 1, speed: 0.4 },
      { x: 680, y: 195, dir: -1, speed: 0.35 },
    ],
    buildings: 8,
  },
  dodge: {
    id: "dodge",
    label: "Éviter les obstacles",
    description: "Le radar aide à détecter les obstacles — choisissez la meilleure trajectoire.",
    player: { x: 50, y: 230, tx: 980, ty: 230 },
    obstacles: [
      { x: 110, y: 200, w: 32, h: 32, kind: "barrier" },
      { x: 110, y: 260, w: 32, h: 32, kind: "barrier" },
      { x: 210, y: 260, w: 32, h: 32, kind: "barrier" },
      { x: 310, y: 200, w: 32, h: 32, kind: "barrier" },
      { x: 410, y: 260, w: 32, h: 32, kind: "barrier" },
      { x: 510, y: 200, w: 32, h: 32, kind: "barrier" },
      { x: 550, y: 260, w: 32, h: 32, kind: "barrier" },
    ],
    pedestrians: [{ x: 300, y: 192, dir: 1, speed: 0.5 }],
    buildings: 6,
  },
  blocked: {
    id: "blocked",
    label: "Route bloquée",
    description: "La voie est partiellement bloquée — ralentissez et contournement.",
    player: { x: 50, y: 230, tx: 980, ty: 230 },
    obstacles: [
      { x: 110, y: 200, w: 32, h: 92, kind: "barrier" },
    ],
    buildings: 5,
  },
  curve: {
    id: "curve",
    label: "Virage serré",
    description: "Approchez un virage avec des véhicules stationnés.",
    player: { x: 50, y: 230, tx: 980, ty: 230 },
    obstacles: [
      { x: 110, y: 200, w: 200, h: 32, kind: "parked" },
      { x: 110, y: 260, w: 200, h: 32, kind: "parked" },
      { x: 310, y: 260, w: 100, h: 32, kind: "parked" },
      { x: 410, y: 160, w: 40, h: 132, kind: "barrier" },
    ],
    buildings: 7,
  },
  draft: {
    id: "draft",
    label: "Scénario urbain",
    description: "Environnement complet : immeubles, piétons, trafic croisé.",
    player: { x: 50, y: 230, tx: 980, ty: 230 },
    vehicles: [{ id: "AI1", x: 120, y: 140, tx: 980, ty: 230, ai: true }],
    obstacles: [
      { x: 110, y: 200, w: 200, h: 32, kind: "parked" },
      { x: 110, y: 260, w: 340, h: 32, kind: "parked" },
      { x: 310, y: 50, w: 250, h: 82, kind: "building" },
      { x: 450, y: 180, w: 300, h: 32, kind: "parked" },
    ],
    pedestrians: [
      { x: 250, y: 192, dir: 1, speed: 0.45 },
      { x: 520, y: 192, dir: -1, speed: 0.38 },
      { x: 780, y: 192, dir: 1, speed: 0.42 },
    ],
    buildings: 10,
  },
  intersection: {
    id: "intersection",
    label: "Carrefour",
    description: "Priorité et visibilité réduite à l'approche d'un carrefour.",
    player: { x: 50, y: 210, tx: 980, ty: 230 },
    obstacles: [
      { x: 110, y: 150, w: 340, h: 32, kind: "parked" },
      { x: 450, y: 150, w: 32, h: 132, kind: "barrier" },
    ],
    vehicles: [{ id: "CROSS", x: 520, y: 80, tx: 520, ty: 420, ai: true }],
    pedestrians: [
      { x: 480, y: 192, dir: 1, speed: 0.5 },
      { x: 560, y: 192, dir: -1, speed: 0.5 },
    ],
    trafficLights: [
      { x: 500, y: 165, state: "red" },
      { x: 540, y: 165, state: "amber" },
    ],
    buildings: 9,
  },
};

export function getScenario(id: string): DrivingScenario {
  return DRIVING_SCENARIOS[id] ?? DRIVING_SCENARIOS.draft;
}

export const SCENARIO_OPTIONS = Object.values(DRIVING_SCENARIOS);
