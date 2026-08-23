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
  payments: "payments",
  users: "people",
  settings: "settings",
  courses: "menu_book",
  exams: "assignment",
  consort: "folder",
  school: "directions_car",
  students: "school",
  schedule: "calendar_today",
  slots: "event",
  enrollments: "group_add",
  plans: "credit_card",
  instructors: "badge",
  stats: "bar_chart",
  profile: "account_circle",
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
    })),
  }));

  const collapseItems: DashboardKitMenuGroup[] = items.map((group) => ({
    ...group,
    children: group.children.map((item) => ({
      ...item,
      title: item.title.charAt(0),
    })),
  }));

  return { items, collapseItems, roleTitle: t(`auth.roles.${role}.title`) };
}
