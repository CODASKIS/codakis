import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";
import Loader from "../../components/common/Loader";
import { getAccessToken } from "../../lib/authApi";
import { getSession, hydrateSessionFromApi } from "../authStore";
import type { UserRole } from "../types";

type RequireAuthProps = {
  role: UserRole;
  children: ReactNode;
};

export default function RequireAuth({ role, children }: RequireAuthProps) {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const token = getAccessToken();
      if (!token) {
        if (!cancelled) {
          setAllowed(false);
          setReady(true);
        }
        return;
      }

      let session = getSession();
      if (!session || !session.id) {
        session = (await hydrateSessionFromApi()) ?? null;
      }

      if (!cancelled) {
        setAllowed(session?.role === role);
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [role]);

  if (!ready) {
    return <Loader variant="page" />;
  }

  if (!allowed) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  }

  return children;
}
