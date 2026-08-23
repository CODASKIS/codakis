import { MOCK_DRIVING_SCHOOLS } from "../data/mockDrivingSchools";
import type { AuthSession, CandidateEnrollment, EnrollmentStatus } from "./types";
import { getSession, setSession } from "./authStore";

type ForfaitLang = "fr" | "en";

function findSchool(schoolId: string) {
  return MOCK_DRIVING_SCHOOLS.find((s) => s.id === schoolId) ?? null;
}

function findForfait(schoolId: string, forfaitId: string) {
  const school = findSchool(schoolId);
  if (!school) return null;
  const all = [
    ...school.forfaits.codeSeul,
    ...school.forfaits.conduiteSeule,
    ...school.forfaits.complet,
  ];
  return all.find((f) => f.id === forfaitId) ?? null;
}

/**
 * CDC CU-03 / Algo 11 — l'auto-école est rattachée au candidat
 * uniquement après achat d'un forfait (Mobile Money confirmé), pas en amont.
 */
export function confirmForfaitPurchase(
  schoolId: string,
  forfaitId: string,
  lang: ForfaitLang = "fr",
): AuthSession | null {
  const session = getSession();
  if (!session || session.role !== "candidat") return null;

  const school = findSchool(schoolId);
  const forfait = findForfait(schoolId, forfaitId);
  if (!school || !forfait) return null;

  const enrollment: CandidateEnrollment = {
    schoolId: school.id,
    schoolName: school.name,
    schoolCity: school.city,
    forfaitId: forfait.id,
    forfaitLabel: forfait.label[lang],
    status: "confirmed",
    enrolledAt: new Date().toISOString().slice(0, 10),
    paymentRef: `MM-${Date.now().toString(36).toUpperCase()}`,
  };

  const next = { ...session, enrollment };
  setSession(next);
  return next;
}

export function getCandidateEnrollment(): CandidateEnrollment | null {
  const session = getSession();
  if (session?.role !== "candidat") return null;
  const enrollment = session.enrollment;
  if (!enrollment || enrollment.status === "none" || !enrollment.schoolId) return null;
  return enrollment;
}

export function isCandidateEnrolled(): boolean {
  return getCandidateEnrollment()?.status === "confirmed";
}

export function hasPendingForfaitPayment(): boolean {
  const session = getSession();
  return session?.role === "candidat" && session.enrollment?.status === "pending";
}

export function getEnrolledSchool() {
  const enrollment = getCandidateEnrollment();
  if (!enrollment?.schoolId) return null;
  return findSchool(enrollment.schoolId);
}

export function getEnrollmentStatusLabelKey(status?: EnrollmentStatus): string {
  switch (status) {
    case "confirmed":
      return "dashboard.enrollment.statusConfirmed";
    case "pending":
      return "dashboard.enrollment.statusPending";
    default:
      return "dashboard.enrollment.statusNone";
  }
}
