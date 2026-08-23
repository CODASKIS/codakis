import { useEffect, useState } from "react";
import { fetchServiceDomains, type ServiceDomainItem } from "../lib/directory-api";

export function useServiceDomains() {
  const [domains, setDomains] = useState<ServiceDomainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchServiceDomains()
      .then((data) => {
        if (!cancelled) setDomains(data);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Impossible de charger les domaines.");
          setDomains([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { domains, loading, error };
}
