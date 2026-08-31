# CODAKIS

Plateforme d'apprentissage du code de la route et de mise en relation avec les auto-écoles agréées — Cameroun / CEMAC.

## Structure du monorepo

```
codakis/
├── backend/           # API FastAPI
├── frontend-web/      # Portail web React (candidat, auto-école, admin)
├── mobile/            # Application Flutter (build natif, hors Docker)
└── docker-compose.yml # Déploiement web : PostgreSQL + API + Nginx
```

## Déploiement Docker (recommandé prod / staging)

Stack **web uniquement** : PostgreSQL, API FastAPI et portail Nginx.  
L'app mobile Flutter se compile à part (`mobile/README.md`).

```bash
cp .env.example .env
# Éditez POSTGRES_PASSWORD et SECRET_KEY (obligatoires)

docker compose up -d --build
```

| Service    | URL / accès |
|------------|-------------|
| Portail    | http://localhost:8080 |
| API (proxy)| http://localhost:8080/api/v1/... |
| PostgreSQL | interne (`postgres:5432`) |

Arrêt :

```bash
docker compose down
```

Données persistées dans les volumes `postgres_data` et `cms_uploads`.

### Variables importantes (`.env`)

| Variable | Rôle |
|----------|------|
| `POSTGRES_PASSWORD` | Mot de passe base (obligatoire) |
| `SECRET_KEY` | Clé JWT (obligatoire) |
| `WEB_PORT` | Port public du portail (défaut `8080`) |
| `FRONTEND_URL` / `CORS_ORIGINS` | URL publique du site |
| `VITE_GOOGLE_CLIENT_ID` | OAuth Google (build + API) |

## Développement local (sans Docker)

### Portail web

```bash
cd frontend-web
npm install
npm run dev            # http://localhost:5173
```

**Langues :** FR / EN (sélecteur dans le header, mémorisé en local).

**Stack v3 :** React 19, Vite, Tailwind 4, i18next.

### Backend API

Voir [`backend/README.md`](backend/README.md).

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Application mobile (Flutter)

Voir [`mobile/README.md`](mobile/README.md).

Comptes démo : [`TEST_ACCOUNTS.md`](TEST_ACCOUNTS.md).
