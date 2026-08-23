import { useCallback, useEffect, useState } from "react";
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

  if (loading) return <Loader />;

  return (
    <Row>
      <Col lg={12}>
        <MainCard title={t("dashboard.nav.courses")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
          <p className="text-muted mb-4">{t("candidat.pedagogy.coursesLead")}</p>
          {error ? <div className="alert alert-danger py-2">{error}</div> : null}
          <Accordion alwaysOpen>
            {themes.map((theme, index) => (
              <Accordion.Item eventKey={String(index)} key={theme.id}>
                <Accordion.Header>
                  <span className="me-2">{themeTitle(theme)}</span>
                  {theme.is_premium ? <Badge bg="warning">Premium</Badge> : null}
                  <span className="text-muted small ms-2">({leconsByTheme[theme.id]?.length ?? 0})</span>
                </Accordion.Header>
                <Accordion.Body>
                  {(leconsByTheme[theme.id] ?? []).length === 0 ? (
                    <p className="text-muted mb-0">{t("candidat.pedagogy.noLecons")}</p>
                  ) : (
                    <ul className="list-unstyled mb-0">
                      {(leconsByTheme[theme.id] ?? []).map((lecon) => (
                        <li key={lecon.id} className="mb-2">
                          <Link to={`/espace/candidat/cours/lecon/${lecon.id}`} className="fw-semibold text-decoration-none">
                            {lecon.title}
                          </Link>
                          {lecon.excerpt ? <p className="text-muted small mb-0">{lecon.excerpt}</p> : null}
                        </li>
                      ))}
                    </ul>
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
