import { BookOpen, ChevronRight, Crown, GraduationCap, Layers3, Lock } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Accordion, Badge, Col, Row } from "react-bootstrap";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import {
  AuthApiError,
  fetchCandidatLecons,
  fetchCandidatThemes,
  type PedagogyLecon,
  type PedagogyTheme,
} from "../../../lib/pedagogyApi";

const UPGRADE_HREF = "/themes#abonnement";

export default function CandidatCoursesPage() {
  const { t, i18n } = useTranslation();
  const [themes, setThemes] = useState<PedagogyTheme[]>([]);
  const [leconsByTheme, setLeconsByTheme] = useState<Record<string, PedagogyLecon[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const themesData = await fetchCandidatThemes();
      setThemes(themesData);
      const entries = await Promise.all(
        themesData.map(async (theme) => [theme.id, await fetchCandidatLecons(theme.id)] as const),
      );
      setLeconsByTheme(Object.fromEntries(entries));
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("candidat.pedagogy.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const themeTitle = (theme: PedagogyTheme) => (i18n.language.startsWith("en") ? theme.title_en : theme.title_fr);
  const totalLecons = useMemo(
    () => Object.values(leconsByTheme).reduce((total, lecons) => total + lecons.length, 0),
    [leconsByTheme],
  );

  if (loading) return <Loader />;

  return (
    <Row>
      <Col lg={12}>
        <MainCard
          title={t("dashboard.nav.courses")}
          isOption={false}
          cardClass="codakis-courses"
          optionClass=""
          CardBodyClass=""
        >
          {error ? <div className="alert alert-danger py-2">{error}</div> : null}

          <section className="codakis-courses__hero">
            <div className="codakis-courses__hero-icon" aria-hidden>
              <GraduationCap size={30} strokeWidth={1.8} />
            </div>
            <div className="codakis-courses__hero-copy">
              <span className="codakis-courses__eyebrow">{t("candidat.pedagogy.learningPath")}</span>
              <h2>{t("candidat.pedagogy.coursesTitle")}</h2>
              <p>{t("candidat.pedagogy.coursesLead")}</p>
            </div>
            <div className="codakis-courses__stats" aria-label={t("candidat.pedagogy.pathSummary")}>
              <div>
                <Layers3 size={20} aria-hidden />
                <strong>{themes.length}</strong>
                <span>{t("candidat.pedagogy.modules")}</span>
              </div>
              <div>
                <BookOpen size={20} aria-hidden />
                <strong>{totalLecons}</strong>
                <span>{t("candidat.pedagogy.lessons")}</span>
              </div>
            </div>
          </section>

          <div className="codakis-courses__section-heading">
            <div>
              <span>{t("candidat.pedagogy.curriculum")}</span>
              <h3>{t("candidat.pedagogy.allThemes")}</h3>
            </div>
            <p>{t("candidat.pedagogy.openThemeHint")}</p>
          </div>

          <Accordion alwaysOpen defaultActiveKey={["0"]} className="codakis-courses__outline">
            {themes.map((theme, index) => (
              <Accordion.Item eventKey={String(index)} key={theme.id}>
                <Accordion.Header>
                  <span className="codakis-courses__module-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="codakis-courses__module-title">
                    <small>{t("candidat.pedagogy.themeLabel", { number: index + 1 })}</small>
                    <strong>{themeTitle(theme)}</strong>
                  </span>
                  <span className="codakis-courses__module-meta">
                    {theme.is_premium ? (
                      <Badge className="codakis-courses__premium">
                        {theme.locked ? <Lock size={12} aria-hidden /> : <Crown size={13} aria-hidden />}
                        {t("candidat.pedagogy.premium")}
                      </Badge>
                    ) : null}
                    <span>
                      {t("candidat.pedagogy.lessonCount", {
                        count: leconsByTheme[theme.id]?.length ?? 0,
                      })}
                    </span>
                  </span>
                </Accordion.Header>
                <Accordion.Body>
                  {(leconsByTheme[theme.id] ?? []).length === 0 ? (
                    <p className="codakis-courses__empty">{t("candidat.pedagogy.noLecons")}</p>
                  ) : (
                    <>
                      <ol className="codakis-courses__lesson-list">
                        {(leconsByTheme[theme.id] ?? []).map((lecon, lessonIndex) =>
                          theme.locked ? (
                            <li key={lecon.id}>
                              <div className="codakis-courses__lesson is-locked">
                                <span className="codakis-courses__lesson-step" aria-hidden>
                                  <Lock size={14} strokeWidth={2} />
                                </span>
                                <span className="codakis-courses__lesson-copy">
                                  <strong>{lecon.title}</strong>
                                  {lecon.excerpt ? <span>{lecon.excerpt}</span> : null}
                                </span>
                              </div>
                            </li>
                          ) : (
                            <li key={lecon.id}>
                              <Link
                                to={`/espace/candidat/cours/lecon/${lecon.id}`}
                                className="codakis-courses__lesson"
                              >
                                <span className="codakis-courses__lesson-step" aria-hidden>
                                  {lessonIndex + 1}
                                </span>
                                <span className="codakis-courses__lesson-copy">
                                  <strong>{lecon.title}</strong>
                                  {lecon.excerpt ? <span>{lecon.excerpt}</span> : null}
                                </span>
                                <span className="codakis-courses__lesson-action">
                                  {t("candidat.pedagogy.readLesson")}
                                  <ChevronRight size={18} aria-hidden />
                                </span>
                              </Link>
                            </li>
                          ),
                        )}
                      </ol>

                      {theme.locked ? (
                        <div className="codakis-courses__paywall">
                          <Lock size={20} aria-hidden />
                          <div>
                            <strong>{t("candidat.pedagogy.lockedTitle")}</strong>
                            <p>{t("candidat.pedagogy.lockedLead")}</p>
                          </div>
                          <Link to={UPGRADE_HREF} className="btn btn-primary btn-sm">
                            {t("dashboard.userMenu.upgradeCta")}
                          </Link>
                        </div>
                      ) : null}
                    </>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </MainCard>
      </Col>
    </Row>
  );
}
