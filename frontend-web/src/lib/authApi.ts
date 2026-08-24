import type { UserRole } from "../auth/types";

export type ApiUser = {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string | null;
  city?: string | null;
  avatar_url?: string | null;
  country_code: string;
  langue: string;
  is_active: boolean;
  school_validated?: boolean | null;
  school_id?: string | null;
  school_name?: string | null;
  plan?: "free" | "premium" | null;
  has_password?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ConsortPieceStatus = "validated" | "pending" | "missing";

export type ConsortPiece = {
  key: string;
  status: ConsortPieceStatus;
  validated_at: string | null;
};

export type ConsortDossier = {
  id: string;
  statut: string;
  validated_count: number;
  pending_count: number;
  missing_count: number;
  total_count: number;
  progress_percent: number;
  created_at: string;
  updated_at: string;
  date_depot: string | null;
  pieces: ConsortPiece[];
};

export type GerantSchool = {
  id: string;
  raison_sociale: string;
  raison_sociale_legale: string | null;
  numero_agrement: string;
  rccm: string | null;
  adresse: string;
  ville: string | null;
  quartier: string | null;
  country_code: string;
  site_web: string | null;
  logo_url: string | null;
  description: string | null;
  description_longue: string | null;
  access_info: string | null;
  telephone: string | null;
  nombre_moniteurs: number | null;
  nombre_vehicules: number | null;
  annees_experience: number | null;
  fonction_gerant: string | null;
  latitude: number | null;
  longitude: number | null;
  horaires: Record<string, string> | null;
  est_validee: boolean;
  est_refusee: boolean;
  motif_refus: string | null;
  validee_le: string | null;
  created_at: string;
};

export type GerantMoniteur = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  has_password: boolean;
  linked_at: string;
  max_seances_semaine: number;
  capacite_creneau: number;
};

export type GerantMoniteurCreateResponse = GerantMoniteur & {
  temp_password: string | null;
};

