import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ConfigProvider } from "@/dashboardkit/contexts/ConfigContext";
import { DashboardMenuProvider } from "@/dashboardkit/contexts/DashboardMenuContext";
import AdminLayout from "@/dashboardkit/layouts/AdminLayout";
import type { UserRole } from "../../auth/types";
import { buildCodakisMenuItems } from "../buildCodakisMenu";

type DashboardKitLayoutProps = {
  role: UserRole;
};

export default function DashboardKitLayout({ role }: DashboardKitLayoutProps) {
  const { t, i18n } = useTranslation();
  const menu = useMemo(() => buildCodakisMenuItems(role, t), [role, t, i18n.language]);

  useEffect(() => {
    void import("@/dashboardkit/assets/scss/style.scss");
    document.body.classList.add("dashboardkit-active");
    return () => {
      document.body.classList.remove("dashboardkit-active");
    };
  }, []);

  return (
    <ConfigProvider>
      <DashboardMenuProvider menu={menu}>
        <AdminLayout />
      </DashboardMenuProvider>
    </ConfigProvider>
  );
}
