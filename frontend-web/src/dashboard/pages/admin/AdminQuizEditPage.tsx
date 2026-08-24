import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import {
  AuthApiError,
  createAdminQuiz,
  deleteAdminQuiz,
  fetchAdminQuestions,
  fetchAdminQuiz,
  fetchAdminThemes,
  updateAdminQuiz,
  type PedagogyQuestion,
  type PedagogyTheme,
} from "../../../lib/pedagogyApi";

export default function AdminQuizEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isNew = !id || id === "nouveau";

  const [themes, setThemes] = useState<PedagogyTheme[]>([]);
  const [questions, setQuestions] = useState<PedagogyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    theme_id: searchParams.get("themeId") ?? "",
    title: "",
    description: "",
    question_count: 10,
    duree_minutes: 10,
    est_actif: true,
    sort_order: Number(searchParams.get("sortOrder") ?? 100),
    in_course_path: searchParams.get("inCourse") !== "0",
    question_ids: [] as string[],
  });

  const load = useCallback(async () => {
    try {
      const [themesData, questionsData] = await Promise.all([fetchAdminThemes(), fetchAdminQuestions()]);
      setThemes(themesData);
      setQuestions(questionsData);
      if (!isNew && id) {
        const quiz = await fetchAdminQuiz(id);
        setForm({
          theme_id: quiz.theme_id,
          title: quiz.title,
          description: quiz.description ?? "",
          question_count: quiz.question_count,
          duree_minutes: quiz.duree_minutes,
          est_actif: quiz.est_actif,
          sort_order: quiz.sort_order,
          in_course_path: quiz.in_course_path,
          question_ids: quiz.question_ids ?? [],
        });
      } else {
        setForm((current) => ({
          ...current,
          theme_id: current.theme_id || themesData[0]?.id || "",
        }));
      }
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("admin.pedagogy.loadError"));
    } finally {
      setLoading(false);
    }
  }, [id, isNew, t]);

  useEffect(() => {
    void load();
  }, [load]);

  function toggleQuestion(questionId: string) {
    setForm((current) => ({
      ...current,
      question_ids: current.question_ids.includes(questionId)
        ? current.question_ids.filter((item) => item !== questionId)
        : [...current.question_ids, questionId],
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        description: form.description.trim() || null,
        question_count: form.question_ids.length || form.question_count,
      };
      if (isNew) {
        const created = await createAdminQuiz(payload);
        navigate(`/admin/contenu/quiz/${created.id}/modifier`, { replace: true });
      } else {
        await updateAdminQuiz(id!, payload);
      }
      navigate("/admin/contenu");
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("admin.pedagogy.saveError"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader />;

  const filteredQuestions = form.theme_id ? questions.filter((q) => q.theme_id === form.theme_id) : questions;

  return (
    <MainCard title={isNew ? t("admin.pedagogy.newQuiz") : t("admin.pedagogy.editQuiz")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
      <Link to="/admin/contenu" className="btn btn-outline-secondary btn-sm mb-4">{t("admin.pedagogy.back")}</Link>
      {error ? <Alert variant="danger">{error}</Alert> : null}
      <Form onSubmit={(event) => void handleSubmit(event)}>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>{t("admin.pedagogy.colTheme")}</Form.Label>
              <Form.Select required value={form.theme_id} onChange={(e) => setForm((c) => ({ ...c, theme_id: e.target.value, question_ids: [] }))}>
                {themes.map((theme) => (
                  <option key={theme.id} value={theme.id}>{theme.title_fr}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>{t("admin.pedagogy.colTitle")}</Form.Label>
              <Form.Control required value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>{t("admin.pedagogy.colDuration")}</Form.Label>
              <Form.Control type="number" min={1} max={120} value={form.duree_minutes} onChange={(e) => setForm((c) => ({ ...c, duree_minutes: Number(e.target.value) }))} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>{t("admin.pedagogy.sortOrder")}</Form.Label>
              <Form.Control type="number" min={0} value={form.sort_order} onChange={(e) => setForm((c) => ({ ...c, sort_order: Number(e.target.value) }))} />
              <Form.Text className="text-muted">{t("admin.pedagogy.courseStepOrderHint")}</Form.Text>
            </Form.Group>
          </Col>
          <Col md={3} className="d-flex align-items-end">
            <Form.Check type="switch" label={t("admin.pedagogy.quizActive")} checked={form.est_actif} onChange={(e) => setForm((c) => ({ ...c, est_actif: e.target.checked }))} />
          </Col>
          <Col md={3} className="d-flex align-items-end">
            <Form.Check type="switch" label={t("admin.pedagogy.inCourseSection")} checked={form.in_course_path} onChange={(e) => setForm((c) => ({ ...c, in_course_path: e.target.checked }))} />
          </Col>
          <Col md={12}>
            <Form.Group>
              <Form.Label>{t("admin.pedagogy.description")}</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} />
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Label>{t("admin.pedagogy.selectQuestions")} ({form.question_ids.length})</Form.Label>
            <div className="border rounded p-3" style={{ maxHeight: "320px", overflowY: "auto" }}>
              {filteredQuestions.map((question) => (
                <Form.Check key={question.id} type="checkbox" id={`q-${question.id}`} label={question.prompt} checked={form.question_ids.includes(question.id)} onChange={() => toggleQuestion(question.id)} className="mb-2" />
              ))}
            </div>
          </Col>
        </Row>
        <div className="d-flex gap-2 mt-4">
          <Button type="submit" variant="primary" disabled={saving}>{saving ? t("admin.pedagogy.saving") : t("admin.pedagogy.save")}</Button>
          {!isNew ? (
            <Button type="button" variant="outline-danger" disabled={saving} onClick={() => void deleteAdminQuiz(id!).then(() => navigate("/admin/contenu"))}>
              {t("admin.pedagogy.delete")}
            </Button>
          ) : null}
        </div>
      </Form>
    </MainCard>
  );
}
