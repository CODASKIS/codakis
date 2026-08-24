from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import AdminUser, require_roles
from app.db.models import RoleUtilisateur, Utilisateur
from app.db.session import get_db
from app.schemas.payments import (
    AdminPaymentItem,
    AdminPaymentStatsResponse,
    ClientInvoiceResponse,
    ClientSubscriptionResponse,
    InitiatePaymentRequest,
    PaymentConfigResponse,
    PaymentInitiateResponse,
    PaymentStatusResponse,
    PlanPricingResponse,
)
from app.services.payments import (
    admin_get_payment,
    admin_list_payments,
    admin_payment_stats,
    confirm_payment,
    get_my_subscription,
    get_payment,
    get_payment_config,
    get_plan_pricing,
    initiate_payment,
    list_user_invoices,
    payment_to_initiate_response,
    payment_to_status_response,
)

router = APIRouter(prefix="/payments", tags=["payments"])
admin_router = APIRouter(prefix="/admin/payments", tags=["admin-payments"])
AuthUser = require_roles(
    RoleUtilisateur.candidat,
    RoleUtilisateur.moniteur,
    RoleUtilisateur.gerant_auto_ecole,
    RoleUtilisateur.administrateur,
)


@router.get("/config", response_model=PaymentConfigResponse)
def payment_config():
    return get_payment_config()


@router.get("/plans/pricing", response_model=PlanPricingResponse)
def plan_pricing():
    return PlanPricingResponse(**get_plan_pricing())


@router.get("/subscription/me", response_model=ClientSubscriptionResponse | None)
def my_subscription(user: Utilisateur = Depends(AuthUser), db: Session = Depends(get_db)):
    return get_my_subscription(db, user)


@router.get("/invoices/me", response_model=list[ClientInvoiceResponse])
def my_invoices(user: Utilisateur = Depends(AuthUser), db: Session = Depends(get_db)):
    return list_user_invoices(db, user)


@router.get("/receipts/me", response_model=list[ClientInvoiceResponse])
def my_receipts(user: Utilisateur = Depends(AuthUser), db: Session = Depends(get_db)):
    return list_user_invoices(db, user)


@router.get("/{reference}/receipt", response_model=ClientInvoiceResponse)
def payment_receipt(reference: str, user: Utilisateur = Depends(AuthUser), db: Session = Depends(get_db)):
    paiement = get_payment(db, user, reference)
    if paiement is None or paiement.status != "completed":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reçu introuvable")
    invoices = list_user_invoices(db, user)
    match = next((item for item in invoices if item["reference"] == reference), None)
    if match is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reçu introuvable")
    return match


@router.post("/initiate", response_model=PaymentInitiateResponse)
def payment_initiate(
    payload: InitiatePaymentRequest,
    user: Utilisateur = Depends(AuthUser),
    db: Session = Depends(get_db),
):
    if payload.purpose == "enrollment" and user.role != RoleUtilisateur.candidat:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les candidats peuvent acheter un forfait auto-école",
        )
    forfait_id = payload.forfait_id
    if forfait_id is None and payload.purpose == "enrollment" and payload.plan_id:
        try:
            forfait_id = UUID(payload.plan_id)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="forfait_id invalide") from exc

    try:
        paiement = initiate_payment(
            db,
            user,
            payment_method=payload.payment_method,
            phone=payload.phone,
            purpose=payload.purpose,
            plan_id=payload.plan_id,
            forfait_id=forfait_id,
            auto_ecole_id=payload.auto_ecole_id,
            billing_period=payload.billing_period,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return payment_to_initiate_response(paiement)


@router.get("/{reference}/status", response_model=PaymentStatusResponse)
def payment_status(reference: str, user: Utilisateur = Depends(AuthUser), db: Session = Depends(get_db)):
    paiement = get_payment(db, user, reference)
    if paiement is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paiement introuvable")
    return payment_to_status_response(paiement)


@router.post("/{reference}/confirm", response_model=PaymentStatusResponse)
def payment_confirm(reference: str, user: Utilisateur = Depends(AuthUser), db: Session = Depends(get_db)):
    try:
        paiement = confirm_payment(db, user, reference)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return payment_to_status_response(paiement)


@admin_router.get("/stats", response_model=AdminPaymentStatsResponse)
def admin_payments_stats(_admin: AdminUser, db: Session = Depends(get_db)):
    return admin_payment_stats(db)


@admin_router.get("", response_model=list[AdminPaymentItem])
def admin_payments_list(
    _admin: AdminUser,
    db: Session = Depends(get_db),
    status: str | None = Query(default=None),
    purpose: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
):
    return admin_list_payments(db, status=status, purpose=purpose, limit=limit)


@admin_router.get("/{reference}", response_model=AdminPaymentItem)
def admin_payment_detail(reference: str, _admin: AdminUser, db: Session = Depends(get_db)):
    item = admin_get_payment(db, reference)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paiement introuvable")
    return item
