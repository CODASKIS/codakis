"""
Service d'upload Cloudinary.

Prend en charge :
- Images (JPEG, PNG, WebP, GIF) → resource_type="image"
- Vidéos (MP4, WebM, MOV) → resource_type="video"
- Documents (PDF, DOCX, etc.) → resource_type="raw"

Si Cloudinary n'est pas configuré, bascule sur le stockage local (compatibilité).
"""

from __future__ import annotations

import logging
from io import BytesIO

import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

logger = logging.getLogger("codakis.cloudinary")

# ── types acceptés ────────────────────────────────────────────────────────────

ALLOWED_IMAGE_TYPES: dict[str, str] = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}

ALLOWED_VIDEO_TYPES: dict[str, str] = {
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
    "video/x-msvideo": ".avi",
}

ALLOWED_DOC_TYPES: dict[str, str] = {
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

ALL_ALLOWED_TYPES = {**ALLOWED_IMAGE_TYPES, **ALLOWED_VIDEO_TYPES, **ALLOWED_DOC_TYPES}

MAX_IMAGE_BYTES = 10 * 1024 * 1024   # 10 Mo
MAX_VIDEO_BYTES = 100 * 1024 * 1024  # 100 Mo
MAX_DOC_BYTES   = 20 * 1024 * 1024   # 20 Mo

# ── configuration ─────────────────────────────────────────────────────────────

def _is_configured() -> bool:
    """Retourne True si les credentiels Cloudinary sont présents."""
    if settings.cloudinary_url.strip():
        return True
    return bool(
        settings.cloudinary_cloud_name.strip()
        and settings.cloudinary_api_key.strip()
        and settings.cloudinary_api_secret.strip()
    )


def _configure() -> None:
    """Configure le SDK Cloudinary depuis les settings."""
    if settings.cloudinary_url.strip():
        cloudinary.config(cloudinary_url=settings.cloudinary_url.strip())
    else:
        # Cloudinary n'accepte que des cloud_name en minuscules : « Codakis » est rejeté.
        cloudinary.config(
            cloud_name=settings.cloudinary_cloud_name.strip().lower(),
            api_key=settings.cloudinary_api_key.strip(),
            api_secret=settings.cloudinary_api_secret.strip(),
            secure=True,
        )


# ── upload public ─────────────────────────────────────────────────────────────

class UploadResult:
    __slots__ = ("public_id", "url", "secure_url", "resource_type", "format", "bytes")

    def __init__(self, data: dict) -> None:
        self.public_id: str = data.get("public_id", "")
        self.url: str = data.get("url", "")
        self.secure_url: str = data.get("secure_url", "")
        self.resource_type: str = data.get("resource_type", "image")
        self.format: str = data.get("format", "")
        self.bytes: int = data.get("bytes", 0)


def upload_file(
    file: UploadFile,
    *,
    folder: str = "codakis/uploads",
    allowed_types: dict[str, str] | None = None,
    max_bytes: int | None = None,
) -> UploadResult:
    """
    Upload un fichier vers Cloudinary et retourne l'URL sécurisée.

    Paramètres :
    - folder    : dossier Cloudinary de destination (ex. "codakis/documents")
    - allowed_types : mapping MIME→extension autorisé ; None = tout accepter
    - max_bytes : limite en octets ; None = pas de limite explicite

    Lève HTTPException 400 si le type ou la taille est invalide.
    Lève HTTPException 503 si Cloudinary n'est pas configuré.
    """
    if not _is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stockage cloud non configuré. Veuillez contacter l'administrateur.",
        )

    content_type = (file.content_type or "").lower()

    if allowed_types is not None and content_type not in allowed_types:
        accepted = ", ".join(sorted(allowed_types.keys()))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Type de fichier non supporté ({content_type}). Acceptés : {accepted}",
        )

    data = file.file.read()

    effective_max = max_bytes or MAX_IMAGE_BYTES
    if len(data) > effective_max:
        mb = effective_max // (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fichier trop volumineux (max {mb} Mo).",
        )

    # Détermine le resource_type Cloudinary
    if content_type in ALLOWED_VIDEO_TYPES:
        resource_type = "video"
    elif content_type in ALLOWED_DOC_TYPES and content_type not in ALLOWED_IMAGE_TYPES:
        resource_type = "raw"
    else:
        resource_type = "image"

    _configure()

    try:
        result = cloudinary.uploader.upload(
            BytesIO(data),
            folder=folder,
            resource_type=resource_type,
            use_filename=False,
            unique_filename=True,
            overwrite=False,
        )
        logger.info(
            "Cloudinary upload OK: public_id=%s url=%s bytes=%s",
            result.get("public_id"),
            result.get("secure_url"),
            result.get("bytes"),
        )
        return UploadResult(result)
    except Exception as exc:
        logger.exception("Cloudinary upload échoué: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Échec de l'upload vers le stockage cloud : {exc}",
        ) from exc


# ── helpers par catégorie ─────────────────────────────────────────────────────

def upload_image(file: UploadFile, *, folder: str = "codakis/images") -> UploadResult:
    """Upload une image (JPEG/PNG/WebP/GIF, max 10 Mo)."""
    return upload_file(
        file,
        folder=folder,
        allowed_types=ALLOWED_IMAGE_TYPES,
        max_bytes=MAX_IMAGE_BYTES,
    )


def upload_video(file: UploadFile, *, folder: str = "codakis/videos") -> UploadResult:
    """Upload une vidéo (MP4/WebM/MOV/AVI, max 100 Mo)."""
    return upload_file(
        file,
        folder=folder,
        allowed_types=ALLOWED_VIDEO_TYPES,
        max_bytes=MAX_VIDEO_BYTES,
    )


def upload_document(file: UploadFile, *, folder: str = "codakis/documents") -> UploadResult:
    """Upload un document (PDF, DOCX, images, max 20 Mo)."""
    return upload_file(
        file,
        folder=folder,
        allowed_types=ALLOWED_DOC_TYPES,
        max_bytes=MAX_DOC_BYTES,
    )
