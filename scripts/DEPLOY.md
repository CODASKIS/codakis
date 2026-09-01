# Déployer un projet sur le serveur Plesk (Docker)

Guide générique pour déployer **n'importe quel projet** Docker sur le serveur Linux.

## Prérequis serveur

- Ubuntu + Plesk
- Docker + Docker Compose
- Git
- Utilisateur SSH avec `sudo` ou groupe `docker`

## Modèle en 5 étapes

### 1. Préparer le repo

```
mon-projet/
├── docker-compose.yml
├── .env.example
├── backend/Dockerfile
├── frontend-web/Dockerfile
└── scripts/deploy.sh
```

### 2. Cloner sur le serveur

```bash
ssh user@serveur
git clone https://github.com/ORG/mon-projet.git ~/mon-projet
cd ~/mon-projet && cp .env.example .env
```

### 3. Lancer

```bash
docker compose up -d --build
```

### 4. Auto-démarrage

```bash
sudo cp scripts/codakis-docker.service /etc/systemd/system/mon-projet-docker.service
# Éditez WorkingDirectory
sudo systemctl enable --now mon-projet-docker
```

### 5. Domaine Plesk

Reverse proxy → `http://127.0.0.1:8080`

---

## CODAKIS

```bash
cd ~/codakis && ./scripts/deploy.sh
```

## E-mails (Resend — gratuit)

1. [resend.com](https://resend.com) → clé API
2. Dans `.env` : `EMAIL_MODE=resend`, `RESEND_API_KEY=re_...`
3. `./scripts/deploy.sh`

## Plusieurs projets

Changez `WEB_PORT` par projet (8080, 8081, …).
