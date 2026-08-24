import { useCallback, useEffect, useMemo, useState } from "react";
import { Row, Col, Card, ProgressBar, Badge, Button, Alert, Table } from "react-bootstrap";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import { getCandidateEnrollment, isCandidateEnrolled } from "../../../auth/candidateEnrollment";
import {
  AuthApiError,
  fetchConsortDossier,
  submitConsortPiece,
  type ConsortDossier,
  type ConsortPieceStatus,
} from "../../../lib/authApi";

const PIECE_KEYS = ["id", "birth", "medical", "photos", "address", "stamps"] as const;

const DOSSIER_STATUS_BADGE: Record<string, string> = {
  en_cours: "primary",
  pieces_incompletes: "warning",
  pret: "success",
  depose: "info",
};

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function CandidatConsortPage() {
  const { t } = useTranslation();
  const enrollment = getCandidateEnrollment();
  const enrolled = isCandidateEnrolled();
  const [dossier, setDossier] = useState<ConsortDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadDossier = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setDossier(await fetchConsortDossier());
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("dashboard.consort.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadDossier();
  }, [loadDossier]);

  const stats = useMemo(() => {
    if (!dossier) {
      return { validated: 0, pending: 0, missing: 6, progress: 0 };
    }
    return {
      validated: dossier.validated_count,
      pending: dossier.pending_count,
      missing: dossier.missing_count,
      progress: dossier.progress_percent,
    };
  }, [dossier]);

  async function handleSubmit(pieceKey: string) {
    setBusyKey(pieceKey);
    setError("");
    setSuccess("");
    try {
      setDossier(await submitConsortPiece(pieceKey));
      setSuccess(t("dashboard.consort.submitSuccess"));
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("dashboard.consort.submitError"));
    } finally {
      setBusyKey(null);
    }
  }

  if (loading) {
    return <Loader />;
  }

  const pieces = dossier?.pieces ?? [];
  const dossierStatus = dossier?.statut ?? "pieces_incompletes";

  return (
    <Row className="g-4">
      <Col lg={8}>
        <MainCard title={t("dashboard.consort.pageTitle")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
          <p className="text-muted mb-4">{t("dashboard.consort.pageLead")}</p>

          {error ? <Alert variant="danger">{error}</Alert> : null}
          {success ? <Alert variant="success">{success}</Alert> : null}

          <div className="codakis-consort-summary mb-4 p-3 rounded bg-light">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
              <div className="d-flex align-items-center gap-2">
                <strong>{t("dashboard.consort.progressLabel")}</strong>
                <Badge bg={DOSSIER_STATUS_BADGE[dossierStatus] ?? "secondary"}>
                  {t(`dashboard.consort.dossierStatus.${dossierStatus}`, { defaultValue: dossierStatus })}
                </Badge>
              </div>
              <span className="text-primary fw-bold">
                {stats.validated}/{PIECE_KEYS.length} — {stats.progress}%
              </span>
            </div>
            <ProgressBar now={stats.progress} variant="success" className="codakis-consort-progress" />
            <p className="text-muted small mt-2 mb-0">
              {t("dashboard.consort.progressHintDynamic", {
                validated: stats.validated,
                pending: stats.pending,
                missing: stats.missing,
              })}
            </p>
          </div>

          <h6 className="mb-3">{t("dashboard.consort.tableTitle")}</h6>
          <div className="table-responsive mb-4">
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th>{t("dashboard.consort.colPiece")}</th>
                  <th>{t("dashboard.widgets.colStatus")}</th>
                  <th>{t("dashboard.consort.colDate")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {PIECE_KEYS.map((key) => {
                  const piece = pieces.find((item) => item.key === key);
                  const status = (piece?.status ?? "missing") as ConsortPieceStatus;
                  const badgeVariant =
                    status === "validated" ? "success" : status === "pending" ? "warning" : "danger";

                  return (
                    <tr key={key}>
                      <td>
                        <div className="fw-semibold">{t(`consort.pieces.${key}.title`)}</div>
                        <small className="text-muted">{t(`consort.pieces.${key}.desc`)}</small>
                      </td>
                      <td>
                        <Badge bg={badgeVariant}>{t(`dashboard.consort.status.${status}`)}</Badge>
                      </td>
                      <td>{status === "validated" ? formatDate(piece?.validated_at) : "—"}</td>
                      <td className="text-end">
                        {status !== "validated" ? (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            disabled={busyKey === key || status === "pending"}
                            onClick={() => void handleSubmit(key)}
                          >
                            {busyKey === key
                              ? t("dashboard.consort.submitting")
                              : status === "pending"
                                ? t("dashboard.consort.pendingReview")
                                : t("dashboard.consort.actionAdd")}
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          <h6 className="mb-3">{t("dashboard.consort.detailsTitle")}</h6>
          <Row className="g-3">
            {PIECE_KEYS.map((key) => {
              const piece = pieces.find((item) => item.key === key);
              const status = (piece?.status ?? "missing") as ConsortPieceStatus;

              return (
                <Col md={6} key={key}>
                  <Card className={`codakis-consort-piece codakis-consort-piece--${status} h-100`}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <h6 className="mb-0">{t(`consort.pieces.${key}.title`)}</h6>
                        <Badge
                          bg={status === "validated" ? "success" : status === "pending" ? "warning" : "danger"}
                          className="text-uppercase"
                        >
                          {t(`dashboard.consort.status.${status}`)}
                        </Badge>
                      </div>
                      <p className="text-muted small mb-2">{t(`consort.pieces.${key}.desc`)}</p>
                      <p className="small mb-3">
                        <strong>{t("dashboard.consort.requirementsLabel")} :</strong>{" "}
                        {t(`dashboard.consort.pieceRequirements.${key}`)}
                      </p>
                      {status === "validated" && piece?.validated_at ? (
                        <span className="small text-success">
                          <i className="feather icon-check-circle me-1" />
                          {t("dashboard.consort.validatedOn", { date: formatDate(piece.validated_at) })}
                        </span>
                      ) : null}
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>

          <div className="codakis-consort-footer mt-4 p-3 rounded">
            <p className="mb-2">{t("dashboard.consort.footerText")}</p>
            <Link to="/consort" className="btn btn-outline-secondary btn-sm me-2" target="_blank">
              {t("dashboard.consort.publicGuide")}
            </Link>
            <Link to="/themes" className="btn btn-primary btn-sm me-2">
              {t("dashboard.candidat.actionCourses")}
            </Link>
            <Link to="/espace/candidat/auto-ecoles" className="btn btn-outline-dark btn-sm">
              {t("schools.heading")}
            </Link>
          </div>
        </MainCard>
      </Col>

      <Col lg={4}>
        <Card className="mb-4">
          <Card.Body>
            <h6 className="mb-3">{t("dashboard.consort.dossierInfoTitle")}</h6>
            <dl className="mb-0 codakis-dl-compact">
              <dt>{t("dashboard.consort.dossierId")}</dt>
              <dd className="text-muted small text-break">{dossier?.id ?? "—"}</dd>
              <dt>{t("dashboard.consort.dossierCreated")}</dt>
              <dd>{formatDateTime(dossier?.created_at)}</dd>
              <dt>{t("dashboard.consort.dossierUpdated")}</dt>
              <dd>{formatDateTime(dossier?.updated_at)}</dd>
              <dt>{t("dashboard.consort.dossierDepot")}</dt>
              <dd>{formatDateTime(dossier?.date_depot)}</dd>
            </dl>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Body>
            <h6 className="mb-3">{t("dashboard.consort.stepsTitle")}</h6>
            <ol className="small ps-3 mb-0">
              <li className="mb-2">{t("dashboard.consort.step1")}</li>
              <li className="mb-2">{t("dashboard.consort.step2")}</li>
              <li className="mb-2">{t("dashboard.consort.step3")}</li>
              <li>{t("dashboard.consort.step4")}</li>
            </ol>
          </Card.Body>
        </Card>

        {enrolled && enrollment ? (
          <Card className="mb-4">
            <Card.Body>
              <h6 className="mb-2">{t("dashboard.nav.mySchool")}</h6>
              <p className="fw-semibold mb-1">{enrollment.schoolName}</p>
              {enrollment.schoolCity ? <p className="text-muted small mb-2">{enrollment.schoolCity}</p> : null}
              <p className="text-muted small mb-3">{t("dashboard.consort.schoolValidationHint")}</p>
              <Link to="/espace/candidat/auto-ecole" className="btn btn-outline-primary btn-sm">
                {t("dashboard.nav.mySchool")}
              </Link>
            </Card.Body>
          </Card>
        ) : (
          <Card className="mb-4">
            <Card.Body>
              <h6 className="mb-2">{t("dashboard.consort.noSchoolTitle")}</h6>
              <p className="text-muted small mb-3">{t("dashboard.consort.noSchoolHint")}</p>
              <Link to="/espace/candidat/auto-ecoles" className="btn btn-primary btn-sm">
                {t("dashboard.enrollment.browseForfaits")}
              </Link>
            </Card.Body>
          </Card>
        )}

        <Card>
          <Card.Body>
            <h6 className="mb-2">{t("dashboard.consort.helpTitle")}</h6>
            <p className="text-muted small mb-0">{t("dashboard.consort.helpText")}</p>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
