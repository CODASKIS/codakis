# Guide Plesk — CODAKIS (192.168.1.150)

Panneau : **https://192.168.1.150:8443** (Plesk Obsidian 18.0.80)

## Outils & Paramètres (Tools & Settings)

### Mail — indispensable pour les e-mails CODAKIS

| Option | Usage |
|--------|--------|
| **Mail Server Settings** | Serveur sortant (Postfix). Autoriser le relais depuis Docker si vous utilisez `SMTP_FALLBACK_HOST=172.17.0.1`. |
| **Mail Queue** | Voir les e-mails bloqués (OTP, bienvenue, paiement). |
| **Spam Filter / Antivirus** | Réduire les faux positifs sur les OTP. |
| **Smarthost** | Relayer via Brevo/SendGrid si Resend n’est pas utilisé. |

**Resend (recommandé)** : validez le domaine `codakis.cm` sur [resend.com/domains](https://resend.com/domains), puis :

```env
EMAIL_MODE=resend
RESEND_API_KEY=re_...
SMTP_FROM=noreply@codakis.cm
```

Sans domaine validé, Resend n’envoie qu’à l’e-mail du compte Resend (mode test).

### Sécurité

- **SSL/TLS Certificates** — HTTPS pour le domaine public
- **Fail2Ban** — protection brute-force
- **ModSecurity (WAF)** — filtrage requêtes web

### Paramètres généraux

- **DNS Settings** — enregistrements A/MX pour le domaine
- **PHP Settings** — version PHP pour WordPress
- **Apache & nginx Settings** — reverse proxy vers CODAKIS Docker (port 8080)

### Outils & ressources

- **Scheduled Tasks (Cron)** — tâches planifiées WordPress / sauvegardes
- **Backup Manager** — sauvegardes automatiques

### Gestion du serveur

- **Services Management** — redémarrer Postfix, Apache, nginx
- **System Updates** — mises à jour Plesk / OS

## WordPress + Astra

### Option A — Docker (port 8082)

```bash
cd ~/codakis
docker compose -f docker-compose.wordpress.yml up -d
```

→ **http://192.168.1.150:8082** — Admin : `admin` / `Admin123!`

### Option B — Plesk (sudo)

```bash
sudo bash ~/codakis/scripts/setup-plesk-wordpress-astra.sh blog.votredomaine.com
```
