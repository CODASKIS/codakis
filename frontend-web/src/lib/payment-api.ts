import { apiFetch } from "./api";
import { authFetch } from "./authApi";

export type InitiatePaymentPayload = {
  plan_id?: string;
  forfait_id?: string;
  auto_ecole_id?: string;
  payment_method?: "orange" | "mtn" | "moov";
  phone?: string;
  billing_period?: "monthly" | "yearly";
  purpose?: "subscription" | "escrow_deposit" | "certification" | "registration" | "enrollment";
};

export type InitiatePaymentResult = {
  reference: string;
  status: string;
  amount_fcfa: number;
  channel: string;
  message: string;
  ussd_hint: string | null;
  payment_url: string | null;
  payment_token: string | null;
  commission_fcfa?: number | null;
  school_payout_fcfa?: number | null;
  commission_rate_pct?: number | null;
  redirect_error?: string | null;
};

export type PaymentStatusResult = {
  reference: string;
  status: string;
  amount_fcfa: number;
  channel: string;
  message?: string | null;
};

type InitiateDto = {
  reference: string;
  status: string;
  amount_fcfa: number;
  channel: string;
  message: string;
  ussd_hint: string | null;
  payment_url: string | null;
  payment_token: string | null;
  commission_fcfa?: number | null;
  school_payout_fcfa?: number | null;
  commission_rate_pct?: number | null;
};

type StatusDto = {
  reference: string;
  status: string;
  amount_fcfa: number;
  channel: string;
  message?: string | null;
};

export type PaymentConfig = {
  provider: "sebpay" | "kpay" | "cinetpay" | "legacy";
  requires_phone: boolean;
  requires_redirect: boolean;
  sandbox: boolean;
  label: string;
};

export async function getPaymentConfig(): Promise<PaymentConfig> {
  return apiFetch<PaymentConfig>("/api/v1/payments/config");
}

export async function getPlanPricing(): Promise<PlanPricing> {
  return apiFetch<PlanPricing>("/api/v1/payments/plans/pricing");
}

export type PlanPricing = {
  essentiel: number;
  pro: number;
  premium: number;
  entreprise: number;
  essentiel_yearly: number;
  pro_yearly: number;
  premium_yearly?: number;
  entreprise_yearly: number;
  deposit_min_fcfa: number;
  certification_fee_fcfa: number;
  platform_commission_rate_pct?: number;
};

export type ClientSubscription = {
  plan_name: string;
  billing_label: string | null;
  status: string;
  expires_at: string;
  is_active: boolean;
  seconds_remaining: number;
  days_remaining: number;
  hours_remaining: number;
  minutes_remaining: number;
};

export type ClientInvoice = {
  reference: string;
  label: string;
  amount_fcfa: number;
  channel: string;
  status: string;
  paid_at: string;
  receipt_number?: string | null;
  payer_name?: string | null;
};

export async function getMySubscription(token: string): Promise<ClientSubscription | null> {
  return apiFetch<ClientSubscription | null>("/api/v1/payments/subscription/me", { token });
}

export async function getMyInvoices(token: string): Promise<ClientInvoice[]> {
  return apiFetch<ClientInvoice[]>("/api/v1/payments/invoices/me", { token });
}

export async function getMyReceipts(token: string): Promise<ClientInvoice[]> {
  return apiFetch<ClientInvoice[]>("/api/v1/payments/receipts/me", { token });
}

export async function getPaymentReceipt(token: string, reference: string): Promise<ClientInvoice> {
  return apiFetch<ClientInvoice>(`/api/v1/payments/${reference}/receipt`, { token });
}

export async function initiatePayment(
  token: string,
  payload: InitiatePaymentPayload,
): Promise<InitiatePaymentResult> {
  const data = await apiFetch<InitiateDto>("/api/v1/payments/initiate", {
    method: "POST",
    token,
    body: JSON.stringify({
      plan_id: payload.plan_id ?? null,
      forfait_id: payload.forfait_id ?? null,
      auto_ecole_id: payload.auto_ecole_id ?? null,
      payment_method: payload.payment_method ?? null,
      phone: payload.phone ?? null,
      billing_period: payload.billing_period ?? "monthly",
      purpose: payload.purpose ?? "subscription",
    }),
  });
  return data;
}

export async function confirmPayment(
  token: string,
  reference: string,
): Promise<PaymentStatusResult> {
  return apiFetch<StatusDto>(`/api/v1/payments/${reference}/confirm`, {
    method: "POST",
    token,
  });
}

export async function getPaymentStatus(
  token: string,
  reference: string,
): Promise<PaymentStatusResult> {
  return apiFetch<StatusDto>(`/api/v1/payments/${reference}/status`, { token });
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Confirme un paiement sandbox avec retries (statut parfois retardé au retour). */
export async function confirmPaymentWithRetry(
  token: string,
  reference: string,
  attempts = 8,
  delayMs = 2000,
): Promise<PaymentStatusResult> {
  let lastError: Error | null = null;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const status = await getPaymentStatus(token, reference).catch(() => null);
      if (status?.status === "failed") {
        throw new Error(
          status.message ||
            "Le paiement a échoué ou a été annulé. Vérifiez votre solde Mobile Money.",
        );
      }
      return await confirmPayment(token, reference);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Confirmation impossible");
      const status = await getPaymentStatus(token, reference).catch(() => null);
      if (status?.status === "completed") {
        return status;
      }
      if (status?.status === "failed") {
        throw new Error(
          status.message ||
            "Le paiement a échoué ou a été annulé. Vérifiez votre solde Mobile Money.",
        );
      }
      if (i < attempts - 1) {
        await sleep(delayMs);
      }
    }
  }
  throw lastError ?? new Error("Confirmation impossible");
}

export type AdminPaymentStats = {
  total_volume_fcfa: number;
  completed_count: number;
  pending_count: number;
  failed_count: number;
  enrollment_count: number;
  subscription_count: number;
  commission_total_fcfa?: number;
};

export type AdminPaymentItem = {
  reference: string;
  status: string;
  purpose: string;
  plan_id: string | null;
  amount_fcfa: number;
  channel: string;
  phone?: string;
  message: string | null;
  receipt_number: string | null;
  payer_name: string | null;
  payer_email: string | null;
  school_name: string | null;
  forfait_label: string | null;
  context_label: string;
  commission_fcfa?: number | null;
  school_payout_fcfa?: number | null;
  commission_rate_pct?: number | null;
  created_at: string;
  completed_at: string | null;
  inscription_id: string | null;
};

export async function fetchAdminPaymentStats(): Promise<AdminPaymentStats> {
  return authFetch<AdminPaymentStats>("/api/v1/admin/payments/stats");
}

export async function fetchAdminPayments(params?: {
  status?: string;
  purpose?: string;
  limit?: number;
}): Promise<AdminPaymentItem[]> {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.purpose) search.set("purpose", params.purpose);
  if (params?.limit) search.set("limit", String(params.limit));
  const query = search.toString();
  return authFetch<AdminPaymentItem[]>(`/api/v1/admin/payments${query ? `?${query}` : ""}`);
}
