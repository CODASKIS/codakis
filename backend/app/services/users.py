import uuid
from datetime import UTC, datetime

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.db.models import (
    ArticleBlog,
    AutoEcole,
    CodeVerification,
    DossierAdministratif,
    FournisseurAuth,
    MoniteurAutoEcole,
    Pays,
    RoleUtilisateur,
    Utilisateur,
    Ville,
)
from app.schemas.auth import UserPublic
from app.services.consort import init_candidat_dossier as init_dossier_consort
from app.services.email import generate_temp_password, send_moniteur_invite_email, send_welcome_email
from app.services.pedagogy import has_premium_access


ROLE_TO_FRONT: dict[str, str] = {
    RoleUtilisateur.candidat.value: "candidat",
    RoleUtilisateur.gerant_auto_ecole.value: "gerant",
    RoleUtilisateur.moniteur.value: "moniteur",
    RoleUtilisateur.administrateur.value: "admin",
}

FRONT_TO_ROLE: dict[str, RoleUtilisateur] = {
    "candidat": RoleUtilisateur.candidat,
    "gerant": RoleUtilisateur.gerant_auto_ecole,
    "moniteur": RoleUtilisateur.moniteur,
    "admin": RoleUtilisateur.administrateur,
}


def split_full_name(full_name: str) -> tuple[str, str]:
    parts = full_name.strip().split()
    if len(parts) == 1:
        return parts[0], parts[0]
    return parts[0], " ".join(parts[1:])


def normalize_country(code: str) -> str:
    return code.strip().upper()


def ensure_country(db: Session, country_code: str) -> None:
    code = normalize_country(country_code)
    if db.get(Pays, code) is None:
        db.add(Pays(code=code, nom_fr=code, nom_en=code, est_actif=True))
        db.commit()


def get_or_create_ville(db: Session, country_code: str, city_name: str) -> Ville:
    code = normalize_country(country_code)
    name = city_name.strip()
    existing = db.query(Ville).filter(Ville.country_code == code, Ville.nom.ilike(name)).first()
    if existing:
        return existing
    ville = Ville(country_code=code, nom=name)
    db.add(ville)
    db.flush()
    return ville


def init_candidat_dossier(db: Session, user: Utilisateur) -> None:
    init_dossier_consort(db, user)


