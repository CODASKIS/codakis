import { Card, Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";

type SettingsSection = {
  titleKey: string;
  descKey: string;
  badgeKey?: string;
};

type RoleSettingsPageProps = {
  titleKey: string;
  subtitleKey: string;
  sections: SettingsSection[];
};

export default function RoleSettingsPage({ titleKey, subtitleKey, sections }: RoleSettingsPageProps) {
  const { t } = useTranslation();

  return (
    <MainCard title={t(titleKey)} isOption={false} cardClass="" optionClass="" CardBodyClass="">
      <p className="text-muted mb-4">{t(subtitleKey)}</p>
      <Row className="g-3">
        {sections.map((section) => (
          <Col md={6} key={section.titleKey}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                  <h6 className="mb-0">{t(section.titleKey)}</h6>
                  {section.badgeKey ? (
                    <span className="badge bg-light text-muted">{t(section.badgeKey)}</span>
                  ) : null}
                </div>
                <p className="text-muted small mb-0">{t(section.descKey)}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </MainCard>
  );
}
