import { useCallback, useEffect, useState } from "react";
import type { DrivingSchool } from "../../data/mockDrivingSchools";
import { syncCandidateEnrollmentFromApi } from "../../auth/candidateEnrollment";
import { fetchCandidatInscriptions, type CandidatInscription } from "../../lib/enrollmentsApi";
import { fetchPublicSchool, mapPublicSchoolToDrivingSchool } from "../../lib/publicSchoolsApi";

type UseCandidateEnrollmentState = {
  inscription: CandidatInscription | null;
  school: DrivingSchool | null;
  loading: boolean;
  error: string;
  enrolled: boolean;
  reload: () => Promise<void>;
};

export function useCandidateEnrollment(): UseCandidateEnrollmentState {
  const [inscription, setInscription] = useState<CandidatInscription | null>(null);
  const [school, setSchool] = useState<DrivingSchool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await syncCandidateEnrollmentFromApi();
      const inscriptions = await fetchCandidatInscriptions();
      const active =
        inscriptions.find((item) => item.statut === "confirmee") ??
        inscriptions.find((item) => item.statut === "en_attente") ??
        null;
      setInscription(active);
      if (active) {
        const detail = await fetchPublicSchool(active.auto_ecole_id);
        setSchool(mapPublicSchoolToDrivingSchool(detail, detail.forfaits));
      } else {
        setSchool(null);
      }
    } catch (err) {
      setInscription(null);
      setSchool(null);
      setError(err instanceof Error ? err.message : "load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    inscription,
    school,
    loading,
    error,
    enrolled: inscription?.statut === "confirmee",
    reload,
  };
}