def user_to_public(db: Session, user: Utilisateur) -> UserPublic:
    school_validated = None
    school_id = None
    school_name = None

    if user.role == RoleUtilisateur.gerant_auto_ecole.value:
        school = db.query(AutoEcole).filter(AutoEcole.gerant_id == user.id).first()
        if school:
            school_validated = school.est_validee
            school_id = school.id
            school_name = school.raison_sociale

    if user.role == RoleUtilisateur.moniteur.value:
        link = (
            db.query(MoniteurAutoEcole)
            .filter(MoniteurAutoEcole.utilisateur_id == user.id, MoniteurAutoEcole.est_actif.is_(True))
            .first()
        )
        if link:
            school = db.get(AutoEcole, link.auto_ecole_id)
            if school:
                school_validated = school.est_validee
                school_id = school.id
                school_name = school.raison_sociale

    city = None
    if user.ville_id:
        ville = db.get(Ville, user.ville_id)
        city = ville.nom if ville else None

    plan = None
    if user.role == RoleUtilisateur.candidat.value:
        plan = "premium" if has_premium_access(db, user) else "free"

    return UserPublic(
        id=user.id,
        email=user.email,
        role=ROLE_TO_FRONT.get(user.role, user.role),
        first_name=user.prenom,
        last_name=user.nom,
        phone=user.telephone,
        city=city,
        avatar_url=user.avatar_url,
        country_code=user.country_code,
        langue=user.langue,
        is_active=user.est_actif,
        school_validated=school_validated,
        school_id=school_id,
        school_name=school_name,
        plan=plan,
        has_password=bool(user.mot_de_passe_hash),
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


def build_tokens(user: Utilisateur) -> dict[str, str]:
    subject = str(user.id)
    return {
        "access_token": create_access_token(subject),
        "refresh_token": create_refresh_token(subject),
        "token_type": "bearer",
    }


def assert_can_login(db: Session, user: Utilisateur) -> None:
    if not user.est_actif:
        raise ValueError("Compte désactivé")
    if user.role == RoleUtilisateur.gerant_auto_ecole.value:
        school = db.query(AutoEcole).filter(AutoEcole.gerant_id == user.id).first()
        if school and school.est_refusee:
            raise ValueError("Votre demande d'inscription auto-école a été refusée. Consultez votre e-mail pour le motif.")
        if school and not school.est_validee:
            raise ValueError("Votre auto-école est en attente de validation par l'administrateur CODAKIS")


def authenticate_user(db: Session, email: str, password: str) -> Utilisateur:
    user = db.query(Utilisateur).filter(Utilisateur.email == email.lower()).first()
    if user is None or not verify_password(password, user.mot_de_passe_hash):
        raise ValueError("Identifiants invalides")
    assert_can_login(db, user)
    return user


def register_candidat(db: Session, *, email: str, password: str, full_name: str, phone, city, country_code, langue) -> Utilisateur:
    if db.query(Utilisateur).filter(Utilisateur.email == email.lower()).first():
        raise ValueError("Un compte existe déjà avec cet e-mail")
    ensure_country(db, country_code)
    prenom, nom = split_full_name(full_name)
    ville = get_or_create_ville(db, country_code, city or "Inconnu") if city else None
    user = Utilisateur(
        email=email.lower(),
        mot_de_passe_hash=hash_password(password),
        prenom=prenom,
        nom=nom,
        role=RoleUtilisateur.candidat.value,
        country_code=normalize_country(country_code),
        ville_id=ville.id if ville else None,
        telephone=phone,
        langue=langue,
        fournisseur_auth=FournisseurAuth.email.value,
    )
    db.add(user)
    db.flush()
    init_candidat_dossier(db, user)
    db.commit()
    db.refresh(user)
    send_welcome_email(user.email, full_name)
    return user


def register_auto_ecole(
    db: Session,
    *,
    email: str,
    password: str,
    full_name: str,
    phone: str,
    city: str,
    country_code: str,
    langue: str,
    school_name: str,
    school_address: str,
    mint_registration: str | None = None,
    rccm: str | None = None,
    legal_name: str | None = None,
    description: str | None = None,
    website: str | None = None,
    manager_role: str | None = None,
    instructor_count: int | None = None,
    vehicle_count: int | None = None,
    years_operating: int | None = None,
) -> Utilisateur:
    if db.query(Utilisateur).filter(Utilisateur.email == email.lower()).first():
        raise ValueError("Un compte existe déjà avec cet e-mail")

    agrement = (mint_registration or rccm or f"PENDING-{uuid.uuid4().hex[:8]}").strip()
    if db.query(AutoEcole).filter(AutoEcole.numero_agrement == agrement).first():
        raise ValueError("Ce numéro d'agrément est déjà enregistré")

    ensure_country(db, country_code)
    prenom, nom = split_full_name(full_name)
    ville = get_or_create_ville(db, country_code, city)

    user = Utilisateur(
        email=email.lower(),
        mot_de_passe_hash=hash_password(password),
        prenom=prenom,
        nom=nom,
        role=RoleUtilisateur.gerant_auto_ecole.value,
        country_code=normalize_country(country_code),
        ville_id=ville.id,
        telephone=phone,
        langue=langue,
        fournisseur_auth=FournisseurAuth.email.value,
    )
    db.add(user)
    db.flush()

    school = AutoEcole(
        country_code=user.country_code,
        ville_id=ville.id,
        gerant_id=user.id,
        raison_sociale=school_name.strip(),
        raison_sociale_legale=(legal_name or "").strip() or None,
        numero_agrement=agrement,
        rccm=(rccm or "").strip() or None,
        adresse=school_address.strip(),
        site_web=(website or "").strip() or None,
        description=(description or "").strip() or None,
        telephone=phone.strip() or None,
        nombre_moniteurs=instructor_count,
        nombre_vehicules=vehicle_count,
        annees_experience=years_operating,
        fonction_gerant=(manager_role or "").strip() or None,
        est_validee=False,
    )
    db.add(school)
    db.commit()
    db.refresh(user)
    send_welcome_email(user.email, full_name)
    return user


def verify_google_token(id_token_str: str) -> dict:
    if not settings.google_client_id:
        raise ValueError("Google OAuth non configuré (GOOGLE_CLIENT_ID manquant)")
    return id_token.verify_oauth2_token(id_token_str, google_requests.Request(), settings.google_client_id)


def login_or_register_google(db: Session, id_token_str: str) -> Utilisateur:
    payload = verify_google_token(id_token_str)
    email = payload.get("email", "").lower()
    if not email:
        raise ValueError("E-mail Google indisponible")

    google_sub = payload.get("sub")
    avatar = payload.get("picture")
    given_name = payload.get("given_name") or email.split("@")[0]
    family_name = payload.get("family_name") or given_name

    user = db.query(Utilisateur).filter(Utilisateur.email == email).first()
    if user:
        if avatar and not user.avatar_url:
            user.avatar_url = avatar
        if user.fournisseur_auth == FournisseurAuth.email.value:
            user.fournisseur_auth = FournisseurAuth.email_google.value
        elif user.fournisseur_auth != FournisseurAuth.email_google.value:
            user.fournisseur_auth = FournisseurAuth.google.value
        if google_sub and not user.supabase_uid:
            user.supabase_uid = uuid.uuid5(uuid.NAMESPACE_DNS, google_sub)
        db.commit()
        assert_can_login(db, user)
        return user

    ensure_country(db, "CM")
    user = Utilisateur(
        email=email,
        mot_de_passe_hash=None,
        prenom=given_name,
        nom=family_name,
        avatar_url=avatar,
        role=RoleUtilisateur.candidat.value,
        country_code="CM",
        langue="fr",
        fournisseur_auth=FournisseurAuth.google.value,
        supabase_uid=uuid.uuid5(uuid.NAMESPACE_DNS, google_sub) if google_sub else None,
    )
    db.add(user)
    db.flush()
    init_candidat_dossier(db, user)
    db.commit()
    db.refresh(user)
    send_welcome_email(user.email, f"{given_name} {family_name}")
    return user


def admin_create_user(db: Session, data) -> tuple[Utilisateur, str | None]:
    if db.query(Utilisateur).filter(Utilisateur.email == data.email.lower()).first():
        raise ValueError("E-mail déjà utilisé")
    role = FRONT_TO_ROLE.get(data.role, None)
    if role is None:
        try:
            role = RoleUtilisateur(data.role)
        except ValueError as exc:
            raise ValueError("Rôle invalide") from exc

    plain = data.password or generate_temp_password()
    ensure_country(db, data.country_code)
    user = Utilisateur(
        email=data.email.lower(),
        mot_de_passe_hash=hash_password(plain),
        prenom=data.first_name,
        nom=data.last_name,
        role=role.value,
        country_code=normalize_country(data.country_code),
        telephone=data.phone,
        langue=data.langue,
        fournisseur_auth=FournisseurAuth.email.value,
    )
    db.add(user)
    db.flush()
    if role == RoleUtilisateur.candidat:
        init_candidat_dossier(db, user)
    db.commit()
    db.refresh(user)
    send_welcome_email(user.email, f"{data.first_name} {data.last_name}", None if data.password else plain)
    return user, None if data.password else plain


def gerant_create_moniteur(db: Session, gerant: Utilisateur, data) -> tuple[Utilisateur, str | None]:
    school = db.query(AutoEcole).filter(AutoEcole.gerant_id == gerant.id).first()
    if school is None:
        raise ValueError("Aucune auto-école associée")
    if not school.est_validee:
        raise ValueError("Auto-école non validée")

    if db.query(Utilisateur).filter(Utilisateur.email == data.email.lower()).first():
        raise ValueError("E-mail déjà utilisé")

    plain = data.password or generate_temp_password()
    user = Utilisateur(
        email=data.email.lower(),
        mot_de_passe_hash=hash_password(plain),
        prenom=data.first_name,
        nom=data.last_name,
        role=RoleUtilisateur.moniteur.value,
        country_code=gerant.country_code,
        ville_id=gerant.ville_id,
        telephone=data.phone,
        langue=gerant.langue,
        fournisseur_auth=FournisseurAuth.email.value,
    )
    db.add(user)
    db.flush()
    db.add(MoniteurAutoEcole(auto_ecole_id=school.id, utilisateur_id=user.id))
    db.commit()
    db.refresh(user)
    full_name = f"{data.first_name} {data.last_name}"
    send_moniteur_invite_email(
        user.email,
        full_name,
        school.raison_sociale,
        None if data.password else plain,
    )
    return user, None if data.password else plain


def _moniteur_link(db: Session, gerant: Utilisateur, moniteur_id: uuid.UUID) -> tuple[Utilisateur, MoniteurAutoEcole] | None:
    school = db.query(AutoEcole).filter(AutoEcole.gerant_id == gerant.id).first()
    if school is None:
        return None
    link = (
        db.query(MoniteurAutoEcole)
        .filter(
            MoniteurAutoEcole.auto_ecole_id == school.id,
            MoniteurAutoEcole.utilisateur_id == moniteur_id,
            MoniteurAutoEcole.est_actif.is_(True),
        )
        .first()
    )
    if link is None:
        return None
    user = db.get(Utilisateur, moniteur_id)
    if user is None or user.role != RoleUtilisateur.moniteur.value:
        return None
    return user, link


def moniteur_to_public(user: Utilisateur, link: MoniteurAutoEcole) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.prenom,
        "last_name": user.nom,
        "phone": user.telephone,
        "avatar_url": user.avatar_url,
        "is_active": user.est_actif,
        "has_password": user.fournisseur_auth == FournisseurAuth.email.value and bool(user.mot_de_passe_hash),
        "linked_at": link.created_at,
        "max_seances_semaine": link.max_seances_semaine,
        "capacite_creneau": link.capacite_creneau,
    }


