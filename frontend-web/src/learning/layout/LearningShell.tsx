import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import {
  BookOpen,
  Calendar,
  ChevronDown,
  Map,
  Moon,
  School,
  Shield,
  BarChart3,
  Sun,
  Trophy,
  LogOut,
  Settings,
  Award,
} from "lucide-react";
import { CODAKIS_LOGO } from "../../flexjobs/components/BrandLogo";
import { clearSession, getSession } from "../../auth/authStore";
import { useTheme } from "../../context/ThemeContext";
import { getUserAvatarUrl } from "../../lib/uiAvatars";
import { fetchCandidatDashboard, fetchGamification, type CandidatDashboard, type Gamification } from "../../lib/pedagogyApi";
import StickyWidgets from "../components/StickyWidgets";

const TOP_LINKS = [
  { to: "/espace/candidat", end: true, label: "Feuille de route", icon: Map },
  { to: "/espace/candidat/tests", label: "Tests supplémentaires", icon: Shield },
  { to: "/espace/candidat/statistiques", label: "Statistiques", icon: BarChart3 },
  { to: "/espace/candidat/handbook", label: "Handbook", icon: BookOpen },
] as const;

const MORE_LINKS = [
  { to: "/espace/candidat/auto-ecole", label: "Auto-école", icon: School },
  { to: "/espace/candidat/seances", label: "Séances", icon: Calendar },
] as const;

const MOBILE_LINKS = [
  { to: "/espace/candidat", end: true, label: "Cours", icon: Map },
  { to: "/espace/candidat/tests", label: "Tests", icon: Shield },
  { to: "/espace/candidat/statistiques", label: "Stats", icon: BarChart3 },
  { to: "/espace/candidat/handbook", label: "Livre", icon: BookOpen },
  { to: "/espace/candidat/profil", label: "Profil", icon: Settings },
] as const;

function isImmersive(pathname: string) {
  return /\/(lecon|quiz|examen)\//.test(pathname);
}

function ProfilePhoto({ name, avatarUrl, size = 40 }: { name: string; avatarUrl?: string | null; size?: number }) {
  return (
    <img
      src={getUserAvatarUrl(name, size, avatarUrl)}
      alt=""
      className="ck-avatar-photo"
      width={size}
      height={size}
      referrerPolicy="no-referrer"
    />
  );
}

