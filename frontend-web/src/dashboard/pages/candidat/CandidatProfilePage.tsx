import { useCallback, useEffect, useState } from "react";
import { Row, Col, Card, Badge, Button, Form, Alert } from "react-bootstrap";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import { getSession, isPremiumUser, setSession } from "../../../auth/authStore";
import { getCandidateEnrollment, isCandidateEnrolled } from "../../../auth/candidateEnrollment";
import {
  AuthApiError,
  fetchConsortDossier,
  fetchMe,
  updateProfile,
  userToSession,
  type ApiUser,
  type ConsortDossier,
} from "../../../lib/authApi";

const UPGRADE_HREF = "/themes#abonnement";

type ProfileForm = {
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
};

function toForm(user: ApiUser): ProfileForm {
  return {
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone ?? "",
    city: user.city ?? "",
  };
}

export default function CandidatProfilePage() {
  const { t } = useTranslation();
  const session = getSession();
  const enrollment = getCandidateEnrollment();
  const enrolled = isCandidateEnrolled();
  const isPremium = isPremiumUser();

  const [user, setUser] = useState<ApiUser | null>(null);
  const [consort, setConsort] = useState<ConsortDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm>({ first_name: "", last_name: "", phone: "", city: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [me, dossier] = await Promise.all([fetchMe(), fetchConsortDossier()]);
      setUser(me);
      setConsort(dossier);
      setForm(toForm(me));
      setSession(userToSession(me));
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("dashboard.profile.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateProfile({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim() || undefined,
        city: form.city.trim() || undefined,
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

  if (loading) {
    return <Loader />;
  }

  const displayName = user ? `${user.first_name} ${user.last_name}`.trim() : session?.name ?? "—";

  return (
    <Row>
      <Col lg={8}>
        {error ? <Alert variant="danger">{error}</Alert> : null}
        {success ? <Alert variant="success">{success}</Alert> : null}

        <MainCard title={t("dashboard.profile.title")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
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
                <p className="fw-semibold mb-0">{user?.email ?? session?.email ?? "—"}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted small mb-1">{t("dashboard.profile.phone")}</p>
                <p className="fw-semibold mb-0">{user?.phone ?? t("dashboard.profile.notProvided")}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted small mb-1">{t("dashboard.profile.city")}</p>
                <p className="fw-semibold mb-0">{user?.city ?? t("dashboard.profile.notProvided")}</p>
              </Col>
            </Row>
          )}
        </MainCard>

        <MainCard
          title={t("dashboard.profile.schoolSection")}
          isOption={false}
          cardClass="mt-4"
          optionClass=""
          CardBodyClass=""
        >
          {enrolled && enrollment ? (
            <>
              <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                <h5 className="mb-0">{enrollment.schoolName}</h5>
                <Badge bg="success">{t("dashboard.enrollment.statusConfirmed")}</Badge>
              </div>
              {enrollment.schoolCity ? <p className="text-muted mb-2">{enrollment.schoolCity}</p> : null}
              {enrollment.forfaitLabel ? (
                <p className="mb-2">
                  <strong>{t("dashboard.profile.pack")} :</strong> {enrollment.forfaitLabel}
                </p>
              ) : null}
              {enrollment.enrolledAt ? (
                <p className="text-muted small mb-3">
                  {t("dashboard.profile.enrolledSince", { date: enrollment.enrolledAt })}
                </p>
              ) : null}
              <Link to="/espace/candidat/auto-ecole" className="btn btn-primary btn-sm">
                {t("dashboard.nav.mySchool")}
              </Link>
            </>
          ) : (
            <>
              <p className="text-muted">{t("dashboard.enrollment.noneLead")}</p>
              <Link to="/auto-ecoles" className="btn btn-primary btn-sm me-2">
                {t("dashboard.enrollment.browseForfaits")}
              </Link>
              <Link to="/espace/candidat/auto-ecole" className="btn btn-outline-secondary btn-sm">
                {t("dashboard.enrollment.learnMore")}
              </Link>
            </>
          )}
        </MainCard>
      </Col>

      <Col lg={4}>
        <Card className="mb-4">
          <Card.Body>
            <h6 className="mb-3">{t("dashboard.profile.subscriptionSection")}</h6>
            <Badge bg={isPremium ? "success" : "secondary"} className="mb-3">
              {isPremium ? t("dashboard.userMenu.planPremium") : t("dashboard.userMenu.planFree")}
            </Badge>
            <p className="text-muted small">
              {isPremium ? t("dashboard.profile.premiumActive") : t("dashboard.profile.premiumHint")}
            </p>
            {!isPremium ? (
              <Link to={UPGRADE_HREF} className="btn btn-primary btn-sm w-100">
                {t("dashboard.userMenu.upgradeCta")}
              </Link>
            ) : (
              <Link to={UPGRADE_HREF} className="btn btn-outline-primary btn-sm w-100">
                {t("dashboard.userMenu.managePlan")}
              </Link>
            )}
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <h6 className="mb-2">{t("dashboard.nav.consort")}</h6>
            <p className="mb-3">
              {consort
                ? t("dashboard.profile.consortSummaryDynamic", {
                    validated: consort.validated_count,
                    total: consort.total_count,
                  })
                : t("dashboard.profile.consortSummary")}
            </p>
            <Link to="/espace/candidat/consort" className="btn btn-outline-dark btn-sm w-100">
              {t("dashboard.candidat.actionConsort")}
            </Link>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
