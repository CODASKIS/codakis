from fastapi import APIRouter, Depends, HTTPException, status
import uuid

from sqlalchemy.orm import Session

from app.core.deps import CurrentUser, GerantUser, require_roles
from app.db.models import RoleUtilisateur, Utilisateur
from app.db.session import get_db
from app.schemas.auth import (
    ChangePasswordRequest,
    ConsortDossierPublic,
    GerantSchoolPublic,
    UpdateGerantSchoolRequest,
    UpdateProfileRequest,
    UserPublic,
)
from app.services.consort import (
    dossier_to_public,
    gerant_get_candidat_consort,
    gerant_validate_candidat_consort_piece,
    get_or_create_dossier,
    submit_consort_piece,
)
from app.services.schools import get_gerant_school, school_to_gerant, update_gerant_school
from app.services.users import change_password, update_profile, user_to_public

router = APIRouter(tags=["profile"])
candidat_router = APIRouter(prefix="/candidat", tags=["candidat"])

CandidatUser = require_roles(RoleUtilisateur.candidat)


@router.patch("/users/me", response_model=UserPublic)
def patch_me(payload: UpdateProfileRequest, current_user: CurrentUser, db: Session = Depends(get_db)):
    user = update_profile(
        db,
        current_user,
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone=payload.phone,
        city=payload.city,
        langue=payload.langue,
    )
    return user_to_public(db, user)


@router.patch("/users/me/password")
def patch_my_password(payload: ChangePasswordRequest, current_user: CurrentUser, db: Session = Depends(get_db)):
    try:
        change_password(
            db,
            current_user,
            current_password=payload.current_password,
            new_password=payload.new_password,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return {"message": "Mot de passe mis à jour."}


@candidat_router.get("/consort", response_model=ConsortDossierPublic)
def get_my_consort(
    current_user: Utilisateur = Depends(CandidatUser),
    db: Session = Depends(get_db),
):
    dossier = get_or_create_dossier(db, current_user)
    return dossier_to_public(dossier)


@candidat_router.post("/consort/pieces/{piece_key}/submit", response_model=ConsortDossierPublic)
def submit_piece(
    piece_key: str,
    current_user: Utilisateur = Depends(CandidatUser),
    db: Session = Depends(get_db),
):
    try:
        dossier = submit_consort_piece(db, current_user, piece_key)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return dossier_to_public(dossier)


@router.get("/gerant/auto-ecole", response_model=GerantSchoolPublic)
def get_gerant_school_profile(gerant: GerantUser, db: Session = Depends(get_db)):
    school = get_gerant_school(db, gerant)
    if school is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Auto-école introuvable")
    return school_to_gerant(db, school)


@router.patch("/gerant/auto-ecole", response_model=GerantSchoolPublic)
def patch_gerant_school_profile(
    payload: UpdateGerantSchoolRequest,
    gerant: GerantUser,
    db: Session = Depends(get_db),
):
    try:
        school = update_gerant_school(
            db,
            gerant,
            raison_sociale=payload.raison_sociale,
            raison_sociale_legale=payload.raison_sociale_legale,
            numero_agrement=payload.numero_agrement,
            rccm=payload.rccm,
            adresse=payload.adresse,
            city=payload.city,
            country_code=payload.country_code,
            site_web=payload.site_web,
            logo_url=payload.logo_url,
            description=payload.description,
            telephone=payload.telephone,
            nombre_moniteurs=payload.nombre_moniteurs,
            nombre_vehicules=payload.nombre_vehicules,
            annees_experience=payload.annees_experience,
            fonction_gerant=payload.fonction_gerant,
            quartier=payload.quartier,
            description_longue=payload.description_longue,
            access_info=payload.access_info,
            latitude=payload.latitude,
            longitude=payload.longitude,
            horaires=payload.horaires,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return school_to_gerant(db, school)


@router.get("/gerant/candidats/{candidat_id}/consort", response_model=ConsortDossierPublic)
def gerant_get_candidat_consort_dossier(
    candidat_id: uuid.UUID,
    gerant: GerantUser,
    db: Session = Depends(get_db),
):
    try:
        return gerant_get_candidat_consort(db, gerant, candidat_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/gerant/candidats/{candidat_id}/consort/pieces/{piece_key}/validate", response_model=ConsortDossierPublic)
def gerant_validate_candidat_consort_piece_route(
    candidat_id: uuid.UUID,
    piece_key: str,
    gerant: GerantUser,
    db: Session = Depends(get_db),
):
    try:
        return gerant_validate_candidat_consort_piece(db, gerant, candidat_id, piece_key)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("/gerant/candidats/{candidat_id}/consort", response_model=ConsortDossierPublic)
def gerant_get_candidat_consort_dossier(
    candidat_id: uuid.UUID,
    gerant: GerantUser,
    db: Session = Depends(get_db),
):
    try:
        return gerant_get_candidat_consort(db, gerant, candidat_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/gerant/candidats/{candidat_id}/consort/pieces/{piece_key}/validate", response_model=ConsortDossierPublic)
def gerant_validate_candidat_consort_piece_route(
    candidat_id: uuid.UUID,
    piece_key: str,
    gerant: GerantUser,
    db: Session = Depends(get_db),
):
    try:
        return gerant_validate_candidat_consort_piece(db, gerant, candidat_id, piece_key)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
