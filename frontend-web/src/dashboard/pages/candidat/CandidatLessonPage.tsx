import { ArrowLeft, ArrowRight, BookOpen, ChevronLeft, ListOrdered, Lock } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Col, Row } from "react-bootstrap";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import CmsCoverImage from "../../../components/common/CmsCoverImage";
import { renderBlogBody } from "../../../lib/blog-content";
import {
  AuthApiError,
  fetchCandidatLecon,
  fetchCandidatLecons,
  fetchCandidatThemes,
  type PedagogyLecon,
  type PedagogyTheme,
} from "../../../lib/pedagogyApi";

const UPGRADE_HREF = "/themes#abonnement";

export default function CandidatLessonPage() {
  const { t, i18n } = useTranslation();
  const { id = "" } = useParams<{ id: string }>();
  const [lecon, setLecon] = useState<PedagogyLecon | null>(null);
  const [siblings, setSiblings] = useState<PedagogyLecon[]>([]);
  const [theme, setTheme] = useState<PedagogyTheme | null>(null);
  const [bodyHtml, setBodyHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setLocked(false);
    try {
      const data = await fetchCandidatLecon(id);
      setLecon(data);
      setBodyHtml(await renderBlogBody(data.body));

      const [lecons, themes] = await Promise.all([
        fetchCandidatLecons(data.theme_id),
        fetchCandidatThemes(),
      ]);
      setSiblings(lecons);
      setTheme(themes.find((item) => item.id === data.theme_id) ?? null);
    } catch (err) {
      if (err instanceof AuthApiError && err.status === 403) {
        setLocked(true);
      } else {
        setError(err instanceof AuthApiError ? err.message : t("candidat.pedagogy.loadError"));
      }
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [id]);

  const themeTitle = theme
    ? i18n.language.startsWith("en")
      ? theme.title_en
      : theme.title_fr
    : null;

  const { index, previous, next } = useMemo(() => {
    const position = siblings.findIndex((item) => item.id === id);
    return {
      index: position,
      previous: position > 0 ? siblings[position - 1] : null,
      next: position >= 0 && position < siblings.length - 1 ? siblings[position + 1] : null,
    };
  }, [id, siblings]);

  if (loading) return <Loader />;

  if (locked) {
    return (
      <Row>
        <Col xl={7} lg={9}>
          <MainCard
            title={t("candidat.pedagogy.lockedTitle")}
            isOption={false}
            cardClass="codakis-lesson__main"
            optionClass=""
            CardBodyClass=""
          >
            <div className="codakis-lesson__locked">
              <span className="codakis-lesson__locked-icon" aria-hidden>
                <Lock size={26} strokeWidth={1.8} />
              </span>
              <h2>{t("candidat.pedagogy.lockedTitle")}</h2>
              <p>{t("candidat.pedagogy.lockedLead")}</p>
              <div className="codakis-lesson__locked-actions">
                <Link to={UPGRADE_HREF} className="btn btn-primary btn-sm">
                  {t("dashboard.userMenu.upgradeCta")}
                </Link>
                <Link to="/espace/candidat/cours" className="btn btn-outline-secondary btn-sm">
                  {t("candidat.pedagogy.backCourses")}
                </Link>
              </div>
            </div>
          </MainCard>
        </Col>
      </Row>
    );
  }

  if (!lecon) return <Alert variant="danger">{error || t("candidat.pedagogy.leconNotFound")}</Alert>;

  return (
    <Row className="codakis-lesson">
      <Col xl={8} lg={7}>
        <MainCard
          title={themeTitle ?? t("dashboard.nav.courses")}
          isOption={false}
          cardClass="codakis-lesson__main"
          optionClass=""
          CardBodyClass=""
        >
          <Link to="/espace/candidat/cours" className="codakis-lesson__back">
            <ChevronLeft size={16} aria-hidden />
            {t("candidat.pedagogy.backCourses")}
          </Link>

          <header className="codakis-lesson__header">
            {index >= 0 ? (
              <span className="codakis-lesson__eyebrow">
                {t("candidat.pedagogy.lessonPosition", {
                  current: index + 1,
                  total: siblings.length,
                })}
              </span>
            ) : null}
            <h1>{lecon.title}</h1>
            {lecon.excerpt ? <p>{lecon.excerpt}</p> : null}
          </header>

          {lecon.cover_image_url ? (
            <CmsCoverImage
              url={lecon.cover_image_url}
              alt={lecon.title}
              className="codakis-lesson__cover"
            />
          ) : null}

          <div
            className="fj-prose fj-wysiwyg codakis-lesson-body"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />

          <nav className="codakis-lesson__nav" aria-label={t("candidat.pedagogy.lessonNav")}>
            {previous ? (
              <Link
                to={`/espace/candidat/cours/lecon/${previous.id}`}
                className="codakis-lesson__nav-link"
              >
                <ArrowLeft size={18} aria-hidden />
                <span>
                  <small>{t("candidat.pedagogy.prevLesson")}</small>
                  <strong>{previous.title}</strong>
                </span>
              </Link>
            ) : (
              <span />
            )}

            {next ? (
              <Link
                to={`/espace/candidat/cours/lecon/${next.id}`}
                className="codakis-lesson__nav-link is-next"
              >
                <span>
                  <small>{t("candidat.pedagogy.nextLesson")}</small>
                  <strong>{next.title}</strong>
                </span>
                <ArrowRight size={18} aria-hidden />
              </Link>
            ) : (
              <Link to="/espace/candidat/examens" className="codakis-lesson__nav-link is-next">
                <span>
                  <small>{t("candidat.pedagogy.themeCompleted")}</small>
                  <strong>{t("candidat.pedagogy.goExams")}</strong>
                </span>
                <ArrowRight size={18} aria-hidden />
              </Link>
            )}
          </nav>
        </MainCard>
      </Col>

      <Col xl={4} lg={5}>
        <MainCard
          title={t("candidat.pedagogy.themeOutline")}
          isOption={false}
          cardClass="codakis-lesson__aside"
          optionClass=""
          CardBodyClass=""
        >
          <div className="codakis-lesson__aside-meta">
            <ListOrdered size={18} aria-hidden />
            {t("candidat.pedagogy.lessonCount", { count: siblings.length })}
          </div>

          <ol className="codakis-lesson__outline">
            {siblings.map((item, position) => (
              <li key={item.id}>
                <Link
                  to={`/espace/candidat/cours/lecon/${item.id}`}
                  className={`codakis-lesson__outline-item${item.id === id ? " is-current" : ""}`}
                  aria-current={item.id === id ? "page" : undefined}
                >
                  <span className="codakis-lesson__outline-step" aria-hidden>
                    {item.id === id ? <BookOpen size={15} strokeWidth={2} /> : position + 1}
                  </span>
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ol>

          <Link to="/espace/candidat/examens" className="btn btn-primary btn-sm w-100 mt-3">
            {t("candidat.pedagogy.goExams")}
          </Link>
        </MainCard>
      </Col>
    </Row>
  );
}
