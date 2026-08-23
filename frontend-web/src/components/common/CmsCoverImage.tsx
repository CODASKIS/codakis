import { useState, type CSSProperties } from "react";
import { DEFAULT_COVER_IMAGE } from "../../flexjobs/assets/online-images";
import { resolveCmsMediaUrl } from "../../lib/cms-api";

type CmsCoverImageProps = {
  url?: string | null;
  alt?: string;
  className?: string;
  loading?: "eager" | "lazy";
  width?: number;
  height?: number;
  style?: CSSProperties;
};

/** Image CMS avec repli local si l'URL distante échoue. */
export default function CmsCoverImage({
  url,
  alt = "",
  className,
  loading = "lazy",
  width,
  height,
  style,
}: CmsCoverImageProps) {
  const [src, setSrc] = useState(() => resolveCmsMediaUrl(url));

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      width={width}
      height={height}
      style={style}
      onError={() => {
        if (src !== DEFAULT_COVER_IMAGE) setSrc(DEFAULT_COVER_IMAGE);
      }}
    />
  );
}
