#!/usr/bin/env bash
# Installation WordPress + Astra via Plesk (root requis)
# Usage : sudo bash scripts/setup-plesk-wordpress-astra.sh [domaine]
set -euo pipefail

DOMAIN="${1:-blog.codakis.local}"
ADMIN_EMAIL="${WP_ADMIN_EMAIL:-admin@codakis.cm}"
ADMIN_PASS="${WP_ADMIN_PASSWORD:-Admin123!}"
DB_NAME="wp_codakis"
DB_USER="wp_codakis"
DB_PASS="${WP_DB_PASSWORD:-WordPressDemo123!}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Exécutez avec sudo : sudo bash $0 [domaine]"
  exit 1
fi

if ! command -v plesk >/dev/null; then
  echo "Plesk introuvable."
  exit 1
fi

echo "==> Création domaine $DOMAIN (si absent)"
if ! plesk bin domain --list | grep -qx "$DOMAIN"; then
  plesk bin site --create "$DOMAIN" -owner admin -ip "$(hostname -I | awk '{print $1}')" -hosting true
fi

echo "==> Base MySQL"
plesk bin database --create "$DB_NAME" -domain "$DOMAIN" -type mysql || true
plesk bin database --update "$DB_NAME" -domain "$DOMAIN" -passwd "$DB_PASS" || true

DOCROOT="/var/www/vhosts/$DOMAIN/httpdocs"

echo "==> WordPress (WP-CLI)"
if ! command -v wp >/dev/null; then
  curl -sO https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
  chmod +x wp-cli.phar
  mv wp-cli.phar /usr/local/bin/wp
fi

cd "$DOCROOT"
if ! wp core is-installed --allow-root 2>/dev/null; then
  wp core download --allow-root
  wp config create --dbname="$DB_NAME" --dbuser="$DB_USER" --dbpass="$DB_PASS" --dbhost=localhost --allow-root
  wp core install \
    --url="https://$DOMAIN" \
    --title="CODAKIS Blog" \
    --admin_user=admin \
    --admin_password="$ADMIN_PASS" \
    --admin_email="$ADMIN_EMAIL" \
    --skip-email \
    --allow-root
fi

wp theme install astra --activate --allow-root
wp theme update astra --allow-root
wp plugin install litespeed-cache --activate --allow-root || true
wp option update blogdescription "Site vitrine CODAKIS" --allow-root
wp rewrite structure '/%postname%/' --allow-root

echo ""
echo "WordPress + Astra installé sur https://$DOMAIN"
echo "Admin : admin / $ADMIN_PASS"
echo "Configurez SSL dans Plesk → SSL/TLS → Let's Encrypt"
