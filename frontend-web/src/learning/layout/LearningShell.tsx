import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  ChevronDown,
  Map,
  School,
  Shield,
  Trophy,
  User,
} from "lucide-react";
import { CODAKIS_LOGO } from "../../flexjobs/components/BrandLogo";
import { clearSession, getSession, hydrateSessionFromApi, setSession } from "../../auth/authStore";
import type { AuthSession } from "../../auth/types";
import UserMenuPanel from "../../components/prefs/UserMenuPanel";
import { useTheme } from "../../context/ThemeContext";
import { getUserAvatarUrl } from "../../lib/uiAvatars";
import { fetchCandidatDashboard, fetchGamification, type CandidatDashboard, type Gamification } from "../../lib/pedagogyApi";
import StickyWidgets from "../components/StickyWidgets";

const TOP_LINKS = [
  { to: "/espace/candidat", end: true, label: "Feuille de route", icon: Map, color: "#00a859" },
  { to: "/espace/candidat/tests", label: "Tests", icon: Shield, color: "#0ea5e9" },
  { to: "/espace/candidat/statistiques", label: "Statistiques", icon: BarChart3, color: "#f59e0b" },
  { to: "/espace/candidat/handbook", label: "Handbook", icon: BookOpen, color: "#8b5cf6" },
] as const;

const BOTTOM_LINKS = [
  { to: "/espace/candidat", end: true, label: "Cours", icon: Map, color: "#00a859" },
  { to: "/espace/candidat/tests", label: "Tests", icon: Shield, color: "#0ea5e9" },
  { to: "/espace/candidat/statistiques", label: "Stats", icon: BarChart3, color: "#f59e0b" },
  { to: "/espace/candidat/handbook", label: "Livre", icon: BookOpen, color: "#8b5cf6" },
  { to: "/espace/candidat/profil", label: "Profil", icon: User, color: "#ec4899" },
] as const;

function isImmersive(pathname: string) {
  return /\/(lecon|quiz|examen)\//.test(pathname) || pathname.endsWith("/super");
}

function formatDisplayName(raw?: string | null, email?: string | null): string {
  const cleaned = (raw ?? "").replace(/\s+/g, " ").trim();
  if (cleaned) {
    return cleaned
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }
  const local = email?.split("@")[0]?.replace(/[._-]+/g, " ").trim();
  if (local) {
    return local
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }
  return "Candidat";
}

function ProfilePhoto({ name, avatarUrl, size = 40 }: { name: string; avatarUrl?: string | null; size?: number }) {
  return (
    <img
      src={getUserAvatarUrl(name, size, avatarUrl)}
      alt=""
      className="ck-avatar-photo"
      style={{ width: size, height: size }}
      width={size}
      height={size}
      referrerPolicy="no-referrer"
    />
  );
}

export default function LearningShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const [session, setLocalSession] = useState<AuthSession | null>(() => getSession());
  const [stats, setStats] = useState<Gamification | null>(null);
  const [dash, setDash] = useState<CandidatDashboard | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const immersive = isImmersive(location.pathname);

  const displayName = formatDisplayName(session?.name, session?.email);
  const avatarSeed = session?.email || session?.id || displayName;

  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  useEffect(() => {
    let cancelled = false;
    void hydrateSessionFromApi().then((fresh) => {
      if (!cancelled && fresh) {
        setLocalSession(fresh);
        setSession(fresh);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchGamification().catch(() => null), fetchCandidatDashboard().catch(() => null)]).then(([g, d]) => {
      if (cancelled) return;
      setStats(
        g ?? {
          points: 0,
          niveau: 1,
          chapters_read: 0,
          chapters_total: 0,
          next_level_at: 150,
          points_to_next_level: 150,
        },
      );
      if (d) setDash(d);
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
            <img src={CODAKIS_LOGO} alt="CODAKIS" className="ck-topbar__brand-img" />
          </Link>

          <nav className="ck-topbar__nav" aria-label="Navigation principale">
            {TOP_LINKS.map(({ to, label, icon: Icon, ...rest }) => (
              <NavLink key={to} to={to} end={"end" in rest ? rest.end : false} className={({ isActive }) => (isActive ? "is-active" : undefined)}>
                <span className="ck-topbar__nav-icon" aria-hidden>
                  <Icon size={20} strokeWidth={2.25} />
                </span>
                <span className="ck-topbar__nav-label">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="ck-topbar__right">
            <span className="ck-topbar__stat">
              <Trophy size={16} /> Niveau {niveau}
            </span>
            <span className="ck-topbar__stat ck-topbar__stat--pts">Points {points}</span>
            <span className="ck-topbar__stat ck-topbar__stat--ch">Chapitres {chapters}</span>

            <div className="ck-topbar__profile" ref={menuRef}>
              <button type="button" className="ck-topbar__avatar-btn" aria-expanded={menuOpen} aria-haspopup="menu" onClick={() => setMenuOpen((v) => !v)}>
                <ProfilePhoto name={avatarSeed} avatarUrl={session?.avatarUrl} size={40} />
                <span className="ck-topbar__user-name">{displayName}</span>
                <ChevronDown size={16} aria-hidden />
              </button>
              {menuOpen ? (
                <div className="ck-topbar__menu" role="menu">
                  <UserMenuPanel
                    name={displayName}
                    email={session?.email ?? ""}
                    avatarUrl={session?.avatarUrl}
                    profileTo="/espace/candidat/profil"
                    preferencesTo="/espace/candidat/preferences"
                    onClose={() => setMenuOpen(false)}
                    onLogout={logout}
                    extraLinks={[
                      {
                        to: "/espace/candidat/statistiques",
                        label: "Mes réalisations",
                        icon: <Award size={16} aria-hidden />,
                      },
                      {
                        to: "/espace/candidat/auto-ecole",
                        label: "Auto-école",
                        icon: <School size={16} aria-hidden />,
                      },
                      {
                        to: "/espace/candidat/seances",
                        label: "Séances",
                        icon: <Calendar size={16} aria-hidden />,
                      },
                    ]}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className={`ck-learn__body${immersive ? " is-immersive" : ""}`}>
        <main className="ck-learn__feed">
          <Outlet context={{ stats, setStats, dash }} />
        </main>
        {!immersive ? (
          <StickyWidgets
            stats={stats}
            successRate={dash?.first_try_rate ?? dash?.success_rate ?? 0}
            questionsAnswered={dash?.questions_answered ?? 0}
            questionsTotal={dash?.questions_total ?? 0}
            correctAnswers={dash?.correct_answers ?? 0}
            quizzesPassed={dash?.quizzes_passed ?? 0}
            examensPassed={dash?.examens_passed ?? 0}
            userName={avatarSeed}
            avatarUrl={session?.avatarUrl}
          />
        ) : null}
      </div>

      {!immersive ? (
        <nav className="ck-dock" aria-label="Navigation mobile">
          {BOTTOM_LINKS.map(({ to, label, icon: Icon, color, ...rest }) => (
            <NavLink
              key={to}
              to={to}
              end={"end" in rest ? rest.end : false}
              className={({ isActive }) => `ck-dock__item${isActive ? " is-active" : ""}`}
              style={{ "--ck-dock-color": color } as CSSProperties}
            >
              <span className="ck-dock__icon">
                <Icon size={24} strokeWidth={2.4} aria-hidden />
              </span>
              <span className="ck-dock__label">{label}</span>
            </NavLink>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
