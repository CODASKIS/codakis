import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.db.models import RoleUtilisateur, Utilisateur
from app.db.session import get_db

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> Utilisateur:
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentification requise")

    try:
        payload = decode_token(credentials.credentials, expected_type="access")
        user_id = uuid.UUID(payload["sub"])
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Jeton invalide") from exc

    user = db.get(Utilisateur, user_id)
    if user is None or not user.est_actif:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Compte introuvable ou inactif")

    return user


def require_roles(*roles: RoleUtilisateur):
    def dependency(user: Annotated[Utilisateur, Depends(get_current_user)]) -> Utilisateur:
        if user.role not in [role.value for role in roles]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès refusé")
        return user

    return dependency


CurrentUser = Annotated[Utilisateur, Depends(get_current_user)]
AdminUser = Annotated[Utilisateur, Depends(require_roles(RoleUtilisateur.administrateur))]
GerantUser = Annotated[Utilisateur, Depends(require_roles(RoleUtilisateur.gerant_auto_ecole))]
