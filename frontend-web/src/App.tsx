import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter as Router, Navigate, Routes, Route } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import CookieConsentBanner from "./components/common/CookieConsentBanner";
import RoutePageLoader from "./flexjobs/components/RoutePageLoader";
import PublicLayout from "./flexjobs/layout/PublicLayout";
import PublicRoutes from "./flexjobs/routes/PublicRoutes";
import { ConnexionRoutes, InscriptionRoutes } from "./routes/AuthAndDashboardRoutes";

export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

  const app = (
    <Router>
      <ScrollToTop />
      <RoutePageLoader />
      <Routes>
        {/* Auth pages — hors PublicLayout, comme avant */}
        <Route path="/connexion/*" element={<ConnexionRoutes />} />
        <Route path="/inscription/*" element={<InscriptionRoutes />} />

        <Route path="/signin" element={<Navigate to="/connexion" replace />} />
        <Route path="/signup" element={<Navigate to="/inscription" replace />} />
        <Route path="/login" element={<Navigate to="/connexion" replace />} />
        <Route path="/register" element={<Navigate to="/inscription" replace />} />

        <Route path="/admin/*" element={<Navigate to="/" replace />} />
        <Route path="/espace/*" element={<Navigate to="/" replace />} />

        <Route element={<PublicLayout />}>
          <Route path="/*" element={<PublicRoutes />} />
        </Route>
      </Routes>
      <CookieConsentBanner />
    </Router>
  );

  if (!googleClientId) {
    return app;
  }

  return <GoogleOAuthProvider clientId={googleClientId}>{app}</GoogleOAuthProvider>;
}
