#!/usr/bin/env bash
# Démarre l'émulateur CODAKIS Lite (Pixel 5, API 34) — plus léger que Pixel 7 Pro.
set -euo pipefail

SDK="${ANDROID_HOME:-$HOME/Android/Sdk}"
EMULATOR="$SDK/emulator/emulator"
AVD="${1:-Codakis_Lite}"

if [[ ! -x "$EMULATOR" ]]; then
  echo "Emulateur introuvable : $EMULATOR"
  exit 1
fi

if ! groups | rg -q '\bkvm\b'; then
  echo "⚠️  Votre utilisateur n'est pas dans le groupe 'kvm'."
  echo "   L'émulateur tournera en mode logiciel (lent). Pour corriger :"
  echo "   sudo usermod -aG kvm \"\$USER\"   puis déconnectez/reconnectez la session."
  echo
fi

echo "Démarrage de $AVD (Pixel 5 · API 34 · 1,5 Go RAM · SwiftShader)…"
echo "Attendez l'écran d'accueil Android (~45 s) avant flutter run."
echo

exec "$EMULATOR" \
  -avd "$AVD" \
  -no-snapshot-load \
  -gpu swiftshader_indirect \
  -no-boot-anim \
  -memory 1536 \
  -cores 2
