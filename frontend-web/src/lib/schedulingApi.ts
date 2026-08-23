import { authFetch, AuthApiError } from "./authApi";
import type { MoniteurSeance, SeancePratique } from "./enrollmentsApi";

export { AuthApiError };

export type CreneauCandidat = {
  candidat_id: string;
  candidat_name: string;
  seance_id: string;
};

export type Creneau = {
  id: string;
  moniteur_id: string;
  auto_ecole_id: string;
  starts_at: string;
  ends_at: string;
  capacite_max: number;
  places_prises: number;
  places_libres: number;
  statut: string;
  lieu: string | null;
  notes: string | null;
  candidats: CreneauCandidat[];
};

export type MoniteurEleve = {
  candidat_id: string;
  candidat_name: string;
  candidat_email: string;
  candidat_phone: string | null;
  forfait_label: string;
  heures_restantes: number;
  heures_total: number;
  seances_count: number;
  next_seance_at: string | null;
};

export type WeeklyPlanning = {
  week_start: string;
  week_end: string;
  max_seances_semaine: number;
  seances_semaine: number;
  heures_semaine: number;
  seances: MoniteurSeance[];
  creneaux: Creneau[];
};

export type NotificationItem = {
  id: string;
  type: string;
  title_fr: string;
  title_en: string;
  body_fr: string;
  body_en: string;
  payload: Record<string, unknown> | null;
  lu: boolean;
  created_at: string;
};

export type MoniteurLimits = {
  max_seances_semaine: number;
  capacite_creneau: number;
};

export function getWeekStart(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatWeekParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function shiftWeek(date: Date, deltaWeeks: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + deltaWeeks * 7);
  return next;
}

export async function fetchMoniteurEleves(): Promise<MoniteurEleve[]> {
  return authFetch<MoniteurEleve[]>("/api/v1/moniteur/eleves");
}

export async function fetchMoniteurCreneaux(week?: string): Promise<Creneau[]> {
  const query = week ? `?week=${encodeURIComponent(week)}` : "";
  return authFetch<Creneau[]>(`/api/v1/moniteur/creneaux${query}`);
}

export async function createMoniteurCreneau(payload: {
  starts_at: string;
  duration_minutes?: number;
  capacite_max?: number;
  lieu?: string;
  notes?: string;
}): Promise<Creneau> {
  return authFetch<Creneau>("/api/v1/moniteur/creneaux", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteMoniteurCreneau(id: string): Promise<void> {
  await authFetch<void>(`/api/v1/moniteur/creneaux/${id}`, { method: "DELETE" });
}

export async function updateMoniteurCreneau(
  id: string,
  payload: {
    starts_at?: string;
    duration_minutes?: number;
    lieu?: string;
    notes?: string;
  },
): Promise<Creneau> {
  return authFetch<Creneau>(`/api/v1/moniteur/creneaux/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function fetchMoniteurWeeklyPlanning(week?: string): Promise<WeeklyPlanning> {
  const query = week ? `?week=${encodeURIComponent(week)}` : "";
  return authFetch<WeeklyPlanning>(`/api/v1/moniteur/planning/semaine${query}`);
}

export async function fetchGerantMoniteurCreneaux(moniteurId: string, week?: string): Promise<Creneau[]> {
  const query = week ? `?week=${encodeURIComponent(week)}` : "";
  return authFetch<Creneau[]>(`/api/v1/gerant/moniteurs/${moniteurId}/creneaux${query}`);
}

export async function assignGerantCreneau(payload: {
  creneau_id: string;
  inscription_id: string;
}): Promise<SeancePratique> {
  return authFetch<SeancePratique>("/api/v1/gerant/seances/assign-creneau", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateGerantMoniteurLimits(
  moniteurId: string,
  payload: Partial<{ max_seances_semaine: number; capacite_creneau: number }>,
): Promise<MoniteurLimits> {
  return authFetch<MoniteurLimits>(`/api/v1/gerant/moniteurs/${moniteurId}/limits`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function fetchNotifications(unreadOnly = false): Promise<NotificationItem[]> {
  const query = unreadOnly ? "?unread_only=true" : "";
  return authFetch<NotificationItem[]>(`/api/v1/notifications${query}`);
}

export async function markNotificationRead(id: string): Promise<void> {
  await authFetch<void>(`/api/v1/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllNotificationsRead(): Promise<void> {
  await authFetch<void>("/api/v1/notifications/read-all", { method: "POST" });
}
