import { useEffect, useRef, useState, type ComponentType } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { ChevronDown, LogOut, Menu, MoreHorizontal, UserRound, X } from "lucide-react";
import { CODAKIS_LOGO } from "../../flexjobs/components/BrandLogo";
import { clearSession, getSession, hydrateSessionFromApi } from "../../auth/authStore";
import { useTheme } from "../../context/ThemeContext";
import { getUserAvatarUrl } from "../../lib/uiAvatars";
import SchoolsRightRail, { type ProRole } from "../components/SchoolsRightRail";

export type SchoolsTab = {
  to: string;
  label: string;
  end?: boolean;
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  color?: string;
};

type Props = {
  role: ProRole;
  roleLabel: string;
  homeTo: string;
  tabs: SchoolsTab[];
  title?: string;
  loadTitle?: () => Promise<string>;
  profileTo: string;
  accent?: string;
};

function ProfilePhoto({ name, avatarUrl, size = 40 }: { name: string; avatarUrl?: string | null; size?: number }) {
  return (
    <img
      src={getUserAvatarUrl(name, size, avatarUrl)}
      alt=""
      className="ck-avatar-photo"
      style={{ width: size, height: size }}
      width={size}
      height={size}
    />
  );
}

function ProfileMenu({
  displayName,
  email,
  avatarUrl,
  profileTo,
  onClose,
  onLogout,
}: {
  displayName: string;
  email?: string;
  avatarUrl?: string | null;
  profileTo: string;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="ck-schools__dropdown" role="menu">
      <div className="ck-schools__dropdown-head">
        <ProfilePhoto name={displayName} avatarUrl={avatarUrl} size={48} />
        <div className="ck-schools__dropdown-meta">
          <strong title={displayName}>{displayName}</strong>
          <small title={email ?? ""}>{email}</small>
        </div>
      </div>
      <div className="ck-schools__dropdown-list">
        <Link to={profileTo} role="menuitem" className="ck-schools__dropdown-item" onClick={onClose}>
          <UserRound size={18} aria-hidden />
          <span>Mon compte</span>
        </Link>
        <button type="button" role="menuitem" className="ck-schools__dropdown-item is-danger" onClick={onLogout}>
          <LogOut size={18} aria-hidden />
          <span>Se déconnecter</span>
        </button>
      </div>
    </div>
  );
}

