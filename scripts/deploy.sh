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
if [[ -d .git ]] && [[ "${CODAKIS_SKIP_GIT_PULL:-}" != "1" ]]; then
  git fetch --depth 1 origin main
  git reset --hard origin/main
  # Re-exec the freshly pulled script so health-check changes are not skipped
  # (bash can mis-seek when the running file is rewritten under its feet).
  export CODAKIS_SKIP_GIT_PULL=1
  exec bash "$ROOT/scripts/deploy.sh"
fi

echo "==> Build & start stack"
docker compose up -d --build

echo "==> Status"
docker compose ps

echo "==> Health check (retry)"
ok=0
for i in $(seq 1 40); do
  if body="$(curl -sf "http://127.0.0.1:${WEB_PORT:-8080}/health")"; then
    echo "OK (${i}): ${body}"
    ok=1
    break
  fi
  echo "attempt ${i}: API pas prête"
  sleep 3
done
if [[ "$ok" != "1" ]]; then
  echo "==> Health check échoué — logs API"
  docker compose logs --tail 200 api || docker logs --tail 200 codakis_api || true
  docker compose ps -a || true
  exit 1
fi

IP="$(hostname -I | awk '{print $1}')"
echo "CODAKIS en ligne : http://${IP}:${WEB_PORT:-8080}"
