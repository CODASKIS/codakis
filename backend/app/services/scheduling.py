import uuid
from datetime import UTC, date, datetime, timedelta

from sqlalchemy.orm import Session

from app.db.models import (
    AutoEcole,
    CreneauMoniteur,
    Inscription,
    MoniteurAutoEcole,
    Notification,
    SeancePratique,
    StatutCreneau,
    StatutSeance,
    Utilisateur,
)
from app.services.notifications import notify_seance_event


def week_bounds(week_start: date) -> tuple[datetime, datetime]:
    start = datetime.combine(week_start, datetime.min.time(), tzinfo=UTC)
    end = start + timedelta(days=7)
    return start, end


def parse_week_start(value: str | None) -> date:
    if not value:
        today = datetime.now(UTC).date()
        return today - timedelta(days=today.weekday())
    return date.fromisoformat(value)


def _moniteur_link(db: Session, moniteur_id: uuid.UUID, auto_ecole_id: uuid.UUID) -> MoniteurAutoEcole | None:
    return (
        db.query(MoniteurAutoEcole)
        .filter(
            MoniteurAutoEcole.utilisateur_id == moniteur_id,
            MoniteurAutoEcole.auto_ecole_id == auto_ecole_id,
            MoniteurAutoEcole.est_actif.is_(True),
        )
        .first()
    )


def _count_seances_week(db: Session, moniteur_id: uuid.UUID, starts_at: datetime) -> int:
    week_start = starts_at.date() - timedelta(days=starts_at.weekday())
    start, end = week_bounds(week_start)
    return (
        db.query(SeancePratique)
        .filter(
            SeancePratique.moniteur_id == moniteur_id,
            SeancePratique.starts_at >= start,
            SeancePratique.starts_at < end,
            SeancePratique.statut != StatutSeance.annulee.value,
        )
        .count()
    )


def _has_overlap(
    db: Session,
    moniteur_id: uuid.UUID,
    starts_at: datetime,
    ends_at: datetime,
    *,
    exclude_seance_id: uuid.UUID | None = None,
    exclude_creneau_id: uuid.UUID | None = None,
) -> bool:
    seance_q = db.query(SeancePratique).filter(
        SeancePratique.moniteur_id == moniteur_id,
        SeancePratique.statut != StatutSeance.annulee.value,
        SeancePratique.starts_at < ends_at,
        SeancePratique.ends_at > starts_at,
    )
    if exclude_seance_id:
        seance_q = seance_q.filter(SeancePratique.id != exclude_seance_id)
    if seance_q.first():
        return True

    creneau_q = db.query(CreneauMoniteur).filter(
        CreneauMoniteur.moniteur_id == moniteur_id,
        CreneauMoniteur.statut != StatutCreneau.annule.value,
        CreneauMoniteur.starts_at < ends_at,
        CreneauMoniteur.ends_at > starts_at,
    )
    if exclude_creneau_id:
        creneau_q = creneau_q.filter(CreneauMoniteur.id != exclude_creneau_id)
    return creneau_q.first() is not None


def validate_moniteur_schedule(
    db: Session,
    moniteur_id: uuid.UUID,
    auto_ecole_id: uuid.UUID,
    starts_at: datetime,
    ends_at: datetime,
    *,
    exclude_seance_id: uuid.UUID | None = None,
    exclude_creneau_id: uuid.UUID | None = None,
) -> MoniteurAutoEcole:
    link = _moniteur_link(db, moniteur_id, auto_ecole_id)
    if link is None:
        raise ValueError("Moniteur non rattaché à cette auto-école")
    if _has_overlap(db, moniteur_id, starts_at, ends_at, exclude_seance_id=exclude_seance_id, exclude_creneau_id=exclude_creneau_id):
        raise ValueError("Ce moniteur a déjà un créneau ou une séance sur ce créneau horaire")
    count = _count_seances_week(db, moniteur_id, starts_at)
    if count >= link.max_seances_semaine:
        raise ValueError(
            f"Limite hebdomadaire atteinte ({link.max_seances_semaine} séances/semaine pour ce moniteur)"
        )
    return link


def _creneau_places_prises(db: Session, creneau_id: uuid.UUID) -> int:
    return (
        db.query(SeancePratique)
        .filter(
            SeancePratique.creneau_id == creneau_id,
            SeancePratique.statut != StatutSeance.annulee.value,
        )
        .count()
    )


