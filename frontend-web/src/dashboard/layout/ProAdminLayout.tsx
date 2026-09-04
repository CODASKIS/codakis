import { useEffect, useMemo, type ReactNode } from "react";
import { Outlet, useLocation } from "react-router";
import type { LucideIcon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import AppHeader from "./AppHeader";
import AppSidebar, { type ProNavItem } from "./AppSidebar";
import Backdrop from "./Backdrop";
import "../styles/tailadmin-codakis.css";

export type { ProNavItem };

export type ProLayoutNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

type Props = {
  role: string;
  roleLabel: string;
  homeTo: string;
  profileTo: string;
  preferencesTo: string;
  /** Titre de secours (ex. « Espace gérant ») si aucune route nav ne matche. */
  title?: string;
  navItems: ProLayoutNavItem[];
  children?: ReactNode;
};

function matchPageTitle(pathname: string, navItems: ProLayoutNavItem[], fallback: string): string {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const scored = navItems
    .map((item) => {
      const to = item.to.replace(/\/+$/, "") || "/";
      if (item.end) {
        return normalized === to ? { label: item.label, score: 10_000 } : null;
      }
      if (normalized === to || normalized.startsWith(`${to}/`)) {
        return { label: item.label, score: to.length };
      }
      return null;
    })
    .filter(Boolean) as Array<{ label: string; score: number }>;

  if (!scored.length) return fallback;
  scored.sort((a, b) => b.score - a.score);
  return scored[0].label;
}

function ProAdminLayoutInner({
  roleLabel,
  homeTo,
  profileTo,
  preferencesTo,
  title = "",
  navItems,
}: Omit<Props, "role" | "children">) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { setTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  const pageTitle = useMemo(
    () => matchPageTitle(location.pathname, navItems, title || roleLabel),
    [location.pathname, navItems, title, roleLabel],
  );

  useEffect(() => {
    document.title = `${pageTitle} · CODAKIS`;
  }, [pageTitle]);

  const contentPad = isMobileOpen ? "ml-0" : isExpanded || isHovered ? "lg:ml-[29rem]" : "lg:ml-[9rem]";

  return (
    <div className="ck-learn ck-pro ta-shell min-h-screen xl:flex">
      <AppSidebar roleLabel={roleLabel} homeTo={homeTo} items={navItems} />
      <Backdrop />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${contentPad}`}>
        <AppHeader
          title={pageTitle}
          spaceLabel={title || `Espace ${roleLabel.toLowerCase()}`}
          profileTo={profileTo}
          preferencesTo={preferencesTo}
        />
        <main className="mx-auto max-w-screen-2xl p-[1.6rem] md:p-[2.2rem]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function ProAdminLayout(props: Props) {
  return (
    <SidebarProvider>
      <ProAdminLayoutInner
        roleLabel={props.roleLabel}
        homeTo={props.homeTo}
        profileTo={props.profileTo}
        preferencesTo={props.preferencesTo}
        title={props.title}
        navItems={props.navItems}
      />
    </SidebarProvider>
  );
}
