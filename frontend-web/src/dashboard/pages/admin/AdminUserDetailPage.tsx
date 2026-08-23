import { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Col, Form, Row } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import ConfirmModal from "../../../components/common/ConfirmModal";
import { getSession } from "../../../auth/authStore";
import type { UserRole } from "../../../auth/types";
import {
  AuthApiError,
  deleteAdminUser,
  fetchAdminUser,
  fetchAdminUserConsort,
  updateAdminUser,
  type ApiUser,
  type ConsortDossier,
} from "../../../lib/authApi";

const ROLES: UserRole[] = ["admin", "candidat", "moniteur", "gerant"];

const ROLE_BADGE: Record<UserRole, string> = {
  admin: "dark",
  candidat: "primary",
  moniteur: "warning",
  gerant: "success",
};

type EditForm = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: UserRole;
  langue: string;
  country_code: string;
  password: string;
};

function fullName(user: ApiUser): string {
  return `${user.first_name} ${user.last_name}`.trim();
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function toForm(user: ApiUser): EditForm {
  return {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone ?? "",
    role: user.role,
    langue: user.langue,
    country_code: user.country_code,
    password: "",
  };
}

export default function AdminUserDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = "" } = useParams<{ id: string }>();
  const currentUserId = getSession()?.id;

  const [user, setUser] = useState<ApiUser | null>(null);
  const [consort, setConsort] = useState<ConsortDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"delete" | "toggle" | null>(null);
  const [form, setForm] = useState<EditForm | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUser = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const me = await fetchAdminUser(id);
      setUser(me);
      setForm(toForm(me));
      if (me.role === "candidat") {
        try {
          setConsort(await fetchAdminUserConsort(id));
        } catch {
          setConsort(null);
        }
      } else {
        setConsort(null);
      }
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("admin.users.detailLoadError"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  function roleLabel(role: UserRole): string {
    return t(`auth.roles.${role}.title`);
  }

  async function handleSave() {
    if (!user || !form) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateAdminUser(user.id, {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        role: form.role,
        langue: form.langue,
        country_code: form.country_code,
        password: form.password.trim() || undefined,
      });
      setUser(updated);
      setForm(toForm(updated));
      setEditing(false);
      setSuccess(t("admin.users.detailSaveSuccess"));
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("admin.users.updateError"));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive() {
    if (!user) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateAdminUser(user.id, { is_active: !user.is_active });
      setUser(updated);
      setForm(toForm(updated));
      setSuccess(t("admin.users.detailSaveSuccess"));
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("admin.users.updateError"));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!user) return;
    if (user.id === currentUserId) {
      setError(t("admin.users.deleteSelf"));
      return;
    }
    setBusy(true);
    setError("");
    try {
      await deleteAdminUser(user.id);
      navigate("/admin/utilisateurs");
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("admin.users.deleteError"));
      setBusy(false);
    }
  }

  async function handleConfirmAction() {
    if (!confirmAction) return;
    if (confirmAction === "delete") {
      await handleDelete();
      return;
    }
    await handleToggleActive();
    setConfirmAction(null);
  }

  if (loading) return <Loader />;
  if (!user || !form) {
    return (
      <Alert variant="danger">
        {error || t("admin.users.detailLoadError")}{" "}
        <Link to="/admin/utilisateurs">{t("admin.users.backToList")}</Link>
      </Alert>
    );
  }

  return (
    <Row className="g-4">
      <Col lg={8}>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <Link to="/admin/utilisateurs" className="btn btn-outline-secondary btn-sm">
            {t("admin.users.backToList")}
          </Link>
          <div className="d-flex flex-wrap gap-2">
            {editing ? (
              <>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={saving}
                  onClick={() => {
                    setForm(toForm(user));
                    setEditing(false);
                  }}
                >
                  {t("common.cancel")}
                </Button>
                <Button variant="primary" size="sm" disabled={saving} onClick={() => void handleSave()}>
                  {saving ? t("admin.users.detailSaving") : t("admin.users.detailSave")}
                </Button>
              </>
            ) : (
              <Button variant="outline-primary" size="sm" onClick={() => setEditing(true)}>
                {t("admin.users.detailEdit")}
              </Button>
            )}
          </div>
        </div>

        <MainCard title={fullName(user)} isOption={false} cardClass="" optionClass="" CardBodyClass="">
          {error ? <Alert variant="danger">{error}</Alert> : null}
          {success ? <Alert variant="success">{success}</Alert> : null}

          <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
            <Badge bg={ROLE_BADGE[user.role]}>{roleLabel(user.role)}</Badge>
            <Badge bg={user.is_active ? "success" : "secondary"}>
              {user.is_active ? t("admin.users.statusActive") : t("admin.users.statusInactive")}
            </Badge>
          </div>

          {editing ? (
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("admin.users.fields.firstName")}</Form.Label>
                  <Form.Control
                    value={form.first_name}
                    onChange={(event) => setForm((current) => current && { ...current, first_name: event.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("admin.users.fields.lastName")}</Form.Label>
                  <Form.Control
                    value={form.last_name}
                    onChange={(event) => setForm((current) => current && { ...current, last_name: event.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>{t("admin.users.fields.email")}</Form.Label>
                  <Form.Control
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => current && { ...current, email: event.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("admin.users.fields.role")}</Form.Label>
                  <Form.Select
                    value={form.role}
                    onChange={(event) =>
                      setForm((current) => current && { ...current, role: event.target.value as UserRole })
                    }
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {roleLabel(role)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("admin.users.fields.phone")}</Form.Label>
                  <Form.Control
                    value={form.phone}
                    onChange={(event) => setForm((current) => current && { ...current, phone: event.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("dashboard.profile.language")}</Form.Label>
                  <Form.Select
                    value={form.langue}
                    onChange={(event) => setForm((current) => current && { ...current, langue: event.target.value })}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("dashboard.profile.country")}</Form.Label>
                  <Form.Control
                    value={form.country_code}
                    onChange={(event) =>
                      setForm((current) => current && { ...current, country_code: event.target.value.toUpperCase() })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>{t("admin.users.fields.password")}</Form.Label>
                  <Form.Control
                    type="password"
                    minLength={8}
                    value={form.password}
                    onChange={(event) => setForm((current) => current && { ...current, password: event.target.value })}
                  />
                  <Form.Text className="text-muted">{t("admin.users.fields.passwordHint")}</Form.Text>
                </Form.Group>
              </Col>
            </Row>
          ) : (
            <Row className="g-4">
              <Col md={6}>
                <p className="text-muted small mb-1">{t("admin.users.columns.email")}</p>
                <p className="fw-semibold mb-0">{user.email}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted small mb-1">{t("admin.users.columns.phone")}</p>
                <p className="fw-semibold mb-0">{user.phone ?? t("dashboard.profile.notProvided")}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted small mb-1">{t("dashboard.profile.city")}</p>
                <p className="fw-semibold mb-0">{user.city ?? t("dashboard.profile.notProvided")}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted small mb-1">{t("dashboard.profile.language")}</p>
                <p className="fw-semibold mb-0">{user.langue === "en" ? "English" : "Français"}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted small mb-1">{t("admin.users.detailCreated")}</p>
                <p className="fw-semibold mb-0">{formatDateTime(user.created_at)}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted small mb-1">{t("admin.users.detailUpdated")}</p>
                <p className="fw-semibold mb-0">{formatDateTime(user.updated_at)}</p>
              </Col>
              <Col md={12}>
                <p className="text-muted small mb-1">{t("admin.users.detailUserId")}</p>
                <p className="fw-semibold mb-0 text-break small">{user.id}</p>
              </Col>
            </Row>
          )}
        </MainCard>

        <div className="d-flex flex-wrap gap-2 mt-3">
          <Button variant="outline-secondary" size="sm" disabled={busy} onClick={() => setConfirmAction("toggle")}>
            {user.is_active ? t("admin.users.deactivate") : t("admin.users.activate")}
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            disabled={busy || user.id === currentUserId}
            onClick={() => setConfirmAction("delete")}
          >
            {t("admin.users.delete")}
          </Button>
        </div>
      </Col>

      <Col lg={4}>
        {user.role === "gerant" || user.role === "moniteur" ? (
          <MainCard title={t("admin.users.detailSchoolTitle")} isOption={false} cardClass="mb-4" optionClass="" CardBodyClass="">
            {user.school_name ? (
              <>
                <p className="fw-semibold mb-2">{user.school_name}</p>
                <Badge bg={user.school_validated ? "success" : "warning"} className="mb-3">
                  {user.school_validated ? t("admin.users.schoolValidated") : t("admin.users.schoolPending")}
                </Badge>
                {user.school_id ? (
                  <Link to={`/admin/auto-ecoles/${user.school_id}`} className="btn btn-outline-primary btn-sm">
                    {t("admin.users.viewSchool")}
                  </Link>
                ) : null}
              </>
            ) : (
              <p className="text-muted small mb-0">{t("admin.users.noSchoolLinked")}</p>
            )}
          </MainCard>
        ) : null}

        {user.role === "candidat" && consort ? (
          <MainCard title={t("dashboard.nav.consort")} isOption={false} cardClass="mb-4" optionClass="" CardBodyClass="">
            <p className="mb-2">
              <strong>{consort.validated_count}/{consort.total_count}</strong>{" "}
              {t("dashboard.consort.progressLabel").toLowerCase()}
            </p>
            <Badge bg={consort.progress_percent === 100 ? "success" : "warning"} className="mb-3">
              {consort.progress_percent}%
            </Badge>
            <p className="text-muted small mb-0">
              {t("dashboard.consort.progressHintDynamic", {
                validated: consort.validated_count,
                pending: consort.pending_count,
                missing: consort.missing_count,
              })}
            </p>
          </MainCard>
        ) : null}
      </Col>

      <ConfirmModal
        show={confirmAction !== null}
        title={
          confirmAction === "delete"
            ? t("admin.users.deleteTitle")
            : user.is_active
              ? t("admin.users.deactivateTitle")
              : t("admin.users.activateTitle")
        }
        message={
          confirmAction === "delete"
            ? t("admin.users.deleteConfirm", { email: user.email })
            : user.is_active
              ? t("admin.users.deactivateConfirm", { email: user.email })
              : t("admin.users.activateConfirm", { email: user.email })
        }
        variant={confirmAction === "delete" ? "danger" : user.is_active ? "warning" : "success"}
        busy={busy}
        onCancel={() => !busy && setConfirmAction(null)}
        onConfirm={() => void handleConfirmAction()}
      />
    </Row>
  );
}
