from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
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
    fail_payment,
    get_my_subscription,
    get_payment,
    get_payment_config,
    get_plan_pricing,
    initiate_payment,
    list_user_invoices,
    payment_to_initiate_response,
    payment_to_status_response,
    reconcile_pending_payments,
)
from app.services.subscription_lifecycle import process_subscription_reminders

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
def plan_pricing(country: str = Query(default="CM", min_length=2, max_length=2)):
    return PlanPricingResponse(**get_plan_pricing(country))


@router.get("/subscription/me", response_model=ClientSubscriptionResponse | None)
def my_subscription(user: Utilisateur = Depends(AuthUser), db: Session = Depends(get_db)):
    # Déclenche les rappels J-7 / J-3 au passage (léger, idempotent).
    try:
        process_subscription_reminders(db)
    except Exception:
        pass
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
    return payment_to_initiate_response(paiement, user, country_code=payload.country_code)


@router.post("/cinetpay/notify")
async def cinetpay_notify(request: Request, db: Session = Depends(get_db)):
    """Webhook CinetPay — confirmation uniquement après vérif API opérateur."""
    from app.db.models import Paiement, Utilisateur
    from app.services.cinetpay import verify_transaction

    try:
        body = await request.json()
    except Exception:
        body = {}

    transaction_id = body.get("cpm_trans_id") or body.get("transaction_id") or body.get("merchant_transaction_id")
    if not transaction_id:
        return {"status": "ignored"}

    paiement = db.query(Paiement).filter(Paiement.reference == str(transaction_id)).first()
    if paiement is None:
        return {"status": "not_found"}

    if paiement.status == "completed":
        return {"status": "already_done"}

    status_ok = False
    try:
        check = verify_transaction(str(transaction_id))
        status_ok = str((check.get("data") or {}).get("status") or "").upper() in {
            "ACCEPTED",
            "SUCCESS",
            "00",
        }
    except Exception:
        status_ok = False

    if status_ok:
        user = db.get(Utilisateur, paiement.utilisateur_id)
        if user:
            confirm_payment(db, user, paiement.reference, skip_provider_check=True)
    else:
        result = str(body.get("cpm_result") or body.get("status") or "").upper()
        if result in {"01", "02", "03", "FAILED", "REFUSED", "CANCELLED", "CANCELED"}:
            fail_payment(db, paiement, "Paiement refusé par l'opérateur")

    return {"status": "ok"}


@router.post("/pawapay/callback")
async def pawapay_callback(request: Request, db: Session = Depends(get_db)):
    """Callback PawaPay — confirmation uniquement après get_checkout_status."""
    import logging as _logging

    from app.db.models import Paiement, Utilisateur
    from app.services.pawapay import get_checkout_status

    cb_logger = _logging.getLogger("codakis.pawapay.callback")

    try:
        body = await request.json()
    except Exception:
        return {"status": "parse_error"}

    checkout_id = body.get("checkoutId")
    client_ref = body.get("clientReferenceId")
    cb_logger.info(
        "PawaPay callback reçu checkoutId=%s clientReferenceId=%s status=%s",
        checkout_id,
        client_ref,
        body.get("status"),
    )

    paiement = None
    if client_ref:
        paiement = db.query(Paiement).filter(Paiement.reference == str(client_ref)).first()
    if paiement is None and checkout_id:
        paiement = db.query(Paiement).filter(Paiement.provider_checkout_id == str(checkout_id)).first()
    if paiement is None:
        cb_logger.warning("PawaPay callback: paiement introuvable")
        return {"status": "not_found"}

    if paiement.status == "completed":
        return {"status": "already_done"}

    if checkout_id and not paiement.provider_checkout_id:
        paiement.provider_checkout_id = str(checkout_id)
        db.commit()

    lookup_id = paiement.provider_checkout_id or checkout_id
    if not lookup_id:
        return {"status": "ignored"}

    try:
        check = get_checkout_status(str(lookup_id))
        checkout_status = str(check.get("status") or "").upper()
    except Exception:
        cb_logger.exception("PawaPay: vérif statut impossible pour %s", paiement.reference)
        return {"status": "verify_error"}

    if checkout_status == "COMPLETED":
        user = db.get(Utilisateur, paiement.utilisateur_id)
        if user:
            try:
                confirm_payment(db, user, paiement.reference, skip_provider_check=True)
                cb_logger.info("PawaPay: paiement %s confirmé via callback", paiement.reference)
            except Exception:
                cb_logger.exception("PawaPay: erreur lors de la confirmation de %s", paiement.reference)
    elif checkout_status in {"FAILED", "EXPIRED", "CANCELLED", "CANCELED"}:
        fail_payment(db, paiement, f"PawaPay: {checkout_status}")
        cb_logger.info("PawaPay: paiement %s marqué échoué (status=%s)", paiement.reference, checkout_status)

    return {"status": "ok"}


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
        detail = str(exc)
        if "en cours" in detail.lower():
            paiement = get_payment(db, user, reference)
            if paiement is not None:
                return payment_to_status_response(paiement)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail) from exc
    return payment_to_status_response(paiement)


@admin_router.post("/reconcile")
def admin_payments_reconcile(_admin: AdminUser, db: Session = Depends(get_db)):
    """Repasse derrière l'opérateur sur les paiements encore en attente."""
    return reconcile_pending_payments(db)


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
