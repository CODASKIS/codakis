import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../components/common/Loader";
import { setSession } from "../../auth/authStore";
import {
  AuthApiError,
  fetchMe,
  updateProfile,
  userToSession,
  type ApiUser,
} from "../../lib/authApi";
import { changePassword } from "../../lib/pedagogyApi";

export type ProfileFormState = {
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  langue: string;
};

function toForm(user: ApiUser): ProfileFormState {
  return {
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone ?? "",
    city: user.city ?? "",
    langue: user.langue,
  };
}

type ProfileEditorProps = {
  title: string;
  subtitle?: string;
  showLanguage?: boolean;
  extraReadOnly?: React.ReactNode;
  sidebar?: React.ReactNode;
};

export default function ProfileEditor({
  title,
  subtitle,
  showLanguage = true,
  extraReadOnly,
  sidebar,
}: ProfileEditorProps) {
  const { t } = useTranslation();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [form, setForm] = useState<ProfileFormState>({ first_name: "", last_name: "", phone: "", city: "", langue: "fr" });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const loadUser = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const me = await fetchMe();
      setUser(me);
      setForm(toForm(me));
      setSession(userToSession(me));
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("dashboard.profile.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateProfile({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim() || undefined,
        city: form.city.trim() || undefined,
        langue: showLanguage ? form.langue : undefined,
      });
      setUser(updated);
      setForm(toForm(updated));
      setSession(userToSession(updated));
      setEditing(false);
      setSuccess(t("dashboard.profile.saveSuccess"));
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("dashboard.profile.saveError"));
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(event: React.FormEvent) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (passwordForm.next.length < 8) {
      setPasswordError(t("dashboard.profile.passwordTooShort"));
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError(t("dashboard.profile.passwordMismatch"));
      return;
    }
    setPasswordSaving(true);
    try {
      await changePassword(passwordForm.current, passwordForm.next);
      setPasswordForm({ current: "", next: "", confirm: "" });
      setPasswordSuccess(t("dashboard.profile.passwordSuccess"));
    } catch (err) {
      setPasswordError(err instanceof AuthApiError ? err.message : t("dashboard.profile.passwordError"));
    } finally {
      setPasswordSaving(false);
    }
  }

  if (loading) return <Loader />;

  const displayName = user ? `${user.first_name} ${user.last_name}`.trim() : "—";

  const main = (
    <MainCard title={title} isOption={false} cardClass="" optionClass="" CardBodyClass="">
      {subtitle ? <p className="text-muted mb-4">{subtitle}</p> : null}
      {error ? <Alert variant="danger">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}

      <div className="d-flex justify-content-end mb-3">
        {editing ? (
          <>
            <Button
              variant="outline-secondary"
              size="sm"
              className="me-2"
              disabled={saving}
              onClick={() => {
                if (user) setForm(toForm(user));
                setEditing(false);
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button variant="primary" size="sm" disabled={saving} onClick={() => void handleSave()}>
              {saving ? t("dashboard.profile.saving") : t("dashboard.profile.save")}
            </Button>
          </>
        ) : (
          <Button variant="outline-primary" size="sm" onClick={() => setEditing(true)}>
            {t("dashboard.profile.edit")}
          </Button>
        )}
      </div>

      {editing ? (
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>{t("dashboard.profile.firstName")}</Form.Label>
              <Form.Control
                value={form.first_name}
                onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>{t("dashboard.profile.lastName")}</Form.Label>
              <Form.Control
                value={form.last_name}
                onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>{t("dashboard.profile.phone")}</Form.Label>
              <Form.Control
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>{t("dashboard.profile.city")}</Form.Label>
              <Form.Control
                value={form.city}
                onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
              />
            </Form.Group>
          </Col>
          {showLanguage ? (
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t("dashboard.profile.language")}</Form.Label>
                <Form.Select
                  value={form.langue}
                  onChange={(event) => setForm((current) => ({ ...current, langue: event.target.value }))}
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </Form.Select>
              </Form.Group>
            </Col>
          ) : null}
          <Col md={12}>
            <Form.Group>
              <Form.Label>{t("dashboard.profile.email")}</Form.Label>
              <Form.Control value={user?.email ?? ""} disabled readOnly />
            </Form.Group>
          </Col>
        </Row>
      ) : (
        <Row className="g-4">
          <Col md={6}>
            <p className="text-muted small mb-1">{t("dashboard.profile.fullName")}</p>
            <p className="fw-semibold mb-0">{displayName}</p>
          </Col>
          <Col md={6}>
            <p className="text-muted small mb-1">{t("dashboard.profile.email")}</p>
            <p className="fw-semibold mb-0">{user?.email ?? "—"}</p>
          </Col>
          <Col md={6}>
            <p className="text-muted small mb-1">{t("dashboard.profile.phone")}</p>
            <p className="fw-semibold mb-0">{user?.phone ?? t("dashboard.profile.notProvided")}</p>
          </Col>
          <Col md={6}>
            <p className="text-muted small mb-1">{t("dashboard.profile.city")}</p>
            <p className="fw-semibold mb-0">{user?.city ?? t("dashboard.profile.notProvided")}</p>
          </Col>
          {showLanguage ? (
            <Col md={6}>
              <p className="text-muted small mb-1">{t("dashboard.profile.language")}</p>
              <p className="fw-semibold mb-0">{user?.langue === "en" ? "English" : "Français"}</p>
            </Col>
          ) : null}
          <Col md={6}>
            <p className="text-muted small mb-1">{t("dashboard.profile.role")}</p>
            <p className="fw-semibold mb-0 text-capitalize">{user?.role ?? "—"}</p>
          </Col>
          {extraReadOnly}
        </Row>
      )}
    </MainCard>
  );

  const passwordCard = user?.has_password !== false ? (
    <MainCard title={t("dashboard.profile.passwordTitle")} isOption={false} cardClass="mt-4" optionClass="" CardBodyClass="">
      <p className="text-muted small mb-3">{t("dashboard.profile.passwordHint")}</p>
      {passwordError ? <Alert variant="danger">{passwordError}</Alert> : null}
      {passwordSuccess ? <Alert variant="success">{passwordSuccess}</Alert> : null}
      <Form onSubmit={(event) => void handlePasswordChange(event)}>
        <Row className="g-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>{t("dashboard.profile.currentPassword")}</Form.Label>
              <Form.Control
                type="password"
                autoComplete="current-password"
                required
                value={passwordForm.current}
                onChange={(event) => setPasswordForm((current) => ({ ...current, current: event.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>{t("dashboard.profile.newPassword")}</Form.Label>
              <Form.Control
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={passwordForm.next}
                onChange={(event) => setPasswordForm((current) => ({ ...current, next: event.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>{t("dashboard.profile.confirmPassword")}</Form.Label>
              <Form.Control
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={passwordForm.confirm}
                onChange={(event) => setPasswordForm((current) => ({ ...current, confirm: event.target.value }))}
              />
            </Form.Group>
          </Col>
        </Row>
        <Button type="submit" variant="primary" size="sm" className="mt-3" disabled={passwordSaving}>
          {passwordSaving ? t("dashboard.profile.passwordSaving") : t("dashboard.profile.passwordSave")}
        </Button>
      </Form>
    </MainCard>
  ) : (
    <MainCard title={t("dashboard.profile.passwordTitle")} isOption={false} cardClass="mt-4" optionClass="" CardBodyClass="">
      <p className="text-muted mb-0">{t("dashboard.profile.passwordGoogleHint")}</p>
    </MainCard>
  );

  if (!sidebar) {
    return (
      <>
        {main}
        {passwordCard}
      </>
    );
  }

  return (
    <Row>
      <Col lg={8}>
        {main}
        {passwordCard}
      </Col>
      <Col lg={4}>{sidebar}</Col>
    </Row>
  );
}

export function useProfileUser() {
  const [user, setUser] = useState<ApiUser | null>(null);
  useEffect(() => {
    void fetchMe().then(setUser).catch(() => setUser(null));
  }, []);
  return user;
}
