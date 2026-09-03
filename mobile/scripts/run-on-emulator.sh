#!/usr/bin/env bash
# Build (if needed), start emulator, install APK and launch CODAKIS mobile.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

API_URL="${API_BASE_URL:-http://10.0.2.2:8000}"
AVD="${1:-Codakis_Lite}"
APK="$ROOT/build/app/outputs/flutter-apk/app-debug.apk"
LOG="/tmp/codakis-emulator.log"
PIDFILE="/tmp/codakis-emulator.pid"

if ! groups | rg -q '\bkvm\b'; then
  echo "⚠️  Accélération KVM inactive (utilisateur hors groupe kvm)."
  echo "   L'émulateur sera lent et peut planter si la RAM est saturée."
  echo "   Corrigez une fois : sudo usermod -aG kvm \"\$USER\" puis reconnectez la session."
  echo
fi

if [[ ! -f "$APK" ]]; then
  echo "→ Compilation APK debug (sans émulateur, pour économiser la RAM)…"
  flutter build apk --debug --dart-define="API_BASE_URL=$API_URL"
fi

if [[ -f "$PIDFILE" ]] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
  echo "→ Émulateur déjà en cours (PID $(cat "$PIDFILE"))."
else
  echo "→ Démarrage émulateur $AVD…"
  nohup "$ROOT/scripts/start-emulator.sh" "$AVD" >>"$LOG" 2>&1 &
  echo $! >"$PIDFILE"
fi

echo "→ Attente du boot Android…"
adb wait-for-device
for _ in $(seq 1 90); do
  boot="$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)"
  state="$(adb get-state 2>/dev/null || true)"
  if [[ "$boot" == "1" && "$state" == "device" ]]; then
    break
  fi
  sleep 2
done

if [[ "$(adb get-state 2>/dev/null || echo missing)" != "device" ]]; then
  echo "✗ Émulateur indisponible. Consultez $LOG"
  exit 1
fi

echo "→ Installation APK…"
if ! adb -s emulator-5554 install -r "$APK"; then
  echo "✗ Installation échouée (souvent manque de RAM). Fermez des apps, relancez ce script."
  exit 1
fi

echo "→ Lancement de l'application…"
adb -s emulator-5554 shell am start -n cm.codakis.codakis_mobile/.MainActivity >/dev/null

echo "✓ CODAKIS est lancé sur l'émulateur."
echo "  Logs : flutter attach -d emulator-5554"
echo "  Dev  : flutter run -d emulator-5554 --use-application-binary=$APK --dart-define=API_BASE_URL=$API_URL"
