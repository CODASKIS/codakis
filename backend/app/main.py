from contextlib import asynccontextmanager
import asyncio
import logging
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

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
            if settings.app_env.lower() in {"production", "prod"} and settings.default_admin_password in {
                "Admin123!",
                "admin",
                "password",
                "changeme",
            }:
                logger.warning(
                    "Admin par défaut non créé en production : changez DEFAULT_ADMIN_PASSWORD."
                )
            else:
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

        if admin is None:
            admin = db.query(Utilisateur).filter(Utilisateur.role == RoleUtilisateur.administrateur.value).first()
        if admin is None:
            logger.warning("Aucun administrateur — seed contenu limité.")
            return

        seed_blog_articles(db, admin)
        seed_themes(db)
        seed_lecons(db, admin)
        allow_demo = settings.seed_demo or settings.app_env.lower() not in {"production", "prod"}
        if allow_demo:
            seed_demo_data(db, admin)
        else:
            logger.info("Seed démo désactivé (production). Définissez SEED_DEMO=true pour forcer.")
        seed_driving_quiz(db, admin)
    finally:
        db.close()


async def _subscription_reminder_loop() -> None:
    from app.services.subscription_lifecycle import process_subscription_reminders

    while True:
        try:
            stats = await asyncio.to_thread(process_subscription_reminders)
            if stats.get("reminder_7d") or stats.get("reminder_3d"):
                logger.info("Rappels abonnement envoyés : %s", stats)
        except Exception:
            logger.exception("Boucle rappels abonnement")
        await asyncio.sleep(6 * 60 * 60)


async def _payment_reconcile_loop() -> None:
    from app.services.payments import reconcile_pending_payments, repair_orphan_enrollments

    def run() -> dict:
        db = db_session.SessionLocal()
        try:
            return {
                **reconcile_pending_payments(db),
                "enrollments": repair_orphan_enrollments(db),
            }
        finally:
            db.close()

    while True:
        try:
            stats = await asyncio.to_thread(run)
            enrollments = stats.get("enrollments") or {}
            if (
                stats.get("completed")
                or stats.get("failed")
                or stats.get("abandoned")
                or enrollments.get("repaired")
                or enrollments.get("relinked")
            ):
                logger.info("Réconciliation paiements : %s", stats)
        except Exception:
            logger.exception("Boucle réconciliation paiements")
        await asyncio.sleep(10 * 60)


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
    background_tasks = [
        asyncio.create_task(_subscription_reminder_loop()),
        asyncio.create_task(_payment_reconcile_loop()),
    ]
    try:
        yield
    finally:
        for task in background_tasks:
            task.cancel()
        for task in background_tasks:
            try:
                await task
            except asyncio.CancelledError:
                pass


_is_prod = settings.app_env.lower() in {"production", "prod"}
app = FastAPI(
    title="CODAKIS API",
    version="0.1.0",
    lifespan=lifespan,
    docs_url=None if _is_prod else "/docs",
    redoc_url=None if _is_prod else "/redoc",
    openapi_url=None if _is_prod else "/openapi.json",
)

# Mount static files from assets directory
app.mount("/assets", StaticFiles(directory=str(Path(__file__).parent.parent / "assets")), name="assets")

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
