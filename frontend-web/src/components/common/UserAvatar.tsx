import { useEffect, useMemo, useState } from "react";

function UserSilhouette({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.866 0-7 2.239-7 5v1h14v-1c0-2.761-3.134-5-7-5z" />
    </svg>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function hasValidPhoto(url?: string | null): url is string {
  return Boolean(url && url.trim() && !url.includes("owner.jpg"));
}

type UserAvatarProps = {
  name: string;
  photoUrl?: string | null;
  fallbackPhotoUrl?: string | null;
  sizeClass?: string;
  textClass?: string;
};

export default function UserAvatar({
  name,
  photoUrl,
  fallbackPhotoUrl,
  sizeClass = "h-11 w-11",
  textClass = "text-sm",
}: UserAvatarProps) {
  const initials = useMemo(() => getInitials(name), [name]);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const primaryUrl = hasValidPhoto(photoUrl) ? photoUrl.trim() : null;
  const fallbackUrl = hasValidPhoto(fallbackPhotoUrl) ? fallbackPhotoUrl.trim() : null;

  useEffect(() => {
    setActiveUrl(primaryUrl ?? fallbackUrl);
    setImageLoaded(false);
    setImageError(false);
  }, [primaryUrl, fallbackUrl]);

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
    <span
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-brand-600 font-semibold text-white ring-2 ring-white dark:ring-gray-900 ${textClass}`}
      aria-hidden={Boolean(initials)}
      title={name}
    >
      {initials || <UserSilhouette />}
    </span>
  );
}
