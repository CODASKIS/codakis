import { Link } from "react-router";
import { Car, Medal, Trophy } from "lucide-react";
import { getUserAvatarUrl } from "../../lib/uiAvatars";
import type { Gamification } from "../../lib/pedagogyApi";

type Props = {
  stats: Gamification | null;
  successRate?: number;
  questionsAnswered?: number;
  questionsTotal?: number;
  correctAnswers?: number;
  userName?: string;
  avatarUrl?: string | null;
};

const VEHICLES = [
  { id: 1, unlockedAt: 0, label: "Citadine", color: "#ef4444" },
  { id: 2, unlockedAt: 150, label: "Berline", color: "#0ea5e9" },
  { id: 3, unlockedAt: 300, label: "SUV", color: "#00a859" },
  { id: 4, unlockedAt: 450, label: "Sport", color: "#f59e0b" },
] as const;

export default function StickyWidgets({
  stats,
  successRate = 0,
  questionsAnswered = 0,
  questionsTotal = 0,
  correctAnswers = 0,
  userName = "Vous",
  avatarUrl,
}: Props) {
  const points = stats?.points ?? 0;
  const nextAt = stats?.next_level_at ?? 150;
  const toNext = stats?.points_to_next_level ?? Math.max(0, nextAt - points);
  const levelProgress = nextAt > 0 ? Math.min(100, Math.round(((nextAt - toNext) / nextAt) * 100)) : 0;
  const ring = Math.max(0, Math.min(100, successRate));
  const currentVehicle = [...VEHICLES].reverse().find((v) => points >= v.unlockedAt) ?? VEHICLES[0];
  const ringColor = ring >= 70 ? "#f59e0b" : ring >= 40 ? "#00a859" : "#38bdf8";

  return (
    <aside className="ck-sticky" aria-label="Progression">
      <section className="ck-widget">
        <h2 className="ck-widget__title">Véhicule</h2>
        <div className="ck-widget__vehicle">
          <div className="ck-widget__car" style={{ background: `${currentVehicle.color}22`, color: currentVehicle.color }} aria-hidden>
            <Car size={56} strokeWidth={1.5} />
          </div>
          <p className="ck-widget__hint">{toNext} points pour changer de niveau</p>
          <div className="ck-widget__bar" aria-hidden>
            <span style={{ width: `${levelProgress}%`, background: `linear-gradient(90deg, ${currentVehicle.color}, #fbbf24)` }} />
          </div>
        </div>
        <div className="ck-widget__collection">
          <span className="ck-widget__label">Collection</span>
          <div className="ck-widget__cars">
            {VEHICLES.map((v) => {
              const unlocked = points >= v.unlockedAt;
              return (
                <span
                  key={v.id}
                  className={`ck-widget__car-slot${unlocked ? " is-on" : ""}${currentVehicle.id === v.id ? " is-current" : ""}`}
                  style={unlocked ? { color: v.color, borderColor: v.color, background: `${v.color}18` } : undefined}
                  title={unlocked ? v.label : "Verrouillé"}
                >
                  {unlocked ? <Car size={22} /> : "?"}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      <section className="ck-widget">
        <h2 className="ck-widget__title">Questions</h2>
        <div className="ck-widget__ring-wrap">
          <svg className="ck-widget__ring" viewBox="0 0 120 70" aria-hidden>
            <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="var(--ck-line)" strokeWidth="12" strokeLinecap="round" />
            <path
              d="M10 60 A50 50 0 0 1 110 60"
              fill="none"
              stroke={ringColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(ring / 100) * 157} 157`}
            />
          </svg>
          <strong className="ck-widget__ring-value" style={{ color: ringColor }}>
            {ring}%
          </strong>
          <span className="ck-widget__ring-caption">Correct au 1er essai</span>
        </div>
        <div className="ck-widget__split">
          <div>
            <small>Questions répondues</small>
            <strong>
              {questionsAnswered}/{questionsTotal || "—"}
            </strong>
          </div>
          <div>
            <small>Réponses correctes</small>
            <strong>{correctAnswers}</strong>
          </div>
        </div>
        <Link to="/espace/candidat/statistiques" className="ck-btn ck-btn--ghost ck-btn--block">
          Plus de statistiques
        </Link>
      </section>

      <section className="ck-widget">
        <h2 className="ck-widget__title">Classement</h2>
        <div className="ck-widget__rank is-you">
          <Medal size={22} className="ck-widget__medal" />
          <img src={getUserAvatarUrl(userName, 32, avatarUrl)} alt="" className="ck-avatar-photo" width={32} height={32} />
          <span className="ck-widget__rank-name">Vous</span>
          <Car size={18} style={{ color: currentVehicle.color }} aria-hidden />
          <strong className="ck-widget__rank-pts">{points}</strong>
        </div>
        <p className="ck-empty" style={{ padding: "1.2rem 0 0", fontSize: "1.3rem" }}>
          Invitez des amis pour monter au classement.
        </p>
      </section>

      <section className="ck-widget ck-widget--soft">
        <div className="ck-widget__level-row">
          <Trophy size={20} />
          <span>
            Niveau {stats?.niveau ?? 1} · {points} pts
          </span>
        </div>
      </section>
    </aside>
  );
}
