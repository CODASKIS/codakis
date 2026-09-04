import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  BookOpen,
  Building2,
  CalendarDays,
  CreditCard,
  Sparkles,
  Users,
} from "lucide-react";
import {
  fetchGerantMoniteurs,
  fetchPendingSchools,
  fetchAdminUsers,
} from "../../lib/authApi";
import { fetchGerantForfaits, fetchGerantInscriptions, fetchMoniteurSeances } from "../../lib/enrollmentsApi";
import { fetchAdminPaymentStats } from "../../lib/payment-api";

export type ProRole = "gerant" | "moniteur" | "admin";

type Props = {
  role: ProRole;
  profileTo: string;
  homeTo: string;
  onLogout?: () => void;
};

type Chip = { icon: typeof Users; label: string; value: string; color: string };
type QuickLink = { to: string; label: string };

export default function SchoolsRightRail({ role, profileTo, homeTo, onLogout }: Props) {
  const location = useLocation();
  const onProfile = location.pathname.includes("/profil") || location.pathname.includes("/parametres");
  const [chips, setChips] = useState<Chip[]>([]);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        if (role === "gerant") {
          const [ins, fors, mons] = await Promise.all([
            fetchGerantInscriptions(),
            fetchGerantForfaits(),
            fetchGerantMoniteurs(),
          ]);
          if (cancelled) return;
          const seances = ins.reduce((s, i) => s + (i.seances_count || 0), 0);
          setChips([
            { icon: Users, label: "Élèves", value: String(ins.length), color: "#00a859" },
            { icon: CalendarDays, label: "Séances", value: String(seances), color: "#0ea5e9" },
            { icon: Sparkles, label: "Forfaits", value: String(fors.filter((f) => f.est_actif).length), color: "#f59e0b" },
            { icon: BookOpen, label: "Moniteurs", value: String(mons.length), color: "#8b5cf6" },
          ]);
          setLines([
            `${ins.filter((i) => i.heures_conduite_total > 0).length} élèves en conduite`,
            `${mons.length} moniteur${mons.length > 1 ? "s" : ""} dans l’équipe`,
          ]);
        } else if (role === "moniteur") {
          const seances = await fetchMoniteurSeances();
          if (cancelled) return;
          const upcoming = seances.filter((s) => s.statut !== "terminee");
          const done = seances.filter((s) => s.statut === "terminee");
          setChips([
            { icon: CalendarDays, label: "À venir", value: String(upcoming.length), color: "#0ea5e9" },
            { icon: Sparkles, label: "Terminées", value: String(done.length), color: "#00a859" },
            { icon: Users, label: "Élèves", value: String(new Set(seances.map((s) => s.candidat_name)).size), color: "#f59e0b" },
          ]);
          setLines(
            upcoming.slice(0, 2).map((s) => `${s.candidat_name} · ${new Date(s.starts_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}`),
          );
        } else {
          const [pending, users, pay] = await Promise.all([
            fetchPendingSchools().catch(() => []),
            fetchAdminUsers().catch(() => []),
            fetchAdminPaymentStats().catch(() => null),
          ]);
          if (cancelled) return;
          setChips([
            { icon: Building2, label: "À valider", value: String(pending.length), color: "#f59e0b" },
            { icon: Users, label: "Users", value: String(users.length), color: "#00a859" },
            { icon: CreditCard, label: "Paiements", value: String(pay?.completed_count ?? 0), color: "#0ea5e9" },
            { icon: Sparkles, label: "En attente", value: String(pay?.pending_count ?? 0), color: "#8b5cf6" },
          ]);
          setLines([
            `${pending.length} auto-école${pending.length > 1 ? "s" : ""} en validation`,
            `${users.filter((u) => u.role === "candidat").length} candidats sur la plateforme`,
          ]);
        }
      } catch {
        if (!cancelled) {
          setChips([]);
          setLines([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [role, location.pathname]);

  const settingsLinks: QuickLink[] =
    role === "admin"
      ? [
          { to: `${homeTo}/profil`, label: "Compte" },
          { to: `${homeTo}/ecoles`, label: "Auto-écoles" },
          { to: `${homeTo}/utilisateurs`, label: "Utilisateurs" },
          { to: `${homeTo}/paiements`, label: "Paiements" },
        ]
      : role === "gerant"
        ? [
            { to: profileTo, label: "Compte" },
            { to: "/espace/gerant/parametres", label: "École" },
            { to: "/espace/gerant/rapports", label: "Rapports" },
            { to: "/espace/gerant/assigner", label: "Forfaits & séances" },
          ]
        : [
            { to: profileTo, label: "Compte" },
            { to: "/espace/moniteur/seances", label: "Séances" },
            { to: "/espace/moniteur", label: "Élèves" },
          ];

  return (
    <aside className="ck-pro__rail" aria-label="Raccourcis">
      {chips.length ? (
        <div className="ck-pro__chips">
          {chips.map((chip) => {
            const Icon = chip.icon;
            return (
              <span key={chip.label} className="ck-pro__chip" style={{ color: chip.color }} title={chip.label}>
                <Icon size={18} strokeWidth={2.5} />
                <strong>{chip.value}</strong>
              </span>
            );
          })}
        </div>
      ) : null}

      {onProfile ? (
        <>
          <section className="ck-pro__card">
            <h3>Compte</h3>
            <nav className="ck-pro__card-nav">
              {settingsLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={location.pathname === link.to || location.pathname.startsWith(link.to + "/") ? "is-active" : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </section>
          <section className="ck-pro__card">
            <h3>Abonnement</h3>
            <Link to={role === "admin" ? homeTo : "/espace/gerant/rapports"} className="ck-pro__card-link">
              {role === "admin" ? "Console plateforme" : "Voir l’activité Pro"}
            </Link>
          </section>
          <section className="ck-pro__card">
            <h3>Assistance</h3>
            <a href="mailto:support@codakis.cm" className="ck-pro__card-link">
              Centre d’aide
            </a>
          </section>
        </>
      ) : (
        <>
          <section className="ck-pro__card">
            <h3>{role === "admin" ? "Vue plateforme" : role === "gerant" ? "Votre auto-école" : "Vos séances"}</h3>
            <ul className="ck-pro__lines">
              {lines.length ? lines.map((line) => <li key={line}>{line}</li>) : <li>Chargement…</li>}
            </ul>
            <Link to={homeTo} className="ck-btn ck-btn--primary ck-btn--block" style={{ marginTop: "1.2rem" }}>
              Tableau de bord
            </Link>
          </section>
          <section className="ck-pro__card">
            <h3>Raccourcis</h3>
            <nav className="ck-pro__card-nav">
              {settingsLinks.map((link) => (
                <Link key={link.to} to={link.to}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </section>
        </>
      )}

      <div className="ck-pro__foot">
        <a href="mailto:support@codakis.cm">À propos</a>
        <Link to="/">Vitrine</Link>
        <a href="mailto:support@codakis.cm">Aide</a>
        <Link to="/tarifs">Tarifs</Link>
      </div>

      {onLogout ? (
        <button type="button" className="ck-pro__logout" onClick={onLogout}>
          Se déconnecter
        </button>
      ) : null}
    </aside>
  );
}
