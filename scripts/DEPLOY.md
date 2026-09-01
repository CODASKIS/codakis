# Déployer un projet sur le serveur Plesk (Docker)

Guide réutilisable pour **n'importe quel projet** conteneurisé (comme CODAKIS).

## Prérequis serveur

- Linux (Ubuntu) + **Plesk**
- **Docker** + **Docker Compose** v2
- **Git**
- Utilisateur SSH avec accès au groupe `docker` (ou `sudo`)

---

## Modèle en 6 étapes

### 1. Préparer le dépôt

Structure type :

```
mon-projet/
├── docker-compose.yml
├── .env.example
├── backend/Dockerfile
├── frontend-web/Dockerfile
└── scripts/deploy.sh
```

Ne commitez **jamais** `.env` (clés API, mots de passe).

### 2. Cloner sur le serveur

```bash
ssh utilisateur@serveur
git clone https://github.com/ORG/mon-projet.git ~/mon-projet
cd ~/mon-projet
cp .env.example .env
nano .env   # mots de passe, clés API, URL publique
```

### 3. Lancer les conteneurs

```bash
docker compose up -d --build
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/
# → 200 attendu
```

### 4. Auto-démarrage au boot (systemd)

```bash
sudo cp scripts/codakis-docker.service /etc/systemd/system/mon-projet-docker.service
sudo nano /etc/systemd/system/mon-projet-docker.service
# Modifier WorkingDirectory=/home/USER/mon-projet
sudo systemctl daemon-reload
sudo systemctl enable --now mon-projet-docker
```

### 5. Domaine + HTTPS dans Plesk

**Ne pas** ouvrir `https://IP:8080` : le port 8080 sert du **HTTP** (nginx dans Docker).  
Le navigateur tente du TLS → erreur **`SSL_ERROR_RX_RECORD_TOO_LONG`**.

| Accès | URL correcte |
|-------|----------------|
| Test direct (sans domaine) | `http://192.168.x.x:8080` |
| Production (domaine) | `https://app.votredomaine.com` |

#### Configuration Plesk (reverse proxy)

1. **Domaines** → ajouter ou choisir le domaine / sous-domaine
2. **Paramètres d'hébergement** → racine document : laisser Plesk gérer (pas le dossier Docker)
3. **Apache & nginx** → **Paramètres proxy nginx** (ou « Additional nginx directives ») :

```nginx
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /api/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

4. **SSL/TLS** → Let's Encrypt → activer pour le domaine (port **443**)
5. Dans `.env` du projet :

```env
WEB_PORT=8080
FRONTEND_URL=https://app.votredomaine.com
CORS_ORIGINS=https://app.votredomaine.com
```

6. Redéployer : `./scripts/deploy.sh`

### 6. Mises à jour

```bash
cd ~/mon-projet
git pull
./scripts/deploy.sh
```

---

## CODAKIS (instance actuelle)

```bash
ssh traumatec@192.168.1.150
cd ~/codakis && ./scripts/deploy.sh
```

- **HTTP direct** : http://192.168.1.150:8080  
- **HTTPS** : uniquement via un domaine Plesk (voir ci-dessus)

Comptes démo : voir `TEST_ACCOUNTS.md`.

---

## E-mails (Resend)

1. Créer un compte sur [resend.com](https://resend.com)
2. Générer une clé API (`re_...`)
3. Vérifier un domaine d'envoi (ou utiliser `onboarding@resend.dev` en test)
4. Dans `.env` sur le serveur :

```env
EMAIL_MODE=resend
RESEND_API_KEY=re_votre_cle
SMTP_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=CODAKIS
```

5. Redéployer : `./scripts/deploy.sh`

Les e-mails partent pour : connexion, OTP, quiz, bienvenue, etc.

---

## Paiements CinetPay (sandbox)

1. Compte [CinetPay](https://cinetpay.com) → mode **sandbox / test**
2. Récupérer dans le tableau de bord :
   - **API KEY** (`sk_test_...`)
   - **SITE ID** (numérique — obligatoire)
   - **Mot de passe API**
3. Dans `.env` :

```env
CINETPAY_API_KEY=sk_test_...
CINETPAY_API_PASSWORD=...
CINETPAY_SITE_ID=123456
CINETPAY_CURRENCY=XAF
FRONTEND_URL=https://app.votredomaine.com
```

4. Flux utilisateur :
   - Candidat choisit un forfait → **Initier paiement**
   - Redirection vers la page CinetPay sandbox
   - Retour sur `/paiement/retour?ref=...` → confirmation automatique
   - Webhook : `POST /api/v1/payments/cinetpay/notify`

Sans `CINETPAY_SITE_ID`, le mode sandbox Mobile Money simulé reste actif.

---

## Plusieurs projets sur le même serveur

| Projet | `WEB_PORT` | Proxy Plesk |
|--------|------------|-------------|
| codakis | 8080 | app1.domaine.com → 8080 |
| autre-app | 8081 | app2.domaine.com → 8081 |

Chaque projet : clone séparé, `.env` séparé, service systemd séparé.

---

## Dépannage

| Symptôme | Cause | Solution |
|----------|-------|----------|
| `SSL_ERROR_RX_RECORD_TOO_LONG` | HTTPS sur un port HTTP (8080) | Utiliser `http://` ou un domaine Plesk en 443 |
| 502 Bad Gateway | Conteneurs arrêtés | `docker compose ps` puis `docker compose up -d` |
| E-mails absents | `EMAIL_MODE=console` ou clé manquante | `EMAIL_MODE=resend` + `RESEND_API_KEY` |
| CinetPay ne redirige pas | `SITE_ID` manquant ou mauvaise `FRONTEND_URL` | Vérifier `.env` et logs API |
| CORS bloqué | `CORS_ORIGINS` ≠ URL du navigateur | Aligner avec `FRONTEND_URL` |

Logs :

```bash
docker compose logs -f api
docker compose logs -f web
```

---

## Banque de questions NARSA (DrivingQuiz)

Au premier démarrage, l'API importe automatiquement **40 questions** (projet [DrivingQuiz](https://github.com/ELMESKINEAnas/DrivingQuiz)) dans l'examen **« Examen type NARSA (Maroc) »**.

Fichiers : `backend/assets/driving-quiz/` (JSON + images).
