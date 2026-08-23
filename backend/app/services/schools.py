from sqlalchemy.orm import Session

from app.db.models import AutoEcole, Utilisateur, Ville
from app.services.users import get_or_create_ville, normalize_country


from app.services.school_hours import DEFAULT_SCHOOL_HOURS, normalize_school_hours


def _school_public_fields(school: AutoEcole) -> dict:
    return {
        "raison_sociale_legale": school.raison_sociale_legale,
        "rccm": school.rccm,
        "site_web": school.site_web,
        "logo_url": school.logo_url,
        "description": school.description,
        "description_longue": school.description_longue,
        "access_info": school.access_info,
        "telephone": school.telephone,
        "nombre_moniteurs": school.nombre_moniteurs,
        "nombre_vehicules": school.nombre_vehicules,
        "annees_experience": school.annees_experience,
        "fonction_gerant": school.fonction_gerant,
        "quartier": school.quartier,
        "latitude": school.latitude,
        "longitude": school.longitude,
        "horaires": normalize_school_hours(school.horaires),
    }


def get_gerant_school(db: Session, gerant: Utilisateur) -> AutoEcole | None:
    return db.query(AutoEcole).filter(AutoEcole.gerant_id == gerant.id).first()


def school_to_gerant(db: Session, school: AutoEcole) -> dict:
    ville = db.get(Ville, school.ville_id)
    return {
        "id": school.id,
        "raison_sociale": school.raison_sociale,
        "numero_agrement": school.numero_agrement,
        "adresse": school.adresse,
        "ville": ville.nom if ville else None,
        "country_code": school.country_code,
        "est_validee": school.est_validee,
        "est_refusee": school.est_refusee,
        "motif_refus": school.motif_refus,
        "validee_le": school.validee_le,
        "created_at": school.created_at,
        **_school_public_fields(school),
    }


def update_gerant_school(
    db: Session,
    gerant: Utilisateur,
    *,
    raison_sociale: str | None = None,
    raison_sociale_legale: str | None = None,
    numero_agrement: str | None = None,
    rccm: str | None = None,
    adresse: str | None = None,
    city: str | None = None,
    country_code: str | None = None,
    site_web: str | None = None,
    logo_url: str | None = None,
    description: str | None = None,
    telephone: str | None = None,
    nombre_moniteurs: int | None = None,
    nombre_vehicules: int | None = None,
    annees_experience: int | None = None,
    fonction_gerant: str | None = None,
    quartier: str | None = None,
    description_longue: str | None = None,
    access_info: str | None = None,
    latitude: float | None = None,
    longitude: float | None = None,
    horaires: dict | None = None,
) -> AutoEcole:
    school = get_gerant_school(db, gerant)
    if school is None:
        raise ValueError("Auto-école introuvable")
    if school.est_refusee:
        raise ValueError("Votre auto-école a été refusée — contactez l'administration CODAKIS")

    if raison_sociale is not None:
        school.raison_sociale = raison_sociale.strip()
    if raison_sociale_legale is not None:
        school.raison_sociale_legale = raison_sociale_legale.strip() or None
    if country_code is not None:
        school.country_code = normalize_country(country_code)
    if numero_agrement is not None:
        agrement = numero_agrement.strip()
        if not agrement:
            raise ValueError("Le numéro d'agrément est obligatoire")
        conflict = (
            db.query(AutoEcole)
            .filter(
                AutoEcole.country_code == school.country_code,
                AutoEcole.numero_agrement == agrement,
                AutoEcole.id != school.id,
            )
            .first()
        )
        if conflict:
            raise ValueError("Ce numéro d'agrément est déjà utilisé pour ce pays")
        school.numero_agrement = agrement
    if rccm is not None:
        school.rccm = rccm.strip() or None
    if adresse is not None:
        school.adresse = adresse.strip()
    if city is not None:
        ville = get_or_create_ville(db, country_code or school.country_code, city)
        school.ville_id = ville.id
    if site_web is not None:
        school.site_web = site_web.strip() or None
    if logo_url is not None:
        school.logo_url = logo_url.strip() or None
    if description is not None:
        school.description = description.strip() or None
    if telephone is not None:
        school.telephone = telephone.strip() or None
    if nombre_moniteurs is not None:
        school.nombre_moniteurs = nombre_moniteurs
    if nombre_vehicules is not None:
        school.nombre_vehicules = nombre_vehicules
    if annees_experience is not None:
        school.annees_experience = annees_experience
    if fonction_gerant is not None:
        school.fonction_gerant = fonction_gerant.strip() or None
    if quartier is not None:
        school.quartier = quartier.strip() or None
    if description_longue is not None:
        school.description_longue = description_longue.strip() or None
    if access_info is not None:
        school.access_info = access_info.strip() or None
    if latitude is not None:
        school.latitude = latitude
    if longitude is not None:
        school.longitude = longitude
    if horaires is not None:
        school.horaires = normalize_school_hours(horaires)

    db.commit()
    db.refresh(school)
    return school
