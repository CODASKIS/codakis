import type { SchoolForfaitType } from "../data/mockDrivingSchools";
import { MOCK_DRIVING_SCHOOLS } from "../data/mockDrivingSchools";
import type { AuthSession, CandidateEnrollment, EnrollmentStatus } from "./types";
import { getSession, setSession } from "./authStore";

type ForfaitLang = "fr" | "en";

function findSchool(schoolId: string) {
  return MOCK_DRIVING_SCHOOLS.find((s) => s.id === schoolId) ?? null;
}

/**
 * CDC CU-03 — démarre un achat forfait (statut pending) avant confirmation Mobile Money.
 */
export function initiateForfaitPurchase(
  schoolId: string,
  forfaitId: string,
  _lang: ForfaitLang = "fr",
  schoolMeta?: { name: string; city?: string; forfaitLabel?: string },
): AuthSession | null {
  const session = getSession();
  if (!session || session.role !== "candidat") return null;

  const school = findSchool(schoolId);
  const enrollment: CandidateEnrollment = {
    schoolId,
    schoolName: schoolMeta?.name ?? school?.name ?? "Auto-école",
    schoolCity: schoolMeta?.city ?? school?.city,
    forfaitId,
    forfaitLabel: schoolMeta?.forfaitLabel ?? forfaitId,
    status: "pending",
  };

  const next = { ...session, enrollment };
  setSession(next);
  return next;
}

export type ConfirmForfaitPurchaseParams = {
  schoolId: string;
  schoolName: string;
  schoolCity?: string;
  forfaitId: string;
  forfaitLabel: string;
  paymentRef: string;
  lang?: ForfaitLang;
  packType?: SchoolForfaitType;
};

/**
 * CDC CU-03 / Algo 11 — l'auto-école est rattachée au candidat
 * uniquement après achat d'un forfait (Mobile Money confirmé), pas en amont.
 * L'inscription API est créée côté backend lors de la confirmation du paiement.
 */
export async function confirmForfaitPurchase(
  params: ConfirmForfaitPurchaseParams,
): Promise<AuthSession | null> {
  const session = getSession();
  if (!session || session.role !== "candidat") return null;

  const enrollment: CandidateEnrollment = {
    schoolId: params.schoolId,
    schoolName: params.schoolName,
    schoolCity: params.schoolCity,
    forfaitId: params.forfaitId,
    forfaitLabel: params.forfaitLabel,
    status: "confirmed",
    enrolledAt: new Date().toISOString().slice(0, 10),
    paymentRef: params.paymentRef,
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
