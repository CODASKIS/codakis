import re
import secrets
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import AutoEcole, Forfait, Inscription, Paiement, Utilisateur
from app.services.enrollments import create_inscription
from app.services.cinetpay import is_configured as cinetpay_configured, create_checkout as cinetpay_create_checkout
from app.services.notifications import push_notification

CHANNEL_LABELS = {
    "orange": "Orange Money",
    "mtn": "MTN MoMo",
    "moov": "Moov Money",
    "demo": "Démo",
}

PLAN_LABELS = {
    "essentiel": "Gratuit",
    "pro": "Abonnement Pro",
    "premium": "Abonnement Premium",
    "entreprise": "Abonnement Entreprise",
}

SUBSCRIPTION_PRICING: dict[str, dict[str, int]] = {
    "pro": {"monthly": 5000, "yearly": 50000},
    "premium": {"monthly": 15000, "yearly": 150000},
    "entreprise": {"monthly": 15000, "yearly": 150000},
}

USSD_HINTS = {
    "orange": "Composez #150*50# sur votre téléphone, validez le montant affiché.",
    "mtn": "Composez *126# puis suivez les instructions MTN MoMo.",
    "moov": "Composez #155# puis validez le paiement Moov.",
}


def normalize_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone.strip())
    if digits.startswith("237"):
        digits = digits[3:]
    if len(digits) == 9 and digits.startswith("6"):
        return f"+237{digits}"
    if phone.strip().startswith("+"):
        return phone.strip()
    raise ValueError("Numéro Mobile Money invalide (format attendu : 6XX XX XX XX)")


def _new_reference() -> str:
    return f"MM-{secrets.token_hex(4).upper()}"


def _new_receipt() -> str:
    return f"RC-{datetime.now(UTC).strftime('%Y%m%d')}-{secrets.token_hex(3).upper()}"


def get_plan_pricing() -> dict:
    return {
        "essentiel": 0,
        "pro": SUBSCRIPTION_PRICING["pro"]["monthly"],
        "premium": SUBSCRIPTION_PRICING["premium"]["monthly"],
        "entreprise": SUBSCRIPTION_PRICING["entreprise"]["monthly"],
        "essentiel_yearly": 0,
        "pro_yearly": SUBSCRIPTION_PRICING["pro"]["yearly"],
        "premium_yearly": SUBSCRIPTION_PRICING["premium"]["yearly"],
        "entreprise_yearly": SUBSCRIPTION_PRICING["entreprise"]["yearly"],
        "deposit_min_fcfa": 10000,
        "certification_fee_fcfa": 25000,
        "platform_commission_rate_pct": settings.platform_commission_rate_pct,
    }


def _calc_enrollment_split(amount_fcfa: int) -> tuple[int, int, int]:
    rate = settings.platform_commission_rate_pct
    commission = round(amount_fcfa * rate / 100)
    payout = amount_fcfa - commission
    return rate, commission, payout


def get_payment_config() -> dict:
    if cinetpay_configured():
        return {
            "provider": "cinetpay",
            "requires_phone": False,
            "requires_redirect": True,
            "sandbox": settings.cinetpay_api_key.startswith("sk_test"),
            "label": "CinetPay — Orange / MTN / Moov / Carte",
        }
    return {
        "provider": "legacy",
        "requires_phone": True,
        "requires_redirect": False,
        "sandbox": True,
        "label": "Mobile Money (sandbox CODAKIS)",
    }


