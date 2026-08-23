import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import CmsCoverImage from "../../../components/common/CmsCoverImage";
import ConfirmModal from "../../../components/common/ConfirmModal";
import { uploadCmsImage } from "../../../lib/cms-admin-api";
import {
  AuthApiError,
  createAdminQuestion,
  deleteAdminQuestion,
  fetchAdminQuestion,
  fetchAdminThemes,
  updateAdminQuestion,
  type PedagogyTheme,
} from "../../../lib/pedagogyApi";

const DEFAULT_LABELS = ["A", "B", "C", "D"];

type AnswerForm = { label: string; texte: string; est_correcte: boolean };

export default function AdminQuestionEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "nouveau";

  const [themes, setThemes] = useState<PedagogyTheme[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [themeId, setThemeId] = useState("");
  const [explanation, setExplanation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [answers, setAnswers] = useState<AnswerForm[]>(
    DEFAULT_LABELS.map((label) => ({ label, texte: "", est_correcte: label === "A" })),
  );

  const load = useCallback(async () => {
    try {
      const themesData = await fetchAdminThemes();
      setThemes(themesData);
      if (!isNew && id) {
        const question = await fetchAdminQuestion(id);
        setPrompt(question.prompt);
        setThemeId(question.theme_id ?? "");
        setExplanation(question.explanation ?? "");
        setImageUrl(question.image_url ?? "");
        setAnswers(
          question.reponses.map((item) => ({
            label: item.label,
            texte: item.texte,
            est_correcte: item.est_correcte ?? false,
          })),
        );
      } else if (themesData[0]) {
        setThemeId(themesData[0].id);
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

  function setCorrect(index: number) {
    setAnswers((current) => current.map((item, i) => ({ ...item, est_correcte: i === index })));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    const payload = {
      theme_id: themeId || null,
      prompt: prompt.trim(),
      explanation: explanation.trim() || null,
      image_url: imageUrl.trim() || null,
      reponses: answers.map((item, index) => ({
        label: item.label,
        texte: item.texte.trim(),
        est_correcte: item.est_correcte,
        sort_order: index,
      })),
    };
    try {
      if (isNew) {
        const created = await createAdminQuestion(payload);
        navigate(`/admin/contenu/questions/${created.id}/modifier`, { replace: true });
      } else {
        await updateAdminQuestion(id!, payload);
        setSuccess(t("admin.pedagogy.saveSuccess"));
      }
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("admin.pedagogy.saveError"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader />;

  return (
    <MainCard title={isNew ? t("admin.pedagogy.newQuestion") : t("admin.pedagogy.editQuestion")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
      <Link to="/admin/contenu" className="btn btn-outline-secondary btn-sm mb-4">{t("admin.pedagogy.back")}</Link>
      {error ? <Alert variant="danger">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}
      <Form onSubmit={(event) => void handleSubmit(event)}>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>{t("admin.pedagogy.colTheme")}</Form.Label>
              <Form.Select value={themeId} onChange={(e) => setThemeId(e.target.value)}>
                <option value="">{t("admin.pedagogy.noTheme")}</option>
                {themes.map((theme) => (
                  <option key={theme.id} value={theme.id}>{theme.title_fr}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group>
              <Form.Label>{t("admin.pedagogy.colPrompt")}</Form.Label>
              <Form.Control as="textarea" rows={3} required value={prompt} onChange={(e) => setPrompt(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group>
              <Form.Label>{t("admin.pedagogy.illustration")}</Form.Label>
              {imageUrl ? <CmsCoverImage url={imageUrl} alt="" className="rounded mb-2" style={{ maxHeight: 200, objectFit: "contain" }} /> : null}
              <Form.Control type="file" accept="image/*" disabled={uploadingImage} onChange={(e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;
                setUploadingImage(true);
                void uploadCmsImage(file)
                  .then((result) => setImageUrl(result.key))
                  .catch(() => setError(t("admin.pedagogy.uploadError")))
                  .finally(() => setUploadingImage(false));
              }} />
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Label>{t("admin.pedagogy.answers")}</Form.Label>
            {answers.map((answer, index) => (
              <div key={answer.label} className="d-flex align-items-center gap-2 mb-2">
                <Form.Check type="radio" name="correct" checked={answer.est_correcte} onChange={() => setCorrect(index)} title={t("admin.pedagogy.correctAnswer")} />
                <strong className="text-muted">{answer.label}.</strong>
                <Form.Control
                  required
                  value={answer.texte}
                  onChange={(e) =>
                    setAnswers((current) => current.map((item, i) => (i === index ? { ...item, texte: e.target.value } : item)))
                  }
                />
              </div>
            ))}
            <Form.Text className="text-muted">{t("admin.pedagogy.correctAnswerHint")}</Form.Text>
          </Col>
          <Col md={12}>
            <Form.Group>
              <Form.Label>{t("admin.pedagogy.explanation")}</Form.Label>
              <Form.Control as="textarea" rows={2} value={explanation} onChange={(e) => setExplanation(e.target.value)} />
            </Form.Group>
          </Col>
        </Row>
        <div className="d-flex gap-2 mt-4">
          <Button type="submit" variant="primary" disabled={saving}>{saving ? t("admin.pedagogy.saving") : t("admin.pedagogy.save")}</Button>
          {!isNew ? (
            <Button type="button" variant="outline-danger" disabled={saving} onClick={() => setShowDelete(true)}>{t("admin.pedagogy.delete")}</Button>
          ) : null}
        </div>
      </Form>
      <ConfirmModal show={showDelete} title={t("admin.pedagogy.deleteQuestionTitle")} message={t("admin.pedagogy.deleteQuestionConfirm")} busy={saving} onCancel={() => setShowDelete(false)} onConfirm={() => void (async () => { if (!id) return; await deleteAdminQuestion(id); navigate("/admin/contenu"); })()} />
    </MainCard>
  );
}
