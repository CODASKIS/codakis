import re
import secrets
import uuid
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.db.models import AutoEcole, Forfait, Inscription, Paiement, Utilisateur
from app.services.enrollments import create_inscription
from app.services.notifications import push_notification

CHANNEL_LABELS = {
    "orange": "Orange Money",
    "mtn": "MTN MoMo",
    "moov": "Moov Money",
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


def get_payment_config() -> dict:
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
) -> Paiement:
    normalized_phone = normalize_phone(phone)
    amount_fcfa = 0
    label_fr = "Paiement CODAKIS"

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
        label_fr = f"Forfait {forfait.label_fr} — {school.raison_sociale}"
    elif purpose == "subscription" and plan_id:
        pricing = {"essentiel": 0, "pro": 5000, "entreprise": 15000}
        amount_fcfa = pricing.get(plan_id, 5000)
        label_fr = f"Abonnement CODAKIS {plan_id}"
    else:
        raise ValueError("Paramètres de paiement invalides")

    reference = _new_reference()
    channel = CHANNEL_LABELS.get(payment_method, payment_method)
    paiement = Paiement(
        reference=reference,
        utilisateur_id=user.id,
        auto_ecole_id=auto_ecole_id,
        forfait_id=forfait_id,
        plan_id=plan_id,
        purpose=purpose,
        amount_fcfa=amount_fcfa,
        channel=payment_method,
        phone=normalized_phone,
        status="pending",
        message=label_fr,
    )
    db.add(paiement)
    db.commit()
    db.refresh(paiement)
    return paiement


def payment_to_initiate_response(paiement: Paiement) -> dict:
    channel_label = CHANNEL_LABELS.get(paiement.channel, paiement.channel)
    return {
        "reference": paiement.reference,
        "status": paiement.status,
        "amount_fcfa": paiement.amount_fcfa,
        "channel": channel_label,
        "message": (
            f"Paiement de {paiement.amount_fcfa:,} FCFA via {channel_label}. "
            f"Validez la demande sur votre téléphone {paiement.phone}."
        ).replace(",", " "),
        "ussd_hint": USSD_HINTS.get(paiement.channel),
        "payment_url": None,
        "payment_token": None,
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

    db.commit()
    db.refresh(paiement)
    return paiement


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


def _payment_to_admin_item(db: Session, row: Paiement) -> dict:
    user = db.get(Utilisateur, row.utilisateur_id)
    school = db.get(AutoEcole, row.auto_ecole_id) if row.auto_ecole_id else None
    payer_name = f"{user.prenom} {user.nom}".strip() if user else None
    return {
        "reference": row.reference,
        "status": row.status,
        "purpose": row.purpose,
        "amount_fcfa": row.amount_fcfa,
        "channel": CHANNEL_LABELS.get(row.channel, row.channel),
        "phone": row.phone,
        "message": row.message,
        "receipt_number": row.receipt_number,
        "payer_name": payer_name or None,
        "payer_email": user.email if user else None,
        "school_name": school.raison_sociale if school else None,
        "created_at": row.created_at,
        "completed_at": row.completed_at,
        "inscription_id": row.inscription_id,
    }


def admin_payment_stats(db: Session) -> dict:
    rows = db.query(Paiement).all()
    completed = [row for row in rows if row.status == "completed"]
    pending = [row for row in rows if row.status == "pending"]
    failed = [row for row in rows if row.status == "failed"]
    return {
        "total_volume_fcfa": sum(row.amount_fcfa for row in completed),
        "completed_count": len(completed),
        "pending_count": len(pending),
        "failed_count": len(failed),
        "enrollment_count": sum(1 for row in completed if row.purpose == "enrollment"),
        "subscription_count": sum(1 for row in completed if row.purpose == "subscription"),
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
