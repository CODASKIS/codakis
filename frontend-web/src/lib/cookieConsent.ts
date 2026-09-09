const COOKIE_NAME = "codakis-cookie-consent";
const COOKIE_ACCEPTED = "accepted";
const COOKIE_REFUSED = "refused";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function readConsentValue(): string | null {
  if (typeof document === "undefined") return null;
  for (const entry of document.cookie.split(";")) {
    const [name, value] = entry.trim().split("=");
    if (name === COOKIE_NAME) return value ?? null;
  }
  return null;
}

function writeConsent(value: string): void {
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent("codakis-cookie-consent", { detail: { value } }));
}

/** True si l'utilisateur a déjà choisi (accepter ou refuser). */
export function isCookiePolicyAccepted(): boolean {
  const value = readConsentValue();
  // Compat ancien cookie "active"
  return value === COOKIE_ACCEPTED || value === COOKIE_REFUSED || value === "active";
}

export function acceptCookiePolicy(): void {
  writeConsent(COOKIE_ACCEPTED);
}

export function refuseCookiePolicy(): void {
  writeConsent(COOKIE_REFUSED);
}
