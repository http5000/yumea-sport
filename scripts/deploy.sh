#!/usr/bin/env bash
# Déploiement statique sur le VPS (servi par Caddy depuis /srv/yumea-move).
# Usage : bash scripts/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ Build (export statique)…"
npm run build

DEST="/srv/yumea-move"
echo "→ Publication vers $DEST…"
mkdir -p "$DEST"
rsync -a --delete out/ "$DEST/"
chmod -R a+rX "$DEST"

echo "✓ Déployé. URL de production : https://move.yumea.fr"
echo "  (alias preview : https://yumeamove.49.13.153.199.nip.io)"
