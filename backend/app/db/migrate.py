import logging
from pathlib import Path

from app.db.session import engine

logger = logging.getLogger("codakis")
SCRIPTS_DIR = Path(__file__).resolve().parents[2] / "scripts"


def apply_sql_migrations() -> None:
    """Applique les scripts migrate_*.sql (PostgreSQL uniquement)."""
    if engine.url.drivername.startswith("sqlite"):
        return

    for sql_file in sorted(SCRIPTS_DIR.glob("migrate_*.sql")):
        sql = sql_file.read_text(encoding="utf-8").strip()
        if not sql:
            continue
        logger.info("Migration SQL : %s", sql_file.name)
        with engine.begin() as conn:
            # Exécution DBAPI directe : évite que psycopg interprète % dans LIKE/regexp
            raw = conn.connection.dbapi_connection
            with raw.cursor() as cur:
                cur.execute(sql)
