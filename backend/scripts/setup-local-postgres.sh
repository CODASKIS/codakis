#!/usr/bin/env bash
# Crée la base codaski_db (utilisateur postgres déjà présent sur PostgreSQL local).
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Création de la base codaski_db…"
if sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'codaski_db'" | grep -q 1; then
  echo "La base codaski_db existe déjà."
else
  sudo -u postgres psql -f "$SCRIPT_DIR/setup-local-postgres.sql"
  echo "Base codaski_db créée."
fi
echo "DATABASE_URL=postgresql+psycopg://postgres:VOTRE_MDP@localhost:5432/codaski_db"
