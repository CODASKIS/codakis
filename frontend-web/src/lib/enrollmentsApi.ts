import { authFetch, AuthApiError } from "./authApi";

export type GerantInscription = {
  id: string;
  candidat_id: string;
  candidat_name: string;
  candidat_email: string;
  candidat_phone: string | null;
  forfait_id: string | null;
  forfait_type: string;
  forfait_label: string;
  statut: string;
  payment_ref: string | null;
  heures_conduite_total: number;
  heures_conduite_restantes: number;
  enrolled_at: string;
  seances_count: number;
};

export type SeancePratique = {
  id: string;
  inscription_id: string;
  candidat_id: string;
  moniteur_id: string | null;
  moniteur_name: string | null;
  starts_at: string;
  ends_at: string;
  statut: string;
  lieu: string | null;
  notes: string | null;
};

export type CandidatSeance = SeancePratique & {
  school_name: string | null;
  forfait_label: string | null;
};

export type MoniteurSeance = SeancePratique & {
  candidat_name: string;
  candidat_phone: string | null;
  forfait_label: string | null;
  school_name: string | null;
};

export type CandidatInscription = GerantInscription & {
  school_name: string;
  auto_ecole_id: string;
  seances?: SeancePratique[];
};

export type SchoolForfaitType = "code_seul" | "conduite_seule" | "complet";

export type GerantForfait = {
  id: string;
  type: SchoolForfaitType;
  label_fr: string;
  label_en: string;
  prix: number;
  heures_conduite: number | null;
  description_fr: string | null;
  description_en: string | null;
  est_actif: boolean;
  auto_ecole_id: string;
};

export { AuthApiError };

export async function fetchGerantForfaits(): Promise<GerantForfait[]> {
  return authFetch<GerantForfait[]>("/api/v1/gerant/forfaits");
}

export async function createGerantForfait(payload: {
  type: SchoolForfaitType;
  label_fr: string;
  label_en: string;
  prix: number;
  heures_conduite?: number | null;
  description_fr?: string;
  description_en?: string;
  est_actif?: boolean;
}): Promise<GerantForfait> {
  return authFetch<GerantForfait>("/api/v1/gerant/forfaits", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateGerantForfait(
  id: string,
  payload: Partial<{
    type: SchoolForfaitType;
    label_fr: string;
    label_en: string;
    prix: number;
    heures_conduite: number | null;
    description_fr: string;
    description_en: string;
    est_actif: boolean;
  }>,
): Promise<GerantForfait> {
  return authFetch<GerantForfait>(`/api/v1/gerant/forfaits/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteGerantForfait(id: string): Promise<void> {
  await authFetch<void>(`/api/v1/gerant/forfaits/${id}`, { method: "DELETE" });
}

export async function fetchGerantInscriptions(): Promise<GerantInscription[]> {
  return authFetch<GerantInscription[]>("/api/v1/gerant/inscriptions");
}

export async function fetchGerantInscription(id: string): Promise<GerantInscriptionDetail> {
  return authFetch<GerantInscriptionDetail>(`/api/v1/gerant/inscriptions/${id}`);
}

export async function createGerantSeance(payload: {
  inscription_id: string;
  moniteur_id?: string | null;
  starts_at: string;
  duration_minutes?: number;
  lieu?: string;
  notes?: string;
}): Promise<SeancePratique> {
  return authFetch<SeancePratique>("/api/v1/gerant/seances", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateGerantSeance(
  id: string,
  payload: Partial<{
    moniteur_id: string | null;
    starts_at: string;
    duration_minutes: number;
    statut: string;
    lieu: string;
    notes: string;
  }>,
): Promise<SeancePratique> {
  return authFetch<SeancePratique>(`/api/v1/gerant/seances/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export type GerantInscriptionDetail = GerantInscription & {
  seances: SeancePratique[];
};

export async function fetchCandidatSeances(): Promise<CandidatSeance[]> {
  return authFetch<CandidatSeance[]>("/api/v1/candidat/seances");
}

export async function fetchCandidatInscriptions(): Promise<CandidatInscription[]> {
  return authFetch<CandidatInscription[]>("/api/v1/candidat/inscriptions");
}

export async function fetchCandidatInscription(id: string): Promise<CandidatInscription & { seances: SeancePratique[] }> {
  return authFetch(`/api/v1/candidat/inscriptions/${id}`);
}

export async function fetchMoniteurSeances(): Promise<MoniteurSeance[]> {
  return authFetch<MoniteurSeance[]>("/api/v1/moniteur/seances");
}

export async function updateMoniteurSeance(
  id: string,
  payload: { statut?: string; starts_at?: string; duration_minutes?: number },
): Promise<MoniteurSeance> {
  return authFetch<MoniteurSeance>(`/api/v1/moniteur/seances/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function createCandidatInscription(payload: {
  auto_ecole_id: string;
  forfait_id: string;
  payment_ref?: string;
}): Promise<GerantInscription> {
  return authFetch<GerantInscription>("/api/v1/candidat/inscriptions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
