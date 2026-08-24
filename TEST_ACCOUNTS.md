# Comptes et données de test — CODAKIS

Ce document liste les identifiants de démonstration créés automatiquement au démarrage du backend (`seed_demo_data` dans `app/services/seed_demo.py`).

**Mot de passe commun des comptes démo :** `Demo123!`

---

## Administrateur

| Champ | Valeur |
|---|---|
| E-mail | `admin@codakis.cm` |
| Mot de passe | `Admin123!` |
| Rôle | Administrateur |
| Espace | `/admin` |

---

## Gérants d'auto-école

| E-mail | Mot de passe | Auto-école | Ville |
|---|---|---|---|
| `gerant@demo.codakis.cm` | `Demo123!` | Auto-École Volant Vert | Douala (Bonamoussadi) |
| `gerant2@demo.codakis.cm` | `Demo123!` | Auto-École Route Pro | Yaoundé (Bastos) |
| `gerant3@demo.codakis.cm` | `Demo123!` | Auto-École Permis Plus | Douala (Akwa) |

Espace gérant : `/espace/gerant`

---

## Moniteurs

| E-mail | Mot de passe | Auto-école |
|---|---|---|
| `moniteur@demo.codakis.cm` | `Demo123!` | Auto-École Volant Vert |
| `moniteur2@demo.codakis.cm` | `Demo123!` | Auto-École Volant Vert |
| `moniteur3@demo.codakis.cm` | `Demo123!` | Auto-École Route Pro |

Espace moniteur : `/espace/moniteur`

---

## Candidats

| E-mail | Mot de passe | Plan | Usage |
|---|---|---|---|
| `candidat@demo.codakis.cm` | `Demo123!` | Free | Inscrit à **Auto-École Volant Vert** (forfait Code en ligne) — voir `/espace/candidat/auto-ecole` |
| `premium@demo.codakis.cm` | `Demo123!` | Premium | Accès complet aux thèmes premium (abonnement simulé) |

Espace candidat : `/espace/candidat`

### Parcours auto-école (dashboard)

| Page | URL |
|---|---|
| Mon auto-école (inscription active) | `/espace/candidat/auto-ecole` |
| Parcourir les auto-écoles | `/espace/candidat/auto-ecoles` |
| Choisir un forfait | `/espace/candidat/auto-ecoles/{uuid}` |

---

## Site public — auto-écoles (API backend)

Les pages `/auto-ecoles` et la fiche détail chargent désormais **uniquement** l'API :

- Liste : `GET /api/v1/public/auto-ecoles`
- Détail : `GET /api/v1/public/auto-ecoles/{uuid}`

### Auto-écoles de démo visibles sur le site

1. **Auto-École Volant Vert** — Douala, Bonamoussadi  
   URL : `/auto-ecoles/e9b607bf-6dd0-4715-96d2-ba5839548d53`  
   Forfaits : code, conduite 10h/20h, complet 20h

2. **Auto-École Route Pro** — Yaoundé, Bastos  
   URL : `/auto-ecoles/7b74538f-23f4-45b0-93f7-f675102ab3d7`  
   Forfaits par défaut + moniteur `moniteur3@demo.codakis.cm`

3. **Auto-École Permis Plus** — Douala, Akwa  
   URL : `/auto-ecoles/3f8ddf83-d04b-44a5-aae4-9d458283a442`

> Les UUID peuvent varier si la base est recréée. Consultez l'URL du navigateur ou `GET /api/v1/public/auto-ecoles`.

---

## Site public — blog (API backend)

Les pages `/blog` et `/blog/{slug}` chargent l'API :

- Liste : `GET /api/v1/public/blog`
- Article : `GET /api/v1/public/blog/{slug}`

### Articles publiés (6)

| Slug | Titre |
|---|---|
| `reussir-code-route-cameroun` | 10 conseils pour réussir le code de la route au Cameroun |
| `choisir-auto-ecole-agreee` | Comment choisir une auto-école agréée ? |
| `dossier-consort-pieces` | Dossier Consort : les 6 pièces à préparer |
| `paiement-mobile-money-permis` | Payer son forfait permis avec Mobile Money |
| `examen-blanc-strategies` | Examen blanc : 5 stratégies pour scorer 35/40 |
| `signalisation-cemac` | Signalisation CEMAC : panneaux à connaître par cœur |

Exemple : `/blog/reussir-code-route-cameroun`

---

## Pédagogie — cours, quiz, examens

Créés au seed (thèmes CEMAC + contenus enrichis) :

### Thèmes & leçons

- **10 thèmes** CEMAC (`signalisation`, `priorites`, `circulation`, …)
- **1 leçon d'introduction par thème** (`/espace/candidat/cours`)
- Les **3 premières leçons** incluent une **vidéo YouTube embarquée** et une **image illustrative**

### Questions (6)

Questions avec **image** et/ou **vidéo YouTube** pour tester les quiz et examens :

- Panneau triangulaire (image)
- Vidéo STOP (vidéo)
- Priorité à droite (image)
- Vitesse en agglomération (vidéo)
- Passage clouté (image)
- Alcoolémie

### Quiz (3)

Un quiz par thème : **Signalisation**, **Priorités**, **Vitesse**

- Espace candidat : `/espace/candidat/examens`

### Examen blanc (1)

- **Examen blanc CEMAC — démo** (6 questions, max 2 erreurs, 30 min)

---

## Parcours de test recommandé

1. **Site public** — Ouvrir `/auto-ecoles` et vérifier les 3 auto-écoles de démo.
2. **Blog** — Ouvrir `/blog` et lire un article.
3. **Candidat free inscrit** — Se connecter avec `candidat@demo.codakis.cm` : voir l'auto-école rattachée sur `/espace/candidat/auto-ecole`.
4. **Candidat sans inscription** — Se connecter avec un nouveau compte ou `premium@demo.codakis.cm`, aller sur `/espace/candidat/auto-ecoles`, choisir une auto-école et un forfait (Mobile Money).
5. **Candidat premium** — Accéder aux thèmes premium et lire une leçon avec vidéo.
6. **Quiz & examen** — Passer un quiz thématique puis l'examen blanc démo (questions avec médias).
7. **Gérant** — Se connecter avec `gerant@demo.codakis.cm`, gérer forfaits et moniteurs.
8. **Moniteur** — Se connecter avec `moniteur@demo.codakis.cm`, consulter le planning et les créneaux.
9. **Admin** — Se connecter avec `admin@codakis.cm` / `Admin123!`, éditer le contenu pédagogique et les articles blog.

---

## Réinitialiser les données de démo

Les seeds sont **idempotents** : relancer le backend ne duplique pas les comptes.

Pour repartir de zéro en local, vider les tables concernées ou recréer la base PostgreSQL, puis redémarrer :

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Le frontend doit pointer vers l'API :

```env
# frontend-web/.env
VITE_API_URL=http://localhost:8000
```
