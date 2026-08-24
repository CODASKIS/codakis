# CODAKIS Mobile (Flutter)

Application candidat — révision code de la route, quiz et suivi auto-école.

## Prérequis

- Flutter SDK 3.12+
- Backend CODAKIS en cours d'exécution (`http://localhost:8000`)

## Démarrage

```bash
cd mobile
flutter pub get

# Android emulator (API sur la machine hôte)
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8000

# iOS simulator / Linux desktop
flutter run --dart-define=API_BASE_URL=http://localhost:8000
```

## Comptes de démonstration

Voir `../TEST_ACCOUNTS.md` à la racine du monorepo.

| Compte | Mot de passe |
|--------|--------------|
| `candidat@demo.codakis.cm` | `Demo123!` |
| `premium@demo.codakis.cm` | `Demo123!` |

## Structure

```
lib/
├── config/api_config.dart   # URL API (dart-define)
├── core/api_client.dart     # Client HTTP JSON
├── features/auth/           # Connexion + session
└── features/home/           # Accueil candidat (stub)
```

Prochaines étapes : écrans cours, quiz chronométrés, auto-écoles et paiement Mobile Money.
