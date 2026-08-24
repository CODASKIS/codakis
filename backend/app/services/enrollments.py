import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.db.models import (
    AutoEcole,
    Forfait,
    Inscription,
    MoniteurAutoEcole,
    SeancePratique,
    StatutInscription,
    StatutSeance,
    TypeForfait,
    Utilisateur,
    Ville,
)

from app.services.school_hours import normalize_school_hours

DEFAULT_FORFAITS = [
    (TypeForfait.code_seul.value, "Code en salle", "Classroom theory", 35000, 0),
    (TypeForfait.code_seul.value, "Code en ligne", "Online theory", 28000, 0),
    (TypeForfait.conduite_seule.value, "Conduite 10h", "Driving 10h", 85000, 10),
    (TypeForfait.conduite_seule.value, "Conduite 20h", "Driving 20h", 150000, 20),
    (TypeForfait.complet.value, "Forfait complet 20h", "Full package 20h", 185000, 20),
]


def seed_default_forfaits(db: Session, school: AutoEcole) -> None:
    existing = db.query(Forfait).filter(Forfait.auto_ecole_id == school.id).count()
    if existing > 0:
        return
    for type_, label_fr, label_en, prix, heures in DEFAULT_FORFAITS:
        db.add(
            Forfait(
                auto_ecole_id=school.id,
                type=type_,
                label_fr=label_fr,
                label_en=label_en,
                prix=prix,
                heures_conduite=heures or None,
                description_fr=f"Forfait {label_fr} — {school.raison_sociale}",
                description_en=f"{label_en} package — {school.raison_sociale}",
            )
        )
    db.commit()


def forfait_to_public(forfait: Forfait) -> dict:
    return {
        "id": forfait.id,
        "type": forfait.type,
        "label_fr": forfait.label_fr,
        "label_en": forfait.label_en,
        "prix": forfait.prix,
        "heures_conduite": forfait.heures_conduite,
        "description_fr": forfait.description_fr,
        "description_en": forfait.description_en,
    }


def forfait_to_admin(forfait: Forfait) -> dict:
    return {**forfait_to_public(forfait), "est_actif": forfait.est_actif, "auto_ecole_id": forfait.auto_ecole_id}


def _get_gerant_school(db: Session, gerant: Utilisateur) -> AutoEcole | None:
    return db.query(AutoEcole).filter(AutoEcole.gerant_id == gerant.id).first()


def gerant_list_forfaits(db: Session, gerant: Utilisateur) -> list[dict]:
    school = _get_gerant_school(db, gerant)
    if school is None:
        return []
    if db.query(Forfait).filter(Forfait.auto_ecole_id == school.id).count() == 0:
        seed_default_forfaits(db, school)
    items = (
        db.query(Forfait)
        .filter(Forfait.auto_ecole_id == school.id)
        .order_by(Forfait.type.asc(), Forfait.prix.asc())
        .all()
    )
    return [forfait_to_admin(item) for item in items]


def gerant_create_forfait(db: Session, gerant: Utilisateur, data) -> Forfait:
    school = _get_gerant_school(db, gerant)
    if school is None:
        raise ValueError("Auto-école introuvable")
    forfait = Forfait(
        auto_ecole_id=school.id,
        type=data.type,
        label_fr=data.label_fr.strip(),
        label_en=data.label_en.strip(),
        prix=data.prix,
        heures_conduite=data.heures_conduite,
        description_fr=(data.description_fr or "").strip() or None,
        description_en=(data.description_en or "").strip() or None,
        est_actif=data.est_actif,
    )
    db.add(forfait)
    db.commit()
    db.refresh(forfait)
    return forfait


def gerant_update_forfait(db: Session, gerant: Utilisateur, forfait_id: uuid.UUID, data) -> Forfait:
    school = _get_gerant_school(db, gerant)
    if school is None:
        raise ValueError("Auto-école introuvable")
    forfait = db.get(Forfait, forfait_id)
    if forfait is None or forfait.auto_ecole_id != school.id:
        raise ValueError("Forfait introuvable")
    if data.type is not None:
        forfait.type = data.type
    if data.label_fr is not None:
        forfait.label_fr = data.label_fr.strip()
    if data.label_en is not None:
        forfait.label_en = data.label_en.strip()
    if data.prix is not None:
        forfait.prix = data.prix
    if data.heures_conduite is not None:
        forfait.heures_conduite = data.heures_conduite
    if data.description_fr is not None:
        forfait.description_fr = data.description_fr.strip() or None
    if data.description_en is not None:
        forfait.description_en = data.description_en.strip() or None
    if data.est_actif is not None:
        forfait.est_actif = data.est_actif
    db.commit()
    db.refresh(forfait)
    return forfait


