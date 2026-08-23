import CodakisDashHome from "./CodakisDashHome.jsx";
import type { UserRole } from "../../auth/types";

type DashboardSalesHomeProps = {
  role: UserRole;
};

/** Tableau de bord CODAKIS — données permis / auto-école (DashboardKit) */
export default function DashboardSalesHome({ role }: DashboardSalesHomeProps) {
  return <CodakisDashHome role={role} />;
}