export default function LearningShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = getSession();
  const { theme, toggleTheme } = useTheme();
  const [stats, setStats] = useState<Gamification | null>(null);
  const [dash, setDash] = useState<CandidatDashboard | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const immersive = isImmersive(location.pathname);

  const displayName = session?.name?.trim() || session?.email || "Candidat";
  const avatarSeed = session?.email || session?.id || displayName;

  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchGamification(), fetchCandidatDashboard().catch(() => null)])
      .then(([g, d]) => {
        if (cancelled) return;
        setStats(g);
        if (d) setDash(d);
      })
      .catch(() => {
        if (!cancelled) {
          setStats({
            points: 0,
            niveau: 1,
            chapters_read: 0,
            chapters_total: 0,
            next_level_at: 150,
            points_to_next_level: 150,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const niveau = stats?.niveau ?? 1;
  const points = stats?.points ?? 0;
  const chapters = `${stats?.chapters_read ?? 0}/${stats?.chapters_total ?? 0}`;

  function logout() {
    clearSession();
    navigate("/connexion", { replace: true });
  }

  return (
    <div className={`ck-learn${immersive ? " is-immersive" : ""}`}>
      <header className="ck-topbar">
        <div className="ck-topbar__inner">
          <Link to="/espace/candidat" className="ck-topbar__brand" aria-label="CODAKIS">
            <img src={CODAKIS_LOGO} alt="CODAKIS" />
          </Link>

          <nav className="ck-topbar__nav" aria-label="Navigation principale">
            {TOP_LINKS.map(({ to, label, icon: Icon, ...rest }) => (
              <NavLink key={to} to={to} end={"end" in rest ? rest.end : false} className={({ isActive }) => (isActive ? "is-active" : undefined)}>
                <Icon size={18} aria-hidden />
                <span>{label}</span>
              </NavLink>
            ))}
            {MORE_LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `ck-topbar__nav-more${isActive ? " is-active" : ""}`}>
                <Icon size={18} aria-hidden />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="ck-topbar__right">
            <button type="button" className="ck-learn__theme-btn" onClick={toggleTheme} aria-label={theme === "dark" ? "Mode clair" : "Mode sombre"}>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <span className="ck-topbar__stat">
              <Trophy size={16} /> Niveau {niveau}
            </span>
            <span className="ck-topbar__stat ck-topbar__stat--pts">Points {points}</span>
            <span className="ck-topbar__stat ck-topbar__stat--ch">Chapitres lus {chapters}</span>

            <div className="ck-topbar__profile" ref={menuRef}>
              <button type="button" className="ck-topbar__avatar-btn" aria-expanded={menuOpen} aria-haspopup="menu" onClick={() => setMenuOpen((v) => !v)}>
                <ProfilePhoto name={avatarSeed} avatarUrl={session?.avatarUrl} size={40} />
                <ChevronDown size={16} />
              </button>
              {menuOpen ? (
                <div className="ck-topbar__menu" role="menu">
                  <div className="ck-topbar__menu-head">
                    <ProfilePhoto name={avatarSeed} avatarUrl={session?.avatarUrl} size={48} />
                    <div>
                      <strong>{displayName}</strong>
                      <small>{session?.email}</small>
                    </div>
                  </div>
                  <Link to="/espace/candidat/statistiques" role="menuitem" onClick={() => setMenuOpen(false)}>
                    <Award size={16} /> Mes réalisations
                  </Link>
                  <Link to="/espace/candidat/profil" role="menuitem" onClick={() => setMenuOpen(false)}>
                    <Settings size={16} /> Paramètres
                  </Link>
                  <button type="button" role="menuitem" onClick={logout}>
                    <LogOut size={16} /> Se déconnecter
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="ck-learn__mobile-bar">
        <Link to="/espace/candidat" className="ck-learn__mobile-brand">
          <img src={CODAKIS_LOGO} alt="CODAKIS" />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
          <button type="button" className="ck-learn__theme-btn" onClick={toggleTheme} aria-label={theme === "dark" ? "Mode clair" : "Mode sombre"}>
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <span className="ck-learn__chip ck-learn__chip--level">
            <Trophy size={18} /> {niveau}
          </span>
          <Link to="/espace/candidat/profil" aria-label="Profil">
            <ProfilePhoto name={avatarSeed} avatarUrl={session?.avatarUrl} size={32} />
          </Link>
        </div>
      </div>

      <div className={`ck-learn__body${immersive ? " is-immersive" : ""}`}>
        <main className="ck-learn__feed">
          <Outlet context={{ stats, setStats, dash }} />
        </main>
        {!immersive ? (
          <StickyWidgets
            stats={stats}
            successRate={dash?.success_rate ?? 0}
            questionsAnswered={(dash?.quizzes_passed ?? 0) + (dash?.examens_passed ?? 0)}
            questionsTotal={Math.max(dash?.chapters_total ?? dash?.total_lecons ?? 0, 1)}
            correctAnswers={dash?.quizzes_passed ?? 0}
            userName={avatarSeed}
            avatarUrl={session?.avatarUrl}
          />
        ) : null}
      </div>

      <nav className="ck-learn__bottom" aria-label="Navigation mobile">
        {MOBILE_LINKS.map(({ to, label, icon: Icon, ...rest }) => (
          <NavLink key={to} to={to} end={"end" in rest ? rest.end : false} className={({ isActive }) => (isActive ? "is-active" : undefined)}>
            <Icon size={22} aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
