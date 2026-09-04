import { Navigate, Route, Routes } from "react-router";
import RequireAuth from "../../auth/components/RequireAuth";
import LearningShell from "../layout/LearningShell";
import WorkspaceShell from "../layout/WorkspaceShell";
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
import MoniteurHomePage from "../pages/moniteur/MoniteurHomePage";
import MoniteurSeancesPage from "../pages/moniteur/MoniteurSeancesPage";
import GerantHomePage from "../pages/gerant/GerantHomePage";
import GerantForfaitsPage from "../pages/gerant/GerantForfaitsPage";
import GerantInscriptionsPage from "../pages/gerant/GerantInscriptionsPage";
import GerantSeancesPage from "../pages/gerant/GerantSeancesPage";

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
            <WorkspaceShell
              title="Moniteur"
              homeTo="/espace/moniteur"
              links={[
                { to: "/espace/moniteur", label: "Accueil", end: true },
                { to: "/espace/moniteur/seances", label: "Séances" },
              ]}
            />
          }
        >
          <Route index element={<MoniteurHomePage />} />
          <Route path="seances" element={<MoniteurSeancesPage />} />
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
            <WorkspaceShell
              title="Gérant"
              homeTo="/espace/gerant"
              links={[
                { to: "/espace/gerant", label: "Accueil", end: true },
                { to: "/espace/gerant/forfaits", label: "Forfaits" },
                { to: "/espace/gerant/inscriptions", label: "Inscriptions" },
                { to: "/espace/gerant/seances", label: "Séances" },
              ]}
            />
          }
        >
          <Route index element={<GerantHomePage />} />
          <Route path="forfaits" element={<GerantForfaitsPage />} />
          <Route path="inscriptions" element={<GerantInscriptionsPage />} />
          <Route path="seances" element={<GerantSeancesPage />} />
          <Route path="*" element={<Navigate to="/espace/gerant" replace />} />
        </Route>
      </Routes>
    </RequireAuth>
  );
}
