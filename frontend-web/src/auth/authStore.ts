import type { AuthSession, RegisterPayload, SubscriptionPlan, UserRole } from "./types";
import { getRoleDashboardPath } from "./roles";

const STORAGE_KEY = "codakis-auth-session";

export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** Mock — le backend renverra le rôle réel après authentification. */
export function resolveRoleFromCredentials(username: string): UserRole {
  const lower = username.trim().toLowerCase();

  if (lower.includes("admin")) return "admin";
  if (lower.includes("moniteur") || lower.includes("instructor")) return "moniteur";
  if (lower.includes("gerant") || lower.includes("gérant") || lower.includes("ecole") || lower.includes("école")) {
    return "gerant";
  }

  return "candidat";
}

export function loginWithCredentials(username: string, _password: string): AuthSession {
  const role = resolveRoleFromCredentials(username);
  const session: AuthSession = {
    role,
    email: username.includes("@") ? username : `${username}@codakis.cm`,
    name: username.includes("@") ? username.split("@")[0] : username,
  };
  setSession(session);
  return session;
}

/** Mock OAuth Google — le backend remplacera ce flux. */
export function loginWithGoogle(): AuthSession {
  const session: AuthSession = {
    role: "candidat",
    email: "google.user@gmail.com",
    name: "Utilisateur Google",
  };
  setSession(session);
  return session;
}

/** @deprecated Préférer loginWithCredentials — conservé pour l'inscription par rôle. */
export function login(role: UserRole, username: string, _password: string): AuthSession {
  const session: AuthSession = {
    role,
    email: username.includes("@") ? username : `${username}@codakis.cm`,
    name: username.includes("@") ? username.split("@")[0] : username,
  };
  setSession(session);
  return session;
}

export function register(role: UserRole, payload: RegisterPayload): AuthSession {
  const session: AuthSession = {
    role,
    email: payload.username.includes("@") ? payload.username : `${payload.username}@codakis.cm`,
    name: payload.fullName.trim() || payload.username,
    phone: payload.phone?.trim() || undefined,
    city: payload.city?.trim() || undefined,
  };

  if (role === "gerant" && payload.schoolName?.trim()) {
    session.school = {
      name: payload.schoolName.trim(),
      address: payload.schoolAddress?.trim() || undefined,
      mintRegistration: payload.mintRegistration?.trim() || undefined,
      country: payload.country,
      legalName: payload.legalName?.trim() || undefined,
      rccm: payload.rccm?.trim() || undefined,
      website: payload.website?.trim() || undefined,
      description: payload.description?.trim() || undefined,
      managerRole: payload.managerRole?.trim() || undefined,
      instructorCount: payload.instructorCount?.trim() || undefined,
      vehicleCount: payload.vehicleCount?.trim() || undefined,
      yearsOperating: payload.yearsOperating?.trim() || undefined,
    };
  }

  setSession(session);
  return session;
}

export function getPostLoginPath(role: UserRole): string {
  return getRoleDashboardPath(role);
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export function isAuthenticatedForRole(role: UserRole): boolean {
  const session = getSession();
  return session?.role === role;
}

export function getUserPlan(): SubscriptionPlan {
  return getSession()?.plan ?? "free";
}

export function isPremiumUser(): boolean {
  return getUserPlan() === "premium";
}

export function canUpgradeToPremium(): boolean {
  const session = getSession();
  return session?.role === "candidat" && !isPremiumUser();
}
