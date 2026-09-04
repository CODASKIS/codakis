import { Navigate } from "react-router";

/** @deprecated Remplacé par dashboard/pages/moniteur/MoniteurHome */
export default function MoniteurHomePage() {
  return <Navigate to="/espace/moniteur" replace />;
}
