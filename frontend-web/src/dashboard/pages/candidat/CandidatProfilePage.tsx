import { Row, Col, Card, Badge } from "react-bootstrap";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import { getSession, isPremiumUser } from "../../../auth/authStore";
import { getCandidateEnrollment, isCandidateEnrolled } from "../../../auth/candidateEnrollment";

const UPGRADE_HREF = "/themes#abonnement";

export default function CandidatProfilePage() {
  const { t } = useTranslation();
  const session = getSession();
  const enrollment = getCandidateEnrollment();
  const enrolled = isCandidateEnrolled();
  const isPremium = isPremiumUser();

  return (
    <Row>
      <Col lg={8}>
        <MainCard title={t("dashboard.profile.title")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
          <Row className="g-4">
            <Col md={6}>
              <p className="text-muted small mb-1">{t("dashboard.profile.fullName")}</p>
              <p className="fw-semibold mb-0">{session?.name ?? "—"}</p>
            </Col>
            <Col md={6}>
              <p className="text-muted small mb-1">{t("dashboard.profile.email")}</p>
              <p className="fw-semibold mb-0">{session?.email ?? "—"}</p>
            </Col>
            <Col md={6}>
              <p className="text-muted small mb-1">{t("dashboard.profile.phone")}</p>
              <p className="fw-semibold mb-0">{session?.phone ?? t("dashboard.profile.notProvided")}</p>
            </Col>
            <Col md={6}>
              <p className="text-muted small mb-1">{t("dashboard.profile.city")}</p>
              <p className="fw-semibold mb-0">{session?.city ?? t("dashboard.profile.notProvided")}</p>
            </Col>
          </Row>
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
              {enrollment.schoolCity ? (
                <p className="text-muted mb-2">{enrollment.schoolCity}</p>
              ) : null}
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
            <p className="mb-3">{t("dashboard.profile.consortSummary")}</p>
            <Link to="/espace/candidat/consort" className="btn btn-outline-dark btn-sm w-100">
              {t("dashboard.candidat.actionConsort")}
            </Link>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
