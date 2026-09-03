import { Navigate, useRoutes } from "react-router";
import LoginPage from "../auth/pages/LoginPage";
import RegisterPage from "../auth/pages/RegisterPage";
import ForgotPasswordPage from "../auth/pages/ForgotPasswordPage";

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