def gerant_get_moniteur(db: Session, gerant: Utilisateur, moniteur_id: uuid.UUID) -> dict | None:
    result = _moniteur_link(db, gerant, moniteur_id)
    if result is None:
        return None
    user, link = result
    return moniteur_to_public(user, link)


def gerant_reset_moniteur_password(db: Session, gerant: Utilisateur, moniteur_id: uuid.UUID) -> str:
    result = _moniteur_link(db, gerant, moniteur_id)
    if result is None:
        raise ValueError("Moniteur introuvable")
    user, _link = result
    school = db.query(AutoEcole).filter(AutoEcole.gerant_id == gerant.id).first()
    if school is None:
        raise ValueError("Auto-école introuvable")
    plain = generate_temp_password()
    user.mot_de_passe_hash = hash_password(plain)
    db.commit()
    db.refresh(user)
    send_moniteur_invite_email(
        user.email,
        f"{user.prenom} {user.nom}",
        school.raison_sociale,
        plain,
    )
    return plain


def gerant_list_moniteurs(db: Session, gerant: Utilisateur) -> list[dict]:
    school = db.query(AutoEcole).filter(AutoEcole.gerant_id == gerant.id).first()
    if school is None:
        return []

    links = (
        db.query(MoniteurAutoEcole)
        .filter(MoniteurAutoEcole.auto_ecole_id == school.id, MoniteurAutoEcole.est_actif.is_(True))
        .order_by(MoniteurAutoEcole.created_at.desc())
        .all()
    )
    results: list[dict] = []
    for link in links:
        user = db.get(Utilisateur, link.utilisateur_id)
        if user is None:
            continue
        results.append(moniteur_to_public(user, link))
    return results


