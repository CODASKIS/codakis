import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";
import Loader from "../../components/common/Loader";
import { getAccessToken } from "../../lib/authApi";
import { hydrateSessionFromApi } from "../authStore";
import type { UserRole } from "../types";
import { buildLoginUrl } from "../purchaseIntent";

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

      // Toujours vérifier le token auprès de l’API (lien e-mail, nouvel onglet, etc.)
      const session = await hydrateSessionFromApi();

      if (!cancelled) {
        setAllowed(session?.role === role);
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [role, location.pathname, location.search]);

  if (!ready) {
    return <Loader variant="page" />;
  }

  if (!allowed) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={buildLoginUrl(returnTo)} replace />;
  }

  return children;
}
