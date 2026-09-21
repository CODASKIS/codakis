"""Cycle de vie des abonnements : rappels J-7 / J-3 et expiration."""

from __future__ import annotations

import logging
from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.db.models import AutoEcole, Inscription, Paiement, StatutInscription, Utilisateur
from app.db.session import SessionLocal
from app.services.payments import PLAN_LABELS, compute_subscription_expires_at

logger = logging.getLogger("codakis.subscription")


def _ensure_expires_at(paiement: Paiement) -> datetime:
    if paiement.expires_at is None:
        paiement.expires_at = compute_subscription_expires_at(paiement)
    expires = paiement.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=UTC)
        paiement.expires_at = expires
    return expires


def process_subscription_reminders(db: Session | None = None) -> dict[str, int]:
    """Envoie les e-mails de rappel J-7 et J-3 pour les abonnements encore actifs."""
    owns_session = db is None
    session = db or SessionLocal()
    sent_7 = 0
    sent_3 = 0
    backfilled = 0
    try:
        now = datetime.now(UTC)
        rows = (
            session.query(Paiement)
            .filter(
                Paiement.purpose == "subscription",
                Paiement.status == "completed",
            )
            .all()
        )
        for paiement in rows:
            expires = _ensure_expires_at(paiement)
            if paiement.expires_at is None:
                backfilled += 1
            if expires <= now:
                continue
            days_left = (expires.date() - now.date()).days
            user = session.get(Utilisateur, paiement.utilisateur_id)
            if user is None or not user.email:
                continue
            full_name = f"{user.prenom or ''} {user.nom or ''}".strip() or user.email
            plan_label = PLAN_LABELS.get(paiement.plan_id or "", paiement.plan_id or "CODAKIS")
            expires_label = expires.strftime("%d/%m/%Y")

            if 1 <= days_left <= 7 and paiement.reminder_7d_sent_at is None:
                try:
                    from app.services.email import send_subscription_expiry_reminder_email

                    send_subscription_expiry_reminder_email(
                        user.email,
                        full_name,
                        plan_label=plan_label,
                        days_left=days_left,
                        expires_at_label=expires_label,
                        reminder_kind="7d",
                    )
                    paiement.reminder_7d_sent_at = now
                    sent_7 += 1
                except Exception:
                    logger.exception("Rappel J-7 non envoyé pour %s", paiement.reference)

            if 1 <= days_left <= 3 and paiement.reminder_3d_sent_at is None:
                try:
                    from app.services.email import send_subscription_expiry_reminder_email

                    send_subscription_expiry_reminder_email(
                        user.email,
                        full_name,
                        plan_label=plan_label,
                        days_left=days_left,
                        expires_at_label=expires_label,
                        reminder_kind="3d",
                    )
                    paiement.reminder_3d_sent_at = now
                    sent_3 += 1
                except Exception:
                    logger.exception("Rappel J-3 non envoyé pour %s", paiement.reference)

        session.commit()
        return {"reminder_7d": sent_7, "reminder_3d": sent_3, "backfilled": backfilled}
    except Exception:
        session.rollback()
        logger.exception("process_subscription_reminders a échoué")
        return {"reminder_7d": 0, "reminder_3d": 0, "backfilled": 0}
    finally:
        if owns_session:
            session.close()


def process_forfait_reminders(db: Session | None = None) -> dict[str, int]:
    """Relance J-7 et J-3 avant l'échéance d'un forfait auto-école."""
    owns_session = db is None
    session = db or SessionLocal()
    sent_7 = 0
    sent_3 = 0
    try:
        now = datetime.now(UTC)
        rows = (
            session.query(Inscription)
            .filter(
                Inscription.statut == StatutInscription.confirmee.value,
                Inscription.expires_at.isnot(None),
                Inscription.expires_at > now,
            )
            .all()
        )
        for inscription in rows:
            expires = inscription.expires_at
            if expires.tzinfo is None:
                expires = expires.replace(tzinfo=UTC)
            days_left = (expires.date() - now.date()).days
            if not 1 <= days_left <= 7:
                continue
            user = session.get(Utilisateur, inscription.candidat_id)
            if user is None or not user.email:
                continue
            school = session.get(AutoEcole, inscription.auto_ecole_id)
            full_name = f"{user.prenom or ''} {user.nom or ''}".strip() or user.email
            label = inscription.forfait_label
            if school:
                label = f"{label} — {school.raison_sociale}"
            expires_label = expires.strftime("%d/%m/%Y")

            for threshold, field, counter in ((7, "reminder_7d_sent_at", "7"), (3, "reminder_3d_sent_at", "3")):
                if days_left > threshold or getattr(inscription, field) is not None:
                    continue
                try:
                    from app.services.email import send_subscription_expiry_reminder_email

                    send_subscription_expiry_reminder_email(
                        user.email,
                        full_name,
                        plan_label=f"forfait {label}",
                        days_left=days_left,
                        expires_at_label=expires_label,
                        reminder_kind="3d" if threshold == 3 else "7d",
                    )
                    setattr(inscription, field, now)
                    if counter == "7":
                        sent_7 += 1
                    else:
                        sent_3 += 1
                except Exception:
                    logger.exception("Relance forfait J-%s non envoyée pour %s", threshold, inscription.id)

        session.commit()
        return {"forfait_7d": sent_7, "forfait_3d": sent_3}
    except Exception:
        session.rollback()
        logger.exception("process_forfait_reminders a échoué")
        return {"forfait_7d": 0, "forfait_3d": 0}
    finally:
        if owns_session:
            session.close()


def due_window(days: int) -> tuple[datetime, datetime]:
    now = datetime.now(UTC)
    start = now + timedelta(days=days)
    end = start + timedelta(days=1)
    return start, end
