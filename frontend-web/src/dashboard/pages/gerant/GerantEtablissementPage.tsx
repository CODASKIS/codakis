import { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Col, Form, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import SchoolHoursEditor from "../../components/gerant/SchoolHoursEditor";
import SchoolLocationPicker from "../../components/gerant/SchoolLocationPicker";
import { DEFAULT_DRIVING_SCHOOL_LOGO } from "../../../constants/assets";
import {
  AuthApiError,
  fetchGerantSchool,
  updateGerantSchool,
  type GerantSchool,
} from "../../../lib/authApi";
import { buildSchoolMapEmbedUrl, normalizeSchoolHours, type SchoolHours } from "../../../lib/schoolHours";

type SchoolForm = {
  raison_sociale: string;
  raison_sociale_legale: string;
  numero_agrement: string;
  rccm: string;
  adresse: string;
  ville: string;
  quartier: string;
  country_code: string;
  site_web: string;
  logo_url: string;
  description: string;
  description_longue: string;
  access_info: string;
  telephone: string;
  nombre_moniteurs: string;
  nombre_vehicules: string;
  annees_experience: string;
  fonction_gerant: string;
  latitude: string;
  longitude: string;
  horaires: SchoolHours;
};

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function externalHref(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function schoolToForm(school: GerantSchool): SchoolForm {
  return {
    raison_sociale: school.raison_sociale,
    raison_sociale_legale: school.raison_sociale_legale ?? "",
    numero_agrement: school.numero_agrement,
    rccm: school.rccm ?? "",
    adresse: school.adresse,
    ville: school.ville ?? "",
    quartier: school.quartier ?? "",
    country_code: school.country_code,
    site_web: school.site_web ?? "",
    logo_url: school.logo_url ?? "",
    description: school.description ?? "",
    description_longue: school.description_longue ?? "",
    access_info: school.access_info ?? "",
    telephone: school.telephone ?? "",
    nombre_moniteurs: school.nombre_moniteurs != null ? String(school.nombre_moniteurs) : "",
    nombre_vehicules: school.nombre_vehicules != null ? String(school.nombre_vehicules) : "",
    annees_experience: school.annees_experience != null ? String(school.annees_experience) : "",
    fonction_gerant: school.fonction_gerant ?? "",
    latitude: school.latitude != null ? String(school.latitude) : "",
    longitude: school.longitude != null ? String(school.longitude) : "",
    horaires: normalizeSchoolHours(school.horaires ?? undefined),
  };
}

function parseOptionalInt(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseOptionalCoord(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function GerantEtablissementPage() {
  const { t } = useTranslation();
  const [school, setSchool] = useState<GerantSchool | null>(null);
  const [form, setForm] = useState<SchoolForm>(() => ({
    raison_sociale: "",
    raison_sociale_legale: "",
    numero_agrement: "",
    rccm: "",
    adresse: "",
    ville: "",
    quartier: "",
    country_code: "CM",
    site_web: "",
    logo_url: "",
    description: "",
    description_longue: "",
    access_info: "",
    telephone: "",
    nombre_moniteurs: "",
    nombre_vehicules: "",
    annees_experience: "",
    fonction_gerant: "",
    latitude: "",
    longitude: "",
    horaires: normalizeSchoolHours(),
  }));
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSchool = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchGerantSchool();
      setSchool(data);
      setForm(schoolToForm(data));
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("dashboard.profile.schoolLoadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadSchool();
  }, [loadSchool]);

  async function handleSaveSchool() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateGerantSchool({
        raison_sociale: form.raison_sociale.trim(),
        raison_sociale_legale: form.raison_sociale_legale.trim(),
        numero_agrement: form.numero_agrement.trim(),
        rccm: form.rccm.trim(),
        adresse: form.adresse.trim(),
        city: form.ville.trim(),
        quartier: form.quartier.trim(),
        country_code: form.country_code.trim().toUpperCase(),
        site_web: form.site_web.trim(),
        logo_url: form.logo_url.trim(),
        description: form.description.trim(),
        description_longue: form.description_longue.trim(),
        access_info: form.access_info.trim(),
        telephone: form.telephone.trim(),
        nombre_moniteurs: parseOptionalInt(form.nombre_moniteurs),
        nombre_vehicules: parseOptionalInt(form.nombre_vehicules),
        annees_experience: parseOptionalInt(form.annees_experience),
        fonction_gerant: form.fonction_gerant.trim(),
        latitude: parseOptionalCoord(form.latitude),
        longitude: parseOptionalCoord(form.longitude),
        horaires: form.horaires,
      });
      setSchool(updated);
      setForm(schoolToForm(updated));
      setEditing(false);
      setSuccess(t("dashboard.profile.schoolSaveSuccess"));
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("dashboard.profile.schoolSaveError"));
    } finally {
      setSaving(false);
    }
  }

  function schoolStatusBadge() {
    if (!school) return null;
    if (school.est_refusee) return <Badge bg="danger">{t("dashboard.profile.schoolRejected")}</Badge>;
    if (school.est_validee) return <Badge bg="success">{t("dashboard.profile.schoolValidated")}</Badge>;
    return <Badge bg="warning">{t("dashboard.profile.schoolPending")}</Badge>;
  }

  const logoPreview = (editing ? form.logo_url : school?.logo_url)?.trim() || DEFAULT_DRIVING_SCHOOL_LOGO;
  const websiteHref = school?.site_web ? externalHref(school.site_web) : "";
  const viewMapUrl =
    school?.latitude != null && school.longitude != null
      ? buildSchoolMapEmbedUrl(school.latitude, school.longitude)
      : null;

  const editFields = (
    <Row className="g-3">
      <Col md={6}>
        <Form.Group>
          <Form.Label>{t("dashboard.profile.schoolName")}</Form.Label>
          <Form.Control value={form.raison_sociale} onChange={(e) => setForm((c) => ({ ...c, raison_sociale: e.target.value }))} />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>{t("dashboard.profile.schoolLegalName")}</Form.Label>
          <Form.Control value={form.raison_sociale_legale} onChange={(e) => setForm((c) => ({ ...c, raison_sociale_legale: e.target.value }))} />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>{t("dashboard.profile.schoolAgrement")}</Form.Label>
          <Form.Control required value={form.numero_agrement} onChange={(e) => setForm((c) => ({ ...c, numero_agrement: e.target.value }))} />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>{t("dashboard.profile.schoolRccm")}</Form.Label>
          <Form.Control value={form.rccm} onChange={(e) => setForm((c) => ({ ...c, rccm: e.target.value }))} />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>{t("dashboard.profile.city")}</Form.Label>
          <Form.Control required value={form.ville} onChange={(e) => setForm((c) => ({ ...c, ville: e.target.value }))} />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>{t("dashboard.profile.schoolDistrict")}</Form.Label>
          <Form.Control value={form.quartier} onChange={(e) => setForm((c) => ({ ...c, quartier: e.target.value }))} />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>{t("dashboard.profile.country")}</Form.Label>
          <Form.Control maxLength={2} required value={form.country_code} onChange={(e) => setForm((c) => ({ ...c, country_code: e.target.value.toUpperCase() }))} />
        </Form.Group>
      </Col>
      <Col md={12}>
        <Form.Group>
          <Form.Label>{t("dashboard.profile.schoolAddress")}</Form.Label>
          <Form.Control as="textarea" rows={2} value={form.adresse} onChange={(e) => setForm((c) => ({ ...c, adresse: e.target.value }))} />
        </Form.Group>
      </Col>
      <Col md={12}>
        <Card className="border">
          <Card.Body>
            <SchoolLocationPicker
              address={form.adresse}
              latitude={form.latitude}
              longitude={form.longitude}
              countryCode={form.country_code}
              onAddressChange={(value) => setForm((c) => ({ ...c, adresse: value }))}
              onLatitudeChange={(value) => setForm((c) => ({ ...c, latitude: value }))}
              onLongitudeChange={(value) => setForm((c) => ({ ...c, longitude: value }))}
            />
          </Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>{t("dashboard.profile.schoolPhone")}</Form.Label>
          <Form.Control type="tel" value={form.telephone} onChange={(e) => setForm((c) => ({ ...c, telephone: e.target.value }))} />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>{t("dashboard.profile.schoolWebsite")}</Form.Label>
          <Form.Control type="url" value={form.site_web} onChange={(e) => setForm((c) => ({ ...c, site_web: e.target.value }))} placeholder="https://" />
        </Form.Group>
      </Col>
      <Col md={12}>
        <Form.Group>
          <Form.Label>{t("dashboard.profile.schoolLogo")}</Form.Label>
          <Form.Control type="url" value={form.logo_url} onChange={(e) => setForm((c) => ({ ...c, logo_url: e.target.value }))} placeholder="https://" />
          <Form.Text className="text-muted">{t("dashboard.profile.schoolLogoHint")}</Form.Text>
        </Form.Group>
      </Col>
      <Col md={12}>
        <Form.Group>
          <Form.Label>{t("dashboard.profile.schoolDescription")}</Form.Label>
          <Form.Control as="textarea" rows={3} value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} />
        </Form.Group>
      </Col>
      <Col md={12}>
        <Form.Group>
          <Form.Label>{t("dashboard.profile.schoolLongDescription")}</Form.Label>
          <Form.Control as="textarea" rows={4} value={form.description_longue} onChange={(e) => setForm((c) => ({ ...c, description_longue: e.target.value }))} />
        </Form.Group>
      </Col>
      <Col md={12}>
        <Form.Group>
          <Form.Label>{t("dashboard.profile.schoolAccessInfo")}</Form.Label>
          <Form.Control as="textarea" rows={3} value={form.access_info} onChange={(e) => setForm((c) => ({ ...c, access_info: e.target.value }))} />
        </Form.Group>
      </Col>
      <Col md={12}>
        <Card className="border">
          <Card.Body>
            <SchoolHoursEditor value={form.horaires} onChange={(horaires) => setForm((c) => ({ ...c, horaires }))} />
          </Card.Body>
        </Card>
      </Col>
      <Col md={12}><hr className="my-1" /><h6 className="mb-0">{t("dashboard.profile.schoolActivity")}</h6></Col>
      <Col md={3}>
        <Form.Group>
          <Form.Label>{t("dashboard.profile.schoolInstructors")}</Form.Label>
          <Form.Control type="number" min={0} value={form.nombre_moniteurs} onChange={(e) => setForm((c) => ({ ...c, nombre_moniteurs: e.target.value }))} />
        </Form.Group>
      </Col>
      <Col md={3}>
        <Form.Group>
          <Form.Label>{t("dashboard.profile.schoolVehicles")}</Form.Label>
          <Form.Control type="number" min={0} value={form.nombre_vehicules} onChange={(e) => setForm((c) => ({ ...c, nombre_vehicules: e.target.value }))} />
        </Form.Group>
      </Col>
      <Col md={3}>
        <Form.Group>
          <Form.Label>{t("dashboard.profile.schoolExperience")}</Form.Label>
          <Form.Control type="number" min={0} value={form.annees_experience} onChange={(e) => setForm((c) => ({ ...c, annees_experience: e.target.value }))} />
        </Form.Group>
      </Col>
      <Col md={3}>
        <Form.Group>
          <Form.Label>{t("dashboard.profile.schoolManagerRole")}</Form.Label>
          <Form.Control value={form.fonction_gerant} onChange={(e) => setForm((c) => ({ ...c, fonction_gerant: e.target.value }))} />
        </Form.Group>
      </Col>
    </Row>
  );

  return (
    <Row>
      <Col lg={12}>
        <MainCard title={t("dashboard.nav.schoolProfile")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
          {error ? <Alert variant="danger">{error}</Alert> : null}
          {success ? <Alert variant="success">{success}</Alert> : null}

          {loading ? (
            <Loader />
          ) : school ? (
            <>
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                <div className="d-flex align-items-center gap-3">
                  <img src={logoPreview} alt="" className="rounded border" style={{ width: 72, height: 72, objectFit: "contain", background: "#fff" }} />
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">{schoolStatusBadge()}</div>
                    <h5 className="mb-0">{school.raison_sociale}</h5>
                    {school.raison_sociale_legale ? <p className="text-muted mb-0">{school.raison_sociale_legale}</p> : null}
                  </div>
                </div>
                {!school.est_refusee ? (
                  editing ? (
                    <div>
                      <Button variant="outline-secondary" size="sm" className="me-2" disabled={saving} onClick={() => { setForm(schoolToForm(school)); setEditing(false); }}>
                        {t("common.cancel")}
                      </Button>
                      <Button variant="primary" size="sm" disabled={saving} onClick={() => void handleSaveSchool()}>
                        {saving ? t("dashboard.profile.saving") : t("dashboard.profile.save")}
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline-primary" size="sm" onClick={() => setEditing(true)}>
                      {t("dashboard.profile.editSchool")}
                    </Button>
                  )
                ) : null}
              </div>

              {school.est_refusee && school.motif_refus ? (
                <Alert variant="danger">{t("dashboard.profile.schoolRejectReason", { reason: school.motif_refus })}</Alert>
              ) : null}

              {editing ? editFields : (
                <>
                  <Row className="g-4">
                    <Col md={6}><p className="text-muted mb-1">{t("dashboard.profile.schoolAgrement")}</p><p className="fw-semibold mb-0">{school.numero_agrement}</p></Col>
                    <Col md={6}><p className="text-muted mb-1">{t("dashboard.profile.schoolRccm")}</p><p className="fw-semibold mb-0">{school.rccm ?? "—"}</p></Col>
                    <Col md={6}><p className="text-muted mb-1">{t("dashboard.profile.city")}</p><p className="fw-semibold mb-0">{school.ville ?? "—"}</p></Col>
                    <Col md={6}><p className="text-muted mb-1">{t("dashboard.profile.schoolDistrict")}</p><p className="fw-semibold mb-0">{school.quartier ?? "—"}</p></Col>
                    <Col md={12}><p className="text-muted mb-1">{t("dashboard.profile.schoolAddress")}</p><p className="fw-semibold mb-0">{school.adresse}</p></Col>
                    <Col md={6}><p className="text-muted mb-1">{t("dashboard.profile.schoolPhone")}</p><p className="fw-semibold mb-0">{school.telephone ?? "—"}</p></Col>
                    <Col md={6}>
                      <p className="text-muted mb-1">{t("dashboard.profile.schoolWebsite")}</p>
                      {websiteHref ? <a href={websiteHref} target="_blank" rel="noreferrer" className="fw-semibold">{t("dashboard.profile.openWebsite")}</a> : <p className="fw-semibold mb-0">—</p>}
                    </Col>
                    <Col md={12}><p className="text-muted mb-1">{t("dashboard.profile.schoolDescription")}</p><p className="mb-0">{school.description ?? "—"}</p></Col>
                    <Col md={12}><p className="text-muted mb-1">{t("dashboard.profile.schoolLongDescription")}</p><p className="mb-0">{school.description_longue ?? "—"}</p></Col>
                    <Col md={12}><p className="text-muted mb-1">{t("dashboard.profile.schoolAccessInfo")}</p><p className="mb-0">{school.access_info ?? "—"}</p></Col>
                    <Col md={6}><p className="text-muted mb-1">{t("dashboard.profile.schoolRegistered")}</p><p className="fw-semibold mb-0">{formatDate(school.created_at)}</p></Col>
                    {school.validee_le ? <Col md={6}><p className="text-muted mb-1">{t("dashboard.profile.schoolValidatedAt")}</p><p className="fw-semibold mb-0">{formatDate(school.validee_le)}</p></Col> : null}
                  </Row>

                  {viewMapUrl ? (
                    <Card className="mt-4 border">
                      <Card.Body>
                        <h6 className="mb-3">{t("dashboard.profile.schoolLocationTitle")}</h6>
                        <div className="codakis-location-picker__map rounded overflow-hidden border">
                          <iframe title={t("dashboard.profile.schoolLocationTitle")} src={viewMapUrl} loading="lazy" />
                        </div>
                      </Card.Body>
                    </Card>
                  ) : null}

                  <Card className="mt-4 bg-light border-0">
                    <Card.Body>
                      <SchoolHoursEditor value={normalizeSchoolHours(school.horaires ?? undefined)} onChange={() => undefined} readOnly />
                    </Card.Body>
                  </Card>

                  <Card className="mt-4 bg-light border-0">
                    <Card.Body>
                      <h6 className="mb-3">{t("dashboard.profile.schoolActivity")}</h6>
                      <Row className="g-3">
                        <Col md={3}><p className="text-muted mb-1">{t("dashboard.profile.schoolInstructors")}</p><p className="fw-semibold mb-0">{school.nombre_moniteurs ?? "—"}</p></Col>
                        <Col md={3}><p className="text-muted mb-1">{t("dashboard.profile.schoolVehicles")}</p><p className="fw-semibold mb-0">{school.nombre_vehicules ?? "—"}</p></Col>
                        <Col md={3}><p className="text-muted mb-1">{t("dashboard.profile.schoolExperience")}</p><p className="fw-semibold mb-0">{school.annees_experience ?? "—"}</p></Col>
                        <Col md={3}><p className="text-muted mb-1">{t("dashboard.profile.schoolManagerRole")}</p><p className="fw-semibold mb-0">{school.fonction_gerant ?? "—"}</p></Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </>
              )}

              <Card className="mt-4 border-0">
                <Card.Body>
                  <h6 className="mb-2">{t("dashboard.profile.schoolPresentation")}</h6>
                  <p className="text-muted mb-0">{t("dashboard.profile.schoolPresentationHint")}</p>
                </Card.Body>
              </Card>
            </>
          ) : (
            <p className="text-muted">{t("dashboard.profile.schoolLoadError")}</p>
          )}
        </MainCard>
      </Col>
    </Row>
  );
}
