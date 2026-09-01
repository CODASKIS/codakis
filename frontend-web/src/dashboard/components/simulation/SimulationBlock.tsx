import { useEffect, useState } from "react";
import DrivingSimulator from "./DrivingSimulator";
import { getScenario } from "./presets";
import { fetchSimulationScenario, normalizeScenarioFromApi } from "../../../lib/simulationApi";
import type { DrivingScenario } from "./presets";

type Props = {
  scenarioKey: string;
  mode: "preset" | "ref";
};

export default function SimulationBlock({ scenarioKey, mode }: Props) {
  const [scenario, setScenario] = useState<DrivingScenario | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setError("");
    setScenario(null);

    if (mode === "preset") {
      setScenario(getScenario(scenarioKey));
      return undefined;
    }

    void fetchSimulationScenario(scenarioKey)
      .then((record) => {
        if (!cancelled) setScenario(normalizeScenarioFromApi(record.scenario as unknown as Record<string, unknown>));
      })
      .catch(() => {
        if (!cancelled) setError("Simulation indisponible");
      });

    return () => {
      cancelled = true;
    };
  }, [mode, scenarioKey]);

  if (error) return <p className="codakis-driving-sim__hint text-danger">{error}</p>;
  if (!scenario) return <p className="codakis-driving-sim__hint">Chargement de la simulation…</p>;
  return <DrivingSimulator scenario={scenario} />;
}
