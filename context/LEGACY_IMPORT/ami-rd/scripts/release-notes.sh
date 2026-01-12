#!/usr/bin/env bash
set -euo pipefail

FROM="${1:-}"
TO="${2:-HEAD}"

if ! command -v git >/dev/null 2>&1; then
  echo "git no está disponible en el PATH" >&2
  exit 1
fi

if [ -z "$FROM" ]; then
  FROM=$(git describe --tags --abbrev=0 2>/dev/null || true)
fi

echo "Generando notas de la release desde: '$FROM' hasta: '$TO'"

if [ -n "$FROM" ]; then
  RANGE="$FROM..$TO"
else
  RANGE="$TO"
fi

git log $RANGE --pretty=format:"- %s (%h)" --no-merges > RELEASE_NOTES.md

echo "Notas generadas en RELEASE_NOTES.md"