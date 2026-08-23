import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: true,
});

export async function markdownToHtml(markdown: string): Promise<string> {
  return marked.parse(markdown, { async: false }) as string;
}

/** Rendu synchrone pour les bulles de chat. */
export function markdownToHtmlSync(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string;
}
