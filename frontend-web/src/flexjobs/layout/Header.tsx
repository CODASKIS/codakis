import { useState } from "react";
import { Link, NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { BookOpen, CarFront, Menu, Newspaper, X } from "lucide-react";
import { AUTH_PATHS } from "../../constants/authPaths";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import BrandLogo from "../components/BrandLogo";
import { getSession } from "../../auth/authStore";
import { getRoleDashboardPath } from "../../auth/roles";

export default function Header() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const session = getSession();
  const espaceLabel = t("nav.mySpace", { defaultValue: "Mon espace" });
  /** Connecté → tableau de bord ; sinon → page connexion (entrée « Mon espace »). */
  const espaceHref = session ? getRoleDashboardPath(session.role) : AUTH_PATHS.login;

  const mainNav = [
    { to: "/auto-ecoles", label: t("nav.drivingSchools"), icon: CarFront },
    { to: "/comment-ca-marche", label: t("nav.howItWorks"), icon: BookOpen },
    { to: "/blog", label: t("nav.blog"), icon: Newspaper },
  ] as const;

  const mobileNav = [
    ...mainNav,
    { to: "/themes", label: t("nav.themes") },
    { to: "/contact", label: t("nav.contact") },
    { to: espaceHref, label: espaceLabel },
    ...(!session
      ? [{ to: AUTH_PATHS.register.candidat, label: t("nav.signup") }]
      : []),
  ] as const;

  return (
    <header className={`ck-public-topbar${mobileOpen ? " is-drawer-open" : ""}`}>
      <div className="ck-public-topbar__inner">
        <button
          type="button"
          className="ck-public-topbar__menu-btn"
          aria-expanded={mobileOpen}
          aria-label={t("nav.mobileMenu")}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className="ck-public-topbar__brand">
          <BrandLogo showTagline={false} size="sm" />
        </div>

        <nav className="ck-public-topbar__nav" aria-label={t("nav.menu")}>
          {mainNav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "is-active" : undefined)}>
              <span className="ck-public-topbar__nav-icon" aria-hidden>
                <Icon size={20} strokeWidth={2.25} />
              </span>
              <span className="ck-public-topbar__nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="ck-public-topbar__right">
          <div className="ck-public-topbar__lang ck-public-topbar__lang--bar">
            <LanguageSwitcher />
          </div>
          {!session ? (
            <Link to={AUTH_PATHS.register.candidat} className="ck-public-btn ck-public-btn--ghost">
              {t("nav.signup")}
            </Link>
          ) : null}
          <Link to={espaceHref} className="ck-public-btn ck-public-btn--primary ck-public-topbar__espace">
            <span className="ck-public-topbar__espace-label">{espaceLabel}</span>
          </Link>
        </div>
      </div>

      <nav
        className={`ck-public-drawer${mobileOpen ? " is-open" : ""}`}
        aria-label={t("nav.mobileMenu")}
        aria-hidden={!mobileOpen}
      >
        <div className="ck-public-drawer__panel">
          <div className="ck-public-drawer__lang">
            <span className="ck-public-drawer__lang-label">{t("lang.switch")}</span>
            <LanguageSwitcher variant="mobile" />
          </div>
          {mobileNav.map((link) => (
            <Link key={`${link.label}-${link.to}`} to={link.to} onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
