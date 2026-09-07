"""
Endpoints d'upload fichier via Cloudinary.

Routes :
  POST /upload/image    → image (roles : admin, gérant, candidat, moniteur)
  POST /upload/video    → vidéo cours/quiz (roles : admin)
  POST /upload/document → document Consort, PDF, etc. (tous les rôles)
"""

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.core.deps import CurrentUser
from app.db.models import RoleUtilisateur, Utilisateur
from app.db.session import get_db
from app.services.cloudinary_upload import upload_document, upload_image, upload_video

router = APIRouter(prefix="/upload", tags=["upload"])


class UploadResponse:
    pass


from pydantic import BaseModel


class FileUploadResponse(BaseModel):
    url: str
    secure_url: str
    public_id: str
    resource_type: str
    size_bytes: int


@router.post("/image", response_model=FileUploadResponse)
async def upload_image_endpoint(
    file: UploadFile = File(...),
    current_user: Utilisateur = Depends(CurrentUser),
    _db: Session = Depends(get_db),
):
    """Upload une image. Accessible à tous les utilisateurs authentifiés."""
    # Dossier par rôle
    role_folder = {
        RoleUtilisateur.administrateur.value: "codakis/admin/images",
        RoleUtilisateur.gerant_auto_ecole.value: "codakis/ecoles/images",
        RoleUtilisateur.candidat.value: "codakis/candidats/images",
        RoleUtilisateur.moniteur.value: "codakis/moniteurs/images",
    }
    folder = role_folder.get(current_user.role, "codakis/images")
    result = upload_image(file, folder=folder)
    return FileUploadResponse(
        url=result.url,
        secure_url=result.secure_url,
        public_id=result.public_id,
        resource_type=result.resource_type,
        size_bytes=result.bytes,
    )


@router.post("/video", response_model=FileUploadResponse)
async def upload_video_endpoint(
    file: UploadFile = File(...),
    current_user: Utilisateur = Depends(CurrentUser),
    _db: Session = Depends(get_db),
):
    """Upload une vidéo de cours/quiz. Réservé aux administrateurs."""
    if current_user.role != RoleUtilisateur.administrateur.value:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les administrateurs peuvent uploader des vidéos.",
        )
    result = upload_video(file, folder="codakis/cours/videos")
    return FileUploadResponse(
        url=result.url,
        secure_url=result.secure_url,
        public_id=result.public_id,
        resource_type=result.resource_type,
        size_bytes=result.bytes,
    )


@router.post("/document", response_model=FileUploadResponse)
async def upload_document_endpoint(
    file: UploadFile = File(...),
    current_user: Utilisateur = Depends(CurrentUser),
    _db: Session = Depends(get_db),
):
    """Upload un document (PDF, DOCX, images). Accessible à tous les utilisateurs authentifiés."""
    role_folder = {
        RoleUtilisateur.administrateur.value: "codakis/admin/documents",
        RoleUtilisateur.gerant_auto_ecole.value: "codakis/ecoles/documents",
        RoleUtilisateur.candidat.value: "codakis/candidats/documents",
        RoleUtilisateur.moniteur.value: "codakis/moniteurs/documents",
    }
    folder = role_folder.get(current_user.role, "codakis/documents")
    result = upload_document(file, folder=folder)
    return FileUploadResponse(
        url=result.url,
        secure_url=result.secure_url,
        public_id=result.public_id,
        resource_type=result.resource_type,
        size_bytes=result.bytes,
    )
