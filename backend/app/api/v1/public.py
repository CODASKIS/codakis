import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.enrollments import PublicSchoolDetail, PublicSchoolListItem
from app.services.enrollments import get_public_school, list_public_schools

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/auto-ecoles", response_model=list[PublicSchoolListItem])
def public_list_schools(
    q: str | None = Query(default=None),
    ville: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return list_public_schools(db, query=q, city=ville)


@router.get("/auto-ecoles/{school_id}", response_model=PublicSchoolDetail)
def public_get_school(school_id: uuid.UUID, db: Session = Depends(get_db)):
    school = get_public_school(db, school_id)
    if school is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Auto-école introuvable")
    return school
