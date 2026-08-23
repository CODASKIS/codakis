import { markdownToHtml } from "../flexjobs/utils/markdown";

export function isHtmlContent(content: string): boolean {
  const trimmed = content.trim();
  return trimmed.startsWith("<") && /<\/[a-z][\s\S]*>/i.test(trimmed);
}

export async function renderBlogBody(content: string): Promise<string> {
  if (!content.trim()) return "";
  if (isHtmlContent(content)) return content;
  return markdownToHtml(content);
}
