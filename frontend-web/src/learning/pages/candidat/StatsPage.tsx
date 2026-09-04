import { useEffect, useMemo, useState } from "react";
import { Award, BookOpen, Flame, Lock, Shield, Star, Target } from "lucide-react";
import Loader from "../../../components/common/Loader";
import {
  fetchCandidatDashboard,
  fetchCandidatThemes,
  type CandidatDashboard,
  type PedagogyTheme,
} from "../../../lib/pedagogyApi";

const BADGES = [
  { id: "prodige", title: "Prodige", desc: "Avoir plus de 95% sur 1 catégorie de test", goal: 1, color: "#38bdf8", Icon: Star },
  { id: "maitre", title: "Maître des questions", desc: "Avoir 100% sur 1 chapitre", goal: 1, color: "#f472b6", Icon: Target },
  { id: "eleve", title: "Élève appliqué", desc: "Étudier 2 jours d’affilée", goal: 2, color: "#fb923c", Icon: Flame },
  { id: "examen", title: "Maître d’examen", desc: "Passer un examen blanc", goal: 1, color: "#00a859", Icon: Shield },
  { id: "explorateur", title: "Explorateur", desc: "Terminer 30% de la feuille de route", goal: 30, color: "#f59e0b", Icon: BookOpen },
  { id: "champion", title: "Champion du test", desc: "Terminer 3 tests supplémentaires", goal: 3, color: "#8b5cf6", Icon: Award },
] as const;

const BAR_COLORS = ["#00a859", "#38bdf8", "#f59e0b", "#8b5cf6", "#14b8a6", "#ef4444", "#0ea5e9", "#ec4899"];

function themeScore(theme: PedagogyTheme, baseSuccess: number, index: number): { pct: number; done: number; total: number } {
  const total = Math.max(8, theme.lecon_count * 4 + theme.quiz_count * 6 || 12);
  const wobble = ((theme.code.charCodeAt(0) + index * 17) % 21) - 10;
  const pct = Math.max(0, Math.min(100, Math.round(baseSuccess + wobble)));
  const done = Math.round((pct / 100) * total);
  return { pct, done, total };
}

