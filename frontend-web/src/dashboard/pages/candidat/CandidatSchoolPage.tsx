import { Row, Col, Card, Badge } from "react-bootstrap";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import { formatForfaitPrice } from "../../../data/mockDrivingSchools";
import { useCandidateEnrollment } from "../../hooks/useCandidateEnrollment";

export default function CandidatSchoolPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "fr";
  const { inscription, school, loading, error, enrolled } = useCandidateEnrollment();

  if (loading) return <Loader />;

  if (error) {
    return (
      <MainCard title={t("dashboard.nav.mySchool")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
        <p className="text-danger mb-0">{error}</p>
      </MainCard>
    );
  }

  if (!enrolled || !school || !inscription) {
    return (
      <Row>
        <Col sm={12}>
          <MainCard title={t("dashboard.nav.mySchool")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
            <div className="codakis-enrollment-empty text-center py-4">
              <i className="material-icons-two-tone codakis-enrollment-empty__icon">domain</i>
              <h5 className="mt-3">{t("dashboard.enrollment.noneTitle")}</h5>
              <p className="text-muted mx-auto mb-4" style={{ maxWidth: "42rem" }}>
                {t("dashboard.enrollment.noneLeadDashboard")}
              </p>
              <Link to="/espace/candidat/auto-ecoles" className="btn btn-primary">
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
  ].find((f) => f.id === inscription.forfait_id);

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
            <Link to={`/espace/candidat/auto-ecoles/${school.id}`} className="btn btn-outline-primary btn-sm">
              {t("schools.viewProfile")}
            </Link>
          </div>

          <Row className="g-3 mb-4">
            <Col sm={6}>
              <Card className="h-100 border">
                <Card.Body>
                  <p className="text-muted small mb-1">{t("dashboard.profile.pack")}</p>
                  <p className="fw-semibold mb-1">{inscription.forfait_label ?? "—"}</p>
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
                  <p className="fw-semibold mb-1">{inscription.enrolled_at?.slice(0, 10) ?? "—"}</p>
                  {inscription.heures_conduite_total > 0 ? (
                    <p className="text-muted small mb-0">
                      {t("dashboard.enrollment.drivingHoursRemaining", {
                        remaining: inscription.heures_conduite_restantes,
                        total: inscription.heures_conduite_total,
                      })}
                    </p>
                  ) : (
                    <p className="text-muted small mb-0">{t("dashboard.enrollment.receiptHint")}</p>
                  )}
                  {inscription.payment_ref ? (
                    <p className="text-muted small mb-0 mt-1">
                      {t("dashboard.enrollment.paymentRef", { ref: inscription.payment_ref })}
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
        <Card className="mb-4">
          <Card.Body>
            <h6>{t("dashboard.enrollment.actions")}</h6>
            <div className="d-grid gap-2">
              <Link to="/espace/candidat/consort" className="btn btn-outline-dark btn-sm">
                {t("dashboard.candidat.actionConsort")}
              </Link>
              <Link to="/espace/candidat/seances" className="btn btn-outline-dark btn-sm">
                {t("dashboard.candidat.actionSeances")}
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
