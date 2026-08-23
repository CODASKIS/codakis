from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class BlogPostPublic(BaseModel):
    slug: str
    title: str
    excerpt: str | None = None
    cover_image_url: str | None = None
    author_name: str
    published_at: datetime | None = None


class BlogPostDetailPublic(BlogPostPublic):
    body: str


class BlogPostAdmin(BlogPostPublic):
    id: UUID
    status: str
    body: str
    created_at: datetime
    updated_at: datetime


class BlogPostCreateRequest(BaseModel):
    title: str = Field(min_length=2)
    slug: str | None = Field(default=None, min_length=2, max_length=220)
    excerpt: str | None = None
    body: str = Field(min_length=1)
    cover_image_url: str | None = None
    status: str = Field(default="draft", pattern="^(draft|published)$")
    published_at: datetime | None = None


class BlogPostUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=2)
    slug: str | None = Field(default=None, min_length=2, max_length=220)
    excerpt: str | None = None
    body: str | None = Field(default=None, min_length=1)
    cover_image_url: str | None = None
    status: str | None = Field(default=None, pattern="^(draft|published)$")
    published_at: datetime | None = None


class MediaUploadResponse(BaseModel):
    key: str
    url: str
