import { useEffect, useState } from "react";
import { Badge, Card, Col, Row } from "react-bootstrap";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import UserAvatar from "../../components/common/UserAvatar";
import { fetchGerantMoniteurs, type GerantMoniteur } from "../../lib/authApi";

function fullName(item: GerantMoniteur): string {
  return `${item.first_name} ${item.last_name}`.trim();
}

export default function GerantDashboardMoniteurs() {
  const { t } = useTranslation();
  const [moniteurs, setMoniteurs] = useState<GerantMoniteur[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void fetchGerantMoniteurs()
      .then((items) => {
        if (active) setMoniteurs(items);
      })
      .catch(() => {
        if (active) setMoniteurs([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const activeCount = moniteurs.filter((item) => item.is_active).length;

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h5 className="mb-0">{t("dashboard.gerant.moniteursStrip.title")}</h5>
          <small className="text-muted">{t("dashboard.gerant.moniteursStrip.subtitle")}</small>
        </div>
        <Link to="/espace/gerant/moniteurs" className="btn btn-outline-primary btn-sm">
          {t("dashboard.gerant.moniteursStrip.manage")}
        </Link>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <p className="text-muted mb-0">{t("common.loading")}</p>
        ) : moniteurs.length === 0 ? (
          <p className="text-muted mb-0">{t("dashboard.gerant.moniteursStrip.empty")}</p>
        ) : (
          <>
            <div className="d-flex flex-wrap gap-3 mb-3">
              {moniteurs.slice(0, 8).map((item) => (
                <Link
                  key={item.id}
                  to={`/espace/gerant/moniteurs?moniteur=${item.id}`}
                  className="text-decoration-none text-body d-flex flex-column align-items-center gap-1"
                  title={fullName(item)}
                >
                  <UserAvatar name={fullName(item)} photoUrl={item.avatar_url} sizeClass="h-14 w-14" textClass="text-sm" />
                  <span className="codakis-moniteur-strip__name text-truncate" style={{ maxWidth: 88 }}>
                    {item.first_name}
                  </span>
                </Link>
              ))}
            </div>
            <Row className="g-2">
              <Col xs="auto">
                <Badge bg="primary">{t("dashboard.gerant.moniteursStrip.total", { count: moniteurs.length })}</Badge>
              </Col>
              <Col xs="auto">
                <Badge bg="success">{t("dashboard.gerant.moniteursStrip.active", { count: activeCount })}</Badge>
              </Col>
            </Row>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
