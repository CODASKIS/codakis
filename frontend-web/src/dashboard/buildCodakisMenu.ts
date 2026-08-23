import type { TFunction } from "i18next";
import type { UserRole } from "../auth/types";
import { getDashboardNav } from "./config/menuItems";

type DashboardKitMenuItem = {
  id: string;
  title: string;
  type: "item";
  icon: string;
  iconname: string;
  url: string;
  activeKey?: string;
};

type DashboardKitMenuGroup = {
  id: string;
  title: string;
  type: "group";
  children: DashboardKitMenuItem[];
};

const ICON_MAP: Record<string, string> = {
  home: "dashboard",
  schools: "business",
  content: "menu_book",
  blog: "article",
  payments: "payments",
  users: "people",
  settings: "settings",
  courses: "menu_book",
  exams: "assignment",
  consort: "folder",
  school: "directions_car",
  students: "person",
  schedule: "calendar_today",
  slots: "event",
  enrollments: "group_add",
  plans: "credit_card",
  instructors: "groups",
  stats: "bar_chart",
  profile: "account_circle",
  etablissement: "business",
  seances: "event",
};

/** Segment d'URL utilisé pour l'état actif du menu (sidebar). */
const ACTIVE_KEY_MAP: Record<string, string> = {
  home: "admin",
  schools: "auto-ecoles",
  content: "contenu",
  blog: "blog",
  payments: "paiements",
  users: "utilisateurs",
  settings: "parametres",
  courses: "cours",
  exams: "examens",
  seances: "seances",
  consort: "consort",
  school: "auto-ecole",
  students: "eleves",
  schedule: "planning",
  slots: "creneaux",
  enrollments: "inscriptions",
  plans: "forfaits",
  instructors: "moniteurs",
  stats: "statistiques",
  profile: "profil",
  etablissement: "etablissement",
};

export function buildCodakisMenuItems(role: UserRole, t: TFunction) {
  const groups = getDashboardNav(role);

  const items: DashboardKitMenuGroup[] = groups.map((group) => ({
    id: group.id,
    title: group.titleKey ? t(group.titleKey) : "CODAKIS",
    type: "group",
    children: group.items.map((item) => ({
      id: item.id,
      title: t(item.labelKey),
      type: "item" as const,
      icon: "material-icons-two-tone",
      iconname: ICON_MAP[item.id] ?? "circle",
      url: item.path,
      activeKey: ACTIVE_KEY_MAP[item.id] ?? item.path.split("/").filter(Boolean).pop() ?? item.id,
    })),
  }));

  const collapseItems: DashboardKitMenuGroup[] = items.map((group) => ({
    ...group,
    children: group.children.map((item) => ({
      ...item,
      title: item.title.charAt(0),
      activeKey: item.activeKey,
    })),
  }));

  return { items, collapseItems, roleTitle: t(`auth.roles.${role}.title`) };
}
