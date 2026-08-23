import type { Creneau } from "../../../lib/schedulingApi";
import type { CandidatSeance, MoniteurSeance } from "../../../lib/enrollmentsApi";

export const CALENDAR_START_HOUR = 7;
export const CALENDAR_END_HOUR = 20;
export const CALENDAR_HOUR_HEIGHT = 58;

export type CalendarEventKind = "seance" | "creneau";

export type CalendarEvent = {
  id: string;
  kind: CalendarEventKind;
  starts_at: string;
  ends_at: string;
  title: string;
  subtitle?: string;
  status: string;
  lieu?: string | null;
  raw: MoniteurSeance | CandidatSeance | Creneau;
};

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + index);
    day.setHours(0, 0, 0, 0);
    return day;
  });
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatTimeShort(value: string | Date, locale: string): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

export function formatDayHeader(day: Date, locale: string): { weekday: string; date: string; isToday: boolean } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return {
    weekday: day.toLocaleDateString(locale, { weekday: "short" }),
    date: day.toLocaleDateString(locale, { day: "numeric", month: "short" }),
    isToday: isSameDay(day, today),
  };
}

export function getEventStyle(startsAt: string, endsAt: string): { top: number; height: number } {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const gridStart = CALENDAR_START_HOUR * 60;
  const gridEnd = CALENDAR_END_HOUR * 60;
  const clampedStart = Math.max(startMinutes, gridStart);
  const clampedEnd = Math.min(Math.max(endMinutes, clampedStart + 30), gridEnd);
  const top = ((clampedStart - gridStart) / 60) * CALENDAR_HOUR_HEIGHT;
  const height = Math.max(((clampedEnd - clampedStart) / 60) * CALENDAR_HOUR_HEIGHT, 28);
  return { top, height };
}

export function slotToDatetimeLocal(day: Date, hour: number, minute = 0): string {
  const value = new Date(day);
  value.setHours(hour, minute, 0, 0);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(hour)}:${pad(minute)}`;
}

export function seanceToCalendarEvent(seance: MoniteurSeance): CalendarEvent {
  return {
    id: seance.id,
    kind: "seance",
    starts_at: seance.starts_at,
    ends_at: seance.ends_at,
    title: seance.candidat_name,
    subtitle: seance.forfait_label ?? undefined,
    status: seance.statut,
    lieu: seance.lieu,
    raw: seance,
  };
}

export function creneauToCalendarEvent(creneau: Creneau): CalendarEvent {
  const candidates = creneau.candidats.map((item) => item.candidat_name).join(", ");
  return {
    id: creneau.id,
    kind: "creneau",
    starts_at: creneau.starts_at,
    ends_at: creneau.ends_at,
    title:
      candidates ||
      `${creneau.places_prises}/${creneau.capacite_max}`,
    subtitle: creneau.lieu ?? undefined,
    status: creneau.statut,
    lieu: creneau.lieu,
    raw: creneau,
  };
}

export function eventStatusClass(kind: CalendarEventKind, status: string): string {
  if (kind === "seance") {
    if (status === "confirmee" || status === "terminee") return "is-success";
    if (status === "annulee") return "is-danger";
    return "is-warning";
  }
  if (status === "ouvert") return "is-open";
  if (status === "complet") return "is-full";
  if (status === "annule") return "is-danger";
  return "is-muted";
}

export function calendarHours(): number[] {
  return Array.from({ length: CALENDAR_END_HOUR - CALENDAR_START_HOUR }, (_, index) => CALENDAR_START_HOUR + index);
}

export const CALENDAR_SNAP_MINUTES = 15;

export function getEventDurationMinutes(startsAt: string, endsAt: string): number {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  return Math.max(30, Math.round((end.getTime() - start.getTime()) / 60_000));
}

export function topToMinutes(top: number): number {
  const minutesFromGridStart = (top / CALENDAR_HOUR_HEIGHT) * 60;
  const totalMinutes = CALENDAR_START_HOUR * 60 + minutesFromGridStart;
  const snapped = Math.round(totalMinutes / CALENDAR_SNAP_MINUTES) * CALENDAR_SNAP_MINUTES;
  const gridStart = CALENDAR_START_HOUR * 60;
  const gridEnd = CALENDAR_END_HOUR * 60 - CALENDAR_SNAP_MINUTES;
  return Math.min(Math.max(snapped, gridStart), gridEnd);
}

export function minutesToTop(totalMinutes: number): number {
  const gridStart = CALENDAR_START_HOUR * 60;
  return ((totalMinutes - gridStart) / 60) * CALENDAR_HOUR_HEIGHT;
}

export function buildDatetimeFromDayAndMinutes(day: Date, totalMinutes: number): Date {
  const value = new Date(day);
  value.setHours(Math.floor(totalMinutes / 60), totalMinutes % 60, 0, 0);
  return value;
}

export function isEventDraggable(event: CalendarEvent): boolean {
  if (event.kind === "creneau") {
    return event.status !== "annule";
  }
  return event.status === "planifiee" || event.status === "confirmee";
}
