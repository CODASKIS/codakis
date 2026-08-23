from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class PublicForfait(BaseModel):
    id: UUID
    type: str
    label_fr: str
    label_en: str
    prix: int
    heures_conduite: int | None = None
    description_fr: str | None = None
    description_en: str | None = None


class PublicSchoolListItem(BaseModel):
    id: UUID
    name: str
    city: str
    district: str | None = None
    address: str
    phone: str | None = None
    logo_url: str | None = None
    description: str | None = None
    long_description: str | None = None
    access_info: str | None = None
    site_web: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    country_code: str
    price_from: int
    certified_since: datetime
    hours: dict | None = None


class PublicSchoolDetail(PublicSchoolListItem):
    legal_name: str | None = None
    forfaits: list[PublicForfait] = Field(default_factory=list)


class InscriptionListItem(BaseModel):
    id: UUID
    candidat_id: UUID
    candidat_name: str
    candidat_email: str
    candidat_phone: str | None = None
    forfait_id: UUID | None = None
    forfait_type: str
    forfait_label: str
    statut: str
    payment_ref: str | None = None
    heures_conduite_total: int
    heures_conduite_restantes: int
    enrolled_at: datetime
    seances_count: int = 0


class SeancePublic(BaseModel):
    id: UUID
    inscription_id: UUID
    candidat_id: UUID
    moniteur_id: UUID | None = None
    moniteur_name: str | None = None
    starts_at: datetime
    ends_at: datetime
    statut: str
    lieu: str | None = None
    notes: str | None = None


class InscriptionDetail(InscriptionListItem):
    seances: list[SeancePublic] = Field(default_factory=list)


class CandidatInscriptionItem(InscriptionListItem):
    school_name: str
    auto_ecole_id: UUID


class CandidatInscriptionDetail(CandidatInscriptionItem):
    seances: list[SeancePublic] = Field(default_factory=list)


class MoniteurSeancePublic(SeancePublic):
    candidat_name: str
    candidat_phone: str | None = None
    forfait_label: str | None = None
    school_name: str | None = None


class CandidatSeancePublic(SeancePublic):
    school_name: str | None = None
    forfait_label: str | None = None


class CreateSeanceRequest(BaseModel):
    inscription_id: UUID
    moniteur_id: UUID | None = None
    starts_at: datetime
    duration_minutes: int = Field(default=60, ge=30, le=180)
    lieu: str | None = None
    notes: str | None = None


class UpdateSeanceRequest(BaseModel):
    moniteur_id: UUID | None = None
    starts_at: datetime | None = None
    duration_minutes: int | None = Field(default=None, ge=30, le=180)
    statut: str | None = Field(default=None, pattern="^(planifiee|confirmee|terminee|annulee)$")
    lieu: str | None = None
    notes: str | None = None


class ForfaitAdmin(PublicForfait):
    est_actif: bool = True
    auto_ecole_id: UUID


class ForfaitCreateRequest(BaseModel):
    type: str = Field(pattern="^(code_seul|conduite_seule|complet)$")
    label_fr: str = Field(min_length=2)
    label_en: str = Field(min_length=2)
    prix: int = Field(ge=0)
    heures_conduite: int | None = Field(default=None, ge=0)
    description_fr: str | None = None
    description_en: str | None = None
    est_actif: bool = True


class ForfaitUpdateRequest(BaseModel):
    type: str | None = Field(default=None, pattern="^(code_seul|conduite_seule|complet)$")
    label_fr: str | None = Field(default=None, min_length=2)
    label_en: str | None = Field(default=None, min_length=2)
    prix: int | None = Field(default=None, ge=0)
    heures_conduite: int | None = Field(default=None, ge=0)
    description_fr: str | None = None
    description_en: str | None = None
    est_actif: bool | None = None


class CreateInscriptionRequest(BaseModel):
    auto_ecole_id: UUID
    forfait_id: UUID
    payment_ref: str | None = None
