import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import CurrentUser, GerantUser, require_roles
from app.db.models import RoleUtilisateur, Utilisateur
from app.db.session import get_db
from app.schemas.enrollments import SeancePublic
from app.schemas.scheduling import (
    AssignCreneauRequest,
    CreateCreneauRequest,
    CreneauPublic,
    MoniteurElevePublic,
    MoniteurLimitsPublic,
    NotificationPublic,
    UpdateCreneauRequest,
    UpdateMoniteurLimitsRequest,
    WeeklyPlanningPublic,
)
from app.services.enrollments import seance_to_public
from app.services.scheduling import (
    gerant_assign_seance_to_creneau,
    gerant_list_moniteur_creneaux,
    gerant_update_moniteur_limits,
    list_notifications,
    mark_all_notifications_read,
    mark_notification_read,
    moniteur_create_creneau,
    moniteur_delete_creneau,
    moniteur_list_creneaux,
    moniteur_list_eleves,
    moniteur_update_creneau,
    moniteur_weekly_planning,
    parse_week_start,
)

moniteur_router = APIRouter(prefix="/moniteur", tags=["moniteur-scheduling"])
gerant_sched_router = APIRouter(prefix="/gerant", tags=["gerant-scheduling"])
notifications_router = APIRouter(prefix="/notifications", tags=["notifications"])
MoniteurUser = require_roles(RoleUtilisateur.moniteur)


@moniteur_router.get("/eleves", response_model=list[MoniteurElevePublic])
def moniteur_eleves(moniteur: Utilisateur = Depends(MoniteurUser), db: Session = Depends(get_db)):
    return moniteur_list_eleves(db, moniteur)


@moniteur_router.get("/creneaux", response_model=list[CreneauPublic])
def moniteur_creneaux(
    week: str | None = Query(default=None),
    moniteur: Utilisateur = Depends(MoniteurUser),
    db: Session = Depends(get_db),
):
    week_start: date | None = parse_week_start(week) if week else None
    return moniteur_list_creneaux(db, moniteur, week_start)


@moniteur_router.post("/creneaux", response_model=CreneauPublic, status_code=status.HTTP_201_CREATED)
def moniteur_create_creneau_route(
    payload: CreateCreneauRequest,
    moniteur: Utilisateur = Depends(MoniteurUser),
    db: Session = Depends(get_db),
):
    try:
        creneau = moniteur_create_creneau(
            db,
            moniteur,
            starts_at=payload.starts_at,
            duration_minutes=payload.duration_minutes,
            capacite_max=payload.capacite_max,
            lieu=payload.lieu,
            notes=payload.notes,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    from app.services.scheduling import creneau_to_public

    return creneau_to_public(db, creneau)


@moniteur_router.delete("/creneaux/{creneau_id}", status_code=status.HTTP_204_NO_CONTENT)
def moniteur_delete_creneau_route(
    creneau_id: uuid.UUID,
    moniteur: Utilisateur = Depends(MoniteurUser),
    db: Session = Depends(get_db),
):
    try:
        moniteur_delete_creneau(db, moniteur, creneau_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@moniteur_router.patch("/creneaux/{creneau_id}", response_model=CreneauPublic)
def moniteur_update_creneau_route(
    creneau_id: uuid.UUID,
    payload: UpdateCreneauRequest,
    moniteur: Utilisateur = Depends(MoniteurUser),
    db: Session = Depends(get_db),
):
    try:
        creneau = moniteur_update_creneau(
            db,
            moniteur,
            creneau_id,
            starts_at=payload.starts_at,
            duration_minutes=payload.duration_minutes,
            lieu=payload.lieu,
            notes=payload.notes,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    from app.services.scheduling import creneau_to_public

    return creneau_to_public(db, creneau)


@moniteur_router.get("/planning/semaine", response_model=WeeklyPlanningPublic)
def moniteur_planning_semaine(
    week: str | None = Query(default=None),
    moniteur: Utilisateur = Depends(MoniteurUser),
    db: Session = Depends(get_db),
):
    return moniteur_weekly_planning(db, moniteur, parse_week_start(week))


@gerant_sched_router.get("/moniteurs/{moniteur_id}/creneaux", response_model=list[CreneauPublic])
def gerant_moniteur_creneaux(
    moniteur_id: uuid.UUID,
    gerant: GerantUser,
    week: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    week_start: date | None = parse_week_start(week) if week else None
    return gerant_list_moniteur_creneaux(db, gerant, moniteur_id, week_start)


@gerant_sched_router.post("/seances/assign-creneau", response_model=SeancePublic, status_code=status.HTTP_201_CREATED)
def gerant_assign_creneau(
    payload: AssignCreneauRequest,
    gerant: GerantUser,
    db: Session = Depends(get_db),
):
    try:
        seance = gerant_assign_seance_to_creneau(
            db,
            gerant,
            creneau_id=payload.creneau_id,
            inscription_id=payload.inscription_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return seance_to_public(db, seance)


@gerant_sched_router.patch("/moniteurs/{moniteur_id}/limits", response_model=MoniteurLimitsPublic)
def gerant_update_limits(
    moniteur_id: uuid.UUID,
    payload: UpdateMoniteurLimitsRequest,
    gerant: GerantUser,
    db: Session = Depends(get_db),
):
    try:
        return gerant_update_moniteur_limits(
            db,
            gerant,
            moniteur_id,
            max_seances_semaine=payload.max_seances_semaine,
            capacite_creneau=payload.capacite_creneau,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@notifications_router.get("", response_model=list[NotificationPublic])
def get_notifications(
    current_user: CurrentUser,
    unread_only: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    return list_notifications(db, current_user, unread_only=unread_only)


@notifications_router.patch("/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT)
def read_notification(
    notification_id: uuid.UUID,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    try:
        mark_notification_read(db, current_user, notification_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@notifications_router.post("/read-all", status_code=status.HTTP_204_NO_CONTENT)
def read_all_notifications(current_user: CurrentUser, db: Session = Depends(get_db)):
    mark_all_notifications_read(db, current_user)
