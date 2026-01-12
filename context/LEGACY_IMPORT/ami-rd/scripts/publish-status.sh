#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

echo "→ Regenerando status-site/data/status.json desde PROYECTO.md..."
npm run sync:dashboard >/dev/null

echo "→ Agregando status-site/data/status.json al staging..."
git add status-site/data/status.json

echo "Listo. Revisa 'git status' y haz commit/push cuando estés conforme."
