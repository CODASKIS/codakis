import { resolveCmsMediaUrl } from "../../lib/cms-api";
import { toVideoEmbedUrl } from "../../lib/video-embed";

type MediaVideoProps = {
  url?: string | null;
  title?: string;
  className?: string;
};

/** Lecteur vidéo pédagogique : embarque YouTube/Vimeo ou lit un fichier direct. */
export default function MediaVideo({ url, title = "", className }: MediaVideoProps) {
  const value = url?.trim();
  if (!value) return null;

  const embedUrl = toVideoEmbedUrl(value);
  const wrapperClass = className ? `codakis-video ${className}` : "codakis-video";

  if (embedUrl) {
    return (
      <div className={wrapperClass}>
        <iframe
          src={embedUrl}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <video src={resolveCmsMediaUrl(value)} controls preload="metadata" />
    </div>
  );
}
