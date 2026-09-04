import { Link } from "react-router";
import { Award, BookOpen, Car, Medal, Shield, Star, Target, Trophy } from "lucide-react";
import { getUserAvatarUrl } from "../../lib/uiAvatars";
import type { Gamification } from "../../lib/pedagogyApi";

type Props = {
  stats: Gamification | null;
  successRate?: number;
  questionsAnswered?: number;
  questionsTotal?: number;
  correctAnswers?: number;
  quizzesPassed?: number;
  examensPassed?: number;
  userName?: string;
  avatarUrl?: string | null;
};

type CollectionItem = {
  id: string;
  label: string;
  hint: string;
  color: string;
  unlocked: boolean;
  Icon: typeof Car;
};

const VEHICLES = [
  { id: "citadine", unlockedAt: 0, label: "Citadine", color: "#e11d48" },
  { id: "berline", unlockedAt: 80, label: "Berline", color: "#0ea5e9" },
  { id: "suv", unlockedAt: 200, label: "SUV", color: "#00a859" },
  { id: "sport", unlockedAt: 400, label: "Sport", color: "#f59e0b" },
] as const;

function buildCollection(input: {
  points: number;
  chaptersRead: number;
  quizzesPassed: number;
  examensPassed: number;
  successRate: number;
  questionsAnswered: number;
}): CollectionItem[] {
  const { points, chaptersRead, quizzesPassed, examensPassed, successRate, questionsAnswered } = input;

  const vehicles: CollectionItem[] = VEHICLES.map((v) => ({
    id: v.id,
    label: v.label,
    hint: v.unlockedAt === 0 ? "Véhicule de départ" : `${v.unlockedAt} points`,
    color: v.color,
    unlocked: points >= v.unlockedAt,
    Icon: Car,
  }));

  const badges: CollectionItem[] = [
    {
      id: "lecteur",
      label: "Lecteur",
      hint: "3 chapitres lus",
      color: "#8b5cf6",
      unlocked: chaptersRead >= 3,
      Icon: BookOpen,
    },
    {
      id: "quizzer",
      label: "Quizzer",
      hint: "1 quiz réussi",
      color: "#0ea5e9",
      unlocked: quizzesPassed >= 1,
      Icon: Shield,
    },
    {
      id: "precision",
      label: "Précision",
      hint: "80% de réussite",
      color: "#f59e0b",
      unlocked: successRate >= 80 && questionsAnswered >= 5,
      Icon: Target,
    },
    {
      id: "examinateur",
      label: "Examen",
      hint: "1 examen blanc",
      color: "#00a859",
      unlocked: examensPassed >= 1,
      Icon: Award,
    },
    {
      id: "etoile",
      label: "Étoile",
      hint: "10 questions",
      color: "#ec4899",
      unlocked: questionsAnswered >= 10,
      Icon: Star,
    },
    {
      id: "champion",
      label: "Champion",
      hint: "Niveau 3",
      color: "#f97316",
      unlocked: points >= 300,
      Icon: Trophy,
    },
  ];

  return [...vehicles, ...badges];
}

export default function StickyWidgets({
  stats,
  successRate = 0,
  questionsAnswered = 0,
  questionsTotal = 0,
  correctAnswers = 0,
  quizzesPassed = 0,
  examensPassed = 0,
  userName = "Vous",
  avatarUrl,
}: Props) {
  const points = stats?.points ?? 0;
  const nextAt = stats?.next_level_at ?? 150;
  const toNext = stats?.points_to_next_level ?? Math.max(0, nextAt - points);
  const levelProgress = nextAt > 0 ? Math.min(100, Math.round(((nextAt - toNext) / nextAt) * 100)) : 0;
  const ring = Math.max(0, Math.min(100, successRate));
  const chaptersRead = stats?.chapters_read ?? 0;
  const currentVehicle = [...VEHICLES].reverse().find((v) => points >= v.unlockedAt) ?? VEHICLES[0];
  const ringColor = "#00a859";
  const collection = buildCollection({
    points,
    chaptersRead,
    quizzesPassed,
    examensPassed,
    successRate: ring,
    questionsAnswered,
  });
  const unlockedCount = collection.filter((item) => item.unlocked).length;

  return (
    <aside className="ck-sticky" aria-label="Progression">
      <section className="ck-widget">
        <h2 className="ck-widget__title">Véhicule</h2>
        <div className="ck-widget__vehicle">
          <div
            className="ck-widget__car"
            style={{ background: `${currentVehicle.color}22`, color: currentVehicle.color }}
            aria-hidden
          >
            <Car size={56} strokeWidth={1.5} />
          </div>
          <p className="ck-widget__hint">{toNext} points pour changer de niveau</p>
          <div className="ck-widget__bar" aria-hidden>
            <span
              style={{
                width: `${levelProgress}%`,
                background: `linear-gradient(90deg, ${currentVehicle.color}, #fbbf24)`,
              }}
            />
          </div>
        </div>
        <div className="ck-widget__collection">
          <span className="ck-widget__label">
            Collection · {unlockedCount}/{collection.length}
          </span>
          <div className="ck-widget__cars ck-widget__cars--grid">
            {collection.map((item) => {
              const Icon = item.Icon;
              return (
                <span
                  key={item.id}
                  className={`ck-widget__car-slot${item.unlocked ? " is-on" : ""}${
                    item.id === currentVehicle.id ? " is-current" : ""
                  }`}
                  style={
                    item.unlocked
                      ? { color: item.color, borderColor: item.color, background: `${item.color}18` }
                      : undefined
                  }
                  title={item.unlocked ? `${item.label} — ${item.hint}` : `Verrouillé · ${item.hint}`}
                >
                  {item.unlocked ? <Icon size={20} strokeWidth={2.4} /> : "?"}
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
            <path
              d="M10 60 A50 50 0 0 1 110 60"
              fill="none"
              stroke="var(--ck-line)"
              strokeWidth="12"
              strokeLinecap="round"
            />
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
        <Link to="/espace/candidat/statistiques" className="ck-btn ck-btn--primary ck-btn--block">
          Plus de statistiques
        </Link>
      </section>

      <section className="ck-widget">
        <h2 className="ck-widget__title">Classement</h2>
        <div className="ck-widget__rank is-you">
          <Medal size={22} className="ck-widget__medal" />
          <img
            src={getUserAvatarUrl(userName, 32, avatarUrl)}
            alt=""
            className="ck-avatar-photo"
            width={32}
            height={32}
          />
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
