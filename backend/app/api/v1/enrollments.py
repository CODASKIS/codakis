import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import GerantUser, require_roles
from app.db.models import AutoEcole, Forfait, Inscription, RoleUtilisateur, Utilisateur
from app.db.session import get_db
from app.schemas.enrollments import (
    CandidatInscriptionDetail,
    CandidatInscriptionItem,
    CandidatSeancePublic,
    CreateInscriptionRequest,
    CreateSeanceRequest,
    ForfaitAdmin,
    ForfaitCreateRequest,
    ForfaitUpdateRequest,
    InscriptionDetail,
    InscriptionListItem,
    MoniteurSeancePublic,
    SeancePublic,
    UpdateSeanceRequest,
)
from app.services.enrollments import (
    _inscription_base,
    candidat_get_inscription,
    candidat_list_inscriptions,
    candidat_list_seances,
    create_inscription,
    forfait_to_admin,
    gerant_create_forfait,
    gerant_create_seance,
    gerant_delete_forfait,
    gerant_get_inscription,
    gerant_list_forfaits,
    gerant_list_inscriptions,
    gerant_update_forfait,
    gerant_update_seance,
    moniteur_list_seances,
    moniteur_seance_to_public,
    moniteur_update_seance,
    seance_to_public,
)

gerant_router = APIRouter(prefix="/gerant", tags=["gerant-enrollments"])
candidat_router = APIRouter(prefix="/candidat", tags=["candidat-enrollments"])
moniteur_router = APIRouter(prefix="/moniteur", tags=["moniteur-enrollments"])
CandidatUser = require_roles(RoleUtilisateur.candidat)
MoniteurUser = require_roles(RoleUtilisateur.moniteur)


@gerant_router.get("/forfaits", response_model=list[ForfaitAdmin])
def list_forfaits(gerant: GerantUser, db: Session = Depends(get_db)):
    return gerant_list_forfaits(db, gerant)


@gerant_router.post("/forfaits", response_model=ForfaitAdmin, status_code=status.HTTP_201_CREATED)
def create_forfait(payload: ForfaitCreateRequest, gerant: GerantUser, db: Session = Depends(get_db)):
    try:
        forfait = gerant_create_forfait(db, gerant, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return forfait_to_admin(forfait)


@gerant_router.patch("/forfaits/{forfait_id}", response_model=ForfaitAdmin)
def update_forfait(
    forfait_id: uuid.UUID,
    payload: ForfaitUpdateRequest,
    gerant: GerantUser,
    db: Session = Depends(get_db),
):
    try:
        forfait = gerant_update_forfait(db, gerant, forfait_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return forfait_to_admin(forfait)


@gerant_router.delete("/forfaits/{forfait_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_forfait(forfait_id: uuid.UUID, gerant: GerantUser, db: Session = Depends(get_db)):
    try:
        gerant_delete_forfait(db, gerant, forfait_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@gerant_router.get("/inscriptions", response_model=list[InscriptionListItem])
def list_inscriptions(gerant: GerantUser, db: Session = Depends(get_db)):
    return gerant_list_inscriptions(db, gerant)


@gerant_router.get("/inscriptions/{inscription_id}", response_model=InscriptionDetail)
def get_inscription(inscription_id: uuid.UUID, gerant: GerantUser, db: Session = Depends(get_db)):
    data = gerant_get_inscription(db, gerant, inscription_id)
    if data is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inscription introuvable")
    return data


@gerant_router.post("/seances", response_model=SeancePublic, status_code=status.HTTP_201_CREATED)
def create_seance(payload: CreateSeanceRequest, gerant: GerantUser, db: Session = Depends(get_db)):
    try:
        seance = gerant_create_seance(
            db,
            gerant,
            inscription_id=payload.inscription_id,
            moniteur_id=payload.moniteur_id,
            starts_at=payload.starts_at,
            duration_minutes=payload.duration_minutes,
            lieu=payload.lieu,
            notes=payload.notes,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return seance_to_public(db, seance)


@gerant_router.patch("/seances/{seance_id}", response_model=SeancePublic)
def update_seance(
    seance_id: uuid.UUID,
    payload: UpdateSeanceRequest,
    gerant: GerantUser,
    db: Session = Depends(get_db),
):
    try:
        seance = gerant_update_seance(
            db,
            gerant,
            seance_id,
            moniteur_id=payload.moniteur_id,
            moniteur_id_set="moniteur_id" in payload.model_fields_set,
            starts_at=payload.starts_at,
            duration_minutes=payload.duration_minutes,
            statut=payload.statut,
            lieu=payload.lieu,
            notes=payload.notes,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return seance_to_public(db, seance)


@candidat_router.post("/inscriptions", response_model=InscriptionListItem, status_code=status.HTTP_201_CREATED)
def candidat_create_inscription(
    payload: CreateInscriptionRequest,
    candidat: Utilisateur = Depends(CandidatUser),
    db: Session = Depends(get_db),
):
    school = db.get(AutoEcole, payload.auto_ecole_id)
    if school is None or not school.est_validee or school.est_refusee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Auto-école introuvable")
    forfait = db.get(Forfait, payload.forfait_id)
    if forfait is None or forfait.auto_ecole_id != school.id or not forfait.est_actif:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Forfait invalide")
    existing = (
        db.query(Inscription)
        .filter(
            Inscription.candidat_id == candidat.id,
            Inscription.auto_ecole_id == school.id,
            Inscription.statut != "annulee",
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Vous êtes déjà inscrit à cette auto-école")
    try:
        inscription = create_inscription(
            db,
            candidat=candidat,
            school=school,
            forfait=forfait,
            forfait_type=forfait.type,
            forfait_label=forfait.label_fr,
            payment_ref=payload.payment_ref,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return _inscription_base(db, inscription)


@candidat_router.get("/inscriptions", response_model=list[CandidatInscriptionItem])
def candidat_list_my_inscriptions(candidat: Utilisateur = Depends(CandidatUser), db: Session = Depends(get_db)):
    return candidat_list_inscriptions(db, candidat)


@candidat_router.get("/inscriptions/{inscription_id}", response_model=CandidatInscriptionDetail)
def candidat_get_my_inscription(
    inscription_id: uuid.UUID,
    candidat: Utilisateur = Depends(CandidatUser),
    db: Session = Depends(get_db),
):
    data = candidat_get_inscription(db, candidat, inscription_id)
    if data is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inscription introuvable")
    return data


@candidat_router.get("/seances", response_model=list[CandidatSeancePublic])
def candidat_list_my_seances(candidat: Utilisateur = Depends(CandidatUser), db: Session = Depends(get_db)):
    return candidat_list_seances(db, candidat)


@moniteur_router.get("/seances", response_model=list[MoniteurSeancePublic])
def moniteur_list_my_seances(moniteur: Utilisateur = Depends(MoniteurUser), db: Session = Depends(get_db)):
    return moniteur_list_seances(db, moniteur)


@moniteur_router.patch("/seances/{seance_id}", response_model=MoniteurSeancePublic)
def moniteur_update_my_seance(
    seance_id: uuid.UUID,
    payload: UpdateSeanceRequest,
    moniteur: Utilisateur = Depends(MoniteurUser),
    db: Session = Depends(get_db),
):
    try:
        seance = moniteur_update_seance(
            db,
            moniteur,
            seance_id,
            statut=payload.statut,
            starts_at=payload.starts_at,
            duration_minutes=payload.duration_minutes,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return moniteur_seance_to_public(db, seance)
