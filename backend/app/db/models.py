import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, JSON, String, Text, UniqueConstraint, Uuid, func
from sqlalchemy import JSON
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class RoleUtilisateur(str, enum.Enum):
    candidat = "candidat"
    gerant_auto_ecole = "gerant_auto_ecole"
    moniteur = "moniteur"
    administrateur = "administrateur"


class FournisseurAuth(str, enum.Enum):
    email = "email"
    google = "google"
    email_google = "email_google"


class OtpType(str, enum.Enum):
    reset_password = "reset_password"
    email_verification = "email_verification"


class StatutDossier(str, enum.Enum):
    en_cours = "en_cours"
    pieces_incompletes = "pieces_incompletes"
    pret = "pret"
    depose = "depose"


class StatutPieceConsort(str, enum.Enum):
    missing = "missing"
    pending = "pending"
    validated = "validated"


CONSORT_PIECE_KEYS = ("id", "birth", "medical", "photos", "address", "stamps")


class Pays(Base):
    __tablename__ = "pays"

    code: Mapped[str] = mapped_column(String(2), primary_key=True)
    nom_fr: Mapped[str] = mapped_column(Text, nullable=False)
    nom_en: Mapped[str] = mapped_column(Text, nullable=False)
    est_actif: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Ville(Base):
    __tablename__ = "villes"
    __table_args__ = (UniqueConstraint("country_code", "nom", name="uq_villes_country_nom"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    country_code: Mapped[str] = mapped_column(String(2), ForeignKey("pays.code"), nullable=False)
    nom: Mapped[str] = mapped_column(Text, nullable=False)
    est_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    supabase_uid: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), unique=True, nullable=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    mot_de_passe_hash: Mapped[str | None] = mapped_column(Text, nullable=True)
    nom: Mapped[str] = mapped_column(Text, nullable=False)
    prenom: Mapped[str] = mapped_column(Text, nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    role: Mapped[RoleUtilisateur] = mapped_column(
        String(32),
        default=RoleUtilisateur.candidat,
        nullable=False,
    )
    country_code: Mapped[str] = mapped_column(String(2), ForeignKey("pays.code"), nullable=False)
    ville_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("villes.id"), nullable=True)
    telephone: Mapped[str | None] = mapped_column(Text, nullable=True)
    langue: Mapped[str] = mapped_column(String(2), default="fr", nullable=False)
    fournisseur_auth: Mapped[str] = mapped_column(String(16), default=FournisseurAuth.email.value, nullable=False)
    est_actif: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    auto_ecole_geree: Mapped["AutoEcole | None"] = relationship(
        back_populates="gerant",
        foreign_keys="AutoEcole.gerant_id",
        uselist=False,
    )


class AutoEcole(Base):
    __tablename__ = "auto_ecoles"
    __table_args__ = (UniqueConstraint("country_code", "numero_agrement", name="uq_auto_ecoles_agrement"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    country_code: Mapped[str] = mapped_column(String(2), ForeignKey("pays.code"), nullable=False)
    ville_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("villes.id"), nullable=False)
    gerant_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)
    raison_sociale: Mapped[str] = mapped_column(Text, nullable=False)
    numero_agrement: Mapped[str] = mapped_column(Text, nullable=False)
    adresse: Mapped[str] = mapped_column(Text, nullable=False)
    raison_sociale_legale: Mapped[str | None] = mapped_column(Text, nullable=True)
    rccm: Mapped[str | None] = mapped_column(Text, nullable=True)
    site_web: Mapped[str | None] = mapped_column(Text, nullable=True)
    logo_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    telephone: Mapped[str | None] = mapped_column(Text, nullable=True)
    nombre_moniteurs: Mapped[int | None] = mapped_column(nullable=True)
    nombre_vehicules: Mapped[int | None] = mapped_column(nullable=True)
    annees_experience: Mapped[int | None] = mapped_column(nullable=True)
    fonction_gerant: Mapped[str | None] = mapped_column(Text, nullable=True)
    latitude: Mapped[float | None] = mapped_column(nullable=True)
    longitude: Mapped[float | None] = mapped_column(nullable=True)
    quartier: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_longue: Mapped[str | None] = mapped_column(Text, nullable=True)
    access_info: Mapped[str | None] = mapped_column(Text, nullable=True)
    horaires: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    est_validee: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    validee_le: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    validee_par: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=True)
    est_refusee: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    motif_refus: Mapped[str | None] = mapped_column(Text, nullable=True)
    refusee_le: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    refusee_par: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    gerant: Mapped[Utilisateur] = relationship(back_populates="auto_ecole_geree", foreign_keys=[gerant_id])


