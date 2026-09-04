import { Navigate } from "react-router";

/** @deprecated Remplacé par dashboard/pages/moniteur/MoniteurEleves */
export default function MoniteurElevesPage() {
  return <Navigate to="/espace/moniteur/eleves" replace />;
}
