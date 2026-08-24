/** Convertit un lien YouTube/Vimeo en URL embarquable, sinon renvoie null. */
export function toVideoEmbedUrl(url: string): string | null {
  const value = url.trim();
  if (!value) return null;

  const youtube = value.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;

  const vimeo = value.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return null;
}
