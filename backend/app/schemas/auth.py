from datetime import UTC, datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserPublic(BaseModel):
    id: UUID
    email: EmailStr
    role: str
    first_name: str
    last_name: str
    phone: str | None = None
    city: str | None = None
    avatar_url: str | None = None
    country_code: str
    langue: str
    is_active: bool
    school_validated: bool | None = None
    school_id: UUID | None = None
    school_name: str | None = None
    plan: str | None = None
    has_password: bool = False
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    first_name: str | None = Field(default=None, min_length=1)
    last_name: str | None = Field(default=None, min_length=1)
    phone: str | None = None
    city: str | None = Field(default=None, min_length=2)
    langue: str | None = Field(default=None, pattern="^(fr|en)$")


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=8)
    new_password: str = Field(min_length=8)


class ConsortPiecePublic(BaseModel):
    key: str
    status: str
    validated_at: datetime | None = None


class ConsortDossierPublic(BaseModel):
    id: UUID
    statut: str
    validated_count: int
    pending_count: int
    missing_count: int
    total_count: int
    progress_percent: int
    created_at: datetime
    updated_at: datetime
    date_depot: datetime | None = None
    pieces: list[ConsortPiecePublic]


class GerantSchoolPublic(BaseModel):
    id: UUID
    raison_sociale: str
    raison_sociale_legale: str | None = None
    numero_agrement: str
    rccm: str | None = None
    adresse: str
    ville: str | None = None
    quartier: str | None = None
    country_code: str
    site_web: str | None = None
    logo_url: str | None = None
    description: str | None = None
    description_longue: str | None = None
    access_info: str | None = None
    telephone: str | None = None
    nombre_moniteurs: int | None = None
    nombre_vehicules: int | None = None
    annees_experience: int | None = None
    fonction_gerant: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    horaires: dict | None = None
    est_validee: bool
    est_refusee: bool = False
    motif_refus: str | None = None
    validee_le: datetime | None = None
    created_at: datetime


class UpdateGerantSchoolRequest(BaseModel):
    raison_sociale: str | None = Field(default=None, min_length=2)
    raison_sociale_legale: str | None = Field(default=None, min_length=2)
    numero_agrement: str | None = Field(default=None, min_length=3)
    rccm: str | None = None
    adresse: str | None = Field(default=None, min_length=5)
    city: str | None = Field(default=None, min_length=2)
    quartier: str | None = Field(default=None, max_length=200)
    country_code: str | None = Field(default=None, min_length=2, max_length=2)
    site_web: str | None = None
    logo_url: str | None = None
    description: str | None = Field(default=None, max_length=5000)
    description_longue: str | None = Field(default=None, max_length=10000)
    access_info: str | None = Field(default=None, max_length=5000)
    telephone: str | None = None
    nombre_moniteurs: int | None = Field(default=None, ge=0)
    nombre_vehicules: int | None = Field(default=None, ge=0)
    annees_experience: int | None = Field(default=None, ge=0)
    fonction_gerant: str | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    horaires: dict | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class RegisterCandidatRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=2)
    phone: str | None = None
    city: str | None = None
    country_code: str = Field(min_length=2, max_length=2)
    langue: str = Field(default="fr", pattern="^(fr|en)$")


class RegisterAutoEcoleRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=2)
    phone: str
    city: str
    country_code: str = Field(min_length=2, max_length=2)
    langue: str = Field(default="fr", pattern="^(fr|en)$")
    school_name: str = Field(min_length=2)
    school_address: str = Field(min_length=5)
    mint_registration: str | None = Field(default=None, min_length=3)
    rccm: str | None = None
    legal_name: str | None = None
    description: str | None = None
    website: str | None = None
    manager_role: str | None = None
    instructor_count: int | None = Field(default=None, ge=0)
    vehicle_count: int | None = Field(default=None, ge=0)
    years_operating: int | None = Field(default=None, ge=0)


class GoogleAuthRequest(BaseModel):
    id_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=4, max_length=8)
    new_password: str = Field(min_length=8)


class VerifyResetOtpRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=4, max_length=8)


class AdminCreateUserRequest(BaseModel):
    email: EmailStr
    role: str
    first_name: str
    last_name: str
    phone: str | None = None
    country_code: str = "CM"
    langue: str = "fr"
    password: str | None = Field(default=None, min_length=8)


class AdminUpdateUserRequest(BaseModel):
    email: EmailStr | None = None
    role: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    country_code: str | None = None
    langue: str | None = None
    is_active: bool | None = None
    password: str | None = Field(default=None, min_length=8)


class CreateMoniteurRequest(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: str | None = None
    password: str | None = Field(default=None, min_length=8)


class MoniteurPublic(BaseModel):
    id: UUID
    email: EmailStr
    first_name: str
    last_name: str
    phone: str | None = None
    avatar_url: str | None = None
    is_active: bool
    has_password: bool = True
    linked_at: datetime
    max_seances_semaine: int = 12
    capacite_creneau: int = 2

    model_config = {"from_attributes": True}


class MoniteurCreateResponse(MoniteurPublic):
    temp_password: str | None = None


class MoniteurPasswordResetResponse(BaseModel):
    temp_password: str
    message: str = "Mot de passe temporaire généré. Communiquez-le au moniteur."


class AutoEcolePending(BaseModel):
    id: UUID
    raison_sociale: str
    raison_sociale_legale: str | None = None
    numero_agrement: str
    rccm: str | None = None
    adresse: str
    site_web: str | None = None
    logo_url: str | None = None
    description: str | None = None
    telephone: str | None = None
    nombre_moniteurs: int | None = None
    nombre_vehicules: int | None = None
    annees_experience: int | None = None
    fonction_gerant: str | None = None
    est_validee: bool
    est_refusee: bool = False
    motif_refus: str | None = None
    gerant_email: str
    gerant_name: str
    gerant_phone: str | None = None
    gerant_id: UUID | None = None
    ville: str | None = None
    country_code: str
    status: str
    created_at: datetime
    updated_at: datetime | None = None
    validee_le: datetime | None = None
    refusee_le: datetime | None = None
    moniteur_count: int | None = None

    model_config = {"from_attributes": True}


class RejectAutoEcoleRequest(BaseModel):
    message: str = Field(min_length=5, max_length=2000)


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class MessageResponse(BaseModel):
    message: str
    debug_otp: str | None = None
    email_sent: bool | None = None
