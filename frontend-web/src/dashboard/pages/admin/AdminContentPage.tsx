import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { Badge, Col, Nav, Row, Tab, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import TablePagination from "../../../components/common/TablePagination";
import { useTablePagination } from "../../../hooks/useTablePagination";
import {
  AuthApiError,
  fetchAdminExamens,
  fetchAdminLecons,
  fetchAdminQuestions,
  fetchAdminQuizList,
  fetchAdminThemes,
  type PedagogyExamen,
  type PedagogyLecon,
  type PedagogyQuestion,
  type PedagogyQuiz,
  type PedagogyTheme,
} from "../../../lib/pedagogyApi";
import AdminCoursePathPanel from "./AdminCoursePathPanel";

export default function AdminContentPage() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [themes, setThemes] = useState<PedagogyTheme[]>([]);
  const [lecons, setLecons] = useState<PedagogyLecon[]>([]);
  const [questions, setQuestions] = useState<PedagogyQuestion[]>([]);
  const [quizList, setQuizList] = useState<PedagogyQuiz[]>([]);
  const [examens, setExamens] = useState<PedagogyExamen[]>([]);
  const [activeTab, setActiveTab] = useState("lecons");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [themesData, leconsData, questionsData, quizData, examensData] = await Promise.all([
        fetchAdminThemes(),
        fetchAdminLecons(),
        fetchAdminQuestions(),
        fetchAdminQuizList(),
        fetchAdminExamens(),
      ]);
      setThemes(themesData);
      setLecons(leconsData);
      setQuestions(questionsData);
      setQuizList(quizData);
      setExamens(examensData);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("admin.pedagogy.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const themeTitle = (theme: PedagogyTheme) => (i18n.language.startsWith("en") ? theme.title_en : theme.title_fr);

  const leconsPage = useTablePagination(lecons, { resetKey: activeTab });
  const questionsPage = useTablePagination(questions, { resetKey: activeTab });
  const quizPage = useTablePagination(quizList, { resetKey: activeTab });
  const examensPage = useTablePagination(examens, { resetKey: activeTab });

  if (loading) return <Loader />;

  return (
    <MainCard title={t("admin.pedagogy.title")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
      <p className="text-muted mb-4">{t("admin.pedagogy.subtitle")}</p>
      {error ? <div className="alert alert-danger py-2">{error}</div> : null}

      <Tab.Container activeKey={activeTab} onSelect={(key) => key && setActiveTab(String(key))}>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item><Nav.Link eventKey="themes">{t("admin.pedagogy.tabs.themes")}</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="lecons">{t("admin.pedagogy.tabs.lecons")}</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="questions">{t("admin.pedagogy.tabs.questions")}</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="parcours">{t("admin.pedagogy.tabs.parcours")}</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="quiz">{t("admin.pedagogy.tabs.quiz")}</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="examens">{t("admin.pedagogy.tabs.examens")}</Nav.Link></Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="themes">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">{t("admin.pedagogy.themesTitle")}</h6>
              <Link to="/admin/contenu/themes/nouveau" className="btn btn-primary btn-sm">{t("admin.pedagogy.newTheme")}</Link>
            </div>
            <Row className="g-3">
              {themes.map((theme) => (
                <Col md={6} lg={4} key={theme.id}>
                  <div className="border rounded p-3 h-100 d-flex flex-column">
                    <div className="fw-semibold">{themeTitle(theme)}</div>
                    <small className="text-muted mb-2">{theme.lecon_count} {t("admin.pedagogy.leconCount")} · {theme.quiz_count} quiz</small>
                    {theme.is_premium ? <Badge bg="warning" className="align-self-start mb-2">Premium</Badge> : null}
                    <Link to={`/admin/contenu/themes/${theme.id}/modifier`} className="btn btn-outline-primary btn-sm mt-auto align-self-start">{t("admin.pedagogy.edit")}</Link>
                  </div>
                </Col>
              ))}
            </Row>
          </Tab.Pane>
          <Tab.Pane eventKey="lecons">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">{t("admin.pedagogy.leconsTitle")}</h6>
              <Link to="/admin/contenu/lecons/nouveau" className="btn btn-primary btn-sm">{t("admin.pedagogy.newLecon")}</Link>
            </div>
            <Row className="g-3 mb-4">
              {themes.map((theme) => (
                <Col md={6} lg={4} key={theme.id}>
                  <div className="border rounded p-3 h-100">
                    <div className="fw-semibold">{themeTitle(theme)}</div>
                    <small className="text-muted">{theme.lecon_count} {t("admin.pedagogy.leconCount")}</small>
                    {theme.is_premium ? <Badge bg="warning" className="ms-2">Premium</Badge> : null}
                  </div>
                </Col>
              ))}
            </Row>
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>{t("admin.pedagogy.colTitle")}</th>
                    <th>{t("admin.pedagogy.colTheme")}</th>
                    <th>{t("admin.pedagogy.colStatus")}</th>
                    <th>{t("admin.pedagogy.sortOrder")}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {leconsPage.paginatedItems.map((lecon) => (
                    <tr key={lecon.id}>
                      <td>{lecon.title}</td>
                      <td>{lecon.theme_code}</td>
                      <td><Badge bg={lecon.status === "published" ? "success" : "secondary"}>{lecon.status}</Badge></td>
                      <td>{lecon.sort_order}</td>
                      <td className="text-end">
                        <Link to={`/admin/contenu/lecons/${lecon.id}/modifier`} className="btn btn-outline-primary btn-sm">{t("admin.pedagogy.edit")}</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <TablePagination page={leconsPage.page} pageSize={leconsPage.pageSize} total={leconsPage.total} onPageChange={leconsPage.setPage} />
            </div>
          </Tab.Pane>

          <Tab.Pane eventKey="questions">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">{t("admin.pedagogy.questionsTitle")}</h6>
              <Link to="/admin/contenu/questions/nouveau" className="btn btn-primary btn-sm">{t("admin.pedagogy.newQuestion")}</Link>
            </div>
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>{t("admin.pedagogy.colPrompt")}</th>
                    <th>{t("admin.pedagogy.colTheme")}</th>
                    <th>{t("admin.pedagogy.colAnswers")}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {questionsPage.paginatedItems.map((question) => (
                    <tr key={question.id}>
                      <td className="text-truncate" style={{ maxWidth: "24rem" }}>{question.prompt}</td>
                      <td>{question.theme_code ?? "—"}</td>
                      <td>{question.reponses.length}</td>
                      <td className="text-end">
                        <Link to={`/admin/contenu/questions/${question.id}/modifier`} className="btn btn-outline-primary btn-sm">{t("admin.pedagogy.edit")}</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <TablePagination page={questionsPage.page} pageSize={questionsPage.pageSize} total={questionsPage.total} onPageChange={questionsPage.setPage} />
            </div>
          </Tab.Pane>

          <Tab.Pane eventKey="parcours">
            <AdminCoursePathPanel themes={themes} />
          </Tab.Pane>

          <Tab.Pane eventKey="quiz">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">{t("admin.pedagogy.quizTitle")}</h6>
              <Link to="/admin/contenu/quiz/nouveau" className="btn btn-primary btn-sm">{t("admin.pedagogy.newQuiz")}</Link>
            </div>
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead>
                  <tr><th>{t("admin.pedagogy.colTitle")}</th><th>{t("admin.pedagogy.colTheme")}</th><th>{t("admin.pedagogy.colLinked")}</th><th>{t("admin.pedagogy.sortOrder")}</th><th>{t("admin.pedagogy.inCourse")}</th><th /></tr>
                </thead>
                <tbody>
                  {quizPage.paginatedItems.map((quiz) => (
                    <tr key={quiz.id}>
                      <td>{quiz.title}</td>
                      <td>{quiz.theme_code}</td>
                      <td>{quiz.linked_count}</td>
                      <td>{quiz.sort_order}</td>
                      <td>{quiz.in_course_path ? t("admin.pedagogy.yes") : t("admin.pedagogy.no")}</td>
                      <td className="text-end">
                        <Link to={`/admin/contenu/quiz/${quiz.id}/modifier`} className="btn btn-outline-primary btn-sm">{t("admin.pedagogy.edit")}</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <TablePagination page={quizPage.page} pageSize={quizPage.pageSize} total={quizPage.total} onPageChange={quizPage.setPage} />
            </div>
          </Tab.Pane>

          <Tab.Pane eventKey="examens">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">{t("admin.pedagogy.examensTitle")}</h6>
              <Link to="/admin/contenu/examens/nouveau" className="btn btn-primary btn-sm">{t("admin.pedagogy.newExamen")}</Link>
            </div>
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead>
                  <tr><th>{t("admin.pedagogy.colTitle")}</th><th>{t("admin.pedagogy.colDuration")}</th><th>{t("admin.pedagogy.colLinked")}</th><th /></tr>
                </thead>
                <tbody>
                  {examensPage.paginatedItems.map((examen) => (
                    <tr key={examen.id}>
                      <td>{examen.title}</td>
                      <td>{examen.duree_minutes} min · max {examen.max_erreurs} err.</td>
                      <td>{examen.linked_count}</td>
                      <td className="text-end">
                        <Link to={`/admin/contenu/examens/${examen.id}/modifier`} className="btn btn-outline-primary btn-sm">{t("admin.pedagogy.edit")}</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <TablePagination page={examensPage.page} pageSize={examensPage.pageSize} total={examensPage.total} onPageChange={examensPage.setPage} />
            </div>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </MainCard>
  );
}
