import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Nav, Tab, Table } from "react-bootstrap";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import ModuleSegmentNav from "../../components/common/ModuleSegmentNav";
import PlatformAccessPanel, { isPlatformAccessError } from "../../components/PlatformAccessPanel";
import { fadeUpVariants } from "../../../components/motion/motionPresets";
import {
  AuthApiError,
  fetchCandidatExamens,
  fetchCandidatQuizList,
  fetchCandidatThemes,
  type PedagogyExamen,
  type PedagogyQuiz,
  type PedagogyTheme,
} from "../../../lib/pedagogyApi";

export default function CandidatExamsPage() {
  const { t, i18n } = useTranslation();
  const [quizList, setQuizList] = useState<PedagogyQuiz[]>([]);
  const [examens, setExamens] = useState<PedagogyExamen[]>([]);
  const [themes, setThemes] = useState<PedagogyTheme[]>([]);
  const [activeThemeId, setActiveThemeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paywallBlocked, setPaywallBlocked] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setPaywallBlocked(false);
    try {
      const [quizData, examensData, themesData] = await Promise.all([
        fetchCandidatQuizList(),
        fetchCandidatExamens(),
        fetchCandidatThemes(),
      ]);
      setQuizList(quizData);
      setExamens(examensData);
      setThemes(themesData.filter((theme) => !theme.locked));
      const firstThemeWithQuiz = themesData.find((theme) =>
        quizData.some((quiz) => quiz.theme_id === theme.id),
      );
      setActiveThemeId(firstThemeWithQuiz?.id ?? themesData[0]?.id ?? "");
    } catch (err) {
      if (isPlatformAccessError(err)) {
        setPaywallBlocked(true);
      } else {
        setError(err instanceof AuthApiError ? err.message : t("candidat.pedagogy.loadError"));
      }
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const themeTitle = (theme: PedagogyTheme) =>
    i18n.language.startsWith("en") ? theme.title_en : theme.title_fr;

  const quizSegments = useMemo(
    () =>
      themes
        .filter((theme) => quizList.some((quiz) => quiz.theme_id === theme.id))
        .map((theme, index) => ({
          id: theme.id,
          label: `${String(index + 1).padStart(2, "0")}. ${themeTitle(theme)}`,
          meta: String(quizList.filter((quiz) => quiz.theme_id === theme.id).length),
        })),
    [themes, quizList, i18n.language],
  );

  const filteredQuiz = useMemo(
    () => quizList.filter((quiz) => quiz.theme_id === activeThemeId),
    [quizList, activeThemeId],
  );

  if (loading) return <Loader />;

  return (
    <MainCard title={t("dashboard.nav.exams")} isOption={false} cardClass="codakis-exams" optionClass="" CardBodyClass="">
      <PlatformAccessPanel showBanner={paywallBlocked} onAccessGranted={() => void load()} />
      <p className="text-muted mb-4">{t("candidat.pedagogy.examsLead")}</p>
      {error ? <div className="alert alert-danger py-2">{error}</div> : null}
      {paywallBlocked ? null : (
        <Tab.Container defaultActiveKey="quiz">
          <Nav variant="tabs" className="mb-4">
            <Nav.Item>
              <Nav.Link eventKey="quiz">{t("candidat.pedagogy.tabQuiz")}</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="examens">{t("candidat.pedagogy.tabExamens")}</Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="quiz">
              <ModuleSegmentNav
                segments={quizSegments}
                activeId={activeThemeId}
                onSelect={setActiveThemeId}
                ariaLabel={t("candidat.pedagogy.modules")}
                className="codakis-exams__module-nav mb-4"
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeThemeId}
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Table hover className="align-middle">
                    <thead>
                      <tr>
                        <th>{t("admin.pedagogy.colTitle")}</th>
                        <th>{t("admin.pedagogy.colDuration")}</th>
                        <th>{t("admin.pedagogy.colLinked")}</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredQuiz.map((quiz) => (
                        <tr key={quiz.id}>
                          <td>{quiz.title}</td>
                          <td>{quiz.duree_minutes} min</td>
                          <td>{quiz.linked_count}</td>
                          <td className="text-end">
                            {quiz.linked_count > 0 ? (
                              <Link to={`/espace/candidat/examens/quiz/${quiz.id}`} className="btn btn-primary btn-sm">
                                {t("candidat.pedagogy.start")}
                              </Link>
                            ) : (
                              <Badge bg="secondary">{t("candidat.pedagogy.notReady")}</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  {filteredQuiz.length === 0 ? (
                    <p className="text-muted">{t("candidat.pedagogy.noQuizForModule")}</p>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </Tab.Pane>
            <Tab.Pane eventKey="examens">
              <motion.div variants={fadeUpVariants} initial={false} animate="visible">
                <Table hover className="align-middle">
                  <thead>
                    <tr>
                      <th>{t("admin.pedagogy.colTitle")}</th>
                      <th>{t("admin.pedagogy.colDuration")}</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {examens.map((examen) => (
                      <tr key={examen.id}>
                        <td>{examen.title}</td>
                        <td>
                          {examen.duree_minutes} min · max {examen.max_erreurs} err.
                        </td>
                        <td className="text-end">
                          {examen.linked_count > 0 ? (
                            <Link to={`/espace/candidat/examens/examen/${examen.id}`} className="btn btn-primary btn-sm">
                              {t("candidat.pedagogy.start")}
                            </Link>
                          ) : (
                            <Badge bg="secondary">{t("candidat.pedagogy.notReady")}</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </motion.div>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      )}
    </MainCard>
  );
}