export default function SchoolsShell({
  role,
  roleLabel,
  homeTo,
  tabs,
  title,
  loadTitle,
  profileTo,
  accent = "#00a859",
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTheme } = useTheme();
  const session = getSession();
  const [heading, setHeading] = useState(title || roleLabel);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const headerMenuRef = useRef<HTMLDivElement | null>(null);
  const sideMenuRef = useRef<HTMLDivElement | null>(null);
  const displayName = session?.name || session?.email || roleLabel;
  const hideRightRail =
    role !== "admin" && (location.pathname === homeTo || location.pathname === `${homeTo}/`);

  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  useEffect(() => {
    void hydrateSessionFromApi().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!loadTitle) return;
    let cancelled = false;
    void loadTitle()
      .then((value) => {
        if (!cancelled && value) setHeading(value);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [loadTitle]);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      const target = event.target as Node;
      if (!headerMenuRef.current?.contains(target)) setHeaderMenuOpen(false);
      if (!sideMenuRef.current?.contains(target)) setSideMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  function logout() {
    clearSession();
    navigate("/connexion");
  }

  const menuProps = {
    displayName,
    email: session?.email,
    avatarUrl: session?.avatarUrl,
    profileTo,
    onLogout: logout,
  };

  return (
    <div className="ck-schools ck-pro" data-theme="light" style={{ ["--ck-schools-accent" as string]: accent }}>
      {sidebarOpen ? (
        <button type="button" className="ck-schools__scrim" aria-label="Fermer le menu" onClick={() => setSidebarOpen(false)} />
      ) : null}

      <aside className={`ck-schools__sidebar ck-pro__sidebar${sidebarOpen ? " is-open" : ""}`} aria-label="Navigation">
        <div className="ck-schools__sidebar-top">
          <Link to={homeTo} className="ck-schools__brand ck-pro__brand" onClick={() => setSidebarOpen(false)}>
            <img src={CODAKIS_LOGO} alt="CODAKIS" />
            <span>Pro</span>
          </Link>
          <button type="button" className="ck-schools__sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Fermer">
            <X size={20} />
          </button>
        </div>

        <nav className="ck-schools__side-nav ck-pro__nav">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) => `ck-schools__side-link ck-pro__nav-link${isActive ? " is-active" : ""}`}
                style={{ ["--ck-tab-color" as string]: tab.color || accent }}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="ck-schools__side-icon ck-pro__nav-icon">
                  <Icon size={26} strokeWidth={2.4} />
                </span>
                {tab.label}
              </NavLink>
            );
          })}
          <NavLink
            to={profileTo}
            className={({ isActive }) => `ck-schools__side-link ck-pro__nav-link${isActive ? " is-active" : ""}`}
            style={{ ["--ck-tab-color" as string]: "#1CB0F6" }}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="ck-schools__side-icon ck-pro__nav-icon ck-pro__nav-icon--avatar">
              <ProfilePhoto name={displayName} avatarUrl={session?.avatarUrl} size={32} />
            </span>
            Profil
          </NavLink>
        </nav>

        <div className="ck-schools__side-profile" ref={sideMenuRef}>
          <button
            type="button"
            className="ck-schools__side-profile-btn ck-pro__more"
            aria-expanded={sideMenuOpen}
            aria-haspopup="menu"
            onClick={() => setSideMenuOpen((v) => !v)}
          >
            <span className="ck-pro__more-icon">
              <MoreHorizontal size={22} strokeWidth={2.6} />
            </span>
            <span className="ck-schools__side-profile-meta">
              <strong>Plus</strong>
            </span>
            <ChevronDown size={16} />
          </button>
          {sideMenuOpen ? <ProfileMenu {...menuProps} onClose={() => setSideMenuOpen(false)} /> : null}
        </div>
      </aside>

      <div className="ck-schools__content ck-pro__content">
        <header className="ck-pro__top ck-pro__top--mobile">
          <button type="button" className="ck-schools__menu-btn" aria-label="Ouvrir le menu" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="ck-pro__top-heading">
            <p>{roleLabel}</p>
            <h1>{heading}</h1>
          </div>
          <div className="ck-pro__top-actions">
            <div className="ck-schools__header-user" ref={headerMenuRef}>
              <button
                type="button"
                className="ck-schools__avatar-btn"
                aria-expanded={headerMenuOpen}
                aria-haspopup="menu"
                onClick={() => setHeaderMenuOpen((v) => !v)}
              >
                <ProfilePhoto name={displayName} avatarUrl={session?.avatarUrl} size={40} />
              </button>
              {headerMenuOpen ? <ProfileMenu {...menuProps} onClose={() => setHeaderMenuOpen(false)} /> : null}
            </div>
          </div>
        </header>

        <div className={`ck-pro__body${hideRightRail ? " is-wide" : ""}`}>
          <main className="ck-pro__feed">
            <Outlet />
          </main>
          {!hideRightRail ? (
            <SchoolsRightRail role={role} profileTo={profileTo} homeTo={homeTo} onLogout={logout} />
          ) : null}
        </div>

        <nav className="ck-schools__tabs ck-schools__tabs--mobile ck-pro__dock" aria-label={roleLabel}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) => `ck-schools__tab${isActive ? " is-active" : ""}`}
                style={{ ["--ck-tab-color" as string]: tab.color || accent }}
              >
                <Icon size={18} strokeWidth={2.5} />
                {tab.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
