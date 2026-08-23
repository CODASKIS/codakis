const COOKIE_NAME = "codakis-cookie-consent";
const COOKIE_VALUE = "active";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24;

export function isCookiePolicyAccepted(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((entry) => {
    const [name, value] = entry.trim().split("=");
    return name === COOKIE_NAME && value === COOKIE_VALUE;
  });
}

export function acceptCookiePolicy(): void {
  document.cookie = `${COOKIE_NAME}=${COOKIE_VALUE}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent("codakis-cookie-consent"));
}
