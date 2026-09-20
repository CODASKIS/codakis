/**
 * Stockage auth en cookies de session (SameSite=Lax) — partagé entre onglets
 * du même navigateur (lien e-mail « Sécuriser mon compte »), sans localStorage.
 */

const ACCESS_COOKIE = "codakis_access";
const REFRESH_COOKIE = "codakis_refresh";

/** Anciennes clés localStorage — migration unique. */
const LEGACY_ACCESS = "codakis-access-token";
const LEGACY_REFRESH = "codakis-refresh-token";

function isSecureContext() {
  return typeof window !== "undefined" && window.location.protocol === "https:";
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  for (const part of document.cookie.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length));
    }
  }
  return null;
}

function writeCookie(name: string, value: string, maxAgeSeconds?: number) {
  if (typeof document === "undefined") return;
  const secure = isSecureContext() ? "; Secure" : "";
  const maxAge = typeof maxAgeSeconds === "number" ? `; Max-Age=${maxAgeSeconds}` : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax${maxAge}${secure}`;
}

function eraseCookie(name: string) {
  if (typeof document === "undefined") return;
  const secure = isSecureContext() ? "; Secure" : "";
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

function migrateLegacyTokens() {
  try {
    const legacyAccess = localStorage.getItem(LEGACY_ACCESS);
    const legacyRefresh = localStorage.getItem(LEGACY_REFRESH);
    if (legacyAccess && !readCookie(ACCESS_COOKIE)) {
      writeCookie(ACCESS_COOKIE, legacyAccess);
    }
    if (legacyRefresh && !readCookie(REFRESH_COOKIE)) {
      writeCookie(REFRESH_COOKIE, legacyRefresh);
    }
    if (legacyAccess) localStorage.removeItem(LEGACY_ACCESS);
    if (legacyRefresh) localStorage.removeItem(LEGACY_REFRESH);
  } catch {
    /* ignore */
  }
}

export function getSessionAccessToken(): string | null {
  migrateLegacyTokens();
  return readCookie(ACCESS_COOKIE);
}

export function getSessionRefreshToken(): string | null {
  migrateLegacyTokens();
  return readCookie(REFRESH_COOKIE);
}

export function setSessionTokens(access: string, refresh: string) {
  // Cookies de session (pas de Max-Age) : valables jusqu’à fermeture du navigateur.
  writeCookie(ACCESS_COOKIE, access);
  writeCookie(REFRESH_COOKIE, refresh);
  try {
    localStorage.removeItem(LEGACY_ACCESS);
    localStorage.removeItem(LEGACY_REFRESH);
  } catch {
    /* ignore */
  }
}

export function clearSessionTokens() {
  eraseCookie(ACCESS_COOKIE);
  eraseCookie(REFRESH_COOKIE);
  try {
    localStorage.removeItem(LEGACY_ACCESS);
    localStorage.removeItem(LEGACY_REFRESH);
  } catch {
    /* ignore */
  }
}
