export type UserRole = "admin" | "candidat" | "moniteur" | "gerant";

export type SubscriptionPlan = "free" | "premium";

export type EnrollmentStatus = "none" | "pending" | "confirmed";

/** Inscription à une auto-école — issue d'un achat de forfait (CDC CU-03), pas d'un choix séparé. */
export type CandidateEnrollment = {
  schoolId: string;
  schoolName: string;
  schoolCity?: string;
  forfaitId: string;
  forfaitLabel: string;
  status: EnrollmentStatus;
  enrolledAt?: string;
  /** Référence transaction Mobile Money mock */
  paymentRef?: string;
};

export type GerantSchoolProfile = {
  name: string;
  address?: string;
  mintRegistration?: string;
  country?: string;
  legalName?: string;
  rccm?: string;
  website?: string;
  description?: string;
  managerRole?: string;
  instructorCount?: string;
  vehicleCount?: string;
  yearsOperating?: string;
  validated?: boolean;
};

export type AuthSession = {
  id?: string;
  role: UserRole;
  email: string;
  name: string;
  phone?: string;
  city?: string;
  avatarUrl?: string;
  /** Abonnement CODAKIS candidat — mock jusqu'au backend. */
  plan?: SubscriptionPlan;
  /** Rattachement auto-école — obligatoire pour conduite / dossier complet (CDC). */
  enrollment?: CandidateEnrollment;
  /** Profil établissement — gérant auto-école inscrit sur CODAKIS. */
  school?: GerantSchoolProfile;
};

export type AuthCredentials = {
  username: string;
  password: string;
  language?: string;
};

export type TypePermis = "B" | "A" | "A1" | "C" | "D" | "BE";
export type ParcoursSouhaite = "code" | "conduite" | "complet";

export type RegisterPayload = AuthCredentials & {
  fullName: string;
  phone?: string;
  city?: string;
  country?: string;
  typePermis?: TypePermis;
  parcoursSouhaite?: ParcoursSouhaite;
  schoolName?: string;
  schoolAddress?: string;
  mintRegistration?: string;
  legalName?: string;
  rccm?: string;
  website?: string;
  description?: string;
  managerRole?: string;
  instructorCount?: string;
  vehicleCount?: string;
  yearsOperating?: string;
};
