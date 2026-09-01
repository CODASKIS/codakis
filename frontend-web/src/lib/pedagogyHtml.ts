import { stripSimulationBlocks } from "../dashboard/components/simulation/simulationEmbed";

export { stripSimulationBlocks };

export function htmlToPlainText(html: string): string {
  return stripSimulationBlocks(html)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
