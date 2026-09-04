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
      className={`ta-sidebar ${wide ? "ta-sidebar--wide" : "ta-sidebar--rail"} ${
        isMobileOpen ? "is-open" : ""
      }`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {wide ? (
        <div className="ta-sidebar__brand-wide">
          <Link to={homeTo} className="ta-sidebar__wordmark" onClick={closeMobile}>
            <img src={CODAKIS_LOGO} alt="CODAKIS" />
          </Link>
          {isMobileOpen ? (
            <button type="button" className="ta-sidebar__close" onClick={closeMobile} aria-label="Fermer">
              <X size={20} strokeWidth={2.5} />
            </button>
          ) : null}
        </div>
      ) : (
        /* Même structure exacte qu’un lien nav (centrage identique) */
        <Link to={homeTo} className="ta-sidebar__link ta-sidebar__link--rail ta-sidebar__logo-link" title="CODAKIS">
          <img src={CODAKIS_LOGO_ICON} alt="CODAKIS" className="ta-sidebar__icon-img" />
        </Link>
      )}

      {wide ? <p className="ta-nav-label ta-sidebar__role">{roleLabel}</p> : null}

      <nav className="ta-sidebar__nav">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeMobile}
              title={item.label}
              className={({ isActive }) =>
                `ta-sidebar__link ${isActive ? "is-active" : ""} ${wide ? "" : "ta-sidebar__link--rail"}`
              }
            >
              <Icon size={22} strokeWidth={2.4} className="ta-sidebar__icon" />
              {wide ? <span>{item.label}</span> : null}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
