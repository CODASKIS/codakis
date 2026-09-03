export function stripSimulationBlocks(html: string): string {
  if (!html) return "";
  let result = html;
  result = result.replace(/<div\b[^>]*\bdata-codakis-simulation(?:-ref)?=["'][^"']*["'][^>]*>\s*<\/div>/gi, "");
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

export function htmlToPlainText(html: string): string {
  return stripSimulationBlocks(html)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
