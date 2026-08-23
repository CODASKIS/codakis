import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Col, Form, ListGroup, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { buildSchoolMapEmbedUrl } from "../../../lib/schoolHours";
import { geocodeAddress, searchPlaces, type NominatimResult } from "../../../lib/nominatim";

type SchoolLocationPickerProps = {
  address: string;
  latitude: string;
  longitude: string;
  countryCode?: string;
  onAddressChange: (value: string) => void;
  onLatitudeChange: (value: string) => void;
  onLongitudeChange: (value: string) => void;
};

function parseCoord(value: string): number | null {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function SchoolLocationPicker({
  address,
  latitude,
  longitude,
  countryCode = "CM",
  onAddressChange,
  onLatitudeChange,
  onLongitudeChange,
}: SchoolLocationPickerProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const lat = parseCoord(latitude);
  const lng = parseCoord(longitude);
  const mapUrl = useMemo(() => {
    if (lat == null || lng == null) return null;
    return buildSchoolMapEmbedUrl(lat, lng);
  }, [lat, lng]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 3) {
      setResults([]);
      return;
    }
    const timer = window.setTimeout(() => {
      setSearching(true);
      setError("");
      void searchPlaces(query, { countryCode: countryCode.toLowerCase(), limit: 5 })
        .then(setResults)
        .catch(() => setError(t("dashboard.profile.locationSearchError")))
        .finally(() => setSearching(false));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [query, countryCode, t]);

  function applyResult(item: NominatimResult) {
    onLatitudeChange(item.lat);
    onLongitudeChange(item.lon);
    onAddressChange(item.display_name);
    setQuery(item.display_name);
    setResults([]);
  }

  async function geocodeCurrentAddress() {
    const target = address.trim() || query.trim();
    if (!target) return;
    setSearching(true);
    setError("");
    try {
      const hit = await geocodeAddress(`${target}, ${countryCode}`);
      if (!hit) {
        setError(t("dashboard.profile.locationNotFound"));
        return;
      }
      onLatitudeChange(String(hit.lat));
      onLongitudeChange(String(hit.lng));
      onAddressChange(hit.label);
      setQuery(hit.label);
      setResults([]);
    } catch {
      setError(t("dashboard.profile.locationSearchError"));
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="codakis-location-picker">
      <h6 className="mb-2">{t("dashboard.profile.schoolLocationTitle")}</h6>
      <p className="text-muted mb-3">{t("dashboard.profile.schoolLocationHint")}</p>
      {error ? <Alert variant="warning">{error}</Alert> : null}

      <Row className="g-3 mb-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label>{t("dashboard.profile.locationSearch")}</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                value={query}
                placeholder={t("dashboard.profile.locationSearchPlaceholder")}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Button variant="outline-primary" disabled={searching} onClick={() => void geocodeCurrentAddress()}>
                {searching ? t("common.loading") : t("dashboard.profile.locationGeocode")}
              </Button>
            </div>
          </Form.Group>
          {results.length > 0 ? (
            <ListGroup className="mt-2 shadow-sm">
              {results.map((item) => (
                <ListGroup.Item key={item.place_id} action onClick={() => applyResult(item)}>
                  {item.display_name}
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : null}
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>{t("dashboard.profile.latitude")}</Form.Label>
            <Form.Control
              inputMode="decimal"
              value={latitude}
              placeholder="4.0511"
              onChange={(event) => onLatitudeChange(event.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>{t("dashboard.profile.longitude")}</Form.Label>
            <Form.Control
              inputMode="decimal"
              value={longitude}
              placeholder="9.7679"
              onChange={(event) => onLongitudeChange(event.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      {mapUrl ? (
        <div className="codakis-location-picker__map rounded overflow-hidden border">
          <iframe title={t("dashboard.profile.schoolLocationTitle")} src={mapUrl} loading="lazy" />
        </div>
      ) : (
        <Alert variant="light" className="border mb-0">{t("dashboard.profile.locationMapEmpty")}</Alert>
      )}
    </div>
  );
}
