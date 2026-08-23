import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import CmsCoverImage from "../../../components/common/CmsCoverImage";
import QuillEditor from "../../../components/editor/QuillEditor";
import Loader from "../../../components/common/Loader";
import ConfirmModal from "../../../components/common/ConfirmModal";
import { ApiError } from "../../../lib/api";
import {
  createAdminBlogPost,
  deleteAdminBlogPost,
  fetchAdminBlogPost,
  slugifyTitle,
  updateAdminBlogPost,
  uploadCmsImage,
  type BlogPostPayload,
} from "../../../lib/cms-admin-api";

type BlogFormState = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_image_url: string;
  status: "draft" | "published";
};

const EMPTY_FORM: BlogFormState = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  cover_image_url: "",
  status: "draft",
};

export default function AdminBlogEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const [form, setForm] = useState<BlogFormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadPost = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const post = await fetchAdminBlogPost(id);
      setForm({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? "",
        body: post.body,
        cover_image_url: post.cover_image_url ?? "",
        status: post.status,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("dashboard.adminBlog.loadError"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void loadPost();
  }, [loadPost]);

  function updateField<K extends keyof BlogFormState>(key: K, value: BlogFormState[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "title" && (isNew || !current.slug)) {
        next.slug = slugifyTitle(String(value));
      }
      return next;
    });
  }

  async function handleCoverUpload(file: File) {
    setUploading(true);
    setError("");
    try {
      const result = await uploadCmsImage(file);
      setForm((current) => ({ ...current, cover_image_url: result.key }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("dashboard.adminBlog.uploadError"));
    } finally {
      setUploading(false);
    }
  }

  function buildPayload(): BlogPostPayload {
    return {
      title: form.title.trim(),
      slug: form.slug.trim() || slugifyTitle(form.title),
      excerpt: form.excerpt.trim() || null,
      body: form.body,
      cover_image_url: form.cover_image_url.trim() || null,
      status: form.status,
    };
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.body.trim()) {
      setError(t("dashboard.adminBlog.bodyRequired"));
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = buildPayload();
      if (isNew) {
        const created = await createAdminBlogPost(payload);
        setSuccess(t("dashboard.adminBlog.createSuccess"));
        navigate(`/admin/blog/${created.id}/modifier`, { replace: true });
      } else {
        await updateAdminBlogPost(id!, payload);
        setSuccess(t("dashboard.adminBlog.saveSuccess"));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("dashboard.adminBlog.saveError"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    setSaving(true);
    setError("");
    try {
      await deleteAdminBlogPost(id);
      navigate("/admin/blog");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("dashboard.adminBlog.deleteError"));
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  }

  if (loading) {
    return <Loader variant="inline" theme="flexjobs" message={t("common.loading")} />;
  }

  return (
    <Row>
      <Col sm={12}>
        <MainCard
          title={isNew ? t("dashboard.adminBlog.createTitle") : t("dashboard.adminBlog.editTitle")}
          isOption={false}
          cardClass=""
          optionClass=""
          CardBodyClass=""
        >
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
            <Link to="/admin/blog" className="btn btn-outline-secondary btn-sm">
              {t("dashboard.adminBlog.backToList")}
            </Link>
            {!isNew && form.slug ? (
              <Link to={`/blog/${form.slug}`} className="btn btn-outline-primary btn-sm" target="_blank">
                {t("dashboard.adminBlog.viewPublic")}
              </Link>
            ) : null}
          </div>

          {error ? <Alert variant="danger">{error}</Alert> : null}
          {success ? <Alert variant="success">{success}</Alert> : null}

          <Form onSubmit={(event) => void handleSubmit(event)}>
            <Row className="g-4">
              <Col lg={8}>
                <Form.Group className="mb-3">
                  <Form.Label>{t("dashboard.adminBlog.fields.title")}</Form.Label>
                  <Form.Control
                    required
                    value={form.title}
                    onChange={(event) => updateField("title", event.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>{t("dashboard.adminBlog.fields.slug")}</Form.Label>
                  <Form.Control
                    required
                    value={form.slug}
                    onChange={(event) => updateField("slug", slugifyTitle(event.target.value))}
                  />
                  <Form.Text className="text-muted">{t("dashboard.adminBlog.fields.slugHint")}</Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>{t("dashboard.adminBlog.fields.excerpt")}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={form.excerpt}
                    onChange={(event) => updateField("excerpt", event.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>{t("dashboard.adminBlog.fields.body")}</Form.Label>
                  <QuillEditor
                    value={form.body}
                    onChange={(html) => updateField("body", html)}
                    placeholder={t("dashboard.adminBlog.fields.bodyHint")}
                    minHeight={320}
                  />
                </Form.Group>
              </Col>

              <Col lg={4}>
                <Form.Group className="mb-3">
                  <Form.Label>{t("dashboard.adminBlog.fields.status")}</Form.Label>
                  <Form.Select
                    value={form.status}
                    onChange={(event) => updateField("status", event.target.value as "draft" | "published")}
                  >
                    <option value="draft">{t("dashboard.adminBlog.statusDraft")}</option>
                    <option value="published">{t("dashboard.adminBlog.statusPublished")}</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>{t("dashboard.adminBlog.fields.cover")}</Form.Label>
                  <div className="mb-3">
                    <CmsCoverImage
                      url={form.cover_image_url}
                      width={320}
                      height={180}
                      className="rounded w-100 object-fit-cover"
                    />
                  </div>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={(event) => {
                      const input = event.currentTarget as HTMLInputElement;
                      const file = input.files?.[0];
                      input.value = "";
                      if (file) void handleCoverUpload(file);
                    }}
                  />
                  <Form.Text className="text-muted d-block mt-2">{t("dashboard.adminBlog.fields.coverHint")}</Form.Text>
                  {uploading ? <Form.Text className="text-muted">{t("dashboard.adminBlog.uploading")}</Form.Text> : null}
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex flex-wrap gap-2 mt-2">
              <Button type="submit" variant="primary" disabled={saving || uploading}>
                {saving ? t("dashboard.adminBlog.saving") : t("dashboard.adminBlog.save")}
              </Button>
              {!isNew ? (
                <Button type="button" variant="outline-danger" disabled={saving} onClick={() => setShowDeleteConfirm(true)}>
                  {t("dashboard.adminBlog.delete")}
                </Button>
              ) : null}
            </div>
          </Form>
        </MainCard>
      </Col>

      <ConfirmModal
        show={showDeleteConfirm}
        title={t("dashboard.adminBlog.deleteTitle")}
        message={t("dashboard.adminBlog.deleteConfirm")}
        busy={saving}
        onCancel={() => !saving && setShowDeleteConfirm(false)}
        onConfirm={() => void handleDelete()}
      />
    </Row>
  );
}
