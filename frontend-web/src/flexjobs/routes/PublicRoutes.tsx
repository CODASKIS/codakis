import { Navigate, useRoutes } from "react-router";
import AboutPage from "../pages/AboutPage";
import BlogDetailPage from "../pages/BlogDetailPage";
import BlogPage from "../pages/BlogPage";
import ContactPage from "../pages/ContactPage";
import DomainsPage from "../pages/DomainsPage";
import GuidePage from "../pages/GuidePage";
import HomePage from "../pages/HomePage";
import HowItWorksPage from "../pages/HowItWorksPage";
import PrivacyPolicyPage from "../pages/PrivacyPolicyPage";
import TermsOfUsePage from "../pages/TermsOfUsePage";
import TechniciansPage from "../pages/TechniciansPage";
import ConsortPage from "../pages/ConsortPage";
import DrivingSchoolDetailPage from "../pages/DrivingSchoolDetailPage";

export default function PublicRoutes() {
  return useRoutes([
    { index: true, element: <HomePage /> },
    { path: "home", element: <Navigate to="/" replace /> },
    { path: "comment-ca-marche", element: <HowItWorksPage /> },
    { path: "a-propos", element: <AboutPage /> },
    { path: "themes", element: <DomainsPage /> },
    { path: "domaines", element: <Navigate to="/themes" replace /> },
    { path: "auto-ecoles", element: <TechniciansPage /> },
    { path: "auto-ecoles/:id", element: <DrivingSchoolDetailPage /> },
    { path: "techniciens", element: <Navigate to="/auto-ecoles" replace /> },
    { path: "consort", element: <ConsortPage /> },
    { path: "tarifs", element: <Navigate to="/themes#abonnement" replace /> },
    { path: "blog", element: <BlogPage /> },
    { path: "blog/:slug", element: <BlogDetailPage /> },
    { path: "contact", element: <ContactPage /> },
    { path: "politique-de-confidentialite", element: <PrivacyPolicyPage /> },
    { path: "conditions-d-utilisation", element: <TermsOfUsePage /> },
    { path: "support", element: <Navigate to="/contact" replace /> },
    { path: "guide/candidat", element: <GuidePage variant="client" /> },
    { path: "guide/client", element: <Navigate to="/guide/candidat" replace /> },
    { path: "guide/auto-ecole", element: <GuidePage variant="technician" /> },
    { path: "guide/technicien", element: <Navigate to="/guide/auto-ecole" replace /> },
    { path: "schedules", element: <Navigate to="/themes" replace /> },
    { path: "speakers", element: <Navigate to="/auto-ecoles" replace /> },
    { path: "news", element: <Navigate to="/blog" replace /> },
    { path: "training", element: <Navigate to="/themes" replace /> },
    { path: "recruitment", element: <Navigate to="/auto-ecoles" replace /> },
    { path: "*", element: <Navigate to="/" replace /> },
  ]);
}
