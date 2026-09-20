/** Badge SVG téléchargeable — un fichier par niveau ou succès débloqué. */

export type BadgeCard = {
  id: string;
  title: string;
  subtitle: string;
  color: string;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function downloadBadge(badge: BadgeCard) {
  const title = escapeXml(badge.title);
  const subtitle = escapeXml(badge.subtitle);
  const color = escapeXml(badge.color);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="900" viewBox="0 0 720 900">
  <rect width="720" height="900" rx="48" fill="#F7F7F7"/>
  <rect x="36" y="36" width="648" height="828" rx="36" fill="#FFFFFF" stroke="#E5E5E5" stroke-width="4"/>
  <circle cx="360" cy="280" r="150" fill="${color}"/>
  <circle cx="360" cy="280" r="118" fill="#FFFFFF"/>
  <circle cx="360" cy="280" r="96" fill="${color}"/>
  <text x="360" y="298" text-anchor="middle" font-family="Nunito, Arial, sans-serif" font-size="64" font-weight="800" fill="#FFFFFF">★</text>
  <text x="360" y="500" text-anchor="middle" font-family="Nunito, Arial, sans-serif" font-size="28" font-weight="800" fill="#58A700" letter-spacing="4">CODAKIS</text>
  <text x="360" y="570" text-anchor="middle" font-family="Nunito, Arial, sans-serif" font-size="48" font-weight="800" fill="#3C3C3C">${title}</text>
  <text x="360" y="630" text-anchor="middle" font-family="Nunito, Arial, sans-serif" font-size="24" font-weight="700" fill="#777777">${subtitle}</text>
  <text x="360" y="780" text-anchor="middle" font-family="Nunito, Arial, sans-serif" font-size="20" font-weight="700" fill="#AFAFAF">Badge de progression · Permis CEMAC</text>
</svg>`;
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `codakis-badge-${badge.id}.svg`;
  link.click();
  URL.revokeObjectURL(url);
}
