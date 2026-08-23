import { Navigate, useRoutes } from "react-router";
import RequireAuth from "../auth/components/RequireAuth";
import LoginPage from "../auth/pages/LoginPage";
import RegisterPage from "../auth/pages/RegisterPage";
import ForgotPasswordPage from "../auth/pages/ForgotPasswordPage";
import DashboardKitLayout from "../dashboard/layout/DashboardKitLayout";
import DashboardSalesHome from "../dashboard/pages/DashboardSalesHome";
import DashboardPlaceholderPage from "../dashboard/pages/DashboardPlaceholderPage";
import CandidatConsortPage from "../dashboard/pages/candidat/CandidatConsortPage";
import CandidatProfilePage from "../dashboard/pages/candidat/CandidatProfilePage";
import CandidatSchoolPage from "../dashboard/pages/candidat/CandidatSchoolPage";
import type { UserRole } from "../auth/types";

function withAuth(role: UserRole, element: React.ReactNode) {
  return <RequireAuth role={role}>{element}</RequireAuth>;
}

export function ConnexionRoutes() {
  return useRoutes([
    { index: true, element: <LoginPage /> },
    { path: "mot-de-passe", element: <ForgotPasswordPage /> },
    { path: "admin", element: <Navigate to="/connexion" replace /> },
    { path: "candidat", element: <Navigate to="/connexion" replace /> },
    { path: "moniteur", element: <Navigate to="/connexion" replace /> },
    { path: "gerant", element: <Navigate to="/connexion" replace /> },
  ]);
}

export function InscriptionRoutes() {
  return useRoutes([
    { index: true, element: <RegisterPage role="candidat" /> },
    { path: "candidat", element: <Navigate to="/inscription" replace /> },
    { path: "auto-ecole", element: <Navigate to="/inscription-auto-ecole" replace /> },
    { path: "gerant", element: <Navigate to="/inscription-auto-ecole" replace /> },
    { path: "*", element: <Navigate to="/inscription" replace /> },
  ]);
}

export function AdminRoutes() {
  return useRoutes([
    {
      path: "/",
      element: withAuth("admin", <DashboardKitLayout role="admin" />),
      children: [
        { index: true, element: <DashboardSalesHome role="admin" /> },
        { path: "auto-ecoles", element: <DashboardPlaceholderPage role="admin" /> },
        { path: "contenu", element: <DashboardPlaceholderPage role="admin" /> },
        { path: "paiements", element: <DashboardPlaceholderPage role="admin" /> },
        { path: "utilisateurs", element: <DashboardPlaceholderPage role="admin" /> },
        { path: "parametres", element: <DashboardPlaceholderPage role="admin" /> },
      ],
    },
  ]);
}

export function CandidatRoutes() {
  return useRoutes([
    {
      path: "/",
      element: withAuth("candidat", <DashboardKitLayout role="candidat" />),
      children: [
        { index: true, element: <DashboardSalesHome role="candidat" /> },
        { path: "cours", element: <DashboardPlaceholderPage role="candidat" /> },
        { path: "examens", element: <DashboardPlaceholderPage role="candidat" /> },
        { path: "consort", element: <CandidatConsortPage /> },
        { path: "auto-ecole", element: <CandidatSchoolPage /> },
        { path: "profil", element: <CandidatProfilePage /> },
      ],
    },
  ]);
}

export function MoniteurRoutes() {
  return useRoutes([
    {
      path: "/",
      element: withAuth("moniteur", <DashboardKitLayout role="moniteur" />),
      children: [
        { index: true, element: <DashboardSalesHome role="moniteur" /> },
        { path: "eleves", element: <DashboardPlaceholderPage role="moniteur" /> },
        { path: "planning", element: <DashboardPlaceholderPage role="moniteur" /> },
        { path: "creneaux", element: <DashboardPlaceholderPage role="moniteur" /> },
        { path: "profil", element: <DashboardPlaceholderPage role="moniteur" /> },
      ],
    },
  ]);
}

export function GerantRoutes() {
  return useRoutes([
    {
      path: "/",
      element: withAuth("gerant", <DashboardKitLayout role="gerant" />),
      children: [
        { index: true, element: <DashboardSalesHome role="gerant" /> },
        { path: "inscriptions", element: <DashboardPlaceholderPage role="gerant" /> },
        { path: "forfaits", element: <DashboardPlaceholderPage role="gerant" /> },
        { path: "moniteurs", element: <DashboardPlaceholderPage role="gerant" /> },
        { path: "statistiques", element: <DashboardPlaceholderPage role="gerant" /> },
        { path: "etablissement", element: <DashboardPlaceholderPage role="gerant" /> },
      ],
    },
  ]);
}
