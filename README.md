# CODAKIS

Plateforme d'apprentissage du code de la route et de mise en relation avec les auto-écoles agréées — Cameroun / CEMAC.

## Structure du monorepo

```
codakis/
├── backend/           # API FastAPI (monolithe modulaire)
├── frontend-web/      # Portail web Next.js (candidat, auto-école, admin)
├── mobile/            # Application Flutter (candidat)
└── docker-compose.yml # Orchestration locale
```

## Documentation

Les diagrammes UML, cahiers d'analyse/conception et ADR sont maintenus dans le dépôt de documentation associé.

## Démarrage

### Portail web (vitrine)

```bash
cd frontend-web
npm install
npm run dev            # http://localhost:5173
```

**Langues :** FR / EN (sélecteur dans le header, mémorisé en local).

**Stack v3 :** React 19, Vite, Tailwind 4, i18next — sans Clerk ni auth externe.

**Pages :** `/`, `/auto-ecoles`, `/themes`, `/tarifs`, `/blog`, `/contact`, etc.

> Backend API et espace admin — prochaines étapes.
