import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import {
  AuthApiError,
  createAdminExamen,
  fetchAdminExamen,
  fetchAdminQuestions,
  updateAdminExamen,
  type PedagogyQuestion,
} from "../../../lib/pedagogyApi";

export default function AdminExamEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "nouveau";

  const [questions, setQuestions] = useState<PedagogyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    duree_minutes: 30,
    nb_questions: 40,
    max_erreurs: 5,
    est_actif: true,
    question_ids: [] as string[],
  });

  const load = useCallback(async () => {
    try {
      setQuestions(await fetchAdminQuestions());
      if (!isNew && id) {
        const examen = await fetchAdminExamen(id);
        setForm({
          title: examen.title,
          description: examen.description ?? "",
          duree_minutes: examen.duree_minutes,
          nb_questions: examen.nb_questions,
          max_erreurs: examen.max_erreurs,
          est_actif: examen.est_actif,
          question_ids: examen.question_ids ?? [],
        });
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
      const payload = { ...form, description: form.description.trim() || null };
      if (isNew) await createAdminExamen(payload);
      else await updateAdminExamen(id!, payload);
      navigate("/admin/contenu");
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("admin.pedagogy.saveError"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader />;

  return (
    <MainCard title={isNew ? t("admin.pedagogy.newExamen") : t("admin.pedagogy.editExamen")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
      <Link to="/admin/contenu" className="btn btn-outline-secondary btn-sm mb-4">{t("admin.pedagogy.back")}</Link>
      {error ? <Alert variant="danger">{error}</Alert> : null}
      <Form onSubmit={(event) => void handleSubmit(event)}>
        <Row className="g-3">
          <Col md={8}><Form.Group><Form.Label>{t("admin.pedagogy.colTitle")}</Form.Label><Form.Control required value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>{t("admin.pedagogy.colDuration")}</Form.Label><Form.Control type="number" min={5} value={form.duree_minutes} onChange={(e) => setForm((c) => ({ ...c, duree_minutes: Number(e.target.value) }))} /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>{t("admin.pedagogy.maxErrors")}</Form.Label><Form.Control type="number" min={0} value={form.max_erreurs} onChange={(e) => setForm((c) => ({ ...c, max_erreurs: Number(e.target.value) }))} /></Form.Group></Col>
          <Col md={12}><Form.Group><Form.Label>{t("admin.pedagogy.description")}</Form.Label><Form.Control as="textarea" rows={2} value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} /></Form.Group></Col>
          <Col md={12}>
            <Form.Label>{t("admin.pedagogy.selectQuestions")} ({form.question_ids.length})</Form.Label>
            <div className="border rounded p-3" style={{ maxHeight: "320px", overflowY: "auto" }}>
              {questions.map((question) => (
                <Form.Check key={question.id} type="checkbox" label={question.prompt} checked={form.question_ids.includes(question.id)} onChange={() => toggleQuestion(question.id)} className="mb-2" />
              ))}
            </div>
          </Col>
        </Row>
        <Button type="submit" variant="primary" className="mt-4" disabled={saving}>{saving ? t("admin.pedagogy.saving") : t("admin.pedagogy.save")}</Button>
      </Form>
    </MainCard>
  );
}
