import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "@/dashboardkit/assets/scss/style.scss";
import { ConfigProvider } from "@/dashboardkit/contexts/ConfigContext";
import { DashboardMenuProvider } from "@/dashboardkit/contexts/DashboardMenuContext";
import AdminLayout from "@/dashboardkit/layouts/AdminLayout";
import Loader from "../../components/common/Loader";
import MotionProvider from "../../components/motion/MotionProvider";
import type { UserRole } from "../../auth/types";
import { buildCodakisMenuItems } from "../buildCodakisMenu";

type DashboardKitLayoutProps = {
  role: UserRole;
};

export default function DashboardKitLayout({ role }: DashboardKitLayoutProps) {
  const { t, i18n } = useTranslation();
  const menu = useMemo(() => buildCodakisMenuItems(role, t), [role, t, i18n.language]);
  const [shellReady, setShellReady] = useState(false);

  useEffect(() => {
    document.body.classList.add("dashboardkit-active");
    let cancelled = false;

    void (async () => {
      await document.fonts.ready.catch(() => undefined);
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      if (!cancelled) setShellReady(true);
    })();

    return () => {
      cancelled = true;
      document.body.classList.remove("dashboardkit-active");
    };
  }, []);

  if (!shellReady) {
    return <Loader variant="page" />;
  }

  return (
    <MotionProvider>
      <ConfigProvider>
        <DashboardMenuProvider menu={menu}>
          <AdminLayout />
        </DashboardMenuProvider>
      </ConfigProvider>
    </MotionProvider>
  );
}
