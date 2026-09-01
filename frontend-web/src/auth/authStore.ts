import type { AuthSession, RegisterPayload, SubscriptionPlan, UserRole } from "./types";
import { getRoleDashboardPath } from "./roles";
import {
  AuthApiError,
  clearTokens,
  fetchMe,
  forgotPassword,
  login as apiLogin,
  loginWithGoogleIdToken,
  registerAutoEcole,
  registerCandidat,
  resetPassword,
  verifyResetOtp as apiVerifyResetOtp,
  userToSession,
} from "../lib/authApi";
import { syncCandidateEnrollmentFromApi } from "./candidateEnrollment";

export { resolveAuthRedirect } from "./purchaseIntent";

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
  clearTokens();
}

export async function hydrateSessionFromApi(): Promise<AuthSession | null> {
  try {
    const user = await fetchMe();
    let session = userToSession(user);
    setSession(session);
    if (session.role === "candidat") {
      await syncCandidateEnrollmentFromApi();
      session = getSession() ?? session;
    }
    return session;
  } catch {
    clearSession();
    return null;
  }
}

export async function loginWithCredentials(email: string, password: string): Promise<AuthSession> {
  const { user } = await apiLogin(email, password);
  let session = userToSession(user);
  setSession(session);
  if (session.role === "candidat") {
    await syncCandidateEnrollmentFromApi();
    session = getSession() ?? session;
  }
  return session;
}

export async function loginWithGoogle(idToken: string): Promise<AuthSession> {
  const { user } = await loginWithGoogleIdToken(idToken);
  const session = userToSession(user);
  setSession(session);
  return session;
}

export async function registerCandidatAccount(payload: RegisterPayload, langue: string): Promise<AuthSession> {
  const countryCode = (payload.country ?? "cm").toUpperCase();
  const { user } = await registerCandidat({
    email: payload.username.trim(),
    password: payload.password,
    full_name: payload.fullName.trim(),
    phone: payload.phone?.trim(),
    city: payload.city?.trim(),
    country_code: countryCode,
    langue,
  });
  const session = userToSession(user);
  setSession(session);
  return session;
}

function parseOptionalCount(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function registerDrivingSchool(payload: RegisterPayload, langue: string): Promise<string> {
  const countryCode = (payload.country ?? "cm").toUpperCase();
  const response = await registerAutoEcole({
    email: payload.username.trim(),
    password: payload.password,
    full_name: payload.fullName.trim(),
    phone: payload.phone?.trim() ?? "",
    city: payload.city?.trim() ?? "",
    country_code: countryCode,
    langue,
    school_name: payload.schoolName?.trim() ?? "",
    school_address: payload.schoolAddress?.trim() ?? "",
    mint_registration: payload.mintRegistration?.trim(),
    rccm: payload.rccm?.trim(),
    legal_name: payload.legalName?.trim(),
    description: payload.description?.trim(),
    website: payload.website?.trim(),
    manager_role: payload.managerRole?.trim(),
    instructor_count: parseOptionalCount(payload.instructorCount),
    vehicle_count: parseOptionalCount(payload.vehicleCount),
    years_operating: parseOptionalCount(payload.yearsOperating),
  });
  return response.message;
}

export async function requestPasswordReset(email: string): Promise<{ message: string; debugOtp?: string }> {
  const response = await forgotPassword(email);
  return { message: response.message, debugOtp: response.debug_otp ?? undefined };
}

export async function verifyResetOtp(email: string, otp: string): Promise<{ message: string }> {
  const response = await apiVerifyResetOtp(email, otp);
  return { message: response.message };
}

export async function confirmPasswordReset(email: string, otp: string, newPassword: string): Promise<string> {
  const response = await resetPassword(email, otp, newPassword);
  return response.message;
}

/** @deprecated Préférer loginWithCredentials — conservé pour compatibilité. */
export function login(role: UserRole, username: string, _password: string): AuthSession {
  const session: AuthSession = {
    role,
    email: username.includes("@") ? username : `${username}@codakis.cm`,
    name: username.includes("@") ? username.split("@")[0] : username,
  };
  setSession(session);
  return session;
}

/** @deprecated — mock retiré, utiliser registerCandidatAccount. */
export function register(_role: UserRole, _payload: RegisterPayload): AuthSession {
  throw new Error("Utiliser registerCandidatAccount ou registerDrivingSchool");
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

export function logout(): void {
  clearSession();
}

export function getUserPlan(): SubscriptionPlan {
  const session = getSession();
  if (session?.role !== "candidat") return "free";
  return session.plan ?? "free";
}

export function isPremiumUser(): boolean {
  const session = getSession();
  if (session?.role !== "candidat") return false;
  return (session.plan ?? "free") === "premium";
}

export function canUpgradeToPremium(): boolean {
  const session = getSession();
  return session?.role === "candidat" && !isPremiumUser();
}

export { AuthApiError };
