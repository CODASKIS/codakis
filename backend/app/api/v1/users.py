import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import AdminUser, CurrentUser, GerantUser
from app.core.security import hash_password
from app.db.models import AutoEcole, MoniteurAutoEcole, RoleUtilisateur, Utilisateur
from app.db.session import get_db
from app.schemas.auth import (
    AdminCreateUserRequest,
    AdminUpdateUserRequest,
    AutoEcolePending,
    ConsortDossierPublic,
    CreateMoniteurRequest,
    MessageResponse,
    MoniteurCreateResponse,
    MoniteurPasswordResetResponse,
    MoniteurPublic,
    RejectAutoEcoleRequest,
    UserPublic,
)
from app.services.consort import dossier_to_public, get_or_create_dossier
from app.services.users import (
    FRONT_TO_ROLE,
    ROLE_TO_FRONT,
    admin_create_user,
    admin_delete_user,
    gerant_create_moniteur,
    gerant_get_moniteur,
    gerant_list_moniteurs,
    gerant_reset_moniteur_password,
    moniteur_to_public,
    reject_auto_ecole,
    school_to_admin,
    user_to_public,
    validate_auto_ecole,
)

router = APIRouter(tags=["users"])
admin_router = APIRouter(prefix="/admin", tags=["admin"])
gerant_router = APIRouter(prefix="/gerant", tags=["gerant"])


@router.get("/users/me", response_model=UserPublic)
def get_me(current_user: CurrentUser, db: Session = Depends(get_db)):
    return user_to_public(db, current_user)


@admin_router.get("/users", response_model=list[UserPublic])
def list_users(_: AdminUser, db: Session = Depends(get_db)):
    users = db.query(Utilisateur).order_by(Utilisateur.created_at.desc()).all()
    return [user_to_public(db, user) for user in users]


@admin_router.post("/users", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def create_user(payload: AdminCreateUserRequest, _: AdminUser, db: Session = Depends(get_db)):
    try:
        user, _temp = admin_create_user(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return user_to_public(db, user)


@admin_router.get("/users/{user_id}", response_model=UserPublic)
def get_user(user_id: uuid.UUID, _: AdminUser, db: Session = Depends(get_db)):
    user = db.get(Utilisateur, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable")
    return user_to_public(db, user)


@admin_router.get("/users/{user_id}/consort", response_model=ConsortDossierPublic)
def get_user_consort(user_id: uuid.UUID, _: AdminUser, db: Session = Depends(get_db)):
    user = db.get(Utilisateur, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable")
    if user.role != RoleUtilisateur.candidat.value:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dossier Consort indisponible pour ce compte")
    dossier = get_or_create_dossier(db, user)
    return dossier_to_public(dossier)


@admin_router.patch("/users/{user_id}", response_model=UserPublic)
def update_user(
    user_id: uuid.UUID,
    payload: AdminUpdateUserRequest,
    _: AdminUser,
    db: Session = Depends(get_db),
):
    user = db.get(Utilisateur, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable")

    if payload.email is not None:
        user.email = payload.email.lower()
    if payload.first_name is not None:
        user.prenom = payload.first_name
    if payload.last_name is not None:
        user.nom = payload.last_name
    if payload.phone is not None:
        user.telephone = payload.phone
    if payload.country_code is not None:
        user.country_code = payload.country_code.upper()
    if payload.langue is not None:
        user.langue = payload.langue
    if payload.is_active is not None:
        user.est_actif = payload.is_active
    if payload.role is not None:
        role = FRONT_TO_ROLE.get(payload.role)
        if role is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Rôle invalide")
        user.role = role.value
    if payload.password:
        user.mot_de_passe_hash = hash_password(payload.password)

    db.commit()
    db.refresh(user)
    return user_to_public(db, user)


@admin_router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: uuid.UUID, admin: AdminUser, db: Session = Depends(get_db)):
    user = db.get(Utilisateur, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable")
    try:
        admin_delete_user(db, user, admin)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@admin_router.get("/auto-ecoles", response_model=list[AutoEcolePending])
def list_all_schools(_: AdminUser, db: Session = Depends(get_db)):
    schools = db.query(AutoEcole).order_by(AutoEcole.created_at.desc()).all()
    return [school_to_admin(db, school) for school in schools]


@admin_router.get("/auto-ecoles/pending", response_model=list[AutoEcolePending])
def list_pending_schools(_: AdminUser, db: Session = Depends(get_db)):
    schools = (
        db.query(AutoEcole)
        .filter(AutoEcole.est_validee.is_(False), AutoEcole.est_refusee.is_(False))
        .order_by(AutoEcole.created_at.desc())
        .all()
    )
    return [school_to_admin(db, school) for school in schools]


@admin_router.get("/auto-ecoles/{school_id}", response_model=AutoEcolePending)
def get_school(school_id: uuid.UUID, _: AdminUser, db: Session = Depends(get_db)):
    school = db.get(AutoEcole, school_id)
    if school is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Auto-école introuvable")
    return school_to_admin(db, school, include_stats=True)


@admin_router.post("/auto-ecoles/{school_id}/valider", response_model=MessageResponse)
def validate_school(school_id: uuid.UUID, admin: AdminUser, db: Session = Depends(get_db)):
    try:
        school = validate_auto_ecole(db, school_id, admin)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return MessageResponse(message=f"Auto-école « {school.raison_sociale} » validée.")


@admin_router.post("/auto-ecoles/{school_id}/refuser", response_model=MessageResponse)
def reject_school(
    school_id: uuid.UUID,
    payload: RejectAutoEcoleRequest,
    admin: AdminUser,
    db: Session = Depends(get_db),
):
    try:
        school = reject_auto_ecole(db, school_id, admin, payload.message)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return MessageResponse(message=f"Auto-école « {school.raison_sociale} » refusée. Un e-mail a été envoyé au gérant.")


@gerant_router.get("/moniteurs", response_model=list[MoniteurPublic])
def list_moniteurs(gerant: GerantUser, db: Session = Depends(get_db)):
    return gerant_list_moniteurs(db, gerant)


@gerant_router.get("/moniteurs/{moniteur_id}", response_model=MoniteurPublic)
def get_moniteur(moniteur_id: uuid.UUID, gerant: GerantUser, db: Session = Depends(get_db)):
    data = gerant_get_moniteur(db, gerant, moniteur_id)
    if data is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Moniteur introuvable")
    return data


@gerant_router.post("/moniteurs", response_model=MoniteurCreateResponse, status_code=status.HTTP_201_CREATED)
def create_moniteur(payload: CreateMoniteurRequest, gerant: GerantUser, db: Session = Depends(get_db)):
    try:
        user, temp = gerant_create_moniteur(db, gerant, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    link = (
        db.query(MoniteurAutoEcole)
        .filter(MoniteurAutoEcole.utilisateur_id == user.id)
        .order_by(MoniteurAutoEcole.created_at.desc())
        .first()
    )
    if link is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Liaison moniteur introuvable")
    return {**moniteur_to_public(user, link), "temp_password": temp}


@gerant_router.post("/moniteurs/{moniteur_id}/reset-password", response_model=MoniteurPasswordResetResponse)
def reset_moniteur_password(moniteur_id: uuid.UUID, gerant: GerantUser, db: Session = Depends(get_db)):
    try:
        temp = gerant_reset_moniteur_password(db, gerant, moniteur_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return MoniteurPasswordResetResponse(temp_password=temp)