def creneau_to_public(db: Session, creneau: CreneauMoniteur) -> dict:
    places_prises = _creneau_places_prises(db, creneau.id)
    seances = (
        db.query(SeancePratique)
        .filter(SeancePratique.creneau_id == creneau.id, SeancePratique.statut != StatutSeance.annulee.value)
        .all()
    )
    candidats = []
    for seance in seances:
        candidat = db.get(Utilisateur, seance.candidat_id)
        candidats.append(
            {
                "seance_id": seance.id,
                "candidat_id": seance.candidat_id,
                "candidat_name": f"{candidat.prenom} {candidat.nom}".strip() if candidat else "—",
            }
        )
    return {
        "id": creneau.id,
        "moniteur_id": creneau.moniteur_id,
        "auto_ecole_id": creneau.auto_ecole_id,
        "starts_at": creneau.starts_at,
        "ends_at": creneau.ends_at,
        "capacite_max": creneau.capacite_max,
        "places_prises": places_prises,
        "places_libres": max(0, creneau.capacite_max - places_prises),
        "statut": creneau.statut,
        "lieu": creneau.lieu,
        "notes": creneau.notes,
        "candidats": candidats,
    }


def _sync_creneau_statut(db: Session, creneau: CreneauMoniteur) -> None:
    places = _creneau_places_prises(db, creneau.id)
    if creneau.statut == StatutCreneau.annule.value:
        return
    creneau.statut = StatutCreneau.complet.value if places >= creneau.capacite_max else StatutCreneau.ouvert.value


def moniteur_school(db: Session, moniteur: Utilisateur) -> AutoEcole | None:
    link = db.query(MoniteurAutoEcole).filter(MoniteurAutoEcole.utilisateur_id == moniteur.id, MoniteurAutoEcole.est_actif.is_(True)).first()
    if link is None:
        return None
    return db.get(AutoEcole, link.auto_ecole_id)


def moniteur_list_eleves(db: Session, moniteur: Utilisateur) -> list[dict]:
    seances = (
        db.query(SeancePratique)
        .filter(SeancePratique.moniteur_id == moniteur.id, SeancePratique.statut != StatutSeance.annulee.value)
        .order_by(SeancePratique.starts_at.asc())
        .all()
    )
    by_candidat: dict[uuid.UUID, dict] = {}
    for seance in seances:
        candidat = db.get(Utilisateur, seance.candidat_id)
        inscription = db.get(Inscription, seance.inscription_id)
        entry = by_candidat.get(seance.candidat_id)
        if entry is None:
            entry = {
                "candidat_id": seance.candidat_id,
                "candidat_name": f"{candidat.prenom} {candidat.nom}".strip() if candidat else "—",
                "candidat_email": candidat.email if candidat else "",
                "candidat_phone": candidat.telephone if candidat else None,
                "forfait_label": inscription.forfait_label if inscription else "—",
                "heures_restantes": inscription.heures_conduite_restantes if inscription else 0,
                "heures_total": inscription.heures_conduite_total if inscription else 0,
                "seances_count": 0,
                "next_seance_at": None,
            }
            by_candidat[seance.candidat_id] = entry
        entry["seances_count"] += 1
        if seance.statut not in {StatutSeance.terminee.value, StatutSeance.annulee.value}:
            if entry["next_seance_at"] is None or seance.starts_at < entry["next_seance_at"]:
                entry["next_seance_at"] = seance.starts_at
    return sorted(by_candidat.values(), key=lambda item: item["candidat_name"])


def moniteur_list_creneaux(db: Session, moniteur: Utilisateur, week_start: date | None = None) -> list[dict]:
    q = db.query(CreneauMoniteur).filter(CreneauMoniteur.moniteur_id == moniteur.id)
    if week_start:
        start, end = week_bounds(week_start)
        q = q.filter(CreneauMoniteur.starts_at >= start, CreneauMoniteur.starts_at < end)
    items = q.order_by(CreneauMoniteur.starts_at.asc()).all()
    return [creneau_to_public(db, item) for item in items]


def moniteur_create_creneau(
    db: Session,
    moniteur: Utilisateur,
    *,
    starts_at: datetime,
    duration_minutes: int,
    capacite_max: int,
    lieu: str | None,
    notes: str | None,
) -> CreneauMoniteur:
    school = moniteur_school(db, moniteur)
    if school is None:
        raise ValueError("Aucune auto-école associée")
    link = _moniteur_link(db, moniteur.id, school.id)
    if link is None:
        raise ValueError("Moniteur inactif")
    capacite = min(max(capacite_max, 1), min(link.capacite_creneau, 2))
    ends_at = starts_at + timedelta(minutes=duration_minutes)
    validate_moniteur_schedule(db, moniteur.id, school.id, starts_at, ends_at)
    creneau = CreneauMoniteur(
        auto_ecole_id=school.id,
        moniteur_id=moniteur.id,
        starts_at=starts_at,
        ends_at=ends_at,
        capacite_max=capacite,
        lieu=(lieu or "").strip() or None,
        notes=(notes or "").strip() or None,
    )
    db.add(creneau)
    db.commit()
    db.refresh(creneau)
    return creneau


