import type { CandidatInscription } from "../lib/enrollmentsApi";
import { fetchCandidatInscriptions } from "../lib/enrollmentsApi";
import { fetchPublicSchool } from "../lib/publicSchoolsApi";
import type { CandidateEnrollment } from "./types";
import { getSession, setSession } from "./authStore";

function mapInscriptionToEnrollment(item: CandidatInscription, schoolCity?: string): CandidateEnrollment {
  const status =
    item.statut === "confirmee" ? "confirmed" : item.statut === "en_attente" ? "pending" : "none";
  return {
    schoolId: item.auto_ecole_id,
    schoolName: item.school_name,
    schoolCity,
    forfaitId: item.forfait_id ?? "",
    forfaitLabel: item.forfait_label,
    status,
    enrolledAt: item.enrolled_at?.slice(0, 10),
    paymentRef: item.payment_ref ?? undefined,
  };
}

/** Charge l'inscription active depuis l'API et met à jour la session locale. */
export async function syncCandidateEnrollmentFromApi(): Promise<CandidateEnrollment | null> {
  const session = getSession();
  if (!session || session.role !== "candidat") return null;

  try {
    const inscriptions = await fetchCandidatInscriptions();
    const active =
      inscriptions.find((item) => item.statut === "confirmee") ??
      inscriptions.find((item) => item.statut === "en_attente");

    if (!active) {
      const next = { ...session, enrollment: undefined };
      setSession(next);
      return null;
    }

    let schoolCity: string | undefined;
    try {
      const school = await fetchPublicSchool(active.auto_ecole_id);
      schoolCity = school.city || undefined;
    } catch {
      schoolCity = undefined;
    }

    const enrollment = mapInscriptionToEnrollment(active, schoolCity);
    const next = { ...session, enrollment };
    setSession(next);
    return enrollment;
  } catch {
    return session.enrollment ?? null;
  }
}

/**
 * @deprecated Préférer syncCandidateEnrollmentFromApi — conservé pour le flux paiement immédiat.
 */
export function initiateForfaitPurchase(
  schoolId: string,
  forfaitId: string,
  _lang: "fr" | "en" = "fr",
  schoolMeta?: { name: string; city?: string; forfaitLabel?: string },
): import("./types").AuthSession | null {
  const session = getSession();
  if (!session || session.role !== "candidat") return null;

  const enrollment: CandidateEnrollment = {
    schoolId,
    schoolName: schoolMeta?.name ?? "Auto-école",
    schoolCity: schoolMeta?.city,
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
  lang?: "fr" | "en";
};

/** Après paiement Mobile Money : synchronise l'inscription depuis le backend. */
export async function confirmForfaitPurchase(
  params: ConfirmForfaitPurchaseParams,
): Promise<import("./types").AuthSession | null> {
  const session = getSession();
  if (!session || session.role !== "candidat") return null;

  await syncCandidateEnrollmentFromApi();

  const updated = getSession();
  if (updated?.enrollment?.status === "confirmed") {
    return updated;
  }

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

export function getEnrollmentStatusLabelKey(status?: import("./types").EnrollmentStatus): string {
  switch (status) {
    case "confirmed":
      return "dashboard.enrollment.statusConfirmed";
    case "pending":
      return "dashboard.enrollment.statusPending";
    default:
      return "dashboard.enrollment.statusNone";
  }
}
