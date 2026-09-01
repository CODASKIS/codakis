from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.security import hash_password
from app.db.models import Base, Pays, RoleUtilisateur, Utilisateur
import app.db.session as db_session
from app.db.migrate import apply_sql_migrations
from app.services.blog import seed_blog_articles
from app.services.pedagogy import seed_lecons, seed_themes
from app.services.seed_demo import seed_demo_data
from app.services.seed_driving_quiz import seed_driving_quiz

logger = logging.getLogger("codakis")


def seed_reference_data() -> None:
    db = db_session.SessionLocal()
    try:
        if db.get(Pays, "CM") is None:
            db.add(Pays(code="CM", nom_fr="Cameroun", nom_en="Cameroon", est_actif=True))
            db.commit()

        admin = db.query(Utilisateur).filter(Utilisateur.email == settings.default_admin_email.lower()).first()
        if admin is None:
            admin = Utilisateur(
                email=settings.default_admin_email.lower(),
                mot_de_passe_hash=hash_password(settings.default_admin_password),
                prenom=settings.default_admin_prenom,
                nom=settings.default_admin_nom,
                role=RoleUtilisateur.administrateur.value,
                country_code="CM",
                langue="fr",
                fournisseur_auth="email",
                est_actif=True,
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            logger.info("Administrateur par défaut créé : %s", settings.default_admin_email)

        seed_blog_articles(db, admin)
        seed_themes(db)
        seed_lecons(db, admin)
        seed_demo_data(db, admin)
        seed_driving_quiz(db, admin)
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_: FastAPI):
    if (
        not settings.database_url.startswith("sqlite")
        and not settings.postgres_password
        and not settings._url_has_password(settings.database_url)
    ):
        raise RuntimeError(
            "PostgreSQL : définissez POSTGRES_PASSWORD dans backend/.env "
            "(mot de passe de l'utilisateur postgres)."
        )
    Base.metadata.create_all(bind=db_session.engine)
    apply_sql_migrations()
    seed_reference_data()
    yield


app = FastAPI(title="CODAKIS API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
def health():
    return {"status": "ok"}
