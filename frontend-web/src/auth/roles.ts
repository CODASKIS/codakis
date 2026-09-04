import type { UserRole } from "./types";

export type RoleConfig = {
  role: UserRole;
  loginPath: string;
  registerPath?: string;
  dashboardPath: string;
  canRegister: boolean;
};

const LOGIN_PATH = "/connexion";

export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  admin: {
    role: "admin",
    loginPath: LOGIN_PATH,
    dashboardPath: "/",
    canRegister: false,
  },
  candidat: {
    role: "candidat",
    loginPath: LOGIN_PATH,
    registerPath: "/inscription",
    dashboardPath: "/espace/candidat",
    canRegister: true,
  },
  moniteur: {
    role: "moniteur",
    loginPath: LOGIN_PATH,
    dashboardPath: "/espace/moniteur",
    canRegister: false,
  },
  gerant: {
    role: "gerant",
    loginPath: LOGIN_PATH,
    registerPath: "/inscription-auto-ecole",
    dashboardPath: "/espace/gerant",
    canRegister: true,
  },
};

export function getRoleDashboardPath(role: UserRole): string {
  return ROLE_CONFIG[role].dashboardPath;
}

export function getRoleFromPath(pathname: string): UserRole | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/espace/candidat")) return "candidat";
  if (pathname.startsWith("/espace/moniteur")) return "moniteur";
  if (pathname.startsWith("/espace/gerant")) return "gerant";
  return null;
}

export function getProfilePath(role: UserRole): string {
  if (role === "candidat") return "/espace/candidat/profil";
  if (role === "moniteur") return "/espace/moniteur";
  if (role === "gerant") return "/espace/gerant";
  return "/";
}

export function getSettingsPath(role: UserRole): string {
  return getProfilePath(role);
}
