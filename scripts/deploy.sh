#!/usr/bin/env bash
# Déploiement / mise à jour CODAKIS sur serveur Linux (Plesk + Docker)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Créez d'abord .env depuis .env.example (POSTGRES_PASSWORD et SECRET_KEY obligatoires)."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose introuvable."
  exit 1
fi

echo "==> Pull latest code"
git pull --ff-only origin main

echo "==> Build & start stack"
docker compose up -d --build

echo "==> Status"
docker compose ps

echo "==> Health check"
curl -sf "http://127.0.0.1:${WEB_PORT:-8080}/health" && echo

IP="$(hostname -I | awk '{print $1}')"
echo "CODAKIS en ligne : http://${IP}:${WEB_PORT:-8080}"
