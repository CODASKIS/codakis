import type { MoniteurSeance } from "../../../lib/enrollmentsApi";

export type StudentGroup = {
  id: string;
  name: string;
  phone: string | null;
  seances: MoniteurSeance[];
};

export function groupStudents(items: MoniteurSeance[]): StudentGroup[] {
  const map = new Map<string, StudentGroup>();
  for (const item of items) {
    const entry = map.get(item.candidat_id) ?? {
      id: item.candidat_id,
      name: item.candidat_name,
      phone: item.candidat_phone,
      seances: [],
    };
    entry.seances.push(item);
    map.set(item.candidat_id, entry);
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

export function hoursBetween(start: string, end: string): number {
  const ms = +new Date(end) - +new Date(start);
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return ms / 3_600_000;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function statusBadgeColor(statut: string): "primary" | "success" | "warning" | "light" {
  if (statut === "terminee") return "success";
  if (statut === "planifiee") return "primary";
  return "warning";
}

export function eventClassName(statut: string): string {
  if (statut === "terminee") return "ta-event--terminee";
  if (statut === "planifiee") return "ta-event--planifiee";
  return "ta-event--other";
}
