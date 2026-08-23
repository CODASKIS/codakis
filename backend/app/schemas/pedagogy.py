from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ThemePublic(BaseModel):
    id: UUID
    code: str
    title_fr: str
    title_en: str
    sort_order: int
    is_premium: bool
    lecon_count: int = 0
    quiz_count: int = 0


class ThemeCreateRequest(BaseModel):
    code: str = Field(min_length=2, max_length=64)
    title_fr: str = Field(min_length=2)
    title_en: str = Field(min_length=2)
    sort_order: int = Field(default=0, ge=0)
    is_premium: bool = False


class ThemeUpdateRequest(BaseModel):
    code: str | None = Field(default=None, min_length=2, max_length=64)
    title_fr: str | None = Field(default=None, min_length=2)
    title_en: str | None = Field(default=None, min_length=2)
    sort_order: int | None = Field(default=None, ge=0)
    is_premium: bool | None = None
    est_actif: bool | None = None


class LeconAdmin(BaseModel):
    id: UUID
    theme_id: UUID
    theme_code: str | None = None
    slug: str
    title: str
    excerpt: str | None = None
    body: str
    cover_image_url: str | None = None
    sort_order: int
    status: str
    published_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class LeconCreateRequest(BaseModel):
    theme_id: UUID
    title: str = Field(min_length=2)
    slug: str | None = None
    excerpt: str | None = None
    body: str = ""
    cover_image_url: str | None = None
    sort_order: int = 0
    status: str = "draft"


class LeconUpdateRequest(BaseModel):
    theme_id: UUID | None = None
    title: str | None = Field(default=None, min_length=2)
    slug: str | None = None
    excerpt: str | None = None
    body: str | None = None
    cover_image_url: str | None = None
    sort_order: int | None = None
    status: str | None = None


class LeconPublic(BaseModel):
    id: UUID
    theme_id: UUID
    theme_code: str
    slug: str
    title: str
    excerpt: str | None = None
    body: str
    cover_image_url: str | None = None
    sort_order: int
    published_at: datetime | None = None


class ReponseInput(BaseModel):
    id: UUID | None = None
    label: str = Field(min_length=1, max_length=4)
    texte: str = Field(min_length=1)
    est_correcte: bool = False
    sort_order: int = 0


class ReponseAdmin(BaseModel):
    id: UUID
    label: str
    texte: str
    est_correcte: bool
    sort_order: int


class ReponsePublic(BaseModel):
    id: UUID
    label: str
    texte: str


class QuestionAdmin(BaseModel):
    id: UUID
    theme_id: UUID | None = None
    theme_code: str | None = None
    prompt: str
    image_url: str | None = None
    explanation: str | None = None
    difficulty: int
    est_actif: bool
    reponses: list[ReponseAdmin]
    created_at: datetime
    updated_at: datetime


class QuestionCreateRequest(BaseModel):
    theme_id: UUID | None = None
    prompt: str = Field(min_length=5)
    image_url: str | None = None
    explanation: str | None = None
    difficulty: int = Field(default=1, ge=1, le=3)
    est_actif: bool = True
    reponses: list[ReponseInput] = Field(min_length=2)


class QuestionUpdateRequest(BaseModel):
    theme_id: UUID | None = None
    prompt: str | None = Field(default=None, min_length=5)
    image_url: str | None = None
    explanation: str | None = None
    difficulty: int | None = Field(default=None, ge=1, le=3)
    est_actif: bool | None = None
    reponses: list[ReponseInput] | None = None


class QuestionPublic(BaseModel):
    id: UUID
    prompt: str
    image_url: str | None = None
    reponses: list[ReponsePublic]


class QuizAdmin(BaseModel):
    id: UUID
    theme_id: UUID
    theme_code: str | None = None
    title: str
    description: str | None = None
    question_count: int
    est_actif: bool
    linked_count: int = 0
    question_ids: list[UUID] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class QuizCreateRequest(BaseModel):
    theme_id: UUID
    title: str = Field(min_length=2)
    description: str | None = None
    question_count: int = Field(default=10, ge=1, le=40)
    est_actif: bool = True
    question_ids: list[UUID] = Field(default_factory=list)


class QuizUpdateRequest(BaseModel):
    theme_id: UUID | None = None
    title: str | None = Field(default=None, min_length=2)
    description: str | None = None
    question_count: int | None = Field(default=None, ge=1, le=40)
    est_actif: bool | None = None
    question_ids: list[UUID] | None = None


class QuizPublic(BaseModel):
    id: UUID
    theme_id: UUID
    theme_code: str
    title: str
    description: str | None = None
    question_count: int
    linked_count: int


class ExamenAdmin(BaseModel):
    id: UUID
    title: str
    description: str | None = None
    duree_minutes: int
    nb_questions: int
    max_erreurs: int
    est_actif: bool
    linked_count: int = 0
    question_ids: list[UUID] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class ExamenCreateRequest(BaseModel):
    title: str = Field(min_length=2)
    description: str | None = None
    duree_minutes: int = Field(default=30, ge=5, le=120)
    nb_questions: int = Field(default=40, ge=1, le=60)
    max_erreurs: int = Field(default=5, ge=0, le=20)
    est_actif: bool = True
    question_ids: list[UUID] = Field(default_factory=list)


class ExamenUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=2)
    description: str | None = None
    duree_minutes: int | None = Field(default=None, ge=5, le=120)
    nb_questions: int | None = Field(default=None, ge=1, le=60)
    max_erreurs: int | None = Field(default=None, ge=0, le=20)
    est_actif: bool | None = None
    question_ids: list[UUID] | None = None


class ExamenPublic(BaseModel):
    id: UUID
    title: str
    description: str | None = None
    duree_minutes: int
    nb_questions: int
    max_erreurs: int
    linked_count: int


class QuizTakePublic(BaseModel):
    id: UUID
    title: str
    theme_code: str
    questions: list[QuestionPublic]


class ExamenTakePublic(BaseModel):
    id: UUID
    title: str
    duree_minutes: int
    max_erreurs: int
    questions: list[QuestionPublic]


class AnswerSubmitItem(BaseModel):
    question_id: UUID
    reponse_id: UUID


class SubmitQuizRequest(BaseModel):
    answers: list[AnswerSubmitItem]
    duree_sec: int | None = None


class SubmitResultDetail(BaseModel):
    question_id: UUID
    reponse_id: UUID | None
    correct_reponse_id: UUID
    est_correcte: bool
    explanation: str | None = None


class SubmitQuizResult(BaseModel):
    score: int
    nb_correctes: int
    nb_total: int
    reussi: bool
    details: list[SubmitResultDetail]


class SubmitExamenResult(BaseModel):
    score: int
    nb_erreurs: int
    nb_total: int
    reussi: bool
    details: list[SubmitResultDetail]
