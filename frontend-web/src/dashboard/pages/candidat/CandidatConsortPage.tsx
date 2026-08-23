import { Row, Col, Card, ProgressBar, Badge } from "react-bootstrap";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import { CONSORT_MOCK_STATUS, CONSORT_PIECE_KEYS } from "../../data/codakisDashboardData";

export default function CandidatConsortPage() {
  const { t } = useTranslation();

  const completed = CONSORT_PIECE_KEYS.filter((key) => CONSORT_MOCK_STATUS[key] === "validated").length;
  const progress = Math.round((completed / CONSORT_PIECE_KEYS.length) * 100);

  return (
    <Row>
      <Col sm={12}>
        <MainCard title={t("dashboard.consort.pageTitle")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
          <p className="text-muted mb-4">{t("dashboard.consort.pageLead")}</p>

          <div className="codakis-consort-summary mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>{t("dashboard.consort.progressLabel")}</strong>
              <span className="text-primary fw-bold">
                {completed}/6 — {progress}%
              </span>
            </div>
            <ProgressBar now={progress} variant="success" className="codakis-consort-progress" />
            <p className="text-muted small mt-2 mb-0">{t("dashboard.consort.progressHint")}</p>
          </div>

          <Row className="g-3">
            {CONSORT_PIECE_KEYS.map((key) => {
              const status = CONSORT_MOCK_STATUS[key];
              const badgeVariant =
                status === "validated" ? "success" : status === "pending" ? "warning" : "danger";

              return (
                <Col md={6} key={key}>
                  <Card className={`codakis-consort-piece codakis-consort-piece--${status}`}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <h6 className="mb-0">{t(`consort.pieces.${key}.title`)}</h6>
                        <Badge bg={badgeVariant} className="text-uppercase">
                          {t(`dashboard.consort.status.${status}`)}
                        </Badge>
                      </div>
                      <p className="text-muted small mb-3">{t(`consort.pieces.${key}.desc`)}</p>
                      {status === "validated" ? (
                        <span className="small text-success">
                          <i className="feather icon-check-circle me-1" />
                          {t("dashboard.consort.validatedOn", { date: "15/03/2026" })}
                        </span>
                      ) : (
                        <Link to="#" className="btn btn-sm btn-outline-primary">
                          {status === "pending"
                            ? t("dashboard.consort.actionUpload")
                            : t("dashboard.consort.actionAdd")}
                        </Link>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>

          <div className="codakis-consort-footer mt-4 p-3 rounded">
            <p className="mb-2">{t("dashboard.consort.footerText")}</p>
            <Link to="/themes" className="btn btn-primary btn-sm me-2">
              {t("dashboard.candidat.actionCourses")}
            </Link>
            <Link to="/auto-ecoles" className="btn btn-outline-dark btn-sm">
              {t("schools.heading")}
            </Link>
          </div>
        </MainCard>
      </Col>
    </Row>
  );
}
