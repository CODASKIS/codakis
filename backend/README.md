# CODAKIS — Backend API

API FastAPI pour l'authentification et la gestion des utilisateurs (CDC CODAKIS).

## Prérequis

- Python 3.11+
- PostgreSQL 16 (local ou via `docker compose` à la racine du monorepo)

## Déploiement Docker

L'API peut tourner dans la stack Docker du monorepo :

```bash
cd ..
cp .env.example .env
docker compose up -d --build
```

L'API est accessible via le proxy Nginx : `http://localhost:8080/api/v1/...`

## Installation (développement local)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
# Éditez DATABASE_URL avec vos identifiants PostgreSQL
```

## Base de données (PostgreSQL local, sans Docker)

PostgreSQL doit tourner sur votre machine (`localhost:5432`). **Une seule fois**, créez l'utilisateur et la base :

```bash
cd backend
chmod +x scripts/setup-local-postgres.sh
bash scripts/setup-local-postgres.sh
```

Puis dans `.env` :

```
DATABASE_URL=postgresql+psycopg://postgres:VOTRE_MDP@localhost:5432/codaski_db
```

(Remplacez `VOTRE_MDP` par le mot de passe de l'utilisateur `postgres`.)

Les tables sont créées au premier démarrage de l'API.

## Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → **Identifiants** → **Client OAuth 2.0** (Application Web)
2. Origines JavaScript autorisées : `http://localhost:5173`
3. Copiez le **Client ID** dans :
   - `backend/.env` → `GOOGLE_CLIENT_ID=...`
   - `codakis/.env` → `VITE_GOOGLE_CLIENT_ID=...` (même valeur)
4. Redémarrez le backend et `npm run dev`

Sans Client ID, le bouton Google s'affiche mais indique la marche à suivre.

## Lancer l'API

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Documentation interactive : http://localhost:8000/docs

## Tests

```bash
pytest -v
```

Les tests utilisent SQLite en mémoire (aucune base externe requise).

## E-mails / OTP (mode test)

Avec `EMAIL_MODE=console`, les codes OTP et mots de passe temporaires sont affichés dans la console du serveur.

## Endpoints principaux

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/v1/auth/register/candidat` | Inscription candidat |
| POST | `/api/v1/auth/register/auto-ecole` | Inscription gérant + auto-école (en attente validation) |
| POST | `/api/v1/auth/login` | Connexion email/mot de passe |
| POST | `/api/v1/auth/google` | Connexion / inscription Google |
| POST | `/api/v1/auth/forgot-password` | Envoi OTP |
| POST | `/api/v1/auth/reset-password` | Réinitialisation avec OTP |
| GET | `/api/v1/users/me` | Profil connecté |
| GET | `/api/v1/admin/users` | Liste utilisateurs (admin) |
| POST | `/api/v1/admin/auto-ecoles/{id}/valider` | Valider une auto-école |
