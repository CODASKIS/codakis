import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Award,
  BookOpen,
  Car,
  Crown,
  Medal,
  Shield,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import { getUserAvatarUrl } from "../../lib/uiAvatars";
import {
  fetchLeaderboard,
  type Gamification,
  type LeaderboardEntry,
  type LeaderboardResponse,
} from "../../lib/pedagogyApi";

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

const LEVEL_STEP = 150;

const VEHICLES = [
  { id: "citadine", unlockedAt: 0, label: "Citadine", color: "#e11d48" },
  { id: "berline", unlockedAt: LEVEL_STEP, label: "Berline", color: "#0ea5e9" },
  { id: "suv", unlockedAt: LEVEL_STEP * 2, label: "SUV", color: "#00a859" },
  { id: "sport", unlockedAt: LEVEL_STEP * 3, label: "Sport", color: "#f59e0b" },
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
    hint: v.unlockedAt === 0 ? "Véhicule de départ" : `Niveau ${1 + v.unlockedAt / LEVEL_STEP}`,
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
      unlocked: points >= LEVEL_STEP * 2,
      Icon: Trophy,
    },
  ];

  return [...vehicles, ...badges];
}

function rankMedal(rank: number) {
  if (rank === 1) return { Icon: Crown, tone: "gold" as const };
  if (rank === 2) return { Icon: Medal, tone: "silver" as const };
  if (rank === 3) return { Icon: Medal, tone: "bronze" as const };
  return { Icon: Medal, tone: "plain" as const };
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
  const niveau = stats?.niveau ?? 1;
  const nextAt = stats?.next_level_at ?? LEVEL_STEP;
  const toNext = stats?.points_to_next_level ?? Math.max(0, nextAt - points);
  const levelFloor = Math.max(0, (niveau - 1) * LEVEL_STEP);
  const levelSpan = Math.max(1, nextAt - levelFloor);
  const levelProgress = Math.min(100, Math.round(((points - levelFloor) / levelSpan) * 100));
  const ring = Math.max(0, Math.min(100, successRate));
  const chaptersRead = stats?.chapters_read ?? 0;
  const currentVehicle = [...VEHICLES].reverse().find((v) => points >= v.unlockedAt) ?? VEHICLES[0];
  const collection = buildCollection({
    points,
    chaptersRead,
    quizzesPassed,
    examensPassed,
    successRate: ring,
    questionsAnswered,
  });
  const unlockedCount = collection.filter((item) => item.unlocked).length;

  const [board, setBoard] = useState<LeaderboardResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchLeaderboard(6)
      .then((data) => {
        if (!cancelled) setBoard(data);
      })
      .catch(() => {
        if (!cancelled) setBoard(null);
      });
    return () => {
      cancelled = true;
    };
  }, [points, niveau]);

  const fallbackRow: LeaderboardEntry = {
    rank: board?.your_rank ?? 1,
    user_id: "you",
    display_name: "Vous",
    avatar_url: avatarUrl,
    points,
    niveau,
    is_you: true,
  };
  const rows = board?.entries?.length ? board.entries : [fallbackRow];

  return (
    <aside className="ck-sticky" aria-label="Progression">
      <section className="ck-widget ck-widget--level">
        <div className="ck-widget__level-head">
          <span className="ck-widget__level-pill">
            <Trophy size={14} aria-hidden />
            Niveau {niveau}
          </span>
          <strong className="ck-widget__level-pts">{points} pts</strong>
        </div>

        <div className="ck-widget__vehicle">
          <div
            className="ck-widget__car"
            style={{ background: `${currentVehicle.color}22`, color: currentVehicle.color }}
            aria-hidden
          >
            <Car size={52} strokeWidth={1.6} />
          </div>
          <p className="ck-widget__car-name">{currentVehicle.label}</p>
          <p className="ck-widget__hint">
            {toNext > 0 ? `${toNext} pts pour le niveau ${niveau + 1}` : "Niveau maximum atteint"}
          </p>
          <div
            className="ck-widget__bar"
            role="progressbar"
            aria-valuenow={levelProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progression niveau ${niveau}`}
          >
            <span
              style={{
                width: `${levelProgress}%`,
                background: `linear-gradient(90deg, ${currentVehicle.color}, #fbbf24)`,
              }}
            />
          </div>
          <div className="ck-widget__bar-meta">
            <span>{points - levelFloor} / {levelSpan}</span>
            <span>{levelProgress}%</span>
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
                  {item.unlocked ? <Icon size={18} strokeWidth={2.4} /> : "?"}
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
              stroke="var(--ck-green)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(ring / 100) * 157} 157`}
            />
          </svg>
          <strong className="ck-widget__ring-value">{ring}%</strong>
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

      <section className="ck-widget ck-widget--rank">
        <div className="ck-widget__rank-head">
          <h2 className="ck-widget__title">Classement</h2>
          {board?.your_rank ? (
            <span className="ck-widget__rank-chip">#{board.your_rank}</span>
          ) : null}
        </div>

        <ul className="ck-widget__rank-list">
          {rows.map((row) => {
            const { Icon, tone } = rankMedal(row.rank);
            return (
              <li
                key={`${row.user_id}-${row.rank}`}
                className={`ck-widget__rank${row.is_you ? " is-you" : ""}`}
              >
                <span className={`ck-widget__medal is-${tone}`} aria-hidden>
                  {row.rank <= 3 ? <Icon size={16} /> : <span>{row.rank}</span>}
                </span>
                <img
                  src={getUserAvatarUrl(row.is_you ? userName : row.display_name, 32, row.avatar_url)}
                  alt=""
                  className="ck-avatar-photo"
                  width={32}
                  height={32}
                />
                <div className="ck-widget__rank-meta">
                  <span className="ck-widget__rank-name">{row.display_name}</span>
                  <small>Niv. {row.niveau}</small>
                </div>
                <strong className="ck-widget__rank-pts">{row.points}</strong>
              </li>
            );
          })}
        </ul>

        {board && board.total_players > 1 ? (
          <p className="ck-widget__rank-foot">
            {board.total_players} candidats · continuez pour monter
          </p>
        ) : (
          <p className="ck-widget__rank-foot">Invitez des amis pour monter au classement.</p>
        )}
      </section>
    </aside>
  );
}
