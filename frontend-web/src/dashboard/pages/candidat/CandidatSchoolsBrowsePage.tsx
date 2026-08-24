import { useEffect, useMemo, useState } from "react";
import { Badge, Col, Form, Row } from "react-bootstrap";
import { Link } from "react-router";
import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import { DEFAULT_DRIVING_SCHOOL_LOGO, resolveSchoolLogoUrl } from "../../../constants/assets";
import { formatForfaitPrice } from "../../../data/mockDrivingSchools";
import {
  fetchPublicSchools,
  filterPublicSchools,
  mapPublicSchoolToDrivingSchool,
} from "../../../lib/publicSchoolsApi";
import type { DrivingSchool } from "../../../data/mockDrivingSchools";

export default function CandidatSchoolsBrowsePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "fr";
  const [schools, setSchools] = useState<DrivingSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    void fetchPublicSchools()
      .then((items) => setSchools(items.map((item) => mapPublicSchoolToDrivingSchool(item))))
      .catch(() => setError(t("schools.error")))
      .finally(() => setLoading(false));
  }, [t]);

  const results = useMemo(() => {
    const apiItems = schools.map((s) => ({
      id: s.id,
      name: s.name,
      city: s.city,
      district: s.district,
      address: s.address,
      phone: s.phone,
      logo_url: s.logoUrl ?? null,
      description: s.description.fr,
      long_description: s.longDescription.fr,
      access_info: s.accessInfo.fr,
      site_web: null,
      latitude: s.latitude,
      longitude: s.longitude,
      country_code: "CM",
      price_from: s.priceFrom,
      certified_since: s.certifiedSince,
      hours: s.hours,
    }));
    return filterPublicSchools(apiItems, query, city).map((item) => mapPublicSchoolToDrivingSchool(item));
  }, [schools, query, city]);

  if (loading) return <Loader />;

  return (
    <Row>
      <Col sm={12}>
        <MainCard title={t("dashboard.enrollment.schoolsTitle")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
          <p className="text-muted mb-4">{t("dashboard.enrollment.schoolsLead")}</p>
          <Row className="g-3 mb-4">
            <Col md={6}>
              <Form.Control
                placeholder={t("dashboard.enrollment.searchSchool")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Form.Control
                placeholder={t("dashboard.enrollment.searchCity")}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </Col>
          </Row>

          {error ? <p className="text-danger">{error}</p> : null}

          {results.length === 0 ? (
            <p className="text-muted mb-0">{t("schools.empty")}</p>
          ) : (
            <div className="d-grid gap-3">
              {results.map((school) => (
                <div key={school.id} className="border rounded p-3 d-flex flex-wrap gap-3 align-items-start">
                  <img
                    src={resolveSchoolLogoUrl(school.logoUrl)}
                    alt=""
                    className="rounded border bg-white"
                    style={{ width: 72, height: 72, objectFit: "contain", padding: 6 }}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = DEFAULT_DRIVING_SCHOOL_LOGO;
                    }}
                  />
                  <div className="flex-grow-1 min-w-0">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                      <h5 className="mb-0">{school.name}</h5>
                      <Badge bg="success">{t("schools.certified")}</Badge>
                    </div>
                    <p className="text-muted small mb-2 d-flex align-items-center gap-1">
                      <MapPin size={14} aria-hidden />
                      {school.city}{school.district ? `, ${school.district}` : ""}
                    </p>
                    <p className="mb-2">{school.description[lang]}</p>
                    <p className="text-primary fw-semibold mb-0">
                      {t("dashboard.enrollment.fromPrice", { price: formatForfaitPrice(school.priceFrom, lang) })}
                    </p>
                  </div>
                  <Link to={`/espace/candidat/auto-ecoles/${school.id}`} className="btn btn-primary">
                    {t("dashboard.enrollment.selectForfait")}
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <Link to="/espace/candidat/auto-ecole" className="btn btn-outline-secondary btn-sm">
              {t("dashboard.enrollment.backToMySchool")}
            </Link>
          </div>
        </MainCard>
      </Col>
    </Row>
  );
}
