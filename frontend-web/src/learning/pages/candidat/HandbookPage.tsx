import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  BookOpen,
  Car,
  FileText,
  Lock,
  Shield,
  TrafficCone,
} from "lucide-react";
import Loader from "../../../components/common/Loader";
import {
  fetchCandidatLecons,
  fetchCandidatProgress,
  fetchCandidatThemes,
  type PedagogyLecon,
  type PedagogyTheme,
} from "../../../lib/pedagogyApi";

const LESSON_ICONS = [BookOpen, FileText, TrafficCone, Shield, Car] as const;
const LESSON_COLORS = ["#2563eb", "#00a859", "#f59e0b", "#8b5cf6", "#ef4444", "#0ea5e9"];

export default function HandbookPage() {
  const [themes, setThemes] = useState<PedagogyTheme[]>([]);
  const [leconsByTheme, setLeconsByTheme] = useState<Record<string, PedagogyLecon[]>>({});
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [list, progress] = await Promise.all([
          fetchCandidatThemes(),
          fetchCandidatProgress().catch(() => null),
        ]);
        if (cancelled) return;
        setThemes(list);
        setCompletedIds(new Set(progress?.completed_lecon_ids ?? []));
        const entries = await Promise.all(
          list.map(async (theme) => [theme.id, await fetchCandidatLecons(theme.id)] as const),
        );
        if (cancelled) return;
        setLeconsByTheme(Object.fromEntries(entries));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Handbook indisponible");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Loader variant="page" />;

  return (
    <div className="ck-card">
      <h1 className="ck-title">Handbook</h1>
      <p className="ck-subtitle">Toutes les leçons par thème.</p>
      {error ? <p className="ck-empty">{error}</p> : null}
      {themes.map((theme) => {
        const lecons = leconsByTheme[theme.id] ?? [];
        const doneInTheme = lecons.filter((l) => completedIds.has(l.id)).length;
        return (
          <section key={theme.id} style={{ marginBottom: "2.4rem" }}>
            <div className="ck-stats-block__head">
              <h2 className="ck-stats-block__title">
                {theme.title_fr} {theme.locked ? "(Premium)" : ""}
              </h2>
              {lecons.length > 0 ? (
                <span className="ck-skill-card__count">
                  {doneInTheme}/{lecons.length}
                </span>
              ) : null}
            </div>
            {!lecons.length ? (
              <p className="ck-empty">Aucune leçon dans ce thème.</p>
            ) : (
              <div className="ck-skill-grid">
                {lecons.map((lecon, index) => {
                  const locked = Boolean(theme.locked || lecon.locked);
                  const done = completedIds.has(lecon.id);
                  const Icon = locked ? Lock : LESSON_ICONS[index % LESSON_ICONS.length];
                  const color = LESSON_COLORS[index % LESSON_COLORS.length];
                  const href = locked ? "#" : `/espace/candidat/lecon/${lecon.id}`;
                  return (
                    <Link
                      key={lecon.id}
                      to={href}
                      className={`ck-skill-card${locked ? " is-locked" : ""}`}
                      onClick={(e) => {
                        if (locked) e.preventDefault();
                      }}
                    >
                      <span className="ck-skill-card__icon" style={{ background: locked ? "#94a3b8" : color }}>
                        <Icon size={26} color="#fff" strokeWidth={2.2} aria-hidden />
                      </span>
                      <span className="ck-skill-card__body">
                        <strong>{lecon.title}</strong>
                        <span className="ck-skill-card__meta">
                          <span className="ck-skill-card__bar" aria-hidden>
                            <span style={{ width: done ? "100%" : "0%" }} />
                          </span>
                          <span className="ck-skill-card__count">{done ? "1/1" : "0/1"}</span>
                        </span>
                        {lecon.excerpt ? <span className="ck-skill-card__hint">{lecon.excerpt}</span> : null}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
