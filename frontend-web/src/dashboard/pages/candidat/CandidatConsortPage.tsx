import { useCallback, useEffect, useMemo, useState } from "react";
import { Row, Col, Badge, Button, Alert } from "react-bootstrap";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Clock3, FileWarning, FolderOpen } from "lucide-react";
import Loader from "../../../components/common/Loader";
import ModuleSegmentNav from "../../components/common/ModuleSegmentNav";
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

function statusIcon(status: ConsortPieceStatus) {
  if (status === "validated") return <CheckCircle2 size={18} aria-hidden />;
  if (status === "pending") return <Clock3 size={18} aria-hidden />;
  return <FileWarning size={18} aria-hidden />;
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
  const [activePieceKey, setActivePieceKey] = useState<string>(PIECE_KEYS[0]);

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

  const pieces = dossier?.pieces ?? [];
  const dossierStatus = dossier?.statut ?? "pieces_incompletes";

  const pieceSegments = useMemo(
    () =>
      PIECE_KEYS.map((key) => {
        const piece = pieces.find((item) => item.key === key);
        const status = (piece?.status ?? "missing") as ConsortPieceStatus;
        return {
          id: key,
          label: t(`consort.pieces.${key}.title`),
          meta: t(`dashboard.consort.status.${status}`),
        };
      }),
    [pieces, t],
  );

  const activePiece = pieces.find((item) => item.key === activePieceKey);
  const activeStatus = (activePiece?.status ?? "missing") as ConsortPieceStatus;

  if (loading) {
    return <Loader variant="section" />;
  }

  return (
    <div className="codakis-consort-page">
      <header className="codakis-consort-page__hero">
        <div className="codakis-consort-page__hero-icon" aria-hidden>
          <FolderOpen size={28} strokeWidth={1.75} />
        </div>
        <div>
          <p className="codakis-consort-page__eyebrow">{t("dashboard.nav.consort")}</p>
          <h1>{t("dashboard.consort.pageTitle")}</h1>
          <p>{t("dashboard.consort.pageLead")}</p>
        </div>
        <div className="codakis-consort-page__stats">
          <div>
            <strong>{stats.validated}</strong>
            <span>{t("dashboard.consort.validatedShort")}</span>
          </div>
          <div>
            <strong>{stats.pending}</strong>
            <span>{t("dashboard.consort.pendingShort")}</span>
          </div>
          <div>
            <strong>{stats.progress}%</strong>
            <span>{t("dashboard.consort.progressLabel")}</span>
          </div>
        </div>
      </header>

      {error ? <Alert variant="danger">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}

      <div className="codakis-consort-page__summary">
        <Badge bg={DOSSIER_STATUS_BADGE[dossierStatus] ?? "secondary"}>
          {t(`dashboard.consort.dossierStatus.${dossierStatus}`, { defaultValue: dossierStatus })}
        </Badge>
        <div className="codakis-consort-page__progress" aria-hidden>
          <span style={{ width: `${stats.progress}%` }} />
        </div>
        <p>{t("dashboard.consort.progressHintDynamic", stats)}</p>
      </div>

      <Row className="g-4">
        <Col lg={8}>
          <ModuleSegmentNav
            segments={pieceSegments}
            activeId={activePieceKey}
            onSelect={setActivePieceKey}
            ariaLabel={t("dashboard.consort.piecesNav")}
            className="codakis-consort-page__module-nav mb-4"
          />

          <AnimatePresence mode="sync">
            <motion.article
              key={activePieceKey}
              className={`codakis-consort-card codakis-consort-card--${activeStatus}`}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="codakis-consort-card__head">
                <span className={`codakis-consort-card__icon codakis-consort-card__icon--${activeStatus}`}>
                  {statusIcon(activeStatus)}
                </span>
                <div>
                  <h3>{t(`consort.pieces.${activePieceKey}.title`)}</h3>
                  <p>{t(`consort.pieces.${activePieceKey}.desc`)}</p>
                </div>
                <Badge bg={activeStatus === "validated" ? "success" : activeStatus === "pending" ? "warning" : "danger"}>
                  {t(`dashboard.consort.status.${activeStatus}`)}
                </Badge>
              </div>
              <p className="codakis-consort-card__req">
                <strong>{t("dashboard.consort.requirementsLabel")} :</strong>{" "}
                {t(`dashboard.consort.pieceRequirements.${activePieceKey}`)}
              </p>
              {activeStatus === "validated" && activePiece?.validated_at ? (
                <p className="codakis-consort-card__date">
                  {t("dashboard.consort.validatedOn", { date: formatDate(activePiece.validated_at) })}
                </p>
              ) : null}
              {activeStatus !== "validated" ? (
                <Button
                  variant={activeStatus === "pending" ? "outline-secondary" : "primary"}
                  size="sm"
                  disabled={busyKey === activePieceKey || activeStatus === "pending"}
                  onClick={() => void handleSubmit(activePieceKey)}
                >
                  {busyKey === activePieceKey
                    ? t("dashboard.consort.submitting")
                    : activeStatus === "pending"
                      ? t("dashboard.consort.pendingReview")
                      : t("dashboard.consort.actionAdd")}
                </Button>
              ) : null}
            </motion.article>
          </AnimatePresence>

          <div className="codakis-consort-page__footer">
            <p>{t("dashboard.consort.footerText")}</p>
            <div className="codakis-consort-page__footer-actions">
              <Link to="/consort" target="_blank" className="btn btn-outline-secondary btn-sm">
                {t("dashboard.consort.publicGuide")}
              </Link>
              <Link to="/espace/candidat/cours" className="btn btn-primary btn-sm">
                {t("dashboard.candidat.actionCourses")}
              </Link>
            </div>
          </div>
        </Col>

        <Col lg={4}>
          <aside className="codakis-consort-aside">
            <section>
              <h2>{t("dashboard.consort.dossierInfoTitle")}</h2>
              <dl>
                <dt>{t("dashboard.consort.dossierCreated")}</dt>
                <dd>{formatDateTime(dossier?.created_at)}</dd>
                <dt>{t("dashboard.consort.dossierUpdated")}</dt>
                <dd>{formatDateTime(dossier?.updated_at)}</dd>
                <dt>{t("dashboard.consort.dossierDepot")}</dt>
                <dd>{formatDateTime(dossier?.date_depot)}</dd>
              </dl>
            </section>

            <section>
              <h2>{t("dashboard.consort.stepsTitle")}</h2>
              <ol>
                <li>{t("dashboard.consort.step1")}</li>
                <li>{t("dashboard.consort.step2")}</li>
                <li>{t("dashboard.consort.step3")}</li>
                <li>{t("dashboard.consort.step4")}</li>
              </ol>
            </section>

            {enrolled && enrollment ? (
              <section>
                <h2>{t("dashboard.nav.mySchool")}</h2>
                <p className="fw-semibold mb-1">{enrollment.schoolName}</p>
                {enrollment.schoolCity ? <p className="text-muted small">{enrollment.schoolCity}</p> : null}
                <p className="text-muted small">{t("dashboard.consort.schoolValidationHint")}</p>
                <Link to="/espace/candidat/auto-ecole" className="btn btn-outline-primary btn-sm">
                  {t("dashboard.nav.mySchool")}
                </Link>
              </section>
            ) : (
              <section>
                <h2>{t("dashboard.consort.noSchoolTitle")}</h2>
                <p className="text-muted small">{t("dashboard.consort.noSchoolHint")}</p>
                <Link to="/espace/candidat/auto-ecoles" className="btn btn-primary btn-sm">
                  {t("dashboard.enrollment.browseForfaits")}
                </Link>
              </section>
            )}
          </aside>
        </Col>
      </Row>
    </div>
  );
}
