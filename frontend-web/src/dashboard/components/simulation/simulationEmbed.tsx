import SimulationBlock from "./SimulationBlock";
import { getScenario } from "./presets";

/** Désactivé temporairement — réactiver quand le simulateur sera prêt en production. */
export const DRIVING_SIMULATOR_ENABLED = false;

const PRESET_RE = /<div[^>]*data-codakis-simulation=["']([^"']+)["'][^>]*>\s*<\/div>/gi;
const REF_RE = /<div[^>]*data-codakis-simulation-ref=["']([^"']+)["'][^>]*>\s*<\/div>/gi;

export type ParsedSimulationBlock = {
  id: string;
  mode: "preset" | "ref";
  start: number;
  end: number;
};

function collectBlocks(html: string): ParsedSimulationBlock[] {
  const blocks: ParsedSimulationBlock[] = [];
  let match: RegExpExecArray | null;

  const presetRe = new RegExp(PRESET_RE.source, "gi");
  while ((match = presetRe.exec(html)) !== null) {
    blocks.push({ id: match[1], mode: "preset", start: match.index, end: match.index + match[0].length });
  }

  const refRe = new RegExp(REF_RE.source, "gi");
  while ((match = refRe.exec(html)) !== null) {
    blocks.push({ id: match[1], mode: "ref", start: match.index, end: match.index + match[0].length });
  }

  return blocks.sort((a, b) => a.start - b.start);
}

export function findSimulationBlocks(html: string): ParsedSimulationBlock[] {
  return collectBlocks(html);
}

export function stripSimulationBlocks(html: string): string {
  if (!html) return "";
  let result = html;
  result = result.replace(PRESET_RE, "").replace(REF_RE, "");
  result = result.replace(
    /<h2[^>]*>\s*Simulation(?:\s+(?:interactive|de conduite))?\s*<\/h2>\s*(?:<p[^>]*>[\s\S]*?<\/p>\s*)?/gi,
    "",
  );
  result = result.replace(
    /<p[^>]*>\s*(?:Visualisez|Observez|Circulation dense|Carrefour|Scène urbaine|Virage|Obstacles|Voie bloquée|Approche|Trafic|Pri)[^<]*<\/p>\s*/gi,
    "",
  );
  return result.replace(/\n{3,}/g, "\n\n").trim();
}

type SimulationFromHtmlProps = {
  html: string;
};

export function SimulationsFromHtml({ html }: SimulationFromHtmlProps) {
  const blocks = collectBlocks(html);
  if (blocks.length === 0) return null;

  return (
    <div className="codakis-driving-sim-list">
      {blocks.map((block) => (
        <SimulationBlock key={`${block.mode}-${block.id}-${block.start}`} scenarioKey={block.id} mode={block.mode} />
      ))}
    </div>
  );
}

export function simulationEmbedHtml(scenarioId: string): string {
  getScenario(scenarioId);
  return `<div data-codakis-simulation="${scenarioId}"></div>`;
}

export { simulationRefEmbedHtml } from "../../../lib/simulationApi";
