import { Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import type { UserRole } from "../../auth/types";
import { getDashboardNav } from "../config/menuItems";

type DashboardPlaceholderPageProps = {
  role: UserRole;
};

export default function DashboardPlaceholderPage({ role }: DashboardPlaceholderPageProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const nav = getDashboardNav(role).flatMap((group) => group.items);
  const current = nav.find((item) => item.path === location.pathname);
  const title = current ? t(current.labelKey) : t("dashboard.comingSoon");

  return (
    <Row>
      <Col sm={12}>
        <MainCard title={title} isOption={false} cardClass="" optionClass="" CardBodyClass="">
          <h6>{t("dashboard.placeholder.title")}</h6>
          <p className="mb-0">{t("dashboard.placeholder.description")}</p>
        </MainCard>
      </Col>
    </Row>
  );
}
