# Débloquer l'envoi des e-mails (Resend)

Les e-mails sont codés et fonctionnels (facture de paiement, relances J-7 / J-3,
bienvenue, OTP mot de passe, invitation moniteur). Ils ne partent pas en production
parce que le compte Resend est encore en **mode test** : dans ce mode, Resend
n'accepte qu'une seule adresse de destination, celle du propriétaire du compte.

Symptôme observé : `POST /api/v1/auth/forgot-password` renvoie `email_sent: false`
pour toute adresse autre que `kseme277@gmail.com`.

Il faut vérifier un domaine, puis mettre à jour le `.env` du serveur.

## 1. Vérifier le domaine sur Resend

1. Ouvrir [resend.com/domains](https://resend.com/domains) et cliquer **Add Domain**.
2. Saisir `codakis.cm` et choisir la région la plus proche (`eu-west-1`).
3. Resend affiche 3 enregistrements DNS à créer. Les ajouter chez le registrar du
   domaine (ou dans Plesk → *DNS Settings*) **à l'identique** :

   | Type | Nom | Valeur |
   |---|---|---|
   | MX | `send` | `feedback-smtp.eu-west-1.amazonses.com` (priorité 10) |
   | TXT | `send` | `v=spf1 include:amazonses.com ~all` |
   | TXT | `resend._domainkey` | la longue clé DKIM fournie par Resend |

   Les valeurs exactes sont celles affichées par Resend : ne pas recopier ce tableau
   à l'aveugle, il ne sert qu'à montrer la forme attendue.

4. Revenir sur Resend et cliquer **Verify DNS Records**. La propagation prend
   de quelques minutes à quelques heures. Le domaine doit passer à **Verified**.

## 2. Mettre à jour le `.env` du serveur

Sur le serveur, dans le `.env` du backend :

```bash
EMAIL_MODE=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@codakis.cm
EMAIL_FROM_NAME=CODAKIS
```

Deux points qui bloquent le plus souvent :

- `EMAIL_FROM` **doit** utiliser le domaine vérifié à l'étape 1. Une adresse
  `@gmail.com` sera refusée par Resend.
- La clé API doit être une clé de production (`re_…`) avec la permission
  *Sending access*, créée sur [resend.com/api-keys](https://resend.com/api-keys).

Puis redémarrer le backend :

```bash
docker compose restart backend
```

## 3. Vérifier

```bash
curl -s -X POST https://codakis.efymotors.com/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"une-adresse-de-test@exemple.com"}'
```

La réponse doit contenir `"email_sent": true`. Si elle renvoie `false`, les logs
du backend donnent la raison exacte renvoyée par Resend :

```bash
docker compose logs --tail 100 backend | grep -i -E "resend|email"
```

## Repli SMTP

Si Resend reste bloqué, le backend sait basculer sur un SMTP classique :

```bash
EMAIL_MODE=smtp
SMTP_HOST=smtp.votre-hebergeur.cm
SMTP_PORT=587
SMTP_USER=noreply@codakis.cm
SMTP_PASSWORD=le-mot-de-passe
EMAIL_FROM=noreply@codakis.cm
```

Le SMTP doit autoriser l'authentification depuis l'IP du serveur
(`194.163.171.109`) ; sans cela l'envoi échoue silencieusement côté hébergeur.
