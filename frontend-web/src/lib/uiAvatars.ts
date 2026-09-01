import { getIdenticonDataUrl } from "./identicon";

/** Photo profil : avatar_url API ou identicon généré localement. */
export function getUserAvatarUrl(
  name: string,
  displaySize = 64,
  avatarUrl?: string | null,
): string {
  if (avatarUrl?.trim()) return avatarUrl.trim();
  const pixels = Math.min(512, Math.max(64, displaySize * 2));
  return getIdenticonDataUrl(name.trim() || "User", pixels);
}
