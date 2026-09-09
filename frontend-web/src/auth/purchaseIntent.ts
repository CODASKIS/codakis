import type { SchoolForfaitType } from "../data/mockDrivingSchools";
import { AUTH_PATHS } from "../constants/authPaths";
import type { UserRole } from "./types";
import { getRoleDashboardPath } from "./roles";

const STORAGE_KEY = "codakis-purchase-intent";

export type PurchaseIntent = {
  schoolId: string;
  forfaitId: string;
  packType: SchoolForfaitType;
};

function isPackType(value: string | null): value is SchoolForfaitType {
  return value === "codeSeul" || value === "conduiteSeule" || value === "complet";
}

export function parsePurchaseIntentFromSearch(params: URLSearchParams): PurchaseIntent | null {
  const schoolId = params.get("school")?.trim();
  const forfaitId = params.get("forfait")?.trim() ?? params.get("buy")?.trim();
  const packType = params.get("pack")?.trim() ?? null;

  if (!schoolId || !forfaitId) return null;

  return {
    schoolId,
    forfaitId,
    packType: isPackType(packType) ? packType : "complet",
  };
}

export function savePurchaseIntent(intent: PurchaseIntent): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
}

export function getPurchaseIntent(): PurchaseIntent | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PurchaseIntent;
  } catch {
    return null;
  }
}

export function clearPurchaseIntent(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function rememberPurchaseIntent(intent: PurchaseIntent): void {
  savePurchaseIntent(intent);
}

export function buildSchoolPurchaseUrl(intent: PurchaseIntent): string {
  const params = new URLSearchParams({
    buy: intent.forfaitId,
    pack: intent.packType,
  });
  return `/auto-ecoles/${encodeURIComponent(intent.schoolId)}?${params.toString()}#forfaits`;
}

export function buildRegisterUrlForPurchase(intent: PurchaseIntent): string {
  const params = new URLSearchParams({
    school: intent.schoolId,
    forfait: intent.forfaitId,
    pack: intent.packType,
  });
  return `${AUTH_PATHS.register.candidat}?${params.toString()}`;
}

export function buildLoginUrlForPurchase(intent: PurchaseIntent): string {
  const params = new URLSearchParams({
    school: intent.schoolId,
    forfait: intent.forfaitId,
    pack: intent.packType,
  });
  return `${AUTH_PATHS.login}?${params.toString()}`;
}

const REDIRECT_KEY = "codakis-auth-redirect";

export function rememberAuthRedirect(path: string | null | undefined): void {
  const value = path?.trim();
  if (!value || !value.startsWith("/") || value.startsWith("//")) return;
  sessionStorage.setItem(REDIRECT_KEY, value);
}

export function consumeAuthRedirect(): string | null {
  const value = sessionStorage.getItem(REDIRECT_KEY);
  sessionStorage.removeItem(REDIRECT_KEY);
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

/** Après connexion / inscription — reprend l'achat forfait, redirect ou espace par défaut. */
export function resolveAuthRedirect(role: UserRole): string {
  const intent = getPurchaseIntent();
  if (role === "candidat" && intent?.schoolId && intent.forfaitId) {
    clearPurchaseIntent();
    return buildSchoolPurchaseUrl(intent);
  }
  const redirect = consumeAuthRedirect();
  if (redirect) return redirect;
  return getRoleDashboardPath(role);
}

export function buildLoginUrl(redirect?: string): string {
  if (!redirect) return AUTH_PATHS.login;
  const params = new URLSearchParams({ redirect });
  return `${AUTH_PATHS.login}?${params.toString()}`;
}

export function purchaseIntentFromSchool(
  schoolId: string,
  forfaitId: string,
  packType: SchoolForfaitType,
): PurchaseIntent {
  return { schoolId, forfaitId, packType };
}
