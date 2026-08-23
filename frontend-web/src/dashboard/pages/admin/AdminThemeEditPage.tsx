import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import {
  AuthApiError,
  createAdminTheme,
  deleteAdminTheme,
  fetchAdminThemes,
  updateAdminTheme,
} from "../../../lib/pedagogyApi";

export default function AdminThemeEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "nouveau";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ code: "", title_fr: "", title_en: "", sort_order: 0, is_premium: false });

  const load = useCallback(async () => {
    if (isNew || !id) return;
    try {
      const themes = await fetchAdminThemes();
      const theme = themes.find((item) => item.id === id);
      if (theme) {
        setForm({
          code: theme.code,
          title_fr: theme.title_fr,
          title_en: theme.title_en,
          sort_order: theme.sort_order,
          is_premium: theme.is_premium,
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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (isNew) {
        const created = await createAdminTheme(form);
        navigate(`/admin/contenu/themes/${created.id}/modifier`, { replace: true });
      } else {
        await updateAdminTheme(id!, form);
        navigate("/admin/contenu");
      }
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("admin.pedagogy.saveError"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader />;

  return (
    <MainCard title={isNew ? t("admin.pedagogy.newTheme") : t("admin.pedagogy.editTheme")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
      <Link to="/admin/contenu" className="btn btn-outline-secondary btn-sm mb-4">{t("admin.pedagogy.back")}</Link>
      {error ? <Alert variant="danger">{error}</Alert> : null}
      <Form onSubmit={(e) => void handleSubmit(e)}>
        <Row className="g-3">
          <Col md={4}><Form.Group><Form.Label>Code</Form.Label><Form.Control required value={form.code} onChange={(e) => setForm((c) => ({ ...c, code: e.target.value }))} /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>{t("admin.pedagogy.colTitle")} (FR)</Form.Label><Form.Control required value={form.title_fr} onChange={(e) => setForm((c) => ({ ...c, title_fr: e.target.value }))} /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>{t("admin.pedagogy.colTitle")} (EN)</Form.Label><Form.Control required value={form.title_en} onChange={(e) => setForm((c) => ({ ...c, title_en: e.target.value }))} /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>{t("admin.pedagogy.sortOrder")}</Form.Label><Form.Control type="number" value={form.sort_order} onChange={(e) => setForm((c) => ({ ...c, sort_order: Number(e.target.value) }))} /></Form.Group></Col>
          <Col md={4}><Form.Check type="checkbox" label="Premium" checked={form.is_premium} onChange={(e) => setForm((c) => ({ ...c, is_premium: e.target.checked }))} className="mt-4" /></Col>
        </Row>
        <div className="d-flex gap-2 mt-4">
          <Button type="submit" variant="primary" disabled={saving}>{saving ? t("admin.pedagogy.saving") : t("admin.pedagogy.save")}</Button>
          {!isNew ? (
            <Button type="button" variant="outline-danger" disabled={saving} onClick={() => void deleteAdminTheme(id!).then(() => navigate("/admin/contenu"))}>
              {t("admin.pedagogy.delete")}
            </Button>
          ) : null}
        </div>
      </Form>
    </MainCard>
  );
}