def validate_auto_ecole(db: Session, school_id: uuid.UUID, admin: Utilisateur) -> AutoEcole:
    school = db.get(AutoEcole, school_id)
    if school is None:
        raise ValueError("Auto-école introuvable")
    if school.est_refusee:
        raise ValueError("Cette auto-école a été refusée")
    school.est_validee = True
    school.est_refusee = False
    school.motif_refus = None
    school.validee_le = datetime.now(UTC)
    school.validee_par = admin.id
    school.refusee_le = None
    school.refusee_par = None
    db.commit()
    db.refresh(school)
    from app.services.enrollments import seed_default_forfaits

    seed_default_forfaits(db, school)
    gerant = db.get(Utilisateur, school.gerant_id)
    if gerant:
        from app.services.email import send_school_validated_email

        send_school_validated_email(gerant.email, school.raison_sociale)
    return school


def reject_auto_ecole(db: Session, school_id: uuid.UUID, admin: Utilisateur, message: str) -> AutoEcole:
    school = db.get(AutoEcole, school_id)
    if school is None:
        raise ValueError("Auto-école introuvable")
    if school.est_validee:
        raise ValueError("Cette auto-école est déjà validée")
    if school.est_refusee:
        raise ValueError("Cette auto-école est déjà refusée")

    school.est_validee = False
    school.est_refusee = True
    school.motif_refus = message.strip()
    school.refusee_le = datetime.now(UTC)
    school.refusee_par = admin.id
    school.validee_le = None
    school.validee_par = None
    db.commit()
    db.refresh(school)

    gerant = db.get(Utilisateur, school.gerant_id)
    if gerant:
        from app.services.email import send_school_rejected_email

        send_school_rejected_email(gerant.email, school.raison_sociale, message)
    return school


