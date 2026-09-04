import { useEffect, type ReactNode } from "react";
import { Outlet } from "react-router";
import type { LucideIcon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import AppHeader from "./AppHeader";
import AppSidebar, { type ProNavItem } from "./AppSidebar";
import Backdrop from "./Backdrop";
import "../styles/tailadmin-codakis.css";

export type { ProNavItem };

type Props = {
  role: string;
  roleLabel: string;
  homeTo: string;
  profileTo: string;
  title?: string;
  navItems: Array<{
    to: string;
    label: string;
    icon: LucideIcon;
    end?: boolean;
  }>;
  children?: ReactNode;
};

function ProAdminLayoutInner({ roleLabel, homeTo, profileTo, title, navItems }: Omit<Props, "role" | "children">) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  const contentPad = isMobileOpen ? "ml-0" : isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]";

  return (
    <div className="ta-shell min-h-screen xl:flex">
      <AppSidebar roleLabel={roleLabel} homeTo={homeTo} items={navItems} />
      <Backdrop />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${contentPad}`}>
        <AppHeader title={title} profileTo={profileTo} />
        <main className="mx-auto max-w-screen-2xl p-4 md:p-6">
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
        title={props.title}
        navItems={props.navItems}
      />
    </SidebarProvider>
  );
}
