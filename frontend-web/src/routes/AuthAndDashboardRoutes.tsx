import { Navigate, useRoutes } from "react-router";
import RequireAuth from "../auth/components/RequireAuth";
import LoginPage from "../auth/pages/LoginPage";
import RegisterPage from "../auth/pages/RegisterPage";
import ForgotPasswordPage from "../auth/pages/ForgotPasswordPage";
import DashboardKitLayout from "../dashboard/layout/DashboardKitLayout";
import DashboardSalesHome from "../dashboard/pages/DashboardSalesHome";
import DashboardPlaceholderPage from "../dashboard/pages/DashboardPlaceholderPage";
import AdminSchoolsPage from "../dashboard/pages/admin/AdminSchoolsPage";
import AdminBlogPage from "../dashboard/pages/admin/AdminBlogPage";
import AdminBlogEditPage from "../dashboard/pages/admin/AdminBlogEditPage";
import AdminPaymentsPage from "../dashboard/pages/admin/AdminPaymentsPage";
import AdminUsersPage from "../dashboard/pages/admin/AdminUsersPage";
import AdminUserDetailPage from "../dashboard/pages/admin/AdminUserDetailPage";
import AdminSchoolDetailPage from "../dashboard/pages/admin/AdminSchoolDetailPage";
import AdminSettingsPage from "../dashboard/pages/admin/AdminSettingsPage";
import AdminProfilePage from "../dashboard/pages/admin/AdminProfilePage";
import AdminContentPage from "../dashboard/pages/admin/AdminContentPage";
import AdminLeconEditPage from "../dashboard/pages/admin/AdminLeconEditPage";
import AdminQuestionEditPage from "../dashboard/pages/admin/AdminQuestionEditPage";
import AdminQuizEditPage from "../dashboard/pages/admin/AdminQuizEditPage";
import AdminExamEditPage from "../dashboard/pages/admin/AdminExamEditPage";
import AdminThemeEditPage from "../dashboard/pages/admin/AdminThemeEditPage";
import GerantProfilePage from "../dashboard/pages/gerant/GerantProfilePage";
import GerantSettingsPage from "../dashboard/pages/gerant/GerantSettingsPage";
import MoniteurProfilePage from "../dashboard/pages/moniteur/MoniteurProfilePage";
import GerantEtablissementPage from "../dashboard/pages/gerant/GerantEtablissementPage";
import GerantMoniteursPage from "../dashboard/pages/gerant/GerantMoniteursPage";
import GerantInscriptionsPage from "../dashboard/pages/gerant/GerantInscriptionsPage";
import GerantForfaitsPage from "../dashboard/pages/gerant/GerantForfaitsPage";
import CandidatConsortPage from "../dashboard/pages/candidat/CandidatConsortPage";
import CandidatProfilePage from "../dashboard/pages/candidat/CandidatProfilePage";
import CandidatModulePage from "../dashboard/pages/candidat/CandidatModulePage";
import CandidatModulePlayerPage from "../dashboard/pages/candidat/CandidatModulePlayerPage";
import CandidatCoursesPage from "../dashboard/pages/candidat/CandidatCoursesPage";
import CandidatLessonPage from "../dashboard/pages/candidat/CandidatLessonPage";
import CandidatExamsPage from "../dashboard/pages/candidat/CandidatExamsPage";
import CandidatTakeAssessmentPage from "../dashboard/pages/candidat/CandidatTakeAssessmentPage";
import CandidatSchoolPage from "../dashboard/pages/candidat/CandidatSchoolPage";
import CandidatSchoolsBrowsePage from "../dashboard/pages/candidat/CandidatSchoolsBrowsePage";
import CandidatSchoolSelectPage from "../dashboard/pages/candidat/CandidatSchoolSelectPage";
import CandidatSeancesPage from "../dashboard/pages/candidat/CandidatSeancesPage";
import MoniteurPlanningPage from "../dashboard/pages/moniteur/MoniteurPlanningPage";
import MoniteurElevesPage from "../dashboard/pages/moniteur/MoniteurElevesPage";
import MoniteurCreneauxPage from "../dashboard/pages/moniteur/MoniteurCreneauxPage";
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
        { path: "auto-ecoles", element: <AdminSchoolsPage /> },
        { path: "auto-ecoles/:id", element: <AdminSchoolDetailPage /> },
        { path: "contenu", element: <AdminContentPage /> },
        { path: "contenu/lecons/nouveau", element: <AdminLeconEditPage /> },
        { path: "contenu/lecons/:id/modifier", element: <AdminLeconEditPage /> },
        { path: "contenu/questions/nouveau", element: <AdminQuestionEditPage /> },
        { path: "contenu/questions/:id/modifier", element: <AdminQuestionEditPage /> },
        { path: "contenu/quiz/nouveau", element: <AdminQuizEditPage /> },
        { path: "contenu/quiz/:id/modifier", element: <AdminQuizEditPage /> },
        { path: "contenu/examens/nouveau", element: <AdminExamEditPage /> },
        { path: "contenu/examens/:id/modifier", element: <AdminExamEditPage /> },
        { path: "contenu/themes/nouveau", element: <AdminThemeEditPage /> },
        { path: "contenu/themes/:id/modifier", element: <AdminThemeEditPage /> },
        { path: "blog", element: <AdminBlogPage /> },
        { path: "blog/nouveau", element: <AdminBlogEditPage /> },
        { path: "blog/:id/modifier", element: <AdminBlogEditPage /> },
        { path: "paiements", element: <AdminPaymentsPage /> },
        { path: "utilisateurs", element: <AdminUsersPage /> },
        { path: "utilisateurs/:id", element: <AdminUserDetailPage /> },
        { path: "profil", element: <AdminProfilePage /> },
        { path: "parametres", element: <AdminSettingsPage /> },
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
        { path: "cours", element: <CandidatCoursesPage /> },
        { path: "cours/module/:themeId", element: <CandidatModulePage /> },
        { path: "cours/module/:themeId/etape/:stepRef", element: <CandidatModulePlayerPage /> },
        { path: "cours/lecon/:id", element: <CandidatLessonPage /> },
        { path: "examens", element: <CandidatExamsPage /> },
        { path: "examens/quiz/:id", element: <CandidatTakeAssessmentPage mode="quiz" /> },
        { path: "examens/examen/:id", element: <CandidatTakeAssessmentPage mode="examen" /> },
        { path: "seances", element: <CandidatSeancesPage /> },
        { path: "consort", element: <CandidatConsortPage /> },
        { path: "auto-ecole", element: <CandidatSchoolPage /> },
        { path: "auto-ecoles", element: <CandidatSchoolsBrowsePage /> },
        { path: "auto-ecoles/:id", element: <CandidatSchoolSelectPage /> },
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
        { path: "eleves", element: <MoniteurElevesPage /> },
        { path: "planning", element: <MoniteurPlanningPage /> },
        { path: "creneaux", element: <MoniteurCreneauxPage /> },
        { path: "profil", element: <MoniteurProfilePage /> },
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
        { path: "inscriptions", element: <GerantInscriptionsPage /> },
        { path: "forfaits", element: <GerantForfaitsPage /> },
        { path: "moniteurs", element: <GerantMoniteursPage /> },
        { path: "statistiques", element: <DashboardPlaceholderPage role="gerant" /> },
        { path: "profil", element: <GerantProfilePage /> },
        { path: "etablissement", element: <GerantEtablissementPage /> },
        { path: "parametres", element: <GerantSettingsPage /> },
      ],
    },
  ]);
}
