import type { UserRole } from "./types";

export type RoleConfig = {
  role: UserRole;
  loginPath: string;
  registerPath?: string;
  dashboardPath: string;
  canRegister: boolean;
};

const LOGIN_PATH = "/connexion";
const HOME_PATH = "/";

export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  admin: {
    role: "admin",
    loginPath: LOGIN_PATH,
    dashboardPath: HOME_PATH,
    canRegister: false,
  },
  candidat: {
    role: "candidat",
    loginPath: LOGIN_PATH,
    registerPath: "/inscription",
    dashboardPath: HOME_PATH,
    canRegister: true,
  },
  moniteur: {
    role: "moniteur",
    loginPath: LOGIN_PATH,
    dashboardPath: HOME_PATH,
    canRegister: false,
  },
  gerant: {
    role: "gerant",
    loginPath: LOGIN_PATH,
    registerPath: "/inscription-auto-ecole",
    dashboardPath: HOME_PATH,
    canRegister: true,
  },
};

export function getRoleDashboardPath(_role: UserRole): string {
  return HOME_PATH;
}

export function getRoleFromPath(pathname: string): UserRole | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/espace/candidat")) return "candidat";
  if (pathname.startsWith("/espace/moniteur")) return "moniteur";
  if (pathname.startsWith("/espace/gerant")) return "gerant";
  return null;
}

export function getProfilePath(_role: UserRole): string {
  return HOME_PATH;
}

export function getSettingsPath(_role: UserRole): string {
  return HOME_PATH;
}
