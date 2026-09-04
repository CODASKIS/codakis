import { Navigate } from "react-router";

/** @deprecated Remplacé par dashboard/pages/moniteur/MoniteurSeances */
export default function MoniteurSeancesPage() {
  return <Navigate to="/espace/moniteur/seances" replace />;
}