def initiate_payment(
    db: Session,
    user: Utilisateur,
    *,
    payment_method: str,
    phone: str,
    purpose: str,
    plan_id: str | None = None,
    forfait_id: uuid.UUID | None = None,
    auto_ecole_id: uuid.UUID | None = None,
    billing_period: str = "monthly",
) -> Paiement:
    phone_source = phone.strip() or (user.telephone or "").strip()
    if not phone_source:
        phone_source = "670000000"
    normalized_phone = normalize_phone(phone_source)
    amount_fcfa = 0
    label_fr = "Paiement CODAKIS"
    commission_fcfa: int | None = None
    school_payout_fcfa: int | None = None
    commission_rate_pct: int | None = None

    if purpose == "enrollment":
        if forfait_id is None or auto_ecole_id is None:
            raise ValueError("forfait_id et auto_ecole_id requis pour un achat forfait")
        school = db.get(AutoEcole, auto_ecole_id)
        if school is None or not school.est_validee or school.est_refusee:
            raise ValueError("Auto-école introuvable")
        forfait = db.get(Forfait, forfait_id)
        if forfait is None or forfait.auto_ecole_id != school.id or not forfait.est_actif:
            raise ValueError("Forfait invalide")
        existing = (
            db.query(Inscription)
            .filter(
                Inscription.candidat_id == user.id,
                Inscription.auto_ecole_id == school.id,
                Inscription.statut != "annulee",
            )
            .first()
        )
        if existing:
            raise ValueError("Vous êtes déjà inscrit à cette auto-école")
        amount_fcfa = forfait.prix
        commission_rate_pct, commission_fcfa, school_payout_fcfa = _calc_enrollment_split(amount_fcfa)
        label_fr = (
            f"Forfait {forfait.label_fr} — {school.raison_sociale} "
            f"(CODAKIS {commission_rate_pct}% : {commission_fcfa:,} FCFA)".replace(",", " ")
        )
    elif purpose == "subscription" and plan_id:
        if plan_id in {"essentiel", "free"}:
            raise ValueError("Le plan gratuit ne nécessite pas de paiement")
        period = "yearly" if billing_period == "yearly" else "monthly"
        plan_prices = SUBSCRIPTION_PRICING.get(plan_id)
        if plan_prices is None:
            raise ValueError("Plan d'abonnement invalide")
        amount_fcfa = plan_prices[period]
        period_label = "annuel" if period == "yearly" else "mensuel"
        label_fr = f"Abonnement CODAKIS {PLAN_LABELS.get(plan_id, plan_id)} ({period_label})"
    else:
        raise ValueError("Paramètres de paiement invalides")

    reference = _new_reference()
    paiement = Paiement(
        reference=reference,
        utilisateur_id=user.id,
        auto_ecole_id=auto_ecole_id,
        forfait_id=forfait_id,
        plan_id=plan_id,
        purpose=purpose,
        amount_fcfa=amount_fcfa,
        commission_fcfa=commission_fcfa,
        school_payout_fcfa=school_payout_fcfa,
        commission_rate_pct=commission_rate_pct,
        channel=payment_method,
        phone=normalized_phone,
        status="pending",
        message=label_fr,
    )
    db.add(paiement)
    db.commit()
    db.refresh(paiement)
    return paiement


def payment_to_initiate_response(paiement: Paiement, user: Utilisateur | None = None) -> dict:
    channel_label = CHANNEL_LABELS.get(paiement.channel, paiement.channel)
    payment_url = None
    payment_token = None

    if cinetpay_configured() and user is not None:
        base = settings.frontend_url.rstrip("/")
        try:
            checkout = cinetpay_create_checkout(
                transaction_id=paiement.reference,
                amount_fcfa=paiement.amount_fcfa,
                description=paiement.message or "Paiement CODAKIS",
                customer_name=user.prenom or "Client",
                customer_surname=user.nom or "CODAKIS",
                customer_email=user.email,
                customer_phone=paiement.phone.replace("+237", "").replace("+", ""),
                notify_url=f"{base}/api/v1/payments/cinetpay/notify",
                return_url=f"{base}/paiement/retour?ref={paiement.reference}",
            )
            payment_url = checkout.get("payment_url")
            payment_token = checkout.get("payment_token")
            paiement.channel = "cinetpay"
            channel_label = "CinetPay"
        except Exception as exc:
            paiement.message = f"{paiement.message or ''} (CinetPay: {exc})".strip()

    message = (
        f"Paiement de {paiement.amount_fcfa:,} FCFA via {channel_label}."
        + (f" Validez sur la page CinetPay." if payment_url else f" Validez sur {paiement.phone}.")
    ).replace(",", " ")

    return {
        "reference": paiement.reference,
        "status": paiement.status,
        "amount_fcfa": paiement.amount_fcfa,
        "channel": channel_label,
        "message": message,
        "ussd_hint": None if payment_url else USSD_HINTS.get(paiement.channel),
        "payment_url": payment_url,
        "payment_token": payment_token,
        "commission_fcfa": paiement.commission_fcfa,
        "school_payout_fcfa": paiement.school_payout_fcfa,
        "commission_rate_pct": paiement.commission_rate_pct,
    }


def get_payment(db: Session, user: Utilisateur, reference: str) -> Paiement | None:
    return (
        db.query(Paiement)
        .filter(Paiement.reference == reference, Paiement.utilisateur_id == user.id)
        .first()
    )