export type GerantMoniteurPasswordReset = {
  temp_password: string;
  message: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type MessageResponse = {
  message: string;
  debug_otp?: string | null;
};

export type SchoolStatus = "pending" | "validated" | "rejected";

export type AutoEcolePending = {
  id: string;
  raison_sociale: string;
  raison_sociale_legale: string | null;
  numero_agrement: string;
  rccm: string | null;
  adresse: string;
  site_web: string | null;
  logo_url: string | null;
  description: string | null;
  telephone: string | null;
  nombre_moniteurs: number | null;
  nombre_vehicules: number | null;
  annees_experience: number | null;
  fonction_gerant: string | null;
  est_validee: boolean;
  est_refusee: boolean;
  motif_refus: string | null;
  gerant_email: string;
  gerant_name: string;
  gerant_phone: string | null;
  gerant_id: string | null;
  ville: string | null;
  country_code: string;
  status: SchoolStatus;
  created_at: string;
  updated_at: string | null;
  validee_le: string | null;
  refusee_le: string | null;
  moniteur_count?: number | null;
};

const TOKEN_KEY = "codakis-access-token";
const REFRESH_KEY = "codakis-refresh-token";

function apiUrl(path: string): string {
  const base = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";
  return base ? `${base}${path}` : path;
}

export class AuthApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: string | { msg?: string }[] };
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail) && body.detail[0]?.msg) return body.detail[0].msg;
  } catch {
    /* ignore */
  }
  return `Erreur API (${response.status})`;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(tokens: TokenResponse): void {
  localStorage.setItem(TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export async function authFetch<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(apiUrl(path), { ...init, headers });

  if (response.status === 401 && retry && getRefreshToken()) {
    try {
      await refreshSession();
      return authFetch(path, init, false);
    } catch {
      clearTokens();
    }
  }

  if (!response.ok) {
    throw new AuthApiError(await parseError(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function refreshSession(): Promise<TokenResponse> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new AuthApiError("Session expirée", 401);
  }

  const response = await fetch(apiUrl("/api/v1/auth/refresh"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new AuthApiError(await parseError(response), response.status);
  }

  const tokens = (await response.json()) as TokenResponse;
  setTokens(tokens);
  return tokens;
}

export async function login(email: string, password: string): Promise<{ tokens: TokenResponse; user: ApiUser }> {
  const response = await fetch(apiUrl("/api/v1/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new AuthApiError(await parseError(response), response.status);
  }

  const tokens = (await response.json()) as TokenResponse;
  setTokens(tokens);
  const user = await fetchMe();
  return { tokens, user };
}

export async function loginWithGoogleIdToken(idToken: string): Promise<{ tokens: TokenResponse; user: ApiUser }> {
  const response = await fetch(apiUrl("/api/v1/auth/google"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });

  if (!response.ok) {
    throw new AuthApiError(await parseError(response), response.status);
  }

  const tokens = (await response.json()) as TokenResponse;
  setTokens(tokens);
  const user = await fetchMe();
  return { tokens, user };
}

export async function registerCandidat(payload: {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  city?: string;
  country_code: string;
  langue: string;
}): Promise<{ tokens: TokenResponse; user: ApiUser }> {
  const response = await fetch(apiUrl("/api/v1/auth/register/candidat"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new AuthApiError(await parseError(response), response.status);
  }

  const tokens = (await response.json()) as TokenResponse;
  setTokens(tokens);
  const user = await fetchMe();
  return { tokens, user };
}

export async function registerAutoEcole(payload: {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  city: string;
  country_code: string;
  langue: string;
  school_name: string;
  school_address: string;
  mint_registration?: string;
  rccm?: string;
  legal_name?: string;
  description?: string;
  website?: string;
  manager_role?: string;
  instructor_count?: number;
  vehicle_count?: number;
  years_operating?: number;
}): Promise<MessageResponse> {
  const response = await fetch(apiUrl("/api/v1/auth/register/auto-ecole"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new AuthApiError(await parseError(response), response.status);
  }

  return (await response.json()) as MessageResponse;
}

export async function forgotPassword(email: string): Promise<MessageResponse> {
  const response = await fetch(apiUrl("/api/v1/auth/forgot-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new AuthApiError(await parseError(response), response.status);
  }

  return (await response.json()) as MessageResponse;
}

export async function resetPassword(email: string, otp: string, newPassword: string): Promise<MessageResponse> {
  const response = await fetch(apiUrl("/api/v1/auth/reset-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, new_password: newPassword }),
  });

  if (!response.ok) {
    throw new AuthApiError(await parseError(response), response.status);
  }

  return (await response.json()) as MessageResponse;
}

export async function fetchMe(): Promise<ApiUser> {
  return authFetch<ApiUser>("/api/v1/users/me");
}

export async function updateProfile(payload: {
  first_name?: string;
  last_name?: string;
  phone?: string;
  city?: string;
  langue?: string;
}): Promise<ApiUser> {
  return authFetch<ApiUser>("/api/v1/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function fetchConsortDossier(): Promise<ConsortDossier> {
  return authFetch<ConsortDossier>("/api/v1/candidat/consort");
}

export async function submitConsortPiece(pieceKey: string): Promise<ConsortDossier> {
  return authFetch<ConsortDossier>(`/api/v1/candidat/consort/pieces/${pieceKey}/submit`, { method: "POST" });
}

export async function fetchGerantSchool(): Promise<GerantSchool> {
  return authFetch<GerantSchool>("/api/v1/gerant/auto-ecole");
}

export async function updateGerantSchool(payload: {
  raison_sociale?: string;
  raison_sociale_legale?: string;
  numero_agrement?: string;
  rccm?: string;
  adresse?: string;
  city?: string;
  quartier?: string;
  country_code?: string;
  site_web?: string;
  logo_url?: string;
  description?: string;
  description_longue?: string;
  access_info?: string;
  telephone?: string;
  nombre_moniteurs?: number;
  nombre_vehicules?: number;
  annees_experience?: number;
  fonction_gerant?: string;
  latitude?: number | null;
  longitude?: number | null;
  horaires?: Record<string, string>;
}): Promise<GerantSchool> {
  return authFetch<GerantSchool>("/api/v1/gerant/auto-ecole", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function fetchGerantMoniteur(id: string): Promise<GerantMoniteur> {
  return authFetch<GerantMoniteur>(`/api/v1/gerant/moniteurs/${id}`);
}

export async function fetchGerantMoniteurs(): Promise<GerantMoniteur[]> {
  return authFetch<GerantMoniteur[]>("/api/v1/gerant/moniteurs");
}

export async function createGerantMoniteur(payload: {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
}): Promise<GerantMoniteurCreateResponse> {
  return authFetch<GerantMoniteurCreateResponse>("/api/v1/gerant/moniteurs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetGerantMoniteurPassword(id: string): Promise<GerantMoniteurPasswordReset> {
  return authFetch<GerantMoniteurPasswordReset>(`/api/v1/gerant/moniteurs/${id}/reset-password`, {
    method: "POST",
  });
}

export async function fetchAllSchools(): Promise<AutoEcolePending[]> {
  return authFetch<AutoEcolePending[]>("/api/v1/admin/auto-ecoles");
}

export async function fetchSchool(schoolId: string): Promise<AutoEcolePending> {
  return authFetch<AutoEcolePending>(`/api/v1/admin/auto-ecoles/${schoolId}`);
}

export async function fetchPendingSchools(): Promise<AutoEcolePending[]> {
  return authFetch<AutoEcolePending[]>("/api/v1/admin/auto-ecoles/pending");
}

export async function validateSchool(schoolId: string): Promise<MessageResponse> {
  return authFetch<MessageResponse>(`/api/v1/admin/auto-ecoles/${schoolId}/valider`, { method: "POST" });
}

export async function rejectSchool(schoolId: string, message: string): Promise<MessageResponse> {
  return authFetch<MessageResponse>(`/api/v1/admin/auto-ecoles/${schoolId}/refuser`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
}

export async function fetchAdminUsers(): Promise<ApiUser[]> {
  return authFetch<ApiUser[]>("/api/v1/admin/users");
}

export async function fetchAdminUser(userId: string): Promise<ApiUser> {
  return authFetch<ApiUser>(`/api/v1/admin/users/${userId}`);
}

export async function fetchAdminUserConsort(userId: string): Promise<ConsortDossier> {
  return authFetch<ConsortDossier>(`/api/v1/admin/users/${userId}/consort`);
}

export async function fetchGerantCandidatConsort(candidatId: string): Promise<ConsortDossier> {
  return authFetch<ConsortDossier>(`/api/v1/gerant/candidats/${candidatId}/consort`);
}

export async function validateGerantConsortPiece(candidatId: string, pieceKey: string): Promise<ConsortDossier> {
  return authFetch<ConsortDossier>(`/api/v1/gerant/candidats/${candidatId}/consort/pieces/${pieceKey}/validate`, {
    method: "POST",
  });
}

export async function createAdminUser(payload: {
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
  country_code?: string;
  langue?: string;
  password?: string;
}): Promise<ApiUser> {
  return authFetch<ApiUser>("/api/v1/admin/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUser(
  userId: string,
  payload: Partial<{
    email: string;
    role: UserRole;
    first_name: string;
    last_name: string;
    phone: string | null;
    country_code: string;
    langue: string;
    is_active: boolean;
    password: string;
  }>,
): Promise<ApiUser> {
  return authFetch<ApiUser>(`/api/v1/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminUser(userId: string): Promise<void> {
  await authFetch<void>(`/api/v1/admin/users/${userId}`, { method: "DELETE" });
}

export function userToSession(user: ApiUser): import("../auth/types").AuthSession {
  const name = `${user.first_name} ${user.last_name}`.trim();
  const session: import("../auth/types").AuthSession = {
    id: user.id,
    role: user.role,
    email: user.email,
    name,
    phone: user.phone ?? undefined,
    city: user.city ?? undefined,
    avatarUrl: user.avatar_url ?? undefined,
    plan: user.role === "candidat" ? (user.plan ?? "free") : undefined,
  };

  if (user.role === "gerant" && user.school_name) {
    session.school = {
      name: user.school_name,
      validated: user.school_validated ?? false,
    };
  }

  return session;
}
