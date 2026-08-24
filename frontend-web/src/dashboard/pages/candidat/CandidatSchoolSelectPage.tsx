import { useEffect, useState } from "react";
import { Alert, Col, Row } from "react-bootstrap";
import { Link, useParams, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import CmsCoverImage from "../../../components/common/CmsCoverImage";
import SchoolForfaitPacks from "../../../flexjobs/components/SchoolForfaitPacks";
import { fetchPublicSchool, mapPublicSchoolToDrivingSchool } from "../../../lib/publicSchoolsApi";
import type { DrivingSchool } from "../../../data/mockDrivingSchools";

export default function CandidatSchoolSelectPage() {
  const { t, i18n } = useTranslation();
  const { id = "" } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const buyForfaitId = searchParams.get("buy");
  const lang = i18n.language.startsWith("en") ? "en" : "fr";
  const [school, setSchool] = useState<DrivingSchool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    void fetchPublicSchool(id)
      .then((detail) => setSchool(mapPublicSchoolToDrivingSchool(detail, detail.forfaits)))
      .catch(() => setError(t("schools.error")))
      .finally(() => setLoading(false));
  }, [id, t]);

  if (loading) return <Loader />;

  if (error || !school) {
    return (
      <MainCard title={t("dashboard.enrollment.selectForfait")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
        <Alert variant="danger">{error || t("schools.empty")}</Alert>
        <Link to="/espace/candidat/auto-ecoles" className="btn btn-outline-secondary btn-sm">
          {t("dashboard.enrollment.browseForfaits")}
        </Link>
      </MainCard>
    );
  }

  return (
    <Row>
      <Col lg={12}>
        <MainCard title={school.name} isOption={false} cardClass="" optionClass="" CardBodyClass="">
          <div className="d-flex flex-wrap gap-3 align-items-start mb-4">
            {school.logoUrl ? (
              <CmsCoverImage
                url={school.logoUrl}
                alt={school.name}
                className="rounded"
                style={{ width: 88, height: 88, objectFit: "cover" }}
              />
            ) : null}
            <div>
              <p className="text-muted mb-1">
                {school.district ? `${school.district}, ` : ""}{school.city}
              </p>
              <p className="mb-2">{school.description[lang]}</p>
              <p className="small mb-0">{school.address}</p>
              {school.phone ? <p className="small mb-0">{school.phone}</p> : null}
            </div>
          </div>

          <SchoolForfaitPacks
            school={school}
            title={t("dashboard.enrollment.choosePackTitle")}
            subtitle={t("dashboard.enrollment.choosePackLead")}
            initialBuyForfaitId={buyForfaitId}
          />

          <div className="d-flex flex-wrap gap-2 mt-4">
            <Link to="/espace/candidat/auto-ecoles" className="btn btn-outline-secondary btn-sm">
              {t("dashboard.enrollment.browseForfaits")}
            </Link>
            <Link to="/espace/candidat/auto-ecole" className="btn btn-outline-primary btn-sm">
              {t("dashboard.enrollment.backToMySchool")}
            </Link>
          </div>
        </MainCard>
      </Col>
    </Row>
  );
}