def gerant_delete_forfait(db: Session, gerant: Utilisateur, forfait_id: uuid.UUID) -> None:
    school = _get_gerant_school(db, gerant)
    if school is None:
        raise ValueError("Auto-école introuvable")
    forfait = db.get(Forfait, forfait_id)
    if forfait is None or forfait.auto_ecole_id != school.id:
        raise ValueError("Forfait introuvable")
    forfait.est_actif = False
    db.commit()


def _inscription_base(db: Session, inscription: Inscription) -> dict:
    candidat = db.get(Utilisateur, inscription.candidat_id)
    seances_count = db.query(SeancePratique).filter(SeancePratique.inscription_id == inscription.id).count()
    return {
        "id": inscription.id,
        "candidat_id": inscription.candidat_id,
        "candidat_name": f"{candidat.prenom} {candidat.nom}".strip() if candidat else "—",
        "candidat_email": candidat.email if candidat else "",
        "candidat_phone": candidat.telephone if candidat else None,
        "forfait_id": inscription.forfait_id,
        "forfait_type": inscription.forfait_type,
        "forfait_label": inscription.forfait_label,
        "statut": inscription.statut,
        "payment_ref": inscription.payment_ref,
        "heures_conduite_total": inscription.heures_conduite_total,
        "heures_conduite_restantes": inscription.heures_conduite_restantes,
        "enrolled_at": inscription.enrolled_at,
        "seances_count": seances_count,
    }


def seance_to_public(db: Session, seance: SeancePratique) -> dict:
    moniteur = db.get(Utilisateur, seance.moniteur_id) if seance.moniteur_id else None
    return {
        "id": seance.id,
        "inscription_id": seance.inscription_id,
        "candidat_id": seance.candidat_id,
        "moniteur_id": seance.moniteur_id,
        "moniteur_name": f"{moniteur.prenom} {moniteur.nom}".strip() if moniteur else None,
        "starts_at": seance.starts_at,
        "ends_at": seance.ends_at,
        "statut": seance.statut,
        "lieu": seance.lieu,
        "notes": seance.notes,
    }


def create_inscription(
    db: Session,
    *,
    candidat: Utilisateur,
    school: AutoEcole,
    forfait: Forfait | None,
    forfait_type: str,
    forfait_label: str,
    payment_ref: str | None = None,
) -> Inscription:
    heures = forfait.heures_conduite if forfait and forfait.heures_conduite else 0
    inscription = Inscription(
        candidat_id=candidat.id,
        auto_ecole_id=school.id,
        forfait_id=forfait.id if forfait else None,
        forfait_type=forfait_type,
        forfait_label=forfait_label,
        statut=StatutInscription.confirmee.value,
        payment_ref=payment_ref,
        heures_conduite_total=heures,
        heures_conduite_restantes=heures,
    )
    db.add(inscription)
    db.commit()
    db.refresh(inscription)
    return inscription


def gerant_list_inscriptions(db: Session, gerant: Utilisateur) -> list[dict]:
    school = db.query(AutoEcole).filter(AutoEcole.gerant_id == gerant.id).first()
    if school is None:
        return []
    inscriptions = (
        db.query(Inscription)
        .filter(Inscription.auto_ecole_id == school.id)
        .order_by(Inscription.enrolled_at.desc())
        .all()
    )
    return [_inscription_base(db, item) for item in inscriptions]


def gerant_get_inscription(db: Session, gerant: Utilisateur, inscription_id: uuid.UUID) -> dict | None:
    school = db.query(AutoEcole).filter(AutoEcole.gerant_id == gerant.id).first()
    if school is None:
        return None
    inscription = db.get(Inscription, inscription_id)
    if inscription is None or inscription.auto_ecole_id != school.id:
        return None
    data = _inscription_base(db, inscription)
    seances = (
        db.query(SeancePratique)
        .filter(SeancePratique.inscription_id == inscription.id)
        .order_by(SeancePratique.starts_at.asc())
        .all()
    )
    data["seances"] = [seance_to_public(db, item) for item in seances]
    return data


