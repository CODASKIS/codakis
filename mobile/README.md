# CODAKIS Mobile (Flutter)

Application candidat — onboarding, révision code de la route, quiz et suivi auto-école.

## Prérequis

- Flutter SDK 3.12+ (`flutter doctor` sans erreur)
- Android Studio + émulateur **ou** téléphone USB avec débogage activé
- Backend CODAKIS (`http://localhost:8000`) pour la connexion

---

## Démarrage complet (4 terminaux)

### 1. Backend API

```bash
cd backend
# selon votre setup habituel, par ex. :
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Émulateur Android (lancer **avant** `flutter run`)

**Recommandé — Codakis Lite** (Pixel 5, API 34, ~1,5 Go RAM) :

```bash
cd mobile
./scripts/start-emulator.sh
# ou : flutter emulators --launch Codakis_Lite
```

Ancien AVD lourd (Pixel 7 Pro, API 37, 16 KB) : `./scripts/start-emulator.sh Pixel_7_Pro`

Attendre que l'émulateur affiche l'écran d'accueil Android (30 s à 2 min).

Vérifier qu'il est bien en ligne :

```bash
adb devices
# doit afficher : emulator-5554   device
```

```bash
flutter devices
# doit afficher : sdk gphone... (mobile) • emulator-5554 • android...
```

### 3. Application Flutter

```bash
cd mobile
flutter pub get
flutter run -d emulator-5554 --dart-define=API_BASE_URL=http://10.0.2.2:8000
```

> **`10.0.2.2`** = adresse de votre PC vue depuis l'émulateur Android (équivalent de `localhost`).

### 4. Commandes utiles pendant `flutter run`

| Touche | Action |
|--------|--------|
| `r` | Hot reload |
| `R` | Hot restart |
| `q` | Quitter |

---

## Variantes selon la cible

```bash
# Émulateur Android
flutter run -d emulator-5554 --dart-define=API_BASE_URL=http://10.0.2.2:8000

# Téléphone physique (même Wi‑Fi) — remplacer par l'IP LAN du PC
flutter run --dart-define=API_BASE_URL=http://192.168.1.42:8000

# Linux desktop (sans émulateur)
flutter run -d linux --dart-define=API_BASE_URL=http://localhost:8000

# Chrome (aperçu rapide UI)
flutter run -d chrome --dart-define=API_BASE_URL=http://localhost:8000
```

---

## Tests & analyse

```bash
cd mobile
flutter analyze
flutter test
```

---

## Réafficher l'onboarding (Get Started)

L'onboarding ne s'affiche qu'une fois. Pour le revoir :

```bash
# Option A — réinstaller l'app sur l'émulateur
flutter run -d emulator-5554

# Option B — vider les données de l'app dans l'émulateur
# Paramètres → Apps → codakis_mobile → Effacer les données
```

---

## Comptes démo

Voir `../TEST_ACCOUNTS.md`.

| Compte | Mot de passe |
|--------|--------------|
| `candidat@demo.codakis.cm` | `Demo123!` |
| `premium@demo.codakis.cm` | `Demo123!` |

---

## Dépannage émulateur

### Pourquoi la fenêtre s'ouvre puis se ferme ?

Sur votre machine, **3 causes principales** :

| Cause | Détail |
|-------|--------|
| **GPU `auto` + NVIDIA** | Mode par défaut de l'AVD — crash fréquent sous Linux. Fix : `-gpu swiftshader_indirect` |
| **Pas d'accès KVM** | Vous n'êtes pas dans le groupe `kvm` → émulateur sans accélération matérielle, instable |
| **AVD très lourd** | Pixel 7 Pro, API 37, écran 1440×3120, image 16 KB — ~2,4 Go RAM, limite avec 16 Go sur le PC |

Le snapshot « fast boot » peut aussi faire planter au démarrage → utiliser `-no-snapshot-load`.

**Fix immédiat (testé chez vous) :**

```bash
cd mobile
./scripts/start-emulator.sh
# Attendre 1–2 min, puis :
flutter run -d emulator-5554 --dart-define=API_BASE_URL=http://10.0.2.2:8000
```

**Fix permanent KVM (une fois, puis reconnexion session) :**

```bash
sudo usermod -aG kvm "$USER"
# Déconnexion / reconnexion obligatoire
groups   # doit afficher kvm
```

### Symptômes fréquents

| Message | Cause probable |
|---------|----------------|
| `adb: device 'emulator-5554' not found` | L'émulateur s'est fermé ou n'a pas fini de booter |
| `Device emulator-5554 is offline` | Boot en cours, ou instance ADB corrompue |
| `Running Gradle task 'assembleDebug'...` très long (10+ min) | **Premier build** : téléchargement NDK, Build-Tools, CMake (normal une seule fois) |
| Build OK mais install échoue | L'émulateur a été tué **pendant** le Gradle (notre cas) |

### Pourquoi ça a planté chez vous

1. **Premier build Android ≈ 10 minutes** — Gradle a installé NDK 28, Build-Tools 36 et CMake.
2. **Pendant ce temps**, l'émulateur s'est déconnecté (`not found` / `offline`).
3. L'APK a bien été compilé, mais **l'installation a échoué** car plus d'appareil ADB actif.

Ce n'est pas que l'émulateur est « poubelle » : il faut le **garder ouvert** jusqu'au bout du premier build, ou relancer dans l'ordre ci-dessous.

### Procédure de reset (recommandée)

```bash
# 1. Tuer les processus adb / émulateur zombies
adb kill-server
adb start-server

# 2. Relancer l'émulateur et attendre l'écran d'accueil
flutter emulators --launch Pixel_7_Pro

# 3. Attendre qu'il soit "device" (pas "offline")
watch -n 2 adb devices

# 4. Relancer Flutter (2e build beaucoup plus rapide, ~30 s)
cd mobile
flutter run -d emulator-5554 --dart-define=API_BASE_URL=http://10.0.2.2:8000
```

### Si l'émulateur reste lent ou instable

- Fermer les autres apps lourdes (Chrome, Docker…).
- Android Studio → **Device Manager** → Pixel 7 Pro → **Cold Boot Now**.
- Créer un AVD plus léger : Pixel 5, API 34, sans Google Play si possible.
- Alternative immédiate : `flutter run -d linux` pour tester l'UI sans émulateur.

---

## Structure

```
lib/
├── config/api_config.dart
├── core/app_theme.dart
├── core/api_client.dart
├── features/onboarding/     # Get Started (3 écrans)
├── features/auth/           # Connexion + session
└── features/home/           # Accueil candidat
assets/
├── onboarding/              # Illustrations mockups
└── logo/
```
