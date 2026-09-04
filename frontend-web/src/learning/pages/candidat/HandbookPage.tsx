import { useEffect, useState } from "react";
import { Link } from "react-router";
import { BookOpen } from "lucide-react";
import Loader from "../../../components/common/Loader";
import { fetchCandidatLecons, fetchCandidatThemes, type PedagogyLecon, type PedagogyTheme } from "../../../lib/pedagogyApi";

export default function HandbookPage() {
  const [themes, setThemes] = useState<PedagogyTheme[]>([]);
  const [leconsByTheme, setLeconsByTheme] = useState<Record<string, PedagogyLecon[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await fetchCandidatThemes();
        if (cancelled) return;
        setThemes(list);
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
      {themes.map((theme) => (
        <section key={theme.id} style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.7rem", marginBottom: "1rem" }}>
            {theme.title_fr} {theme.locked ? "(Premium)" : ""}
          </h2>
          <div className="ck-list">
            {(leconsByTheme[theme.id] ?? []).map((lecon) => (
              <Link
                key={lecon.id}
                to={theme.locked || lecon.locked ? "#" : `/espace/candidat/lecon/${lecon.id}`}
                className="ck-list__row"
                onClick={(e) => {
                  if (theme.locked || lecon.locked) e.preventDefault();
                }}
              >
                <span className="ck-list__icon">
                  <BookOpen size={18} />
                </span>
                <span style={{ flex: 1 }}>
                  <strong>{lecon.title}</strong>
                  <small>{lecon.excerpt || "Leçon"}</small>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
