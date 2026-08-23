import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";
import { getSession } from "../authStore";
import type { UserRole } from "../types";

type RequireAuthProps = {
  role: UserRole;
  children: ReactNode;
};

export default function RequireAuth({ role, children }: RequireAuthProps) {
  const location = useLocation();
  const session = getSession();

  if (!session || session.role !== role) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  }

  return children;
}