def moniteur_delete_creneau(db: Session, moniteur: Utilisateur, creneau_id: uuid.UUID) -> None:
    creneau = db.get(CreneauMoniteur, creneau_id)
    if creneau is None or creneau.moniteur_id != moniteur.id:
        raise ValueError("Créneau introuvable")
    if _creneau_places_prises(db, creneau.id) > 0:
        raise ValueError("Impossible de supprimer un créneau avec des candidats affectés")
    creneau.statut = StatutCreneau.annule.value
    db.commit()


def moniteur_update_creneau(
    db: Session,
    moniteur: Utilisateur,
    creneau_id: uuid.UUID,
    *,
    starts_at: datetime | None = None,
    duration_minutes: int | None = None,
    lieu: str | None = None,
    notes: str | None = None,
) -> CreneauMoniteur:
    creneau = db.get(CreneauMoniteur, creneau_id)
    if creneau is None or creneau.moniteur_id != moniteur.id:
        raise ValueError("Créneau introuvable")
    if creneau.statut == StatutCreneau.annule.value:
        raise ValueError("Créneau annulé")

    if starts_at is not None:
        creneau.starts_at = starts_at
    if duration_minutes is not None:
        creneau.ends_at = creneau.starts_at + timedelta(minutes=duration_minutes)
    elif starts_at is not None:
        old_minutes = max(30, int((creneau.ends_at - creneau.starts_at).total_seconds() // 60))
        creneau.ends_at = creneau.starts_at + timedelta(minutes=old_minutes)

    if starts_at is not None or duration_minutes is not None:
        validate_moniteur_schedule(
            db,
            moniteur.id,
            creneau.auto_ecole_id,
            creneau.starts_at,
            creneau.ends_at,
            exclude_creneau_id=creneau.id,
        )
        linked_seances = (
            db.query(SeancePratique)
            .filter(
                SeancePratique.creneau_id == creneau.id,
                SeancePratique.statut != StatutSeance.annulee.value,
            )
            .all()
        )
        for seance in linked_seances:
            seance.starts_at = creneau.starts_at
            seance.ends_at = creneau.ends_at

    if lieu is not None:
        creneau.lieu = lieu.strip() or None
    if notes is not None:
        creneau.notes = notes.strip() or None

    db.commit()
    db.refresh(creneau)
    return creneau


def moniteur_weekly_planning(db: Session, moniteur: Utilisateur, week_start: date) -> dict:
    start, end = week_bounds(week_start)
    link = db.query(MoniteurAutoEcole).filter(MoniteurAutoEcole.utilisateur_id == moniteur.id, MoniteurAutoEcole.est_actif.is_(True)).first()
    seances = (
        db.query(SeancePratique)
        .filter(
            SeancePratique.moniteur_id == moniteur.id,
            SeancePratique.starts_at >= start,
            SeancePratique.starts_at < end,
        )
        .order_by(SeancePratique.starts_at.asc())
        .all()
    )
    creneaux = (
        db.query(CreneauMoniteur)
        .filter(
            CreneauMoniteur.moniteur_id == moniteur.id,
            CreneauMoniteur.starts_at >= start,
            CreneauMoniteur.starts_at < end,
            CreneauMoniteur.statut != StatutCreneau.annule.value,
        )
        .order_by(CreneauMoniteur.starts_at.asc())
        .all()
    )
    active_seances = [s for s in seances if s.statut != StatutSeance.annulee.value]
    hours = sum((s.ends_at - s.starts_at).total_seconds() / 3600 for s in active_seances)
    return {
        "week_start": week_start.isoformat(),
        "week_end": (week_start + timedelta(days=6)).isoformat(),
        "max_seances_semaine": link.max_seances_semaine if link else 12,
        "seances_semaine": len(active_seances),
        "heures_semaine": round(hours, 1),
        "seances": [seance_to_public(db, s) for s in seances],
        "creneaux": [creneau_to_public(db, c) for c in creneaux],
    }


def gerant_list_moniteur_creneaux(db: Session, gerant: Utilisateur, moniteur_id: uuid.UUID, week_start: date | None) -> list[dict]:
    school = db.query(AutoEcole).filter(AutoEcole.gerant_id == gerant.id).first()
    if school is None:
        return []
    _validate_moniteur_school(db, school.id, moniteur_id)
    q = db.query(CreneauMoniteur).filter(
        CreneauMoniteur.moniteur_id == moniteur_id,
        CreneauMoniteur.auto_ecole_id == school.id,
        CreneauMoniteur.statut == StatutCreneau.ouvert.value,
    )
    if week_start:
        start, end = week_bounds(week_start)
        q = q.filter(CreneauMoniteur.starts_at >= start, CreneauMoniteur.starts_at < end)
    items = q.order_by(CreneauMoniteur.starts_at.asc()).all()
    return [creneau_to_public(db, item) for item in items if _creneau_places_prises(db, item.id) < item.capacite_max]


def gerant_assign_seance_to_creneau(
    db: Session,
    gerant: Utilisateur,
    *,
    creneau_id: uuid.UUID,
    inscription_id: uuid.UUID,
) -> SeancePratique:
    school = db.query(AutoEcole).filter(AutoEcole.gerant_id == gerant.id).first()
    if school is None:
        raise ValueError("Auto-école introuvable")
    creneau = db.get(CreneauMoniteur, creneau_id)
    if creneau is None or creneau.auto_ecole_id != school.id:
        raise ValueError("Créneau introuvable")
    if creneau.statut != StatutCreneau.ouvert.value:
        raise ValueError("Ce créneau n'est plus disponible")
    if _creneau_places_prises(db, creneau.id) >= creneau.capacite_max:
        raise ValueError("Créneau complet")
    inscription = db.get(Inscription, inscription_id)
    if inscription is None or inscription.auto_ecole_id != school.id:
        raise ValueError("Inscription introuvable")
    if inscription.heures_conduite_restantes <= 0 and inscription.heures_conduite_total > 0:
        raise ValueError("Plus d'heures de conduite restantes pour ce candidat")
    validate_moniteur_schedule(
        db,
        creneau.moniteur_id,
        school.id,
        creneau.starts_at,
        creneau.ends_at,
        exclude_creneau_id=creneau.id,
    )
    seance = SeancePratique(
        inscription_id=inscription.id,
        auto_ecole_id=school.id,
        candidat_id=inscription.candidat_id,
        moniteur_id=creneau.moniteur_id,
        creneau_id=creneau.id,
        starts_at=creneau.starts_at,
        ends_at=creneau.ends_at,
        statut=StatutSeance.planifiee.value,
        lieu=creneau.lieu,
        notes=creneau.notes,
    )
    db.add(seance)
    db.flush()
    _sync_creneau_statut(db, creneau)
    db.commit()
    db.refresh(seance)
    notify_seance_event(db, seance, event="assigned")
    return seance


def _validate_moniteur_school(db: Session, school_id: uuid.UUID, moniteur_id: uuid.UUID) -> None:
    link = (
        db.query(MoniteurAutoEcole)
        .filter(
            MoniteurAutoEcole.auto_ecole_id == school_id,
            MoniteurAutoEcole.utilisateur_id == moniteur_id,
            MoniteurAutoEcole.est_actif.is_(True),
        )
        .first()
    )
    if link is None:
        raise ValueError("Moniteur non rattaché à cette auto-école")


def gerant_update_moniteur_limits(
    db: Session,
    gerant: Utilisateur,
    moniteur_id: uuid.UUID,
    *,
    max_seances_semaine: int | None,
    capacite_creneau: int | None,
) -> dict:
    school = db.query(AutoEcole).filter(AutoEcole.gerant_id == gerant.id).first()
    if school is None:
        raise ValueError("Auto-école introuvable")
    link = _moniteur_link(db, moniteur_id, school.id)
    if link is None:
        raise ValueError("Moniteur introuvable")
    if max_seances_semaine is not None:
        if max_seances_semaine < 1 or max_seances_semaine > 40:
            raise ValueError("max_seances_semaine doit être entre 1 et 40")
        link.max_seances_semaine = max_seances_semaine
    if capacite_creneau is not None:
        if capacite_creneau < 1 or capacite_creneau > 2:
            raise ValueError("capacite_creneau doit être 1 ou 2")
        link.capacite_creneau = capacite_creneau
    db.commit()
    db.refresh(link)
    return {"max_seances_semaine": link.max_seances_semaine, "capacite_creneau": link.capacite_creneau}


def list_notifications(db: Session, user: Utilisateur, *, unread_only: bool = False) -> list[dict]:
    q = db.query(Notification).filter(Notification.utilisateur_id == user.id)
    if unread_only:
        q = q.filter(Notification.lu.is_(False))
    items = q.order_by(Notification.created_at.desc()).limit(50).all()
    return [
        {
            "id": item.id,
            "type": item.type,
            "title_fr": item.title_fr,
            "title_en": item.title_en,
            "body_fr": item.body_fr,
            "body_en": item.body_en,
            "payload": item.payload,
            "lu": item.lu,
            "created_at": item.created_at,
        }
        for item in items
    ]


def mark_notification_read(db: Session, user: Utilisateur, notification_id: uuid.UUID) -> None:
    item = db.get(Notification, notification_id)
    if item is None or item.utilisateur_id != user.id:
        raise ValueError("Notification introuvable")
    item.lu = True
    db.commit()


def mark_all_notifications_read(db: Session, user: Utilisateur) -> None:
    db.query(Notification).filter(Notification.utilisateur_id == user.id, Notification.lu.is_(False)).update({"lu": True})
    db.commit()