def payment_to_status_response(paiement: Paiement) -> dict:
    channel_label = CHANNEL_LABELS.get(paiement.channel, paiement.channel)
    return {
        "reference": paiement.reference,
        "status": paiement.status,
        "amount_fcfa": paiement.amount_fcfa,
        "channel": channel_label,
        "message": paiement.message,
        "receipt_number": paiement.receipt_number,
        "inscription_id": paiement.inscription_id,
    }


def confirm_payment(db: Session, user: Utilisateur, reference: str) -> Paiement:
    paiement = get_payment(db, user, reference)
    if paiement is None:
        raise ValueError("Paiement introuvable")
    if paiement.status == "completed":
        return paiement
    if paiement.status == "failed":
        raise ValueError("Ce paiement a échoué")

    paiement.status = "completed"
    paiement.completed_at = datetime.now(UTC)
    paiement.receipt_number = _new_receipt()

    inscription = None
    if paiement.purpose == "enrollment" and paiement.inscription_id is None:
        if paiement.commission_fcfa is None and paiement.amount_fcfa:
            rate, commission, payout = _calc_enrollment_split(paiement.amount_fcfa)
            paiement.commission_rate_pct = rate
            paiement.commission_fcfa = commission
            paiement.school_payout_fcfa = payout
        school = db.get(AutoEcole, paiement.auto_ecole_id) if paiement.auto_ecole_id else None
        forfait = db.get(Forfait, paiement.forfait_id) if paiement.forfait_id else None
        if school and forfait:
            inscription = create_inscription(
                db,
                candidat=user,
                school=school,
                forfait=forfait,
                forfait_type=forfait.type,
                forfait_label=forfait.label_fr,
                payment_ref=paiement.reference,
            )
            paiement.inscription_id = inscription.id
            push_notification(
                db,
                user.id,
                type_="enrollment_confirmed",
                title_fr="Inscription confirmée",
                title_en="Enrollment confirmed",
                body_fr=f"Votre forfait {forfait.label_fr} chez {school.raison_sociale} est actif. Reçu : {paiement.receipt_number}.",
                body_en=f"Your {forfait.label_en} plan at {school.raison_sociale} is active. Receipt: {paiement.receipt_number}.",
                payload={
                    "inscription_id": str(inscription.id),
                    "payment_ref": paiement.reference,
                },
            )
    elif paiement.purpose == "subscription":
        plan_label = PLAN_LABELS.get(paiement.plan_id or "", paiement.plan_id or "CODAKIS")
        push_notification(
            db,
            user.id,
            type_="subscription_confirmed",
            title_fr="Abonnement activé",
            title_en="Subscription activated",
            body_fr=f"Votre {plan_label} est actif. Accédez aux cours, quiz et examens. Reçu : {paiement.receipt_number}.",
            body_en=f"Your {plan_label} is active. Access courses, quizzes and exams. Receipt: {paiement.receipt_number}.",
            payload={"payment_ref": paiement.reference, "plan_id": paiement.plan_id},
        )

    db.commit()
    db.refresh(paiement)
    return paiement


def get_my_subscription(db: Session, user: Utilisateur) -> dict | None:
    row = (
        db.query(Paiement)
        .filter(
            Paiement.utilisateur_id == user.id,
            Paiement.purpose == "subscription",
            Paiement.status == "completed",
        )
        .order_by(Paiement.completed_at.desc())
        .first()
    )
    if row is None:
        return None

    paid_at = row.completed_at or row.created_at
    # Durée indicative : 30 jours (mensuel) ou 365 jours (annuel) selon le montant
    yearly_amounts = {
        SUBSCRIPTION_PRICING["pro"]["yearly"],
        SUBSCRIPTION_PRICING["premium"]["yearly"],
        SUBSCRIPTION_PRICING["entreprise"]["yearly"],
    }
    duration_days = 365 if row.amount_fcfa in yearly_amounts else 30
    expires_at = paid_at + timedelta(days=duration_days)
    now = datetime.now(UTC)
    remaining = max(0, int((expires_at - now).total_seconds()))
    days_remaining = max(0, (expires_at.date() - now.date()).days)

    return {
        "plan_id": row.plan_id,
        "plan_name": PLAN_LABELS.get(row.plan_id or "", row.plan_id or "CODAKIS"),
        "billing_label": "Annuel" if row.amount_fcfa in yearly_amounts else "Mensuel",
        "status": "active" if remaining > 0 else "expired",
        "expires_at": expires_at.isoformat(),
        "is_active": remaining > 0,
        "seconds_remaining": remaining,
        "days_remaining": days_remaining,
        "hours_remaining": remaining // 3600,
        "minutes_remaining": (remaining % 3600) // 60,
        "payment_reference": row.reference,
        "receipt_number": row.receipt_number,
    }