def _validate_moniteur_for_school(db: Session, school_id: uuid.UUID, moniteur_id: uuid.UUID) -> None:
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


def gerant_create_seance(
    db: Session,
    gerant: Utilisateur,
    *,
    inscription_id: uuid.UUID,
    moniteur_id: uuid.UUID | None,
    starts_at: datetime,
    duration_minutes: int = 60,
    lieu: str | None = None,
    notes: str | None = None,
) -> SeancePratique:
    school = db.query(AutoEcole).filter(AutoEcole.gerant_id == gerant.id).first()
    if school is None:
        raise ValueError("Auto-école introuvable")
    inscription = db.get(Inscription, inscription_id)
    if inscription is None or inscription.auto_ecole_id != school.id:
        raise ValueError("Inscription introuvable")
    if moniteur_id:
        _validate_moniteur_for_school(db, school.id, moniteur_id)
    ends_at = starts_at + timedelta(minutes=duration_minutes)
    if moniteur_id:
        from app.services.scheduling import validate_moniteur_schedule

        validate_moniteur_schedule(db, moniteur_id, school.id, starts_at, ends_at)
    seance = SeancePratique(
        inscription_id=inscription.id,
        auto_ecole_id=school.id,
        candidat_id=inscription.candidat_id,
        moniteur_id=moniteur_id,
        starts_at=starts_at,
        ends_at=ends_at,
        statut=StatutSeance.planifiee.value,
        lieu=(lieu or "").strip() or None,
        notes=(notes or "").strip() or None,
    )
    db.add(seance)
    db.commit()
    db.refresh(seance)
    from app.services.notifications import notify_seance_event

    notify_seance_event(db, seance, event="assigned")
    return seance


