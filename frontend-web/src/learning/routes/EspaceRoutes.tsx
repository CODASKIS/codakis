import { Navigate, Route, Routes } from "react-router";
import {
  BarChart3,
  Building2,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";
import RequireAuth from "../../auth/components/RequireAuth";
import { fetchGerantSchool } from "../../lib/authApi";
import ProAdminLayout from "../../dashboard/layout/ProAdminLayout";
import MoniteurHome from "../../dashboard/pages/moniteur/MoniteurHome";
import MoniteurEleves from "../../dashboard/pages/moniteur/MoniteurEleves";
import MoniteurPlanning from "../../dashboard/pages/moniteur/MoniteurPlanning";
import MoniteurSeances from "../../dashboard/pages/moniteur/MoniteurSeances";
import MoniteurProfil from "../../dashboard/pages/moniteur/MoniteurProfil";
import LearningShell from "../layout/LearningShell";
import SchoolsShell from "../layout/SchoolsShell";
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
import GerantElevesPage from "../pages/gerant/GerantElevesPage";
import GerantAssignerPage from "../pages/gerant/GerantAssignerPage";
import GerantRapportsPage from "../pages/gerant/GerantRapportsPage";
import GerantParametresPage from "../pages/gerant/GerantParametresPage";
import StaffProfilePage from "../pages/staff/StaffProfilePage";
import AdminHomePage from "../pages/admin/AdminHomePage";
import AdminSchoolsPage from "../pages/admin/AdminSchoolsPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminPaymentsPage from "../pages/admin/AdminPaymentsPage";

async function loadGerantSchoolTitle() {
  const school = await fetchGerantSchool();
  return school.raison_sociale;
}

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
          <Route path="planning" element={<MoniteurPlanning />} />
          <Route path="seances" element={<MoniteurSeances />} />
          <Route path="profil" element={<MoniteurProfil />} />
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
            <SchoolsShell
              role="gerant"
              roleLabel="Gérant auto-école"
              homeTo="/espace/gerant"
              loadTitle={loadGerantSchoolTitle}
              profileTo="/espace/gerant/profil"
              accent="#00a859"
              tabs={[
                { to: "/espace/gerant", label: "Élèves", end: true, icon: Users, color: "#00a859" },
                { to: "/espace/gerant/assigner", label: "Assigner", icon: ClipboardList, color: "#0ea5e9" },
                { to: "/espace/gerant/rapports", label: "Rapports", icon: BarChart3, color: "#f59e0b" },
                { to: "/espace/gerant/parametres", label: "École", icon: Settings, color: "#64748b" },
              ]}
            />
          }
        >
          <Route index element={<GerantElevesPage />} />
          <Route path="assigner" element={<GerantAssignerPage />} />
          <Route path="rapports" element={<GerantRapportsPage />} />
          <Route path="parametres" element={<GerantParametresPage />} />
          <Route
            path="profil"
            element={<StaffProfilePage homeLabel="Espace gérant" homeTo="/espace/gerant" />}
          />
          <Route path="forfaits" element={<Navigate to="/espace/gerant/assigner" replace />} />
          <Route path="inscriptions" element={<Navigate to="/espace/gerant" replace />} />
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
            <SchoolsShell
              role="admin"
              roleLabel="Administrateur"
              homeTo="/espace/admin"
              title="CODAKIS Admin"
              profileTo="/espace/admin/profil"
              accent="#00a859"
              tabs={[
                { to: "/espace/admin", label: "Accueil", end: true, icon: LayoutDashboard, color: "#00a859" },
                { to: "/espace/admin/ecoles", label: "Écoles", icon: Building2, color: "#f59e0b" },
                { to: "/espace/admin/utilisateurs", label: "Users", icon: Users, color: "#0ea5e9" },
                { to: "/espace/admin/paiements", label: "Paiements", icon: CreditCard, color: "#8b5cf6" },
              ]}
            />
          }
        >
          <Route index element={<AdminHomePage />} />
          <Route path="ecoles" element={<AdminSchoolsPage />} />
          <Route path="utilisateurs" element={<AdminUsersPage />} />
          <Route path="paiements" element={<AdminPaymentsPage />} />
          <Route
            path="profil"
            element={<StaffProfilePage homeLabel="Espace admin" homeTo="/espace/admin" />}
          />
          <Route path="*" element={<Navigate to="/espace/admin" replace />} />
        </Route>
      </Routes>
    </RequireAuth>
  );
}
