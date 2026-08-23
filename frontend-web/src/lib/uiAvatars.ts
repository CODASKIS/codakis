const UI_AVATARS_BASE = "https://ui-avatars.com/api/";

export type UiAvatarOptions = {
  name: string;
  size?: number;
  background?: string;
  color?: string;
  bold?: boolean;
  rounded?: boolean;
  format?: "png" | "svg";
};

/** URL UI Avatars — initiales + fond aléatoire (contraste texte auto). */
export function getUiAvatarUrl(options: UiAvatarOptions): string {
  const displayName = options.name.trim() || "User";
  const params = new URLSearchParams();
  params.set("name", displayName);
  params.set("size", String(options.size ?? 128));
  params.set("background", options.background ?? "random");
  if (options.color) {
    params.set("color", options.color);
  }
  params.set("bold", options.bold === false ? "false" : "true");
  params.set("rounded", options.rounded === false ? "false" : "true");
  params.set("format", options.format ?? "png");
  return `${UI_AVATARS_BASE}?${params.toString()}`;
}

/** Photo profil : avatar_url API ou UI Avatars. */
export function getUserAvatarUrl(
  name: string,
  displaySize = 64,
  avatarUrl?: string | null,
): string {
  if (avatarUrl?.trim()) return avatarUrl.trim();
  return getUiAvatarUrl({
    name,
    size: displaySize * 2,
    bold: true,
    rounded: true,
    format: "png",
  });
}