def gerant_update_seance(
    db: Session,
    gerant: Utilisateur,
    seance_id: uuid.UUID,
    *,
    moniteur_id: uuid.UUID | None = None,
    moniteur_id_set: bool = False,
    starts_at: datetime | None = None,
    duration_minutes: int | None = None,
    statut: str | None = None,
    lieu: str | None = None,
    notes: str | None = None,
) -> SeancePratique:
    school = db.query(AutoEcole).filter(AutoEcole.gerant_id == gerant.id).first()
    if school is None:
        raise ValueError("Auto-école introuvable")
    seance = db.get(SeancePratique, seance_id)
    if seance is None or seance.auto_ecole_id != school.id:
        raise ValueError("Séance introuvable")
    if moniteur_id_set:
        if moniteur_id:
            _validate_moniteur_for_school(db, school.id, moniteur_id)
        seance.moniteur_id = moniteur_id
    if starts_at is not None:
        seance.starts_at = starts_at
    if duration_minutes is not None:
        seance.ends_at = seance.starts_at + timedelta(minutes=duration_minutes)
    check_start = starts_at if starts_at is not None else seance.starts_at
    check_end = seance.ends_at
    target_moniteur = moniteur_id if moniteur_id_set else seance.moniteur_id
    if target_moniteur and (starts_at is not None or duration_minutes is not None or moniteur_id_set):
        from app.services.scheduling import validate_moniteur_schedule

        validate_moniteur_schedule(
            db,
            target_moniteur,
            school.id,
            check_start,
            check_end,
            exclude_seance_id=seance.id,
        )
    if statut is not None:
        seance.statut = statut
        if statut == StatutSeance.terminee.value:
            inscription = db.get(Inscription, seance.inscription_id)
            if inscription and inscription.heures_conduite_restantes > 0:
                hours = max(1, int((seance.ends_at - seance.starts_at).total_seconds() // 3600))
                inscription.heures_conduite_restantes = max(0, inscription.heures_conduite_restantes - hours)
    if lieu is not None:
        seance.lieu = lieu.strip() or None
    if notes is not None:
        seance.notes = notes.strip() or None
    db.commit()
    db.refresh(seance)
    from app.services.notifications import notify_seance_event

    if statut == StatutSeance.confirmee.value:
        notify_seance_event(db, seance, event="confirmed")
    elif statut == StatutSeance.terminee.value:
        notify_seance_event(db, seance, event="completed")
    return seance


def candidat_list_inscriptions(db: Session, candidat: Utilisateur) -> list[dict]:
    inscriptions = (
        db.query(Inscription)
        .filter(Inscription.candidat_id == candidat.id, Inscription.statut != "annulee")
        .order_by(Inscription.enrolled_at.desc())
        .all()
    )
    results: list[dict] = []
    for item in inscriptions:
        data = _inscription_base(db, item)
        school = db.get(AutoEcole, item.auto_ecole_id)
        data["school_name"] = school.raison_sociale if school else "—"
        data["auto_ecole_id"] = item.auto_ecole_id
        results.append(data)
    return results


def candidat_get_inscription(db: Session, candidat: Utilisateur, inscription_id: uuid.UUID) -> dict | None:
    inscription = db.get(Inscription, inscription_id)
    if inscription is None or inscription.candidat_id != candidat.id:
        return None
    data = _inscription_base(db, inscription)
    school = db.get(AutoEcole, inscription.auto_ecole_id)
    data["school_name"] = school.raison_sociale if school else "—"
    data["auto_ecole_id"] = inscription.auto_ecole_id
    seances = (
        db.query(SeancePratique)
        .filter(SeancePratique.inscription_id == inscription.id)
        .order_by(SeancePratique.starts_at.asc())
        .all()
    )
    data["seances"] = [seance_to_public(db, item) for item in seances]
    return data


def candidat_list_seances(db: Session, candidat: Utilisateur) -> list[dict]:
    seances = (
        db.query(SeancePratique)
        .filter(SeancePratique.candidat_id == candidat.id)
        .order_by(SeancePratique.starts_at.asc())
        .all()
    )
    results: list[dict] = []
    for seance in seances:
        school = db.get(AutoEcole, seance.auto_ecole_id)
        inscription = db.get(Inscription, seance.inscription_id)
        results.append(
            {
                **seance_to_public(db, seance),
                "school_name": school.raison_sociale if school else None,
                "forfait_label": inscription.forfait_label if inscription else None,
            }
        )
    return results


def moniteur_seance_to_public(db: Session, seance: SeancePratique) -> dict:
    candidat = db.get(Utilisateur, seance.candidat_id)
    inscription = db.get(Inscription, seance.inscription_id)
    school = db.get(AutoEcole, seance.auto_ecole_id)
    return {
        **seance_to_public(db, seance),
        "candidat_name": f"{candidat.prenom} {candidat.nom}".strip() if candidat else "—",
        "candidat_phone": candidat.telephone if candidat else None,
        "forfait_label": inscription.forfait_label if inscription else None,
        "school_name": school.raison_sociale if school else None,
    }


def moniteur_list_seances(db: Session, moniteur: Utilisateur) -> list[dict]:
    seances = (
        db.query(SeancePratique)
        .filter(SeancePratique.moniteur_id == moniteur.id)
        .order_by(SeancePratique.starts_at.asc())
        .all()
    )
    return [moniteur_seance_to_public(db, item) for item in seances]


def moniteur_update_seance(
    db: Session,
    moniteur: Utilisateur,
    seance_id: uuid.UUID,
    *,
    statut: str | None = None,
    starts_at: datetime | None = None,
    duration_minutes: int | None = None,
) -> SeancePratique:
    seance = db.get(SeancePratique, seance_id)
    if seance is None or seance.moniteur_id != moniteur.id:
        raise ValueError("Séance introuvable")
    if starts_at is not None or duration_minutes is not None:
        if seance.statut not in {StatutSeance.planifiee.value, StatutSeance.confirmee.value}:
            raise ValueError("Impossible de déplacer cette séance")
        if starts_at is not None:
            seance.starts_at = starts_at
        if duration_minutes is not None:
            seance.ends_at = seance.starts_at + timedelta(minutes=duration_minutes)
        elif starts_at is not None:
            old_minutes = max(30, int((seance.ends_at - seance.starts_at).total_seconds() // 60))
            seance.ends_at = seance.starts_at + timedelta(minutes=old_minutes)
        from app.services.scheduling import validate_moniteur_schedule

        validate_moniteur_schedule(
            db,
            moniteur.id,
            seance.auto_ecole_id,
            seance.starts_at,
            seance.ends_at,
            exclude_seance_id=seance.id,
        )
    if statut is not None:
        if statut not in {StatutSeance.confirmee.value, StatutSeance.terminee.value}:
            raise ValueError("Statut non autorisé")
        seance.statut = statut
        if statut == StatutSeance.terminee.value:
            inscription = db.get(Inscription, seance.inscription_id)
            if inscription and inscription.heures_conduite_restantes > 0:
                hours = max(1, int((seance.ends_at - seance.starts_at).total_seconds() // 3600))
                inscription.heures_conduite_restantes = max(0, inscription.heures_conduite_restantes - hours)
    db.commit()
    db.refresh(seance)
    from app.services.notifications import notify_seance_event

    if statut == StatutSeance.confirmee.value:
        notify_seance_event(db, seance, event="confirmed")
    elif statut == StatutSeance.terminee.value:
        notify_seance_event(db, seance, event="completed")
    return seance


def list_public_schools(db: Session, *, query: str | None = None, city: str | None = None) -> list[dict]:
    q = db.query(AutoEcole).filter(AutoEcole.est_validee.is_(True), AutoEcole.est_refusee.is_(False))
    schools = q.order_by(AutoEcole.raison_sociale.asc()).all()
    results: list[dict] = []
    for school in schools:
        ville = db.get(Ville, school.ville_id)
        city_name = ville.nom if ville else ""
        if city and city.strip().lower() not in city_name.lower():
            continue
        if query and query.strip():
            needle = query.strip().lower()
            haystack = f"{school.raison_sociale} {city_name} {school.adresse or ''}".lower()
            if needle not in haystack:
                continue
        price_from = (
            db.query(Forfait.prix)
            .filter(Forfait.auto_ecole_id == school.id, Forfait.est_actif.is_(True))
            .order_by(Forfait.prix.asc())
            .limit(1)
            .scalar()
        )
        results.append(
            {
                "id": school.id,
                "name": school.raison_sociale,
                "city": city_name,
                "district": school.quartier,
                "address": school.adresse,
                "phone": school.telephone,
                "logo_url": school.logo_url,
                "description": school.description,
                "long_description": school.description_longue or school.description,
                "access_info": school.access_info,
                "site_web": school.site_web,
                "latitude": school.latitude,
                "longitude": school.longitude,
                "country_code": school.country_code,
                "price_from": price_from or 85000,
                "certified_since": school.validee_le or school.created_at,
                "hours": normalize_school_hours(school.horaires),
            }
        )
    return results


def get_public_school(db: Session, school_id: uuid.UUID) -> dict | None:
    school = db.get(AutoEcole, school_id)
    if school is None or not school.est_validee or school.est_refusee:
        return None
    ville = db.get(Ville, school.ville_id)
    forfaits = (
        db.query(Forfait)
        .filter(Forfait.auto_ecole_id == school.id, Forfait.est_actif.is_(True))
        .order_by(Forfait.prix.asc())
        .all()
    )
    if not forfaits:
        seed_default_forfaits(db, school)
        forfaits = (
            db.query(Forfait)
            .filter(Forfait.auto_ecole_id == school.id, Forfait.est_actif.is_(True))
            .order_by(Forfait.prix.asc())
            .all()
        )
    price_from = forfaits[0].prix if forfaits else 85000
    return {
        "id": school.id,
        "name": school.raison_sociale,
        "legal_name": school.raison_sociale_legale,
        "city": ville.nom if ville else "",
        "district": school.quartier,
        "address": school.adresse,
        "phone": school.telephone,
        "logo_url": school.logo_url,
        "description": school.description,
        "long_description": school.description_longue or school.description,
        "access_info": school.access_info,
        "site_web": school.site_web,
        "latitude": school.latitude,
        "longitude": school.longitude,
        "country_code": school.country_code,
        "price_from": price_from,
        "certified_since": school.validee_le or school.created_at,
        "hours": normalize_school_hours(school.horaires),
        "forfaits": [forfait_to_public(item) for item in forfaits],
    }
