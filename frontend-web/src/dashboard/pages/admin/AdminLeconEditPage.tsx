import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import QuillEditor from "../../../components/editor/QuillEditor";
import Loader from "../../../components/common/Loader";
import CmsCoverImage from "../../../components/common/CmsCoverImage";
import ConfirmModal from "../../../components/common/ConfirmModal";
import { uploadCmsImage } from "../../../lib/cms-admin-api";
import {
  AuthApiError,
  createAdminLecon,
  deleteAdminLecon,
  fetchAdminLecon,
  fetchAdminThemes,
  updateAdminLecon,
  type PedagogyTheme,
} from "../../../lib/pedagogyApi";

export default function AdminLeconEditPage() {
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
  const [uploadingCover, setUploadingCover] = useState(false);
  const [form, setForm] = useState({
    theme_id: "",
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    cover_image_url: "",
    sort_order: 0,
    status: "draft",
  });

  const load = useCallback(async () => {
    try {
      const themesData = await fetchAdminThemes();
      setThemes(themesData);
      if (!isNew && id) {
        const lecon = await fetchAdminLecon(id);
        setForm({
          theme_id: lecon.theme_id,
          title: lecon.title,
          slug: lecon.slug,
          excerpt: lecon.excerpt ?? "",
          body: lecon.body,
          cover_image_url: lecon.cover_image_url ?? "",
          sort_order: lecon.sort_order,
          status: lecon.status,
        });
      } else if (themesData[0]) {
        setForm((current) => ({ ...current, theme_id: themesData[0].id }));
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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    const payload = {
      theme_id: form.theme_id,
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      excerpt: form.excerpt.trim() || undefined,
      body: form.body,
      cover_image_url: form.cover_image_url.trim() || undefined,
      sort_order: form.sort_order,
      status: form.status,
    };
    try {
      if (isNew) {
        const created = await createAdminLecon(payload);
        navigate(`/admin/contenu/lecons/${created.id}/modifier`, { replace: true });
      } else {
        await updateAdminLecon(id!, payload);
        setSuccess(t("admin.pedagogy.saveSuccess"));
      }
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("admin.pedagogy.saveError"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    setSaving(true);
    try {
      await deleteAdminLecon(id);
      navigate("/admin/contenu");
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("admin.pedagogy.deleteError"));
      setSaving(false);
      setShowDelete(false);
    }
  }

  if (loading) return <Loader />;

  return (
    <MainCard title={isNew ? t("admin.pedagogy.newLecon") : t("admin.pedagogy.editLecon")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
      <Link to="/admin/contenu" className="btn btn-outline-secondary btn-sm mb-4">{t("admin.pedagogy.back")}</Link>
      {error ? <Alert variant="danger">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}
      <Form onSubmit={(event) => void handleSubmit(event)}>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>{t("admin.pedagogy.colTheme")}</Form.Label>
              <Form.Select value={form.theme_id} required onChange={(e) => setForm((c) => ({ ...c, theme_id: e.target.value }))}>
                {themes.map((theme) => (
                  <option key={theme.id} value={theme.id}>{theme.title_fr}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>{t("admin.pedagogy.colStatus")}</Form.Label>
              <Form.Select value={form.status} onChange={(e) => setForm((c) => ({ ...c, status: e.target.value }))}>
                <option value="draft">{t("admin.pedagogy.statusDraft")}</option>
                <option value="published">{t("admin.pedagogy.statusPublished")}</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={8}>
            <Form.Group>
              <Form.Label>{t("admin.pedagogy.colTitle")}</Form.Label>
              <Form.Control required value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Slug</Form.Label>
              <Form.Control value={form.slug} onChange={(e) => setForm((c) => ({ ...c, slug: e.target.value }))} />
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group>
              <Form.Label>{t("admin.pedagogy.excerpt")}</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.excerpt} onChange={(e) => setForm((c) => ({ ...c, excerpt: e.target.value }))} />
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group>
              <Form.Label>{t("admin.pedagogy.coverImage")}</Form.Label>
              {form.cover_image_url ? (
                <CmsCoverImage url={form.cover_image_url} alt="" className="rounded mb-2 w-100" style={{ maxHeight: 220, objectFit: "cover" }} />
              ) : null}
              <Form.Control type="file" accept="image/*" disabled={uploadingCover} onChange={(e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;
                setUploadingCover(true);
                void uploadCmsImage(file)
                  .then((result) => setForm((c) => ({ ...c, cover_image_url: result.key })))
                  .catch(() => setError(t("admin.pedagogy.uploadError")))
                  .finally(() => setUploadingCover(false));
              }} />
              <Form.Text className="text-muted">{t("admin.pedagogy.coverImageHint")}</Form.Text>
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Label>{t("admin.pedagogy.body")}</Form.Label>
            <QuillEditor value={form.body} onChange={(body) => setForm((c) => ({ ...c, body }))} />
          </Col>
        </Row>
        <div className="d-flex gap-2 mt-4">
          <Button type="submit" variant="primary" disabled={saving}>{saving ? t("admin.pedagogy.saving") : t("admin.pedagogy.save")}</Button>
          {!isNew ? (
            <Button type="button" variant="outline-danger" disabled={saving} onClick={() => setShowDelete(true)}>{t("admin.pedagogy.delete")}</Button>
          ) : null}
        </div>
      </Form>
      <ConfirmModal show={showDelete} title={t("admin.pedagogy.deleteLeconTitle")} message={t("admin.pedagogy.deleteLeconConfirm")} busy={saving} onCancel={() => setShowDelete(false)} onConfirm={() => void handleDelete()} />
    </MainCard>
  );
}
