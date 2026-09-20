import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Award,
  BookOpen,
  Clock,
  Download,
  Flame,
  Lock,
  Medal,
  Shield,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import Loader from "../../../components/common/Loader";
import { downloadBadge } from "../../lib/badgeCard";
import {
  fetchCandidatDashboard,
  fetchRoadmap,
  type CandidatDashboard,
  type RoadmapSection,
} from "../../../lib/pedagogyApi";

const BADGES = [
  { id: "prodige", title: "Prodige", desc: "Avoir plus de 95% de bonnes réponses", goal: 1, color: "#38bdf8", Icon: Star },
  { id: "maitre", title: "Maître des questions", desc: "Atteindre 100% sur une session", goal: 1, color: "#f472b6", Icon: Target },
  { id: "eleve", title: "Élève appliqué", desc: "Progresser à 50% de la feuille de route", goal: 1, color: "#fb923c", Icon: Flame },
  { id: "examen", title: "Maître d’examen", desc: "Passer un examen blanc", goal: 1, color: "#00a859", Icon: Shield },
  { id: "explorateur", title: "Explorateur", desc: "Terminer 30% de la feuille de route", goal: 1, color: "#f59e0b", Icon: BookOpen },
  { id: "champion", title: "Champion du test", desc: "Réussir 3 quiz", goal: 3, color: "#8b5cf6", Icon: Award },
] as const;

function sectionProgress(section: RoadmapSection) {
  const total = section.steps.length || 1;
  const done = section.steps.filter((s) => s.status === "done").length;
  return { pct: Math.round((done / total) * 100), done, total };
}

type TabKey = "quests" | "badges";

