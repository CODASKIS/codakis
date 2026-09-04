/** Palette bandeaux chapitre (déterministe par titre / index) */
export const CHAPTER_BANNER_COLORS = [
  "#00a859",
  "#0ea5e9",
  "#f59e0b",
  "#8b5cf6",
  "#e11d48",
  "#14b8a6",
  "#6366f1",
  "#ec4899",
  "#84cc16",
  "#f97316",
] as const;

export function chapterBannerColor(title: string, index = 1): string {
  let hash = 0;
  for (let i = 0; i < title.length; i += 1) hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
  return CHAPTER_BANNER_COLORS[(hash + Math.max(0, index - 1)) % CHAPTER_BANNER_COLORS.length];
}
