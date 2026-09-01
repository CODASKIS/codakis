from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class PaymentConfigResponse(BaseModel):
    provider: str = "legacy"
    requires_phone: bool = True
    requires_redirect: bool = False
    sandbox: bool = True
    label: str = "Mobile Money (sandbox CODAKIS)"


class InitiatePaymentRequest(BaseModel):
    plan_id: str | None = None
    forfait_id: UUID | None = None
    auto_ecole_id: UUID | None = None
    payment_method: str = Field(default="orange", pattern="^(orange|mtn|moov)$")
    phone: str = Field(default="", max_length=15)
    billing_period: str = "monthly"
    purpose: str = "subscription"


class PaymentInitiateResponse(BaseModel):
    reference: str
    status: str
    amount_fcfa: int
    channel: str
    message: str
    ussd_hint: str | None = None
    payment_url: str | None = None
    payment_token: str | None = None
    commission_fcfa: int | None = None
    school_payout_fcfa: int | None = None
    commission_rate_pct: int | None = None


class PaymentStatusResponse(BaseModel):
    reference: str
    status: str
    amount_fcfa: int
    channel: str
    message: str | None = None
    receipt_number: str | None = None
    inscription_id: UUID | None = None


class ClientInvoiceResponse(BaseModel):
    reference: str
    label: str
    amount_fcfa: int
    channel: str
    status: str
    paid_at: datetime
    receipt_number: str | None = None
    payer_name: str | None = None


class PlanPricingResponse(BaseModel):
    essentiel: int = 0
    pro: int = 5000
    premium: int = 15000
    entreprise: int = 15000
    essentiel_yearly: int = 0
    pro_yearly: int = 50000
    premium_yearly: int = 150000
    entreprise_yearly: int = 150000
    deposit_min_fcfa: int = 10000
    certification_fee_fcfa: int = 25000
    platform_commission_rate_pct: int = 10


class ClientSubscriptionResponse(BaseModel):
    plan_id: str | None = None
    plan_name: str
    billing_label: str | None = None
    status: str
    expires_at: str
    is_active: bool
    seconds_remaining: int
    days_remaining: int
    hours_remaining: int
    minutes_remaining: int
    payment_reference: str | None = None
    receipt_number: str | None = None


class AdminPaymentStatsResponse(BaseModel):
    total_volume_fcfa: int
    completed_count: int
    pending_count: int
    failed_count: int
    enrollment_count: int
    subscription_count: int
    commission_total_fcfa: int = 0


class AdminPaymentItem(BaseModel):
    reference: str
    status: str
    purpose: str
    plan_id: str | None = None
    amount_fcfa: int
    channel: str
    phone: str
    message: str | None = None
    receipt_number: str | None = None
    payer_name: str | None = None
    payer_email: str | None = None
    school_name: str | None = None
    forfait_label: str | None = None
    context_label: str
    commission_fcfa: int | None = None
    school_payout_fcfa: int | None = None
    commission_rate_pct: int | None = None
    created_at: datetime
    completed_at: datetime | None = None
    inscription_id: UUID | None = None