def school_status(school: AutoEcole) -> str:
    if school.est_validee:
        return "validated"
    if school.est_refusee:
        return "rejected"
    return "pending"


def school_to_admin(db: Session, school: AutoEcole, *, include_stats: bool = False) -> dict:
    gerant = db.get(Utilisateur, school.gerant_id)
    ville = db.get(Ville, school.ville_id)
    moniteur_count = None
    if include_stats:
        moniteur_count = (
            db.query(MoniteurAutoEcole)
            .filter(MoniteurAutoEcole.auto_ecole_id == school.id, MoniteurAutoEcole.est_actif.is_(True))
            .count()
        )
    return {
        "id": school.id,
        "raison_sociale": school.raison_sociale,
        "numero_agrement": school.numero_agrement,
        "adresse": school.adresse,
        "est_validee": school.est_validee,
        "est_refusee": school.est_refusee,
        "motif_refus": school.motif_refus,
        "gerant_id": school.gerant_id,
        "gerant_email": gerant.email if gerant else "",
        "gerant_name": f"{gerant.prenom} {gerant.nom}" if gerant else "",
        "gerant_phone": gerant.telephone if gerant else None,
        "ville": ville.nom if ville else None,
        "country_code": school.country_code,
        "status": school_status(school),
        "created_at": school.created_at,
        "updated_at": school.updated_at,
        "validee_le": school.validee_le,
        "refusee_le": school.refusee_le,
        "moniteur_count": moniteur_count,
        "raison_sociale_legale": school.raison_sociale_legale,
        "rccm": school.rccm,
        "site_web": school.site_web,
        "logo_url": school.logo_url,
        "description": school.description,
        "telephone": school.telephone,
        "nombre_moniteurs": school.nombre_moniteurs,
        "nombre_vehicules": school.nombre_vehicules,
        "annees_experience": school.annees_experience,
        "fonction_gerant": school.fonction_gerant,
    }


def admin_delete_user(db: Session, user: Utilisateur, admin: Utilisateur) -> None:
    if user.id == admin.id:
        raise ValueError("Impossible de supprimer votre propre compte")

    db.query(AutoEcole).filter(AutoEcole.validee_par == user.id).update(
        {AutoEcole.validee_par: None},
        synchronize_session=False,
    )
    db.query(AutoEcole).filter(AutoEcole.refusee_par == user.id).update(
        {AutoEcole.refusee_par: None},
        synchronize_session=False,
    )

    db.query(MoniteurAutoEcole).filter(MoniteurAutoEcole.utilisateur_id == user.id).delete(
        synchronize_session=False,
    )

    school = db.query(AutoEcole).filter(AutoEcole.gerant_id == user.id).first()
    if school is not None:
        db.query(MoniteurAutoEcole).filter(MoniteurAutoEcole.auto_ecole_id == school.id).delete(
            synchronize_session=False,
        )
        db.delete(school)

    dossier = db.query(DossierAdministratif).filter(DossierAdministratif.candidat_id == user.id).first()
    if dossier is not None:
        db.delete(dossier)

    db.query(ArticleBlog).filter(ArticleBlog.author_id == user.id).update(
        {ArticleBlog.author_id: None},
        synchronize_session=False,
    )
    db.query(CodeVerification).filter(CodeVerification.utilisateur_id == user.id).delete(
        synchronize_session=False,
    )

    db.delete(user)
    db.commit()


def update_profile(
    db: Session,
    user: Utilisateur,
    *,
    first_name: str | None = None,
    last_name: str | None = None,
    phone: str | None = None,
    city: str | None = None,
    langue: str | None = None,
) -> Utilisateur:
    if first_name is not None:
        user.prenom = first_name.strip()
    if last_name is not None:
        user.nom = last_name.strip()
    if phone is not None:
        user.telephone = phone.strip() or None
    if langue is not None:
        user.langue = langue
    if city is not None:
        ville = get_or_create_ville(db, user.country_code, city)
        user.ville_id = ville.id

    db.commit()
    db.refresh(user)
    return user


def change_password(db: Session, user: Utilisateur, *, current_password: str, new_password: str) -> None:
    if not user.mot_de_passe_hash:
        raise ValueError("Ce compte n'a pas de mot de passe local — utilisez Google ou la réinitialisation par e-mail.")
    if not verify_password(current_password, user.mot_de_passe_hash):
        raise ValueError("Mot de passe actuel incorrect")
    user.mot_de_passe_hash = hash_password(new_password)
    db.commit()
