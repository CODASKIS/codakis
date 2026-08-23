import { Row, Col, Card, Badge } from "react-bootstrap";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import { getCandidateEnrollment, getEnrolledSchool, isCandidateEnrolled } from "../../../auth/candidateEnrollment";
import { formatForfaitPrice } from "../../../data/mockDrivingSchools";

export default function CandidatSchoolPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "fr";
  const enrollment = getCandidateEnrollment();
  const school = getEnrolledSchool();
  const enrolled = isCandidateEnrolled();

  if (!enrolled || !school || !enrollment) {
    return (
      <Row>
        <Col sm={12}>
          <MainCard title={t("dashboard.nav.mySchool")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
            <div className="codakis-enrollment-empty text-center py-4">
              <i className="material-icons-two-tone codakis-enrollment-empty__icon">domain</i>
              <h5 className="mt-3">{t("dashboard.enrollment.noneTitle")}</h5>
              <p className="text-muted mx-auto mb-4" style={{ maxWidth: "42rem" }}>
                {t("dashboard.enrollment.noneLead")}
              </p>
              <Link to="/auto-ecoles" className="btn btn-primary">
                {t("dashboard.enrollment.browseForfaits")}
              </Link>
            </div>
          </MainCard>
        </Col>
      </Row>
    );
  }

  const forfait = [
    ...school.forfaits.codeSeul,
    ...school.forfaits.conduiteSeule,
    ...school.forfaits.complet,
  ].find((f) => f.id === enrollment.forfaitId);

  return (
    <Row>
      <Col lg={8}>
        <MainCard title={t("dashboard.nav.mySchool")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
          <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
            <div>
              <h4 className="mb-1">{school.name}</h4>
              <p className="text-muted mb-2">
                {school.district}, {school.city}
              </p>
              <Badge bg="success">{t("dashboard.enrollment.statusConfirmed")}</Badge>
            </div>
            <Link to={`/auto-ecoles/${school.id}`} className="btn btn-outline-primary btn-sm">
              {t("schools.viewProfile")}
            </Link>
          </div>

          <Row className="g-3 mb-4">
            <Col sm={6}>
              <Card className="h-100 border">
                <Card.Body>
                  <p className="text-muted small mb-1">{t("dashboard.profile.pack")}</p>
                  <p className="fw-semibold mb-1">{enrollment.forfaitLabel ?? "—"}</p>
                  {forfait ? (
                    <p className="text-primary mb-0">{formatForfaitPrice(forfait.price, lang)}</p>
                  ) : null}
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6}>
              <Card className="h-100 border">
                <Card.Body>
                  <p className="text-muted small mb-1">{t("dashboard.enrollment.enrolledOn")}</p>
                  <p className="fw-semibold mb-1">{enrollment.enrolledAt ?? "—"}</p>
                  <p className="text-muted small mb-0">{t("dashboard.enrollment.receiptHint")}</p>
                  {enrollment.paymentRef ? (
                    <p className="text-muted small mb-0 mt-1">
                      {t("dashboard.enrollment.paymentRef", { ref: enrollment.paymentRef })}
                    </p>
                  ) : null}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <h6>{t("dashboard.enrollment.contact")}</h6>
          <p className="mb-1">{school.address}</p>
          <p className="mb-3">{school.phone}</p>

          <h6>{t("dashboard.enrollment.nextSteps")}</h6>
          <ul className="mb-0">
            <li>{t("dashboard.enrollment.stepConsort")}</li>
            <li>{t("dashboard.enrollment.stepSlots")}</li>
            <li>{t("dashboard.enrollment.stepExam")}</li>
          </ul>
        </MainCard>
      </Col>

      <Col lg={4}>
        <Card className="mb-4 bg-primary text-white">
          <Card.Body>
            <h6 className="text-white">{t("dashboard.enrollment.statsTitle")}</h6>
            <p className="display-6 fw-bold mb-0">{school.successRate} %</p>
            <p className="small mb-0 opacity-75">{t("dashboard.enrollment.successRate")}</p>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <h6>{t("dashboard.enrollment.actions")}</h6>
            <div className="d-grid gap-2">
              <Link to="/espace/candidat/consort" className="btn btn-outline-dark btn-sm">
                {t("dashboard.candidat.actionConsort")}
              </Link>
              <Link to="/espace/candidat/examens" className="btn btn-outline-dark btn-sm">
                {t("dashboard.candidat.actionExam")}
              </Link>
              <Link to="/espace/candidat/profil" className="btn btn-outline-dark btn-sm">
                {t("dashboard.profile.title")}
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