class MoniteurAutoEcole(Base):
    __tablename__ = "moniteurs_auto_ecole"
    __table_args__ = (UniqueConstraint("auto_ecole_id", "utilisateur_id", name="uq_moniteur_ecole"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    auto_ecole_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("auto_ecoles.id"), nullable=False)
    utilisateur_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)
    est_actif: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    max_seances_semaine: Mapped[int] = mapped_column(default=12, nullable=False)
    capacite_creneau: Mapped[int] = mapped_column(default=2, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class DossierAdministratif(Base):
    __tablename__ = "dossiers_administratifs"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    country_code: Mapped[str] = mapped_column(String(2), ForeignKey("pays.code"), nullable=False)
    candidat_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("utilisateurs.id"), unique=True, nullable=False)
    statut: Mapped[str] = mapped_column(String(32), default=StatutDossier.en_cours.value, nullable=False)
    date_depot: Mapped[datetime | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    pieces: Mapped[list["PieceConsort"]] = relationship(back_populates="dossier", cascade="all, delete-orphan")


class PieceConsort(Base):
    __tablename__ = "pieces_consort"
    __table_args__ = (UniqueConstraint("dossier_id", "piece_key", name="uq_piece_dossier_key"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dossier_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("dossiers_administratifs.id"), nullable=False)
    piece_key: Mapped[str] = mapped_column(String(32), nullable=False)
    statut: Mapped[str] = mapped_column(String(16), default=StatutPieceConsort.missing.value, nullable=False)
    validated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    dossier: Mapped[DossierAdministratif] = relationship(back_populates="pieces")


class CodeVerification(Base):
    __tablename__ = "codes_verification"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    utilisateur_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=True)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    code: Mapped[str] = mapped_column(String(16), nullable=False)
    type: Mapped[str] = mapped_column(String(32), nullable=False)
    expire_le: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    utilise: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class StatutArticleBlog(str, enum.Enum):
    draft = "draft"
    published = "published"


class ArticleBlog(Base):
    __tablename__ = "articles_blog"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(220), unique=True, nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    excerpt: Mapped[str | None] = mapped_column(Text, nullable=True)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    cover_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    author_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(16), default=StatutArticleBlog.draft.value, nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    country_code: Mapped[str] = mapped_column(String(2), ForeignKey("pays.code"), default="CM", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    author: Mapped["Utilisateur | None"] = relationship(foreign_keys=[author_id])


class Theme(Base):
    __tablename__ = "themes"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    title_fr: Mapped[str] = mapped_column(Text, nullable=False)
    title_en: Mapped[str] = mapped_column(Text, nullable=False)
    sort_order: Mapped[int] = mapped_column(nullable=False, default=0)
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    est_actif: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    lecons: Mapped[list["Lecon"]] = relationship(back_populates="theme", cascade="all, delete-orphan")


class Lecon(Base):
    __tablename__ = "lecons"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    theme_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("themes.id"), nullable=False)
    slug: Mapped[str] = mapped_column(String(220), unique=True, nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False, default="")
    excerpt: Mapped[str | None] = mapped_column(Text, nullable=True)
    cover_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(nullable=False, default=0)
    status: Mapped[str] = mapped_column(String(16), default=StatutArticleBlog.draft.value, nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    author_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    theme: Mapped["Theme"] = relationship(back_populates="lecons")
    author: Mapped["Utilisateur | None"] = relationship(foreign_keys=[author_id])


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    theme_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("themes.id"), nullable=True)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    difficulty: Mapped[int] = mapped_column(nullable=False, default=1)
    est_actif: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    reponses: Mapped[list["Reponse"]] = relationship(back_populates="question", cascade="all, delete-orphan")
    theme: Mapped["Theme | None"] = relationship()


class Reponse(Base):
    __tablename__ = "reponses"
    __table_args__ = (UniqueConstraint("question_id", "label", name="uq_reponse_question_label"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("questions.id"), nullable=False)
    label: Mapped[str] = mapped_column(String(4), nullable=False)
    texte: Mapped[str] = mapped_column(Text, nullable=False)
    est_correcte: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sort_order: Mapped[int] = mapped_column(nullable=False, default=0)

    question: Mapped["Question"] = relationship(back_populates="reponses")


class Quiz(Base):
    __tablename__ = "quiz"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    theme_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("themes.id"), nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    question_count: Mapped[int] = mapped_column(nullable=False, default=10)
    est_actif: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    theme: Mapped["Theme"] = relationship()
    question_links: Mapped[list["QuizQuestion"]] = relationship(back_populates="quiz", cascade="all, delete-orphan")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    quiz_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("quiz.id"), primary_key=True)
    question_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("questions.id"), primary_key=True)
    sort_order: Mapped[int] = mapped_column(nullable=False, default=0)

    quiz: Mapped["Quiz"] = relationship(back_populates="question_links")
    question: Mapped["Question"] = relationship()


class Examen(Base):
    __tablename__ = "examens"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    duree_minutes: Mapped[int] = mapped_column(nullable=False, default=30)
    nb_questions: Mapped[int] = mapped_column(nullable=False, default=40)
    max_erreurs: Mapped[int] = mapped_column(nullable=False, default=5)
    est_actif: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    question_links: Mapped[list["ExamenQuestion"]] = relationship(back_populates="examen", cascade="all, delete-orphan")


