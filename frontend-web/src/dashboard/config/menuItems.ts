import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import type { UserRole } from "../../auth/types";

export type DashboardNavItem = {
  id: string;
  labelKey: string;
  path: string;
  icon: LucideIcon;
};

export type DashboardNavGroup = {
  id: string;
  titleKey?: string;
  items: DashboardNavItem[];
};

const ADMIN_NAV: DashboardNavGroup[] = [
  {
    id: "main",
    items: [
      { id: "home", labelKey: "dashboard.nav.home", path: "/admin", icon: LayoutDashboard },
      { id: "schools", labelKey: "dashboard.nav.schools", path: "/admin/auto-ecoles", icon: Building2 },
      { id: "content", labelKey: "dashboard.nav.content", path: "/admin/contenu", icon: BookOpen },
      { id: "payments", labelKey: "dashboard.nav.payments", path: "/admin/paiements", icon: CreditCard },
      { id: "users", labelKey: "dashboard.nav.users", path: "/admin/utilisateurs", icon: Users },
      { id: "settings", labelKey: "dashboard.nav.settings", path: "/admin/parametres", icon: Settings },
    ],
  },
];

const CANDIDAT_NAV: DashboardNavGroup[] = [
  {
    id: "main",
    items: [
      { id: "home", labelKey: "dashboard.nav.home", path: "/espace/candidat", icon: LayoutDashboard },
      { id: "courses", labelKey: "dashboard.nav.courses", path: "/espace/candidat/cours", icon: BookOpen },
      { id: "exams", labelKey: "dashboard.nav.exams", path: "/espace/candidat/examens", icon: ClipboardList },
      { id: "consort", labelKey: "dashboard.nav.consort", path: "/espace/candidat/consort", icon: FileText },
      { id: "school", labelKey: "dashboard.nav.mySchool", path: "/espace/candidat/auto-ecole", icon: Building2 },
      { id: "profile", labelKey: "dashboard.nav.profile", path: "/espace/candidat/profil", icon: Users },
    ],
  },
];

const MONITEUR_NAV: DashboardNavGroup[] = [
  {
    id: "main",
    items: [
      { id: "home", labelKey: "dashboard.nav.home", path: "/espace/moniteur", icon: LayoutDashboard },
      { id: "students", labelKey: "dashboard.nav.students", path: "/espace/moniteur/eleves", icon: GraduationCap },
      { id: "schedule", labelKey: "dashboard.nav.schedule", path: "/espace/moniteur/planning", icon: Calendar },
      { id: "slots", labelKey: "dashboard.nav.slots", path: "/espace/moniteur/creneaux", icon: ClipboardList },
    ],
  },
];

const GERANT_NAV: DashboardNavGroup[] = [
  {
    id: "main",
    items: [
      { id: "home", labelKey: "dashboard.nav.home", path: "/espace/gerant", icon: LayoutDashboard },
      { id: "enrollments", labelKey: "dashboard.nav.enrollments", path: "/espace/gerant/inscriptions", icon: Users },
      { id: "plans", labelKey: "dashboard.nav.plans", path: "/espace/gerant/forfaits", icon: CreditCard },
      { id: "instructors", labelKey: "dashboard.nav.instructors", path: "/espace/gerant/moniteurs", icon: GraduationCap },
      { id: "stats", labelKey: "dashboard.nav.stats", path: "/espace/gerant/statistiques", icon: BarChart3 },
      { id: "profile", labelKey: "dashboard.nav.schoolProfile", path: "/espace/gerant/etablissement", icon: Building2 },
    ],
  },
];

export const DASHBOARD_NAV: Record<UserRole, DashboardNavGroup[]> = {
  admin: ADMIN_NAV,
  candidat: CANDIDAT_NAV,
  moniteur: MONITEUR_NAV,
  gerant: GERANT_NAV,
};

export function getDashboardNav(role: UserRole): DashboardNavGroup[] {
  return DASHBOARD_NAV[role];
}
