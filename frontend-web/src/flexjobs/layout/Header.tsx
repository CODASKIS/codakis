import { useState } from "react";
import { Link, NavLink, useLocation, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { AUTH_PATHS } from "../../constants/authPaths";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import BrandLogo from "../components/BrandLogo";
import HeaderSearch from "../components/HeaderSearch";
import { getSession } from "../../auth/authStore";
import { getRoleDashboardPath } from "../../auth/roles";

export default function Header() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const session = getSession();
  const espaceHref = session ? getRoleDashboardPath(session.role) : null;
  const isSchoolsDirectory = location.pathname.startsWith("/auto-ecoles");
  const searchDefaults = isSchoolsDirectory
    ? {
        defaultKeyword: searchParams.get("q") ?? "",
        defaultLocation: searchParams.get("ville") ?? "",
      }
    : undefined;

  const mainNav = [
    { to: "/auto-ecoles", label: t("nav.drivingSchools") },
    { to: "/comment-ca-marche", label: t("nav.howItWorks") },
    { to: "/blog", label: t("nav.blog") },
  ] as const;

  const mobileNav = [
    ...mainNav,
    { to: "/themes", label: t("nav.themes") },
    { to: "/contact", label: t("nav.contact") },
    ...(espaceHref
      ? [{ to: espaceHref, label: t("nav.mySpace", { defaultValue: "Mon espace" }) }]
      : [
          { to: AUTH_PATHS.login, label: t("nav.login") },
          { to: AUTH_PATHS.register.candidat, label: t("nav.signup") },
        ]),
  ] as const;

  return (
    <header className="fj-site-header">
      <div className="fj-header-desktop">
        <div className="fj-topbar">
          <div className="fj-container">
            <div className="fj-topbar__row">
              <BrandLogo />
              <HeaderSearch {...searchDefaults} />
            </div>
          </div>
        </div>

        <div className="fj-navbar">
          <div className="fj-container">
            <div className="fj-navbar__row">
              <nav aria-label={t("nav.menu")}>
                <ul className="fj-navbar__menu">
                  {mainNav.map((link) => (
                    <li key={link.to}>
                      <NavLink to={link.to}>{link.label}</NavLink>
                    </li>
                  ))}
                </ul>
              </nav>

              <ul className="fj-navbar__auth">
                <li className="fj-navbar__lang">
                  <LanguageSwitcher />
                </li>
                {espaceHref ? (
                  <li>
                    <Link to={espaceHref} className="fj-btn-nav-cta">
                      {t("nav.mySpace", { defaultValue: "Mon espace" })}
                    </Link>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link to={AUTH_PATHS.login} className="fj-link-login">
                        {t("nav.login")}
                      </Link>
                    </li>
                    <li>
                      <Link to={AUTH_PATHS.register.candidat} className="fj-btn-nav-cta">
                        {t("nav.signup")}
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="fj-header-mobile">
        <div className="fj-mobile-bar">
          <button
            type="button"
            className="fj-mobile-toggle"
            aria-expanded={mobileOpen}
            aria-label={t("nav.mobileMenu")}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          <BrandLogo showTagline={false} />

          <div className="fj-mobile-bar__actions">
            <Link to="/auto-ecoles" className="fj-btn-nav-cta fj-btn-nav-cta--mobile">
              {t("nav.drivingSchools")}
            </Link>
          </div>
        </div>

        <div className="fj-mobile-search">
          <HeaderSearch variant="mobile" {...searchDefaults} />
        </div>

        <div className="fj-mobile-lang">
          <LanguageSwitcher variant="mobile" />
        </div>

        <nav
          className={`fj-mobile-drawer${mobileOpen ? " is-open" : ""}`}
          aria-label={t("nav.mobileMenu")}
        >
          {mobileNav.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