class ExamenQuestion(Base):
    __tablename__ = "examen_questions"

    examen_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("examens.id"), primary_key=True)
    question_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("questions.id"), primary_key=True)
    sort_order: Mapped[int] = mapped_column(nullable=False, default=0)

    examen: Mapped["Examen"] = relationship(back_populates="question_links")
    question: Mapped["Question"] = relationship()


class TentativeQuiz(Base):
    __tablename__ = "tentatives_quiz"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidat_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)
    quiz_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("quiz.id"), nullable=False)
    score: Mapped[int] = mapped_column(nullable=False)
    nb_correctes: Mapped[int] = mapped_column(nullable=False)
    nb_total: Mapped[int] = mapped_column(nullable=False)
    reussi: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    reponses_json: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    termine_le: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class TentativeExamen(Base):
    __tablename__ = "tentatives_examen"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidat_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)
    examen_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("examens.id"), nullable=False)
    score: Mapped[int] = mapped_column(nullable=False)
    nb_erreurs: Mapped[int] = mapped_column(nullable=False)
    reussi: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    duree_sec: Mapped[int | None] = mapped_column(nullable=True)
    reponses_json: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    termine_le: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class TypeForfait(str, enum.Enum):
    code_seul = "code_seul"
    conduite_seule = "conduite_seule"
    complet = "complet"


class StatutInscription(str, enum.Enum):
    en_attente = "en_attente"
    confirmee = "confirmee"
    annulee = "annulee"


class StatutSeance(str, enum.Enum):
    planifiee = "planifiee"
    confirmee = "confirmee"
    terminee = "terminee"
    annulee = "annulee"


class StatutCreneau(str, enum.Enum):
    ouvert = "ouvert"
    complet = "complet"
    annule = "annule"


class Forfait(Base):
    __tablename__ = "forfaits"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    auto_ecole_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("auto_ecoles.id"), nullable=False)
    type: Mapped[str] = mapped_column(String(32), nullable=False)
    label_fr: Mapped[str] = mapped_column(Text, nullable=False)
    label_en: Mapped[str] = mapped_column(Text, nullable=False)
    prix: Mapped[int] = mapped_column(nullable=False, default=0)
    heures_conduite: Mapped[int | None] = mapped_column(nullable=True)
    description_fr: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    est_actif: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Inscription(Base):
    __tablename__ = "inscriptions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidat_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)
    auto_ecole_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("auto_ecoles.id"), nullable=False)
    forfait_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("forfaits.id"), nullable=True)
    forfait_type: Mapped[str] = mapped_column(String(32), nullable=False)
    forfait_label: Mapped[str] = mapped_column(Text, nullable=False)
    statut: Mapped[str] = mapped_column(String(32), default=StatutInscription.confirmee.value, nullable=False)
    payment_ref: Mapped[str | None] = mapped_column(Text, nullable=True)
    heures_conduite_total: Mapped[int] = mapped_column(default=0, nullable=False)
    heures_conduite_restantes: Mapped[int] = mapped_column(default=0, nullable=False)
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class SeancePratique(Base):
    __tablename__ = "seances_pratiques"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inscription_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("inscriptions.id"), nullable=False)
    auto_ecole_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("auto_ecoles.id"), nullable=False)
    candidat_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)
    moniteur_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=True)
    creneau_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("creneaux_moniteur.id"), nullable=True)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    statut: Mapped[str] = mapped_column(String(32), default=StatutSeance.planifiee.value, nullable=False)
    lieu: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class CreneauMoniteur(Base):
    __tablename__ = "creneaux_moniteur"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    auto_ecole_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("auto_ecoles.id"), nullable=False)
    moniteur_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    capacite_max: Mapped[int] = mapped_column(default=2, nullable=False)
    statut: Mapped[str] = mapped_column(String(32), default=StatutCreneau.ouvert.value, nullable=False)
    lieu: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    utilisateur_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)
    type: Mapped[str] = mapped_column(String(64), nullable=False)
    title_fr: Mapped[str] = mapped_column(Text, nullable=False)
    title_en: Mapped[str] = mapped_column(Text, nullable=False)
    body_fr: Mapped[str] = mapped_column(Text, nullable=False)
    body_en: Mapped[str] = mapped_column(Text, nullable=False)
    payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    lu: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Paiement(Base):
    __tablename__ = "paiements"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reference: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    utilisateur_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)
    auto_ecole_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("auto_ecoles.id"), nullable=True)
    forfait_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("forfaits.id"), nullable=True)
    plan_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    purpose: Mapped[str] = mapped_column(String(32), default="subscription", nullable=False)
    amount_fcfa: Mapped[int] = mapped_column(nullable=False)
    channel: Mapped[str] = mapped_column(String(16), nullable=False)
    phone: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="pending", nullable=False)
    receipt_number: Mapped[str | None] = mapped_column(Text, nullable=True)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    inscription_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("inscriptions.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
