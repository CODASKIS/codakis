import { useCallback, useEffect, useState } from "react";
import { Badge, Nav, Tab, Table } from "react-bootstrap";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import {
  AuthApiError,
  fetchCandidatExamens,
  fetchCandidatQuizList,
  type PedagogyExamen,
  type PedagogyQuiz,
} from "../../../lib/pedagogyApi";

export default function CandidatExamsPage() {
  const { t } = useTranslation();
  const [quizList, setQuizList] = useState<PedagogyQuiz[]>([]);
  const [examens, setExamens] = useState<PedagogyExamen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [quizData, examensData] = await Promise.all([fetchCandidatQuizList(), fetchCandidatExamens()]);
      setQuizList(quizData);
      setExamens(examensData);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("candidat.pedagogy.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <Loader />;

  return (
    <MainCard title={t("dashboard.nav.exams")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
      <p className="text-muted mb-4">{t("candidat.pedagogy.examsLead")}</p>
      {error ? <div className="alert alert-danger py-2">{error}</div> : null}
      <Tab.Container defaultActiveKey="quiz">
        <Nav variant="tabs" className="mb-4">
          <Nav.Item><Nav.Link eventKey="quiz">{t("candidat.pedagogy.tabQuiz")}</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="examens">{t("candidat.pedagogy.tabExamens")}</Nav.Link></Nav.Item>
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="quiz">
            <Table hover className="align-middle">
              <thead><tr><th>{t("admin.pedagogy.colTitle")}</th><th>{t("admin.pedagogy.colTheme")}</th><th>{t("admin.pedagogy.colDuration")}</th><th>{t("admin.pedagogy.colLinked")}</th><th /></tr></thead>
              <tbody>
                {quizList.map((quiz) => (
                  <tr key={quiz.id}>
                    <td>{quiz.title}</td>
                    <td>{quiz.theme_code}</td>
                    <td>{quiz.duree_minutes} min</td>
                    <td>{quiz.linked_count}</td>
                    <td className="text-end">
                      {quiz.linked_count > 0 ? (
                        <Link to={`/espace/candidat/examens/quiz/${quiz.id}`} className="btn btn-primary btn-sm">{t("candidat.pedagogy.start")}</Link>
                      ) : (
                        <Badge bg="secondary">{t("candidat.pedagogy.notReady")}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab.Pane>
          <Tab.Pane eventKey="examens">
            <Table hover className="align-middle">
              <thead><tr><th>{t("admin.pedagogy.colTitle")}</th><th>{t("admin.pedagogy.colDuration")}</th><th /></tr></thead>
              <tbody>
                {examens.map((examen) => (
                  <tr key={examen.id}>
                    <td>{examen.title}</td>
                    <td>{examen.duree_minutes} min · max {examen.max_erreurs} err.</td>
                    <td className="text-end">
                      {examen.linked_count > 0 ? (
                        <Link to={`/espace/candidat/examens/examen/${examen.id}`} className="btn btn-primary btn-sm">{t("candidat.pedagogy.start")}</Link>
                      ) : (
                        <Badge bg="secondary">{t("candidat.pedagogy.notReady")}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </MainCard>
  );
}
