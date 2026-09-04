import type { LucideIcon } from "lucide-react";
import { Link, NavLink } from "react-router";
import { X } from "lucide-react";
import { CODAKIS_LOGO, CODAKIS_LOGO_ICON } from "../../flexjobs/components/BrandLogo";
import { useSidebar } from "../context/SidebarContext";

export type ProNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

type Props = {
  roleLabel: string;
  homeTo: string;
  items: ProNavItem[];
};

export default function AppSidebar({ roleLabel, homeTo, items }: Props) {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, closeMobile } = useSidebar();
  const wide = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={`fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white px-4 py-6 transition-all duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        ${wide ? "w-[290px]" : "lg:w-[90px]"}
      `}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mb-8 flex items-center justify-between gap-3">
        <Link to={homeTo} className="flex min-w-0 items-center gap-2.5 no-underline">
          <img
            src={wide ? CODAKIS_LOGO : CODAKIS_LOGO_ICON}
            alt="CODAKIS"
            className={wide ? "h-10 w-auto object-contain" : "h-10 w-10 object-contain"}
          />
        </Link>
        {isMobileOpen ? (
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 lg:hidden"
            onClick={closeMobile}
            aria-label="Fermer le menu"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        ) : null}
      </div>

      {wide ? <p className="ta-nav-label mb-3 px-2">{roleLabel}</p> : null}

      <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeMobile}
              className={({ isActive }) =>
                `ta-nav-link flex items-center gap-3 rounded-xl px-3 py-3 transition no-underline ${
                  isActive
                    ? "bg-brand-50 text-brand-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                } ${!wide ? "justify-center px-2" : ""}`
              }
              title={item.label}
            >
              <Icon size={22} strokeWidth={2.4} className="shrink-0" />
              {wide ? <span>{item.label}</span> : null}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
