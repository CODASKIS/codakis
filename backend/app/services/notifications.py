import uuid

from sqlalchemy.orm import Session

from app.db.models import Notification, SeancePratique, Utilisateur
from app.services.email import send_seance_notification_email


def push_notification(
    db: Session,
    user_id: uuid.UUID,
    *,
    type_: str,
    title_fr: str,
    title_en: str,
    body_fr: str,
    body_en: str,
    payload: dict | None = None,
    send_email: bool = False,
) -> Notification:
    notif = Notification(
        utilisateur_id=user_id,
        type=type_,
        title_fr=title_fr,
        title_en=title_en,
        body_fr=body_fr,
        body_en=body_en,
        payload=payload,
    )
    db.add(notif)
    db.flush()
    if send_email:
        user = db.get(Utilisateur, user_id)
        if user and user.email:
            send_seance_notification_email(user.email, title_fr, body_fr)
    return notif


def notify_seance_event(db: Session, seance: SeancePratique, *, event: str) -> None:
    candidat = db.get(Utilisateur, seance.candidat_id)
    moniteur = db.get(Utilisateur, seance.moniteur_id) if seance.moniteur_id else None
    when = seance.starts_at.strftime("%d/%m/%Y %H:%M")
    lieu = seance.lieu or "—"

    if event == "assigned":
        if candidat:
            push_notification(
                db,
                candidat.id,
                type_="seance_assigned",
                title_fr="Séance de conduite planifiée",
                title_en="Driving session scheduled",
                body_fr=f"Votre séance est planifiée le {when} — lieu : {lieu}.",
                body_en=f"Your session is scheduled on {when} — location: {lieu}.",
                payload={"seance_id": str(seance.id)},
                send_email=True,
            )
        if moniteur:
            cand_name = f"{candidat.prenom} {candidat.nom}".strip() if candidat else "Candidat"
            push_notification(
                db,
                moniteur.id,
                type_="seance_assigned",
                title_fr="Nouvelle séance affectée",
                title_en="New session assigned",
                body_fr=f"Séance avec {cand_name} le {when}.",
                body_en=f"Session with {cand_name} on {when}.",
                payload={"seance_id": str(seance.id)},
                send_email=True,
            )
    elif event == "confirmed" and candidat:
        push_notification(
            db,
            candidat.id,
            type_="seance_confirmed",
            title_fr="Séance confirmée",
            title_en="Session confirmed",
            body_fr=f"Votre moniteur a confirmé la séance du {when}.",
            body_en=f"Your instructor confirmed the session on {when}.",
            payload={"seance_id": str(seance.id)},
            send_email=True,
        )
    elif event == "completed" and candidat:
        push_notification(
            db,
            candidat.id,
            type_="seance_completed",
            title_fr="Séance terminée",
            title_en="Session completed",
            body_fr=f"Séance du {when} marquée comme terminée.",
            body_en=f"Session on {when} marked as completed.",
            payload={"seance_id": str(seance.id)},
        )
    db.commit()
