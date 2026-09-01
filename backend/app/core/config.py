from urllib.parse import quote_plus

from pydantic import AliasChoices, Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    postgres_user: str = Field(default="postgres", validation_alias=AliasChoices("POSTGRES_USER"))
    postgres_password: str = Field(default="", validation_alias=AliasChoices("POSTGRES_PASSWORD"))
    postgres_db: str = Field(default="codaski_db", validation_alias=AliasChoices("POSTGRES_DB"))
    postgres_host: str = Field(default="localhost", validation_alias=AliasChoices("POSTGRES_HOST"))
    postgres_port: int = Field(default=5432, validation_alias=AliasChoices("POSTGRES_PORT"))

    database_url: str = Field(
        default="",
        validation_alias=AliasChoices("DATABASE_URL"),
    )
    jwt_secret: str = Field(
        default="dev-secret-change-me",
        validation_alias=AliasChoices("JWT_SECRET", "SECRET_KEY"),
    )
    jwt_algorithm: str = Field(default="HS256", validation_alias=AliasChoices("JWT_ALGORITHM", "ALGORITHM"))
    jwt_access_expire_minutes: int = 60
    jwt_refresh_expire_days: int = 14

    default_admin_email: str = "admin@codakis.cm"
    default_admin_password: str = "Admin123!"
    default_admin_prenom: str = "Admin"
    default_admin_nom: str = "CODAKIS"

    google_client_id: str = ""

    email_mode: str = "console"
    resend_api_key: str = Field(default="", validation_alias=AliasChoices("RESEND_API_KEY"))
    email_from_name: str = Field(default="CODAKIS", validation_alias=AliasChoices("EMAIL_FROM_NAME"))
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "noreply@codakis.cm"
    smtp_fallback_host: str = Field(default="", validation_alias=AliasChoices("SMTP_FALLBACK_HOST"))
    smtp_fallback_port: int = Field(default=25, validation_alias=AliasChoices("SMTP_FALLBACK_PORT"))

    otp_expire_minutes: int = 15
    otp_length: int = 6

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    frontend_url: str = "http://localhost:5173"
    app_env: str = "development"
    cms_upload_dir: str = Field(default="uploads/cms", validation_alias=AliasChoices("CMS_UPLOAD_DIR"))
    cms_max_upload_bytes: int = Field(default=5_242_880, validation_alias=AliasChoices("CMS_MAX_UPLOAD_BYTES"))

    platform_commission_rate_pct: int = Field(
        default=10,
        validation_alias=AliasChoices("PLATFORM_COMMISSION_RATE_PCT"),
    )

    elevenlabs_api_key: str = Field(default="", validation_alias=AliasChoices("ELEVENLABS_API_KEY"))
    elevenlabs_voice_id: str = Field(
        default="pNInz6obpgDQGcFmaJgB",
        validation_alias=AliasChoices("ELEVENLABS_VOICE_ID"),
    )
    elevenlabs_voice_id_fr: str = Field(
        default="EXAVITQu4vr4xnSDxMaL",
        validation_alias=AliasChoices("ELEVENLABS_VOICE_ID_FR"),
    )
    elevenlabs_voice_id_en: str = Field(
        default="pNInz6obpgDQGcFmaJgB",
        validation_alias=AliasChoices("ELEVENLABS_VOICE_ID_EN"),
    )
    elevenlabs_model_id: str = Field(
        default="eleven_multilingual_v2",
        validation_alias=AliasChoices("ELEVENLABS_MODEL_ID"),
    )

    mistral_api_key: str = Field(default="", validation_alias=AliasChoices("MISTRAL_API_KEY"))
    mistral_model: str = Field(
        default="mistral-small-latest",
        validation_alias=AliasChoices("MISTRAL_MODEL"),
    )

    cinetpay_api_key: str = Field(default="", validation_alias=AliasChoices("CINETPAY_API_KEY"))
    cinetpay_api_password: str = Field(default="", validation_alias=AliasChoices("CINETPAY_API_PASSWORD"))
    cinetpay_site_id: str = Field(default="", validation_alias=AliasChoices("CINETPAY_SITE_ID"))
    cinetpay_currency: str = Field(default="XAF", validation_alias=AliasChoices("CINETPAY_CURRENCY"))
    cinetpay_country_code: str = Field(default="CM", validation_alias=AliasChoices("CINETPAY_COUNTRY_CODE"))

    @staticmethod
    def _url_has_password(url: str) -> bool:
        if not url or url.startswith("sqlite"):
            return True
        try:
            credentials = url.split("://", 1)[1].split("@", 1)[0]
        except IndexError:
            return False
        return ":" in credentials

    @model_validator(mode="after")
    def resolve_database_url(self) -> "Settings":
        if self.database_url.startswith("sqlite"):
            return self

        if self.database_url and self._url_has_password(self.database_url):
            return self

        user = quote_plus(self.postgres_user)
        password = quote_plus(self.postgres_password) if self.postgres_password else ""
        auth = f"{user}:{password}@" if password else f"{user}@"
        self.database_url = (
            f"postgresql+psycopg://{auth}{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )
        return self

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
