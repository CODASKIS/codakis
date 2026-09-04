import { Navigate, Route, Routes } from "react-router";
import {
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Newspaper,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";
import RequireAuth from "../../auth/components/RequireAuth";
import ProAdminLayout from "../../dashboard/layout/ProAdminLayout";
import MoniteurHome from "../../dashboard/pages/moniteur/MoniteurHome";
import MoniteurEleves, { MoniteurEleveDetail } from "../../dashboard/pages/moniteur/MoniteurEleves";
import MoniteurPlanning from "../../dashboard/pages/moniteur/MoniteurPlanning";
import MoniteurSeances from "../../dashboard/pages/moniteur/MoniteurSeances";
import MoniteurProfil from "../../dashboard/pages/moniteur/MoniteurProfil";
import GerantHome from "../../dashboard/pages/gerant/GerantHome";
import GerantProfil from "../../dashboard/pages/gerant/GerantProfil";
import AdminHome from "../../dashboard/pages/admin/AdminHome";
import AdminSchools from "../../dashboard/pages/admin/AdminSchools";
import AdminSchoolDetail from "../../dashboard/pages/admin/AdminSchoolDetail";
import AdminUsers from "../../dashboard/pages/admin/AdminUsers";
import AdminUserCreate from "../../dashboard/pages/admin/AdminUserCreate";
import AdminUserDetail from "../../dashboard/pages/admin/AdminUserDetail";
import AdminPayments from "../../dashboard/pages/admin/AdminPayments";
import AdminPaymentDetail from "../../dashboard/pages/admin/AdminPaymentDetail";
import AdminBlog from "../../dashboard/pages/admin/AdminBlog";
import AdminBlogForm from "../../dashboard/pages/admin/AdminBlogForm";
import AdminContent from "../../dashboard/pages/admin/AdminContent";
import AdminThemeForm from "../../dashboard/pages/admin/AdminThemeForm";
import AdminLeconForm from "../../dashboard/pages/admin/AdminLeconForm";
import AdminQuestionForm from "../../dashboard/pages/admin/AdminQuestionForm";
import AdminQuizForm from "../../dashboard/pages/admin/AdminQuizForm";
import AdminExamenForm from "../../dashboard/pages/admin/AdminExamenForm";
import AdminProfil from "../../dashboard/pages/admin/AdminProfil";
import LearningShell from "../layout/LearningShell";
import RoadmapPage from "../pages/candidat/RoadmapPage";
import LessonPage from "../pages/candidat/LessonPage";
import QuizPage from "../pages/candidat/QuizPage";
import QuizResultPage from "../pages/candidat/QuizResultPage";
import ExamenPage from "../pages/candidat/ExamenPage";
import TestsPage from "../pages/candidat/TestsPage";
import StatsPage from "../pages/candidat/StatsPage";
import HandbookPage from "../pages/candidat/HandbookPage";
import SchoolPage from "../pages/candidat/SchoolPage";
import SeancesPage from "../pages/candidat/SeancesPage";
import ConsortPage from "../pages/candidat/ConsortPage";
import ProfilePage from "../pages/candidat/ProfilePage";
import SuperUpgradePage from "../pages/candidat/SuperUpgradePage";
import UserPreferencesPage from "../pages/shared/UserPreferencesPage";
import GerantElevesPage from "../pages/gerant/GerantElevesPage";
import GerantEleveDetailPage from "../pages/gerant/GerantEleveDetailPage";
import GerantAssignerPage from "../pages/gerant/GerantAssignerPage";
import GerantRapportsPage from "../pages/gerant/GerantRapportsPage";
import GerantParametresPage from "../pages/gerant/GerantParametresPage";

export function CandidatEspaceRoutes() {
  return (
    <RequireAuth role="candidat">
      <Routes>
        <Route element={<LearningShell />}>
          <Route index element={<RoadmapPage />} />
          <Route path="lecon/:id" element={<LessonPage />} />
          <Route path="quiz/:id" element={<QuizPage />} />
          <Route path="quiz/:id/resultat" element={<QuizResultPage />} />
          <Route path="examen/:id" element={<ExamenPage />} />
          <Route path="tests" element={<TestsPage />} />
          <Route path="statistiques" element={<StatsPage />} />
          <Route path="handbook" element={<HandbookPage />} />
          <Route path="auto-ecole" element={<SchoolPage />} />
          <Route path="seances" element={<SeancesPage />} />
          <Route path="consort" element={<ConsortPage />} />
          <Route path="profil" element={<ProfilePage />} />
          <Route
            path="preferences"
            element={
              <UserPreferencesPage
                profileTo="/espace/candidat/profil"
                preferencesTo="/espace/candidat/preferences"
              />
            }
          />
          <Route path="super" element={<SuperUpgradePage />} />
          <Route path="*" element={<Navigate to="/espace/candidat" replace />} />
        </Route>
      </Routes>
    </RequireAuth>
  );
}

export function MoniteurEspaceRoutes() {
  return (
    <RequireAuth role="moniteur">
      <Routes>
        <Route
          element={
            <ProAdminLayout
              role="moniteur"
              roleLabel="Moniteur"
              homeTo="/espace/moniteur"
              profileTo="/espace/moniteur/profil"
              preferencesTo="/espace/moniteur/preferences"
              title="Espace moniteur"
              navItems={[
                { to: "/espace/moniteur", label: "Accueil", end: true, icon: LayoutDashboard },
                { to: "/espace/moniteur/eleves", label: "Élèves", icon: Users },
                { to: "/espace/moniteur/planning", label: "Planning", icon: CalendarRange },
                { to: "/espace/moniteur/seances", label: "Séances", icon: CalendarDays },
                { to: "/espace/moniteur/profil", label: "Profil", icon: UserCircle },
              ]}
            />
          }
        >
          <Route index element={<MoniteurHome />} />
          <Route path="eleves" element={<MoniteurEleves />} />
          <Route path="eleves/:id" element={<MoniteurEleveDetail />} />
          <Route path="planning" element={<MoniteurPlanning />} />
          <Route path="seances" element={<MoniteurSeances />} />
          <Route path="profil" element={<MoniteurProfil />} />
          <Route
            path="preferences"
            element={
              <UserPreferencesPage
                profileTo="/espace/moniteur/profil"
                preferencesTo="/espace/moniteur/preferences"
              />
            }
          />
          <Route path="*" element={<Navigate to="/espace/moniteur" replace />} />
        </Route>
      </Routes>
    </RequireAuth>
  );
}

export function GerantEspaceRoutes() {
  return (
    <RequireAuth role="gerant">
      <Routes>
        <Route
          element={
            <ProAdminLayout
              role="gerant"
              roleLabel="Gérant"
              homeTo="/espace/gerant"
              profileTo="/espace/gerant/profil"
              preferencesTo="/espace/gerant/preferences"
              title="Espace gérant"
              navItems={[
                { to: "/espace/gerant", label: "Accueil", end: true, icon: LayoutDashboard },
                { to: "/espace/gerant/eleves", label: "Élèves", icon: Users },
                { to: "/espace/gerant/assigner", label: "Assigner", icon: ClipboardList },
                { to: "/espace/gerant/rapports", label: "Rapports", icon: BarChart3 },
                { to: "/espace/gerant/parametres", label: "École", icon: Settings },
                { to: "/espace/gerant/profil", label: "Profil", icon: UserCircle },
              ]}
            />
          }
        >
          <Route index element={<GerantHome />} />
          <Route path="eleves" element={<GerantElevesPage />} />
          <Route path="eleves/:id" element={<GerantEleveDetailPage />} />
          <Route path="assigner" element={<GerantAssignerPage />} />
          <Route path="rapports" element={<GerantRapportsPage />} />
          <Route path="parametres" element={<GerantParametresPage />} />
          <Route path="profil" element={<GerantProfil />} />
          <Route
            path="preferences"
            element={
              <UserPreferencesPage
                profileTo="/espace/gerant/profil"
                preferencesTo="/espace/gerant/preferences"
              />
            }
          />
          <Route path="forfaits" element={<Navigate to="/espace/gerant/assigner" replace />} />
          <Route path="inscriptions" element={<Navigate to="/espace/gerant/eleves" replace />} />
          <Route path="seances" element={<Navigate to="/espace/gerant/assigner" replace />} />
          <Route path="*" element={<Navigate to="/espace/gerant" replace />} />
        </Route>
      </Routes>
    </RequireAuth>
  );
}

export function AdminEspaceRoutes() {
  return (
    <RequireAuth role="admin">
      <Routes>
        <Route
          element={
            <ProAdminLayout
              role="admin"
              roleLabel="Administrateur"
              homeTo="/espace/admin"
              profileTo="/espace/admin/profil"
              preferencesTo="/espace/admin/preferences"
              title="Espace admin"
              navItems={[
                { to: "/espace/admin", label: "Accueil", end: true, icon: LayoutDashboard },
                { to: "/espace/admin/ecoles", label: "Écoles", icon: Building2 },
                { to: "/espace/admin/utilisateurs", label: "Users", icon: Users },
                { to: "/espace/admin/paiements", label: "Paiements", icon: CreditCard },
                { to: "/espace/admin/contenu", label: "Contenu", icon: BookOpen },
                { to: "/espace/admin/blog", label: "Blog", icon: Newspaper },
                { to: "/espace/admin/profil", label: "Profil", icon: UserCircle },
              ]}
            />
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="ecoles" element={<AdminSchools />} />
          <Route path="ecoles/:id" element={<AdminSchoolDetail />} />
          <Route path="auto-ecoles" element={<Navigate to="/espace/admin/ecoles" replace />} />
          <Route path="utilisateurs" element={<AdminUsers />} />
          <Route path="utilisateurs/nouveau" element={<AdminUserCreate />} />
          <Route path="utilisateurs/:id" element={<AdminUserDetail />} />
          <Route path="paiements" element={<AdminPayments />} />
          <Route path="paiements/:reference" element={<AdminPaymentDetail />} />
          <Route path="contenu" element={<AdminContent />} />
          <Route path="contenu/themes/nouveau" element={<AdminThemeForm />} />
          <Route path="contenu/themes/:id" element={<AdminThemeForm />} />
          <Route path="contenu/lecons/nouveau" element={<AdminLeconForm />} />
          <Route path="contenu/lecons/:id" element={<AdminLeconForm />} />
          <Route path="contenu/questions/nouveau" element={<AdminQuestionForm />} />
          <Route path="contenu/questions/:id" element={<AdminQuestionForm />} />
          <Route path="contenu/quiz/nouveau" element={<AdminQuizForm />} />
          <Route path="contenu/quiz/:id" element={<AdminQuizForm />} />
          <Route path="contenu/examens/nouveau" element={<AdminExamenForm />} />
          <Route path="contenu/examens/:id" element={<AdminExamenForm />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="blog/nouveau" element={<AdminBlogForm />} />
          <Route path="blog/:id" element={<AdminBlogForm />} />
          <Route path="profil" element={<AdminProfil />} />
          <Route
            path="preferences"
            element={
              <UserPreferencesPage
                profileTo="/espace/admin/profil"
                preferencesTo="/espace/admin/preferences"
              />
            }
          />
          <Route path="*" element={<Navigate to="/espace/admin" replace />} />
        </Route>
      </Routes>
    </RequireAuth>
  );
}
