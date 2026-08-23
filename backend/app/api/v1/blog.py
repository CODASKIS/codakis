import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload

from app.core.deps import AdminUser
from app.db.models import ArticleBlog, StatutArticleBlog
from app.db.session import get_db
from app.schemas.blog import (
    BlogPostAdmin,
    BlogPostCreateRequest,
    BlogPostDetailPublic,
    BlogPostPublic,
    BlogPostUpdateRequest,
    MediaUploadResponse,
)
from app.services.blog import (
    apply_publish_state,
    article_to_admin,
    article_to_detail,
    article_to_public,
    ensure_unique_slug,
)
from app.services.media import media_public_url, resolve_media_path, save_cms_image, slugify

public_router = APIRouter(prefix="/public", tags=["public"])
admin_router = APIRouter(prefix="/admin", tags=["admin-blog"])


@public_router.get("/blog", response_model=list[BlogPostPublic])
def list_public_blog(db: Session = Depends(get_db)):
    articles = (
        db.query(ArticleBlog)
        .options(joinedload(ArticleBlog.author))
        .filter(ArticleBlog.status == StatutArticleBlog.published.value)
        .order_by(ArticleBlog.published_at.desc().nullslast(), ArticleBlog.created_at.desc())
        .all()
    )
    return [article_to_public(article) for article in articles]


@public_router.get("/blog/{slug}", response_model=BlogPostDetailPublic)
def get_public_blog(slug: str, db: Session = Depends(get_db)):
    article = (
        db.query(ArticleBlog)
        .options(joinedload(ArticleBlog.author))
        .filter(ArticleBlog.slug == slug, ArticleBlog.status == StatutArticleBlog.published.value)
        .first()
    )
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article introuvable")
    return article_to_detail(article)


@public_router.get("/media/{file_path:path}")
def get_public_media(file_path: str):
    path: Path = resolve_media_path(file_path)
    if not path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fichier introuvable")
    return FileResponse(path)


@admin_router.get("/blog", response_model=list[BlogPostAdmin])
def list_admin_blog(_: AdminUser, db: Session = Depends(get_db)):
    articles = db.query(ArticleBlog).options(joinedload(ArticleBlog.author)).order_by(ArticleBlog.updated_at.desc()).all()
    return [article_to_admin(article) for article in articles]


@admin_router.get("/blog/{article_id}", response_model=BlogPostAdmin)
def get_admin_blog(article_id: uuid.UUID, _: AdminUser, db: Session = Depends(get_db)):
    article = (
        db.query(ArticleBlog)
        .options(joinedload(ArticleBlog.author))
        .filter(ArticleBlog.id == article_id)
        .first()
    )
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article introuvable")
    return article_to_admin(article)


@admin_router.post("/blog", response_model=BlogPostAdmin, status_code=status.HTTP_201_CREATED)
def create_blog(payload: BlogPostCreateRequest, admin: AdminUser, db: Session = Depends(get_db)):
    base_slug = slugify(payload.slug or payload.title)
    slug = ensure_unique_slug(db, base_slug)
    status_value, published_at = apply_publish_state(payload.status, payload.published_at)
    article = ArticleBlog(
        slug=slug,
        title=payload.title.strip(),
        excerpt=payload.excerpt,
        body=payload.body,
        cover_image_url=payload.cover_image_url,
        author_id=admin.id,
        status=status_value,
        published_at=published_at,
        country_code="CM",
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    return article_to_admin(article)


@admin_router.patch("/blog/{article_id}", response_model=BlogPostAdmin)
def update_blog(
    article_id: uuid.UUID,
    payload: BlogPostUpdateRequest,
    _: AdminUser,
    db: Session = Depends(get_db),
):
    article = db.get(ArticleBlog, article_id)
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article introuvable")

    data = payload.model_dump(exclude_unset=True)
    if "title" in data and data["title"] is not None:
        article.title = data["title"].strip()
    if "slug" in data and data["slug"] is not None:
        article.slug = ensure_unique_slug(db, slugify(data["slug"]), exclude_id=article.id)
    elif "title" in data and data["title"] is not None and "slug" not in data:
        pass
    if "excerpt" in data:
        article.excerpt = data["excerpt"]
    if "body" in data and data["body"] is not None:
        article.body = data["body"]
    if "cover_image_url" in data:
        article.cover_image_url = data["cover_image_url"]
    if "status" in data and data["status"] is not None:
        article.status, article.published_at = apply_publish_state(
            data["status"],
            data.get("published_at", article.published_at),
        )
    elif "published_at" in data:
        article.published_at = data["published_at"]

    db.commit()
    db.refresh(article)
    return article_to_admin(article)


@admin_router.delete("/blog/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blog(article_id: uuid.UUID, _: AdminUser, db: Session = Depends(get_db)):
    article = db.get(ArticleBlog, article_id)
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article introuvable")
    db.delete(article)
    db.commit()


@admin_router.post("/media", response_model=MediaUploadResponse)
async def upload_media(_: AdminUser, file: UploadFile = File(...)):
    key = save_cms_image(file)
    return MediaUploadResponse(key=key, url=media_public_url(key))