export default function StatsPage() {
  const [data, setData] = useState<CandidatDashboard | null>(null);
  const [sections, setSections] = useState<RoadmapSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<TabKey>("quests");

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetchCandidatDashboard().catch(() => null),
      fetchRoadmap().catch(() => null),
    ])
      .then(([res, roadmap]) => {
        if (cancelled) return;
        if (res) setData(res);
        else setError("Impossible de charger les statistiques pour le moment.");
        setSections(roadmap?.sections ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryRows = useMemo(
    () =>
      sections.map((section) => ({
        id: section.theme_id,
        title: section.theme_title,
        ...sectionProgress(section),
      })),
    [sections],
  );

  const progress = data?.progress_percent ?? 0;
  const firstTry = data?.first_try_rate ?? data?.success_rate ?? 0;
  const success = data?.success_rate ?? firstTry;
  const quizzes = data?.quizzes_passed ?? 0;
  const examens = data?.examens_passed ?? 0;
  const chaptersRead = data?.chapters_read ?? data?.completed_lecons ?? 0;
  const chaptersTotal = data?.chapters_total ?? data?.total_lecons ?? 0;
  const points = data?.points ?? 0;
  const niveau = data?.niveau ?? 1;
  const streak = data?.streak_days ?? data?.streak ?? 0;
  const studyMinutes = data?.study_minutes ?? 0;

  const quests = useMemo(() => {
    const streakGoal = 1;
    const scoreGoal = 2;
    const minutesGoal = 10;

    const streakCurrent = Math.min(streakGoal, streak > 0 ? 1 : 0);
    const scoreCurrent = Math.min(scoreGoal, firstTry >= 80 ? (quizzes >= 2 ? 2 : quizzes >= 1 ? 1 : 0) : 0);
    const minutesCurrent = Math.min(minutesGoal, studyMinutes);

    const list = [
      {
        id: "streak",
        title: "Prolonge ta série",
        goal: streakGoal,
        current: streakCurrent,
        color: "#FF9600",
        bg: "#FFF4E5",
        Icon: Flame,
      },
      {
        id: "score",
        title: "Obtiens un score d'au moins 80 % dans 2 leçons",
        goal: scoreGoal,
        current: scoreCurrent,
        color: "#00CD66",
        bg: "#E5F9EF",
        Icon: Target,
      },
      {
        id: "minutes",
        title: "Apprends pendant 10 minutes",
        goal: minutesGoal,
        current: minutesCurrent,
        color: "#1CB0F6",
        bg: "#E5F4FF",
        Icon: Clock,
      },
    ] as const;

    const doneCount = list.filter((q) => q.current >= q.goal).length;
    return { list, doneCount, total: list.length };
  }, [streak, firstTry, quizzes, studyMinutes]);

  const badgeProgress: Record<string, number> = {
    prodige: firstTry >= 95 ? 1 : 0,
    maitre: success >= 100 ? 1 : 0,
    eleve: progress >= 50 ? 1 : 0,
    examen: Math.min(1, examens),
    explorateur: progress >= 30 ? 1 : 0,
    champion: Math.min(3, quizzes),
  };

  if (loading) return <Loader variant="page" />;

  return (
    <div className="ck-duo-quests">
      <section className="ck-quests-hero">
        <div className="ck-quests-hero__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "quests"}
            className={tab === "quests" ? "is-active" : ""}
            onClick={() => setTab("quests")}
          >
            QUÊTES
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "badges"}
            className={tab === "badges" ? "is-active" : ""}
            onClick={() => setTab("badges")}
          >
            BADGES
          </button>
        </div>

        <div className="ck-quests-hero__body">
          <div className="ck-quests-hero__text">
            <h1 className="ck-quests-hero__title">
              Gagne des récompenses grâce aux quêtes !
            </h1>
            <p className="ck-quests-hero__subtitle">
              Tu as terminé{" "}
              <strong>
                {quests.doneCount} quête
                {quests.doneCount > 1 ? "s" : ""} sur {quests.total}
              </strong>{" "}
              aujourd
              {"'"}hui.
            </p>
          </div>
          <div className="ck-quests-hero__mascot" aria-hidden>
            <Sparkles size={28} />
          </div>
        </div>
      </section>

      {tab === "quests" ? (
        <section className="ck-quests-panel">
          <div className="ck-quests-panel__head">
            <h2 className="ck-quests-panel__title">Quêtes du jour</h2>
            <span className="ck-quests-panel__timer">
              <Clock size={16} strokeWidth={2.4} />
              12 heures
            </span>
          </div>

          <ul className="ck-quest-list" role="list">
            {quests.list.map((q) => {
              const pct = Math.min(100, Math.round((q.current / q.goal) * 100));
              const done = q.current >= q.goal;
              return (
                <li
                  key={q.id}
                  role="listitem"
                  className={`ck-quest ${done ? "is-done" : ""}`}
                >
                  <span
                    className="ck-quest__icon"
                    style={{ color: q.color }}
                    aria-hidden
                  >
                    <q.Icon size={36} strokeWidth={2.2} />
                  </span>
                  <div className="ck-quest__body">
                    <strong className="ck-quest__title">{q.title}</strong>
                    <div className="ck-quest__row">
                      <div className="ck-quest__bar" aria-hidden>
                        <span
                          style={{
                            width: `${pct}%`,
                            background: done ? "#00a859" : q.color,
                          }}
                        />
                      </div>
                      <span className="ck-quest__count">
                        {q.current} / {q.goal}
                      </span>
                      <span
                        className={`ck-quest__chest ${done ? "is-unlocked" : ""}`}
                        aria-label={
                          done
                            ? "Récompense récupérée"
                            : "Récompense à récupérer"
                        }
                      >
                        {done ? (
                          <Trophy size={20} color="#fff" strokeWidth={2.4} />
                        ) : (
                          <Lock size={20} strokeWidth={2.4} />
                        )}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="ck-quest-kpis">
            <article className="ck-kpi">
              <span
                className="ck-kpi__icon"
                style={{ background: "#FFF4E5", color: "#FF9600" }}
              >
                <Zap size={26} strokeWidth={2.3} />
              </span>
              <div className="ck-kpi__body">
                <strong>{points}</strong>
                <span>XP gagnés</span>
              </div>
            </article>
            <article className="ck-kpi">
              <span
                className="ck-kpi__icon"
                style={{ background: "#FFE5D9", color: "#F97316" }}
              >
                <Flame size={26} strokeWidth={2.3} />
              </span>
              <div className="ck-kpi__body">
                <strong>Niv. {niveau}</strong>
                <span>Niveau actuel</span>
              </div>
            </article>
            <article className="ck-kpi">
              <span
                className="ck-kpi__icon"
                style={{ background: "#E5F9EF", color: "#00a859" }}
              >
                <Trophy size={26} strokeWidth={2.3} />
              </span>
              <div className="ck-kpi__body">
                <strong>{firstTry}%</strong>
                <span>Correct au 1er essai</span>
              </div>
            </article>
            <article className="ck-kpi">
              <span
                className="ck-kpi__icon"
                style={{ background: "#EFF6FF", color: "#2563EB" }}
              >
                <Medal size={26} strokeWidth={2.3} />
              </span>
              <div className="ck-kpi__body">
                <strong>
                  {chaptersRead}/{chaptersTotal || "—"}
                </strong>
                <span>Chapitres lus</span>
              </div>
            </article>
          </div>

          <div className="ck-quests-panel">
            <div className="ck-quests-panel__head">
              <h2 className="ck-quests-panel__title">Progression par thème</h2>
              <Link
                to="/espace/candidat"
                className="ck-btn ck-btn--primary ck-btn--sm"
              >
                Continuer
              </Link>
            </div>
            <div className="ck-duo-theme-list">
              {categoryRows.map(({ id, title, pct, done, total }) => (
                <div key={id} className="ck-duo-theme-row">
                  <div className="ck-duo-theme-row__top">
                    <strong>{title}</strong>
                    <span>
                      {done}/{total}
                    </span>
                  </div>
                  <div className="ck-duo-achievement__bar" aria-hidden>
                    <span style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
              {!categoryRows.length ? (
                <p className="ck-empty">Aucun thème pour l&apos;instant.</p>
              ) : null}
            </div>
          </div>
        </section>
      ) : (
        <section className="ck-quests-panel">
          <div className="ck-quests-panel__head">
            <h2 className="ck-quests-panel__title">Badges</h2>
          </div>
          <p className="ck-subtitle">Chaque niveau réussi donne un badge à télécharger. Il reste sur ton compte, même sans abonnement.</p>
          <div className="ck-duo-achievements">
            {Array.from({ length: Math.max(niveau, 1) + 1 }, (_, index) => {
              const level = index + 1;
              const locked = level > niveau;
              return (
                <article key={`niveau-${level}`} className={`ck-duo-achievement ${locked ? "is-locked" : ""}`}>
                  <span className="ck-duo-achievement__icon" style={{ background: locked ? "#d1d5db" : "#00a859" }}>
                    <Medal size={28} color="#fff" strokeWidth={2.3} aria-hidden />
                    {!locked ? <small>OK</small> : null}
                  </span>
                  <div className="ck-duo-achievement__body">
                    <div className="ck-duo-achievement__top">
                      <strong>Niveau {level}</strong>
                      <span>{locked ? "à venir" : "atteint"}</span>
                    </div>
                    <p>{locked ? "Encore un peu de parcours pour débloquer ce badge." : `${points} points cumulés.`}</p>
                    {!locked ? (
                      <button
                        type="button"
                        className="ck-btn ck-btn--primary ck-btn--sm"
                        onClick={() =>
                          downloadBadge({
                            id: `niveau-${level}`,
                            title: `Niveau ${level}`,
                            subtitle: `${points} points`,
                            color: "#00a859",
                          })
                        }
                      >
                        <Download size={14} /> Télécharger
                      </button>
                    ) : null}
                  </div>
                  {locked ? <Lock size={16} color="var(--ck-muted)" aria-label="Verrouillé" /> : <Trophy size={16} color="#00a859" aria-label="Débloqué" />}
                </article>
              );
            })}
            {BADGES.map((badge) => {
              const current = badgeProgress[badge.id] ?? 0;
              const pct = Math.min(100, Math.round((current / badge.goal) * 100));
              const Icon = badge.Icon;
              const locked = current < badge.goal;
              return (
                <article
                  key={badge.id}
                  className={`ck-duo-achievement ${locked ? "is-locked" : ""}`}
                >
                  <span
                    className="ck-duo-achievement__icon"
                    style={{ background: locked ? "#d1d5db" : badge.color }}
                  >
                    <Icon
                      size={28}
                      color="#fff"
                      strokeWidth={2.3}
                      aria-hidden
                    />
                    {!locked ? <small>OK</small> : null}
                  </span>
                  <div className="ck-duo-achievement__body">
                    <div className="ck-duo-achievement__top">
                      <strong>{badge.title}</strong>
                      <span>
                        {current}/{badge.goal}
                      </span>
                    </div>
                    <div className="ck-duo-achievement__bar" aria-hidden>
                      <span
                        style={{
                          width: `${pct}%`,
                          background: locked ? "#9ca3af" : badge.color,
                        }}
                      />
                    </div>
                    <p>{badge.desc}</p>
                    {!locked ? (
                      <button
                        type="button"
                        className="ck-btn ck-btn--primary ck-btn--sm"
                        onClick={() =>
                          downloadBadge({
                            id: badge.id,
                            title: badge.title,
                            subtitle: badge.desc,
                            color: badge.color,
                          })
                        }
                      >
                        <Download size={14} /> Télécharger
                      </button>
                    ) : null}
                  </div>
                  {locked ? (
                    <Lock
                      size={16}
                      color="var(--ck-muted)"
                      aria-label="Verrouillé"
                    />
                  ) : (
                    <Trophy
                      size={16}
                      color="#00a859"
                      aria-label="Débloqué"
                    />
                  )}
                </article>
              );
            })}
          </div>
          {error && !data ? <p className="ck-empty">{error}</p> : null}
        </section>
      )}
    </div>
  );
}
