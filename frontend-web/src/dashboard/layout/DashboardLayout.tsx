import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { Menu, LogOut, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CODAKIS_LOGO } from "../../flexjobs/components/BrandLogo";
import { clearSession, getSession } from "../../auth/authStore";
import { ROLE_CONFIG } from "../../auth/roles";
import { getDashboardNav } from "../config/menuItems";
import type { UserRole } from "../../auth/types";

type DashboardLayoutProps = {
  role: UserRole;
};

export default function DashboardLayout({ role }: DashboardLayoutProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const session = getSession();
  const navGroups = getDashboardNav(role);

  function handleLogout() {
    clearSession();
    navigate(ROLE_CONFIG[role].loginPath, { replace: true });
  }

  return (
    <div className="codakis-dash">
      <aside className={`codakis-dash__sidebar${sidebarOpen ? " is-open" : ""}`}>
        <div className="codakis-dash__brand">
          <Link to="/">
            <img src={CODAKIS_LOGO} alt="CODAKIS" className="codakis-dash__logo" />
          </Link>
          <span className="codakis-dash__role">{t(`auth.roles.${role}.title`)}</span>
        </div>

        <nav className="codakis-dash__nav" aria-label={t("dashboard.nav.aria")}>
          {navGroups.map((group) => (
            <div key={group.id} className="codakis-dash__nav-group">
              {group.titleKey ? (
                <p className="codakis-dash__nav-title">{t(group.titleKey)}</p>
              ) : null}
              <ul>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <NavLink
                        to={item.path}
                        end={item.id === "home"}
                        className={({ isActive }) =>
                          `codakis-dash__nav-link${isActive ? " is-active" : ""}`
                        }
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon size={18} strokeWidth={1.75} aria-hidden />
                        <span>{t(item.labelKey)}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="codakis-dash__sidebar-foot">
          <Link to="/" className="codakis-dash__nav-link">
            <ExternalLink size={18} strokeWidth={1.75} aria-hidden />
            <span>{t("dashboard.backToSite")}</span>
          </Link>
        </div>
      </aside>

      {sidebarOpen ? (
        <button
          type="button"
          className="codakis-dash__overlay"
          aria-label={t("dashboard.closeMenu")}
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="codakis-dash__main">
        <header className="codakis-dash__header">
          <button
            type="button"
            className="codakis-dash__menu-btn"
            aria-label={t("dashboard.openMenu")}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="codakis-dash__header-meta">
            <p className="codakis-dash__welcome">
              {t("dashboard.welcome", { name: session?.name ?? t("dashboard.user") })}
            </p>
            <button type="button" className="codakis-dash__logout" onClick={handleLogout}>
              <LogOut size={16} aria-hidden />
              {t("dashboard.logout")}
            </button>
          </div>
        </header>

        <div className="codakis-dash__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
