import { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Col, Form, Modal, Row } from "react-bootstrap";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import ConfirmModal from "../../../components/common/ConfirmModal";
import { DEFAULT_DRIVING_SCHOOL_LOGO } from "../../../constants/assets";
import {
  AuthApiError,
  fetchSchool,
  rejectSchool,
  validateSchool,
  type AutoEcolePending,
  type SchoolStatus,
} from "../../../lib/authApi";

const STATUS_BADGE: Record<SchoolStatus, string> = {
  pending: "warning",
  validated: "success",
  rejected: "danger",
};

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function formatCount(value: number | null | undefined): string {
  if (value == null) return "—";
  return String(value);
}

function externalHref(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export default function AdminSchoolDetailPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams<{ id: string }>();

  const [school, setSchool] = useState<AutoEcolePending | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [showValidateConfirm, setShowValidateConfirm] = useState(false);
  const [rejectMessage, setRejectMessage] = useState("");

  const loadSchool = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      setSchool(await fetchSchool(id));
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("admin.schools.detailLoadError"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void loadSchool();
  }, [loadSchool]);

  async function handleValidate() {
    if (!school) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await validateSchool(school.id);
      setSuccess(t("admin.schools.validateSuccess"));
      setShowValidateConfirm(false);
      await loadSchool();
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("admin.schools.validateError"));
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    if (!school) return;
    const message = rejectMessage.trim();
    if (message.length < 5) {
      setError(t("admin.schools.rejectMessageTooShort"));
      return;
    }
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await rejectSchool(school.id, message);
      setSuccess(t("admin.schools.rejectSuccess", { email: school.gerant_email }));
      setShowReject(false);
      setRejectMessage("");
      await loadSchool();
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("admin.schools.rejectError"));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loader />;
  if (!school) {
    return (
      <Alert variant="danger">
        {error || t("admin.schools.detailLoadError")}{" "}
        <Link to="/admin/auto-ecoles">{t("admin.schools.backToList")}</Link>
      </Alert>
    );
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <Link to="/admin/auto-ecoles" className="btn btn-outline-secondary btn-sm">
          {t("admin.schools.backToList")}
        </Link>
        {school.status === "pending" ? (
          <div className="d-flex flex-wrap gap-2">
            <Button variant="success" size="sm" disabled={busy} onClick={() => setShowValidateConfirm(true)}>
              {busy ? t("admin.schools.validating") : t("admin.schools.validate")}
            </Button>
            <Button variant="outline-danger" size="sm" disabled={busy} onClick={() => setShowReject(true)}>
              {t("admin.schools.reject")}
            </Button>
          </div>
        ) : null}
      </div>

      <Row className="g-4">
        <Col lg={8}>
          <MainCard title={school.raison_sociale} isOption={false} cardClass="" optionClass="" CardBodyClass="">
            {error ? <Alert variant="danger">{error}</Alert> : null}
            {success ? <Alert variant="success">{success}</Alert> : null}

            <div className="mb-4 d-flex align-items-center gap-3">
              <img
                src={school.logo_url?.trim() || DEFAULT_DRIVING_SCHOOL_LOGO}
                alt=""
                className="rounded border"
                style={{ width: 64, height: 64, objectFit: "contain", background: "#fff" }}
              />
              <div>
                <Badge bg={STATUS_BADGE[school.status]} className="me-2">
                  {t(`admin.schools.status.${school.status}`)}
                </Badge>
                <span className="text-muted small">
                  {school.ville ? `${school.ville} · ` : ""}
                  {school.country_code}
                </span>
              </div>
            </div>

            <Row className="g-4">
              {school.raison_sociale_legale ? (
                <Col md={6}>
                  <p className="text-muted small mb-1">{t("admin.schools.columns.legalName")}</p>
                  <p className="fw-semibold mb-0">{school.raison_sociale_legale}</p>
                </Col>
              ) : null}
              <Col md={6}>
                <p className="text-muted small mb-1">{t("admin.schools.columns.agrement")}</p>
                <p className="fw-semibold mb-0">{school.numero_agrement}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted small mb-1">{t("admin.schools.columns.registered")}</p>
                <p className="fw-semibold mb-0">{formatDateTime(school.created_at)}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted small mb-1">{t("admin.schools.columns.rccm")}</p>
                <p className="fw-semibold mb-0">{school.rccm ?? "—"}</p>
              </Col>
              <Col md={12}>
                <p className="text-muted small mb-1">{t("admin.schools.columns.address")}</p>
                <p className="fw-semibold mb-0">{school.adresse}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted small mb-1">{t("admin.schools.columns.schoolPhone")}</p>
                <p className="fw-semibold mb-0">{school.telephone ?? "—"}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted small mb-1">{t("admin.schools.columns.website")}</p>
                {school.site_web ? (
                  <a href={externalHref(school.site_web)} target="_blank" rel="noreferrer" className="fw-semibold">
                    {school.site_web}
                  </a>
                ) : (
                  <p className="fw-semibold mb-0">—</p>
                )}
              </Col>
              <Col md={12}>
                <p className="text-muted small mb-1">{t("admin.schools.columns.description")}</p>
                <p className="mb-0">{school.description ?? "—"}</p>
              </Col>
              <Col md={3}>
                <p className="text-muted small mb-1">{t("admin.schools.columns.instructors")}</p>
                <p className="fw-semibold mb-0">{formatCount(school.nombre_moniteurs)}</p>
              </Col>
              <Col md={3}>
                <p className="text-muted small mb-1">{t("admin.schools.columns.vehicles")}</p>
                <p className="fw-semibold mb-0">{formatCount(school.nombre_vehicules)}</p>
              </Col>
              <Col md={3}>
                <p className="text-muted small mb-1">{t("admin.schools.columns.experience")}</p>
                <p className="fw-semibold mb-0">{formatCount(school.annees_experience)}</p>
              </Col>
              <Col md={3}>
                <p className="text-muted small mb-1">{t("admin.schools.columns.managerRole")}</p>
                <p className="fw-semibold mb-0">{school.fonction_gerant ?? "—"}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted small mb-1">{t("admin.schools.detailUpdated")}</p>
                <p className="fw-semibold mb-0">{formatDateTime(school.updated_at)}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted small mb-1">{t("admin.schools.detailMoniteurs")}</p>
                <p className="fw-semibold mb-0">{school.moniteur_count ?? 0}</p>
              </Col>
              {school.status === "validated" ? (
                <Col md={6}>
                  <p className="text-muted small mb-1">{t("admin.schools.columns.validatedAt")}</p>
                  <p className="fw-semibold mb-0">{formatDateTime(school.validee_le)}</p>
                </Col>
              ) : null}
              {school.status === "rejected" ? (
                <>
                  <Col md={6}>
                    <p className="text-muted small mb-1">{t("admin.schools.columns.rejectedAt")}</p>
                    <p className="fw-semibold mb-0">{formatDateTime(school.refusee_le)}</p>
                  </Col>
                  <Col md={12}>
                    <p className="text-muted small mb-1">{t("admin.schools.columns.rejectReason")}</p>
                    <p className="fw-semibold mb-0">{school.motif_refus ?? "—"}</p>
                  </Col>
                </>
              ) : null}
              <Col md={12}>
                <p className="text-muted small mb-1">{t("admin.schools.detailSchoolId")}</p>
                <p className="fw-semibold mb-0 text-break small">{school.id}</p>
              </Col>
            </Row>
          </MainCard>
        </Col>

        <Col lg={4}>
          <MainCard title={t("admin.schools.detailManagerTitle")} isOption={false} cardClass="mb-4" optionClass="" CardBodyClass="">
            <p className="fw-semibold mb-1">{school.gerant_name}</p>
            <p className="mb-2">
              <a href={`mailto:${school.gerant_email}`}>{school.gerant_email}</a>
            </p>
            <p className="text-muted small mb-3">
              {t("admin.schools.columns.phone")} : {school.gerant_phone ?? "—"}
            </p>
            {school.gerant_id ? (
              <Link to={`/admin/utilisateurs/${school.gerant_id}`} className="btn btn-outline-primary btn-sm">
                {t("admin.schools.viewManager")}
              </Link>
            ) : null}
          </MainCard>

          <MainCard title={t("admin.schools.detailInfoTitle")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
            <p className="text-muted small mb-0">{t("admin.schools.detailInfoHint")}</p>
          </MainCard>
        </Col>
      </Row>

      <Modal show={showReject} onHide={() => !busy && setShowReject(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("admin.schools.rejectTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t("admin.schools.rejectIntro", { school: school.raison_sociale, email: school.gerant_email })}</p>
          <Form.Group>
            <Form.Label>{t("admin.schools.rejectMessageLabel")}</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={rejectMessage}
              onChange={(event) => setRejectMessage(event.target.value)}
              placeholder={t("admin.schools.rejectMessagePlaceholder")}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReject(false)} disabled={busy}>
            {t("common.cancel")}
          </Button>
          <Button variant="danger" onClick={() => void handleReject()} disabled={busy}>
            {busy ? t("admin.schools.rejecting") : t("admin.schools.rejectConfirm")}
          </Button>
        </Modal.Footer>
      </Modal>

      <ConfirmModal
        show={showValidateConfirm}
        title={t("admin.schools.validateConfirmTitle")}
        message={t("admin.schools.validateConfirmMessage", { school: school.raison_sociale })}
        variant="success"
        confirmLabel={t("admin.schools.validate")}
        busy={busy}
        onCancel={() => !busy && setShowValidateConfirm(false)}
        onConfirm={() => void handleValidate()}
      />
    </>
  );
}
