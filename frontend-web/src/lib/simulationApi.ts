import { authFetch } from "./authApi";
import type { DrivingScenario } from "../dashboard/components/simulation/presets";

export type SimulationScenarioRecord = {
  id: string;
  title: string;
  description: string | null;
  scenario: DrivingScenario;
  source: string;
  theme_id?: string | null;
  created_at: string;
  updated_at?: string;
};

export async function fetchSimulationScenario(id: string): Promise<SimulationScenarioRecord> {
  return authFetch<SimulationScenarioRecord>(`/api/v1/candidat/pedagogy/simulations/${id}`);
}

export async function adminGenerateSimulation(payload: {
  title: string;
  context: string;
  theme_id?: string;
  language?: string;
}): Promise<SimulationScenarioRecord> {
  return authFetch<SimulationScenarioRecord>("/api/v1/admin/pedagogy/simulations/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adminListSimulations(themeId?: string): Promise<SimulationScenarioRecord[]> {
  const query = themeId ? `?theme_id=${encodeURIComponent(themeId)}` : "";
  return authFetch<SimulationScenarioRecord[]>(`/api/v1/admin/pedagogy/simulations${query}`);
}

export function simulationRefEmbedHtml(scenarioId: string): string {
  return `<div data-codakis-simulation-ref="${scenarioId}"></div>`;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isSimulationUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

export function normalizeScenarioFromApi(raw: Record<string, unknown>): DrivingScenario {
  const trafficLights = (raw.traffic_lights ?? raw.trafficLights ?? []) as DrivingScenario["trafficLights"];
  const trees = (raw.trees ?? []) as DrivingScenario["trees"];
  return {
    id: String(raw.id ?? "custom"),
    label: String(raw.label ?? "Scénario"),
    description: String(raw.description ?? ""),
    player: raw.player as DrivingScenario["player"],
    vehicles: (raw.vehicles ?? []) as DrivingScenario["vehicles"],
    obstacles: (raw.obstacles ?? []) as DrivingScenario["obstacles"],
    pedestrians: (raw.pedestrians ?? []) as DrivingScenario["pedestrians"],
    trafficLights,
    trees,
    buildings: Number(raw.buildings ?? 8),
  };
}
