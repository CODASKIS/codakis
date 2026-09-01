import { useEffect, useMemo, useState } from "react";
import { getIdenticonDataUrl } from "@/lib/identicon";

function hasValidPhoto(url?: string | null): url is string {
  return Boolean(url && url.trim() && !url.includes("owner.jpg"));
}

type UserAvatarProps = {
  name: string;
  photoUrl?: string | null;
  fallbackPhotoUrl?: string | null;
  sizeClass?: string;
  textClass?: string;
  displaySize?: number;
};

export default function UserAvatar({
  name,
  photoUrl,
  fallbackPhotoUrl,
  sizeClass = "h-11 w-11",
  displaySize = 128,
}: UserAvatarProps) {
  const identiconSrc = useMemo(() => getIdenticonDataUrl(name, displaySize), [name, displaySize]);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const primaryUrl = hasValidPhoto(photoUrl) ? photoUrl.trim() : null;
  const fallbackUrl = hasValidPhoto(fallbackPhotoUrl) ? fallbackPhotoUrl.trim() : null;

  useEffect(() => {
    setActiveUrl(primaryUrl ?? fallbackUrl ?? identiconSrc);
    setImageLoaded(false);
    setImageError(false);
  }, [primaryUrl, fallbackUrl, identiconSrc]);

  const showPhoto = Boolean(activeUrl) && !imageError;

  if (showPhoto && activeUrl) {
    return (
      <span className={`relative inline-flex shrink-0 ${sizeClass}`}>
        {!imageLoaded ? (
          <span
            className="absolute inset-0 animate-pulse rounded-full bg-brand-500/30 ring-2 ring-white dark:ring-gray-900"
            aria-hidden
          />
        ) : null}
        <img
          src={activeUrl}
          alt={name}
          referrerPolicy="no-referrer"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            if (fallbackUrl && activeUrl !== fallbackUrl) {
              setActiveUrl(fallbackUrl);
              setImageLoaded(false);
              return;
            }
            if (activeUrl !== identiconSrc) {
              setActiveUrl(identiconSrc);
              setImageLoaded(false);
              return;
            }
            setImageError(true);
          }}
          className={`${sizeClass} shrink-0 rounded-full object-cover ring-2 ring-white transition-opacity duration-300 dark:ring-gray-900 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      </span>
    );
  }

  return (
    <span className={`relative inline-flex shrink-0 ${sizeClass}`} title={name}>
      <img
        src={identiconSrc}
        alt={name}
        className={`${sizeClass} shrink-0 rounded-full object-cover ring-2 ring-white dark:ring-gray-900`}
      />
    </span>
  );
}
