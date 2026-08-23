import { useEffect, useState } from "react";
import {
  fetchDirectoryTechnicians,
  fetchServiceDomains,
  type DirectoryTechnicianItem,
  type ServiceDomainItem,
} from "../lib/directory-api";
import {
  buildDomainEntries,
  mapDirectoryTechnician,
  type CertifiedTechnician,
  type DomainEntry,
} from "../client/types/clientTechnician";

type UseDirectoryDataOptions = {
  domain_code?: string;
  city_id?: string;
  q?: string;
  limit?: number;
  /** When false, only service domains are loaded (technicians stay empty). */
  loadTechnicians?: boolean;
};

export function useDirectoryData(options: UseDirectoryDataOptions = {}) {
  const { domain_code, city_id, q, limit, loadTechnicians = true } = options;
  const [domains, setDomains] = useState<ServiceDomainItem[]>([]);
  const [technicians, setTechnicians] = useState<CertifiedTechnician[]>([]);
  const [domainEntries, setDomainEntries] = useState<DomainEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const domainRows = await fetchServiceDomains();
        const technicianRows = loadTechnicians
          ? await fetchDirectoryTechnicians({ domain_code, city_id, q, limit })
          : [];
        if (cancelled) return;
        const mapped = technicianRows.map(mapDirectoryTechnician);
        setDomains(domainRows);
        setTechnicians(mapped);
        setDomainEntries(buildDomainEntries(domainRows, mapped));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Chargement impossible");
          setDomains([]);
          setTechnicians([]);
          setDomainEntries([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [domain_code, city_id, q, limit, loadTechnicians]);

  return { domains, technicians, domainEntries, loading, error };
}

export type { CertifiedTechnician, DomainEntry, DirectoryTechnicianItem, ServiceDomainItem };
