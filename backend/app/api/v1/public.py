import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.enrollments import PublicSchoolDetail, PublicSchoolListItem
from app.services.enrollments import get_public_school, list_public_schools
from pathlib import Path

router = APIRouter(prefix="/public", tags=["public"])

DRIVING_QUIZ_IMAGES = Path(__file__).resolve().parents[3] / "assets" / "driving-quiz" / "images"


@router.get("/auto-ecoles", response_model=list[PublicSchoolListItem])
def public_list_schools(
    q: str | None = Query(default=None),
    ville: str | None = Query(default=None),
    pays: str | None = Query(default=None, alias="pays"),
    country: str | None = Query(default=None),
    price_min: int | None = Query(default=None, ge=0),
    price_max: int | None = Query(default=None, ge=0),
    sort: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    country_code = pays or country
    return list_public_schools(
        db,
        query=q,
        city=ville,
        country_code=country_code,
        price_min=price_min,
        price_max=price_max,
        sort=sort,
    )


@router.get("/auto-ecoles/{school_id}", response_model=PublicSchoolDetail)
def public_get_school(school_id: uuid.UUID, db: Session = Depends(get_db)):
    school = get_public_school(db, school_id)
    if school is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Auto-école introuvable")
    return school


@router.get("/driving-quiz/images/{filename}")
def driving_quiz_image(filename: str):
    safe = Path(filename).name
    path = (DRIVING_QUIZ_IMAGES / safe).resolve()
    if not str(path).startswith(str(DRIVING_QUIZ_IMAGES.resolve())) or not path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image introuvable")
    return FileResponse(path)
