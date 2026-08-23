import { BrowserRouter as Router, Navigate, Routes, Route } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import CookieConsentBanner from "./components/common/CookieConsentBanner";
import RoutePageLoader from "./flexjobs/components/RoutePageLoader";
import PublicLayout from "./flexjobs/layout/PublicLayout";
import PublicRoutes from "./flexjobs/routes/PublicRoutes";
import {
  AdminRoutes,
  CandidatRoutes,
  ConnexionRoutes,
  GerantRoutes,
  InscriptionRoutes,
  MoniteurRoutes,
} from "./routes/AuthAndDashboardRoutes";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <RoutePageLoader />
      <Routes>
        <Route path="/connexion/*" element={<ConnexionRoutes />} />
        <Route path="/inscription/*" element={<InscriptionRoutes />} />

        <Route path="/signin" element={<Navigate to="/connexion" replace />} />
        <Route path="/signup" element={<Navigate to="/inscription" replace />} />
        <Route path="/login" element={<Navigate to="/connexion" replace />} />
        <Route path="/register" element={<Navigate to="/inscription" replace />} />

        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/espace/candidat/*" element={<CandidatRoutes />} />
        <Route path="/espace/moniteur/*" element={<MoniteurRoutes />} />
        <Route path="/espace/gerant/*" element={<GerantRoutes />} />

        <Route element={<PublicLayout />}>
          <Route path="/*" element={<PublicRoutes />} />
        </Route>
      </Routes>
      <CookieConsentBanner />
    </Router>
  );
}