def list_user_invoices(db: Session, user: Utilisateur) -> list[dict]:
    rows = (
        db.query(Paiement)
        .filter(Paiement.utilisateur_id == user.id, Paiement.status == "completed")
        .order_by(Paiement.completed_at.desc())
        .limit(50)
        .all()
    )
    payer_name = f"{user.prenom} {user.nom}".strip()
    return [
        {
            "reference": row.reference,
            "label": row.message or "Paiement CODAKIS",
            "amount_fcfa": row.amount_fcfa,
            "channel": CHANNEL_LABELS.get(row.channel, row.channel),
            "status": row.status,
            "paid_at": row.completed_at or row.created_at,
            "receipt_number": row.receipt_number,
            "payer_name": payer_name or None,
        }
        for row in rows
    ]


def _payment_context_label(
    row: Paiement,
    *,
    school: AutoEcole | None,
    forfait: Forfait | None,
) -> str:
    if row.purpose == "enrollment":
        if school and forfait:
            return f"{school.raison_sociale} — {forfait.label_fr}"
        if school:
            return school.raison_sociale
    if row.purpose == "subscription":
        if row.plan_id:
            return PLAN_LABELS.get(row.plan_id, f"Abonnement {row.plan_id}")
    if row.message:
        return row.message
    return "—"


def _payment_to_admin_item(db: Session, row: Paiement) -> dict:
    user = db.get(Utilisateur, row.utilisateur_id)
    school = db.get(AutoEcole, row.auto_ecole_id) if row.auto_ecole_id else None
    forfait = db.get(Forfait, row.forfait_id) if row.forfait_id else None
    payer_name = f"{user.prenom} {user.nom}".strip() if user else None
    return {
        "reference": row.reference,
        "status": row.status,
        "purpose": row.purpose,
        "plan_id": row.plan_id,
        "amount_fcfa": row.amount_fcfa,
        "channel": CHANNEL_LABELS.get(row.channel, row.channel),
        "phone": row.phone,
        "message": row.message,
        "receipt_number": row.receipt_number,
        "payer_name": payer_name or None,
        "payer_email": user.email if user else None,
        "school_name": school.raison_sociale if school else None,
        "forfait_label": forfait.label_fr if forfait else None,
        "context_label": _payment_context_label(row, school=school, forfait=forfait),
        "commission_fcfa": row.commission_fcfa,
        "school_payout_fcfa": row.school_payout_fcfa,
        "commission_rate_pct": row.commission_rate_pct,
        "created_at": row.created_at,
        "completed_at": row.completed_at,
        "inscription_id": row.inscription_id,
    }


def admin_payment_stats(db: Session) -> dict:
    rows = db.query(Paiement).all()
    completed = [row for row in rows if row.status == "completed"]
    pending = [row for row in rows if row.status == "pending"]
    failed = [row for row in rows if row.status == "failed"]
    enrollment_completed = [row for row in completed if row.purpose == "enrollment"]
    return {
        "total_volume_fcfa": sum(row.amount_fcfa for row in completed),
        "completed_count": len(completed),
        "pending_count": len(pending),
        "failed_count": len(failed),
        "enrollment_count": len(enrollment_completed),
        "subscription_count": sum(1 for row in completed if row.purpose == "subscription"),
        "commission_total_fcfa": sum(row.commission_fcfa or 0 for row in enrollment_completed),
    }


def admin_list_payments(
    db: Session,
    *,
    status: str | None = None,
    purpose: str | None = None,
    limit: int = 100,
) -> list[dict]:
    q = db.query(Paiement).order_by(Paiement.created_at.desc())
    if status:
        q = q.filter(Paiement.status == status)
    if purpose:
        q = q.filter(Paiement.purpose == purpose)
    rows = q.limit(min(max(limit, 1), 500)).all()
    return [_payment_to_admin_item(db, row) for row in rows]


def admin_get_payment(db: Session, reference: str) -> dict | None:
    row = db.query(Paiement).filter(Paiement.reference == reference).first()
    if row is None:
        return None
    return _payment_to_admin_item(db, row)
