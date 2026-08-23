from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class CreneauPublic(BaseModel):
    id: UUID
    moniteur_id: UUID
    auto_ecole_id: UUID
    starts_at: datetime
    ends_at: datetime
    capacite_max: int
    places_prises: int
    places_libres: int
    statut: str
    lieu: str | None = None
    notes: str | None = None
    candidats: list[dict] = Field(default_factory=list)


class CreateCreneauRequest(BaseModel):
    starts_at: datetime
    duration_minutes: int = Field(default=60, ge=30, le=180)
    capacite_max: int = Field(default=1, ge=1, le=2)
    lieu: str | None = None
    notes: str | None = None


class UpdateCreneauRequest(BaseModel):
    starts_at: datetime | None = None
    duration_minutes: int | None = Field(default=None, ge=30, le=180)
    lieu: str | None = None
    notes: str | None = None


class AssignCreneauRequest(BaseModel):
    creneau_id: UUID
    inscription_id: UUID


class MoniteurElevePublic(BaseModel):
    candidat_id: UUID
    candidat_name: str
    candidat_email: str
    candidat_phone: str | None = None
    forfait_label: str
    heures_restantes: int
    heures_total: int
    seances_count: int
    next_seance_at: datetime | None = None


class WeeklyPlanningPublic(BaseModel):
    week_start: str
    week_end: str
    max_seances_semaine: int
    seances_semaine: int
    heures_semaine: float
    seances: list
    creneaux: list


class MoniteurLimitsPublic(BaseModel):
    max_seances_semaine: int
    capacite_creneau: int


class UpdateMoniteurLimitsRequest(BaseModel):
    max_seances_semaine: int | None = Field(default=None, ge=1, le=40)
    capacite_creneau: int | None = Field(default=None, ge=1, le=2)


class NotificationPublic(BaseModel):
    id: UUID
    type: str
    title_fr: str
    title_en: str
    body_fr: str
    body_en: str
    payload: dict | None = None
    lu: bool
    created_at: datetime
