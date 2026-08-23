import re
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

ALLOWED_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


def _upload_root() -> Path:
    root = Path(settings.cms_upload_dir)
    root.mkdir(parents=True, exist_ok=True)
    return root


def save_cms_image(file: UploadFile) -> str:
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format d'image non supporté (JPEG, PNG, WebP, GIF uniquement).",
        )

    data = file.file.read()
    if len(data) > settings.cms_max_upload_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image trop volumineuse (max 5 Mo).",
        )

    ext = ALLOWED_CONTENT_TYPES[content_type]
    key = f"blog/{uuid.uuid4().hex}{ext}"
    target = _upload_root() / key
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
    return key


def resolve_media_path(key: str) -> Path:
    safe_key = key.replace("\\", "/").lstrip("/")
    if ".." in safe_key.split("/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Chemin média invalide")
    path = (_upload_root() / safe_key).resolve()
    root = _upload_root().resolve()
    if not str(path).startswith(str(root)):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Chemin média invalide")
    return path


def media_public_url(key: str) -> str:
    normalized = key.replace("\\", "/").lstrip("/")
    return f"/api/v1/public/media/{normalized}"


def slugify(value: str) -> str:
    text = value.strip().lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-") or "article"