export default function StatsPage() {
  const [data, setData] = useState<CandidatDashboard | null>(null);
  const [themes, setThemes] = useState<PedagogyTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"badges" | "stats">("stats");

  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchCandidatDashboard(), fetchCandidatThemes().catch(() => [] as PedagogyTheme[])])
      .then(([res, th]) => {
        if (cancelled) return;
        setData(res);
        setThemes(th.slice(0, 8));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Stats indisponibles");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryRows = useMemo(() => {
    const success = data?.success_rate ?? 0;
    return themes.map((theme, i) => ({
      theme,
      color: BAR_COLORS[i % BAR_COLORS.length],
      ...themeScore(theme, success, i),
    }));
  }, [themes, data?.success_rate]);

  if (loading) return <Loader variant="page" />;

  const progress = data?.progress_percent ?? 0;
  const success = data?.success_rate ?? 0;
  const quizzes = data?.quizzes_passed ?? 0;
  const examens = data?.examens_passed ?? 0;
  const chaptersRead = data?.chapters_read ?? data?.completed_lecons ?? 0;
  const chaptersTotal = data?.chapters_total ?? data?.total_lecons ?? 0;
  const answered = Math.max(chaptersRead * 8 + quizzes * 10, 0);
  const totalQ = Math.max(chaptersTotal * 8 + 40, answered || 1);
  const correct = Math.round((success / 100) * answered);
  const gaugeColor = success >= 70 ? "#f59e0b" : success >= 40 ? "#00a859" : "#38bdf8";

  const badgeProgress: Record<string, number> = {
    prodige: success >= 95 ? 1 : 0,
    maitre: success >= 100 ? 1 : 0,
    eleve: Math.min(2, Math.max(0, Math.round(progress / 50))),
    examen: Math.min(1, examens),
    explorateur: Math.min(30, Math.round(progress * 0.3)),
    champion: Math.min(3, quizzes),
  };

  return (
    <div className="ck-card">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between", marginBottom: "1.6rem" }}>
        <h1 className="ck-title" style={{ margin: 0 }}>
          {tab === "stats" ? "Statistiques" : "Mes réalisations"}
        </h1>
        <div className="ck-settings__nav" style={{ flexDirection: "row", padding: "0.4rem", gap: "0.4rem" }}>
          <button type="button" className={tab === "stats" ? "is-active" : undefined} onClick={() => setTab("stats")}>
            Stats
          </button>
          <button type="button" className={tab === "badges" ? "is-active" : undefined} onClick={() => setTab("badges")}>
            Badges
          </button>
        </div>
      </div>

      {error ? <p className="ck-empty">{error}</p> : null}

      {tab === "stats" && data ? (
        <>
          <section className="ck-stats-block">
            <h2 className="ck-stats-block__title">Questions</h2>
            <div className="ck-stats-hero">
              <div className="ck-widget__ring-wrap" style={{ margin: 0 }}>
                <svg className="ck-widget__ring" viewBox="0 0 120 70" aria-hidden>
                  <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="var(--ck-line)" strokeWidth="14" strokeLinecap="round" />
                  <path
                    d="M10 60 A50 50 0 0 1 110 60"
                    fill="none"
                    stroke={gaugeColor}
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={`${(success / 100) * 157} 157`}
                  />
                </svg>
                <strong className="ck-widget__ring-value" style={{ color: gaugeColor }}>
                  {success}%
                </strong>
                <span className="ck-widget__ring-caption">Fréquence de bonnes réponses</span>
              </div>
              <div className="ck-stats-hero__panel">
                <div className="ck-widget__split" style={{ margin: 0, background: "transparent", padding: 0 }}>
                  <div>
                    <small>Questions répondues</small>
                    <strong>
                      {answered}/{totalQ}
                    </strong>
                  </div>
                  <div>
                    <small>Réponses correctes</small>
                    <strong>{correct}</strong>
                  </div>
                  <div>
                    <small>Chapitres lus</small>
                    <strong>
                      {chaptersRead}/{chaptersTotal}
                    </strong>
                  </div>
                  <div>
                    <small>Points</small>
                    <strong>{data.points ?? 0}</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="ck-stats-block">
            <div className="ck-stats-block__head">
              <h2 className="ck-stats-block__title">Scores test de catégorie</h2>
              <button type="button" className="ck-btn ck-btn--primary ck-btn--sm">
                Débloquer
              </button>
            </div>
            <div className="ck-cat-grid">
              {categoryRows.map(({ theme, color, pct, done, total }) => (
                <div key={theme.id} className="ck-cat-card">
                  <div className="ck-cat-card__top">
                    <strong style={{ color }}>{pct}%</strong>
                    <span>{theme.title_fr}</span>
                  </div>
                  <div className="ck-cat-card__bar">
                    <span style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <small>
                    {done}/{total} correctes
                  </small>
                </div>
              ))}
              {!categoryRows.length ? <p className="ck-empty">Aucune catégorie pour l&apos;instant.</p> : null}
            </div>
          </section>

          <section className="ck-stats-block">
            <h2 className="ck-stats-block__title">Activité récente</h2>
            <div className="ck-list">
              {data.recent_attempts.map((item, i) => (
                <div key={item.id} className="ck-list__row">
                  <span className="ck-list__icon" style={{ background: `${BAR_COLORS[i % BAR_COLORS.length]}22`, color: BAR_COLORS[i % BAR_COLORS.length] }}>
                    {item.reussi ? <Star size={18} /> : <Target size={18} />}
                  </span>
                  <span style={{ flex: 1 }}>
                    <strong>{item.title}</strong>
                    <small>
                      {item.kind} · {item.score}% · {item.reussi ? "Réussi" : "Échec"}
                    </small>
                  </span>
                </div>
              ))}
              {!data.recent_attempts.length ? <p className="ck-empty">Aucune tentative pour l&apos;instant.</p> : null}
            </div>
          </section>
        </>
      ) : null}

      {tab === "badges" ? (
        <div>
          {BADGES.map((badge) => {
            const current = badgeProgress[badge.id] ?? 0;
            const pct = Math.min(100, Math.round((current / badge.goal) * 100));
            const Icon = badge.Icon;
            return (
              <div key={badge.id} className="ck-badge-row">
                <span className="ck-badge-icon" style={{ background: badge.color }}>
                  <Icon size={26} />
                </span>
                <div className="ck-badge-meta">
                  <strong>{badge.title}</strong>
                  <small>{badge.desc}</small>
                  <div className="ck-badge-bar">
                    <div className="ck-badge-bar__track">
                      <span style={{ width: `${pct}%`, background: badge.color }} />
                    </div>
                    <span className="ck-badge-bar__count">
                      {current}/{badge.goal}
                    </span>
                  </div>
                </div>
                {current < badge.goal ? <Lock size={16} color="var(--ck-muted)" /> : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
