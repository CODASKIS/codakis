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

export type AuthSession = {
  role: UserRole;
  email: string;
  name: string;
  phone?: string;
  city?: string;
  /** Abonnement CODAKIS candidat — mock jusqu'au backend. */
  plan?: SubscriptionPlan;
  /** Rattachement auto-école — obligatoire pour conduite / dossier complet (CDC). */
  enrollment?: CandidateEnrollment;
};

export type AuthCredentials = {
  username: string;
  password: string;
  language?: string;
};

export type RegisterPayload = AuthCredentials & {
  fullName: string;
  phone?: string;
  city?: string;
  country?: string;
  schoolName?: string;
};
