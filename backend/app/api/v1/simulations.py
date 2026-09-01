import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import AdminUser, require_roles
from app.db.models import RoleUtilisateur, Utilisateur
from app.db.session import get_db
from app.schemas.simulation import (
    SimulationCreateRequest,
    SimulationGenerateRequest,
    SimulationScenarioAdmin,
    SimulationScenarioPublic,
    SimulationUpdateRequest,
)
from app.services.mistral import MistralError
from app.services.simulation import (
    create_scenario,
    delete_scenario,
    generate_scenario_with_ai,
    get_scenario,
    list_scenarios,
    update_scenario,
)

admin_router = APIRouter(prefix="/admin/pedagogy/simulations", tags=["admin-simulations"])
candidat_router = APIRouter(prefix="/candidat/pedagogy/simulations", tags=["candidat-simulations"])


@admin_router.get("", response_model=list[SimulationScenarioAdmin])
def admin_list_simulations(
    _: AdminUser,
    db: Session = Depends(get_db),
    theme_id: uuid.UUID | None = Query(default=None),
):
    return list_scenarios(db, theme_id)


@admin_router.get("/{scenario_id}", response_model=SimulationScenarioAdmin)
def admin_get_simulation(_: AdminUser, scenario_id: uuid.UUID, db: Session = Depends(get_db)):
    row = get_scenario(db, scenario_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scénario introuvable")
    from app.services.simulation import _scenario_to_public

    return _scenario_to_public(row)


@admin_router.post("", response_model=SimulationScenarioAdmin, status_code=status.HTTP_201_CREATED)
def admin_create_simulation(
    payload: SimulationCreateRequest,
    admin: AdminUser,
    db: Session = Depends(get_db),
):
    return create_scenario(db, admin, payload)


@admin_router.post("/generate", response_model=SimulationScenarioAdmin, status_code=status.HTTP_201_CREATED)
def admin_generate_simulation(
    payload: SimulationGenerateRequest,
    admin: AdminUser,
    db: Session = Depends(get_db),
):
    try:
        return generate_scenario_with_ai(db, admin, payload)
    except MistralError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc


@admin_router.patch("/{scenario_id}", response_model=SimulationScenarioAdmin)
def admin_update_simulation(
    scenario_id: uuid.UUID,
    payload: SimulationUpdateRequest,
    _: AdminUser,
    db: Session = Depends(get_db),
):
    try:
        return update_scenario(db, scenario_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@admin_router.delete("/{scenario_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_simulation(_: AdminUser, scenario_id: uuid.UUID, db: Session = Depends(get_db)):
    try:
        delete_scenario(db, scenario_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@candidat_router.get("/{scenario_id}", response_model=SimulationScenarioPublic)
def candidat_get_simulation(
    scenario_id: uuid.UUID,
    user: Utilisateur = Depends(require_roles(RoleUtilisateur.candidat, RoleUtilisateur.administrateur)),
    db: Session = Depends(get_db),
):
    row = get_scenario(db, scenario_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scénario introuvable")
    from app.services.simulation import _scenario_to_public

    data = _scenario_to_public(row)
    return {
        "id": data["id"],
        "title": data["title"],
        "description": data["description"],
        "scenario": data["scenario"],
        "source": data["source"],
        "created_at": data["created_at"],
    }
