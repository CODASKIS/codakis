"""Recherche globale administration."""

from __future__ import annotations

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.db.models import AutoEcole, Paiement, Utilisateur
from app.services.users import ROLE_TO_FRONT, user_to_public


def admin_global_search(db: Session, query: str, *, limit_per_type: int = 5) -> list[dict]:
    needle = query.strip()
    if len(needle) < 2:
        return []

    pattern = f"%{needle}%"
    results: list[dict] = []

    users = (
        db.query(Utilisateur)
        .filter(
            or_(
                Utilisateur.email.ilike(pattern),
                Utilisateur.prenom.ilike(pattern),
                Utilisateur.nom.ilike(pattern),
                Utilisateur.telephone.ilike(pattern),
            )
        )
        .order_by(Utilisateur.created_at.desc())
        .limit(limit_per_type)
        .all()
    )
    for user in users:
        public = user_to_public(db, user)
        role = ROLE_TO_FRONT.get(user.role, user.role)
        label = f"{public.first_name} {public.last_name}".strip() or public.email
        results.append(
            {
                "type": "user",
                "id": str(user.id),
                "label": label,
                "subtitle": f"{public.email} · {role}",
            }
        )

    schools = (
        db.query(AutoEcole)
        .filter(
            or_(
                AutoEcole.raison_sociale.ilike(pattern),
                AutoEcole.ville.ilike(pattern),
                AutoEcole.quartier.ilike(pattern),
                AutoEcole.email.ilike(pattern),
            )
        )
        .order_by(AutoEcole.created_at.desc())
        .limit(limit_per_type)
        .all()
    )
    for school in schools:
        city = school.ville or ""
        district = school.quartier or ""
        location = " · ".join(part for part in (city, district) if part)
        results.append(
            {
                "type": "school",
                "id": str(school.id),
                "label": school.raison_sociale,
                "subtitle": location or school.email,
            }
        )

    payments = (
        db.query(Paiement)
        .filter(
            or_(
                Paiement.reference.ilike(pattern),
                Paiement.phone.ilike(pattern),
                Paiement.message.ilike(pattern),
            )
        )
        .order_by(Paiement.created_at.desc())
        .limit(limit_per_type)
        .all()
    )
    for payment in payments:
        user = db.get(Utilisateur, payment.utilisateur_id)
        payer = f"{user.prenom} {user.nom}".strip() if user else ""
        school = db.get(AutoEcole, payment.auto_ecole_id) if payment.auto_ecole_id else None
        subtitle_parts = [part for part in (payer, school.raison_sociale if school else None, payment.status) if part]
        results.append(
            {
                "type": "payment",
                "id": payment.reference,
                "label": payment.reference,
                "subtitle": " · ".join(subtitle_parts),
            }
        )

    return results
