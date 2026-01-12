#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./scripts/bootstrap.sh <CLIENT> <PROJECT> [--origin <URL>|--origin=<URL>] [--push]

CLIENT=${1:-AMI}
PROJECT=${2:-RD-Residente-Digital}
# Shift positional args safely (honors set -u)
if [ $# -ge 1 ]; then shift || true; fi
if [ $# -ge 1 ]; then shift || true; fi

ORIGIN=""
PUSH=""
while [ $# -gt 0 ]; do
  case "$1" in
    --origin=*)
      ORIGIN="${1#*=}"
      shift
      ;;
    --origin)
      shift
      ORIGIN="${1:-}"
      if [ -n "${1-}" ]; then shift; fi
      ;;
    --push)
      PUSH="1"
      shift
      ;;
    *)
      shift
      ;;
  esac
done

UTC_NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DATESTAMP=$(date -u +"%Y-%m-%d_%H%M")

mkdir -p context context/varios propuestas Checkpoints meta scripts api .continue/assistants

# .gitignore
cat > .gitignore << 'EOF'
.env
node_modules/
dist/
.DS_Store
.vscode/
.idea/
EOF

# .env.example
cat > .env.example << EOF
OPENAI_API_KEY=
ENV=dev
CLIENT=${CLIENT}
PROJECT=${PROJECT}
EOF

# PROYECTO.md
cat > PROYECTO.md << EOF
# PROYECTO: ${PROJECT} (Cliente: ${CLIENT})

## Flujo de estados
- [ ] Pendiente
- [ ] En Progreso
- [ ] Hecho
- [ ] Aprobado

## Backlog inicial
- Bootstrap de estructura y artefactos
EOF

# context
cat > context/00_ARQUITECTURA_PROPUESTA.md << 'EOF'
# Arquitectura Propuesta: Integra Evolucionada

Esta propuesta presenta una arquitectura Integra Evolucionada, centrada en:

- Simplicidad operativa y modularidad.
- Estándares claros de entrega y trazabilidad.
- Capas separadas para dominio, aplicación y plataforma.

Estructura estándar sugerida:
- context/: documentación de arquitectura y decisiones.
- api/: endpoints, contratos y adaptadores.
- scripts/: automatizaciones (bootstrap, tareas rutinarias).
- meta/: plantillas de control y trazabilidad.
- Checkpoints/: hitos y estados del proyecto.
- propuestas/: espacio para alternativas y POCs.

Principios:
- Evolución incremental, cambios pequeños y seguros.
- Observabilidad y checklist de calidad.
- Política fast-path: crear/editar sin pedir confirmación; confirmar solo acciones destructivas.
EOF

cat > context/dossier_tecnico.md << 'EOF'
# Dossier Técnico

## Decisiones técnicas

## Supuestos

## Riesgos

## Enlaces
EOF

cat > meta/plantilla_control.md << 'EOF'
tarea:
cambios:
supuestos:
riesgos:
próximos pasos:
EOF

# bootstrap.md
cat > bootstrap.md << EOF
Fecha (UTC): ${UTC_NOW}
Cliente: ${CLIENT}
Proyecto: ${PROJECT}
EOF

# Continue assistants
cat > .continue/assistants/aria-arquitecta.json << 'EOF'
{
  "name": "Aria (Arquitecta)",
  "defaultModel": "gpt-5",
  "models": ["gpt-5", "gpt-4o"],
  "provider": "OpenAI",
  "apiKey": "${{ secrets.OPENAI_API_KEY }}",
  "apiBase": "https://api.openai.com/v1",
  "identity": "Arquitecta, Integra Evolucionada, español",
  "rules": [
    "Usar PROYECTO.md como fuente de verdad",
    "Política fast-path: crear/editar sin pedir confirmación; confirmar solo acciones destructivas"
  ],
  "notes": "Si gpt-5 no existe en la API, usar gpt-4o como predeterminado."
}
EOF

cat > .continue/assistants/ines-ejecutora.json << 'EOF'
{
  "name": "Inés (Ejecutora)",
  "defaultModel": "gpt-4o",
  "models": ["gpt-4o", "gpt-5"],
  "provider": "OpenAI",
  "apiKey": "${{ secrets.OPENAI_API_KEY }}",
  "apiBase": "https://api.openai.com/v1",
  "rules": [
    "Modo ejecutor directo",
    "Producir artefactos y checkpoints sin pedir confirmación"
  ],
  "notes": "Predeterminada gpt-4o; respaldo gpt-5 si está disponible."
}
EOF

# git init opcional y primer commit
if [ ! -d .git ]; then
  git init -b main >/dev/null 2>&1 || git init >/dev/null 2>&1
  git add .
  git commit -m "feat: bootstrap inicial ${CLIENT}/${PROJECT}" >/dev/null 2>&1 || true
fi

# Asegurar rama main
if [ -d .git ]; then
  git branch -M main >/dev/null 2>&1 || true
fi

# Configurar/actualizar remoto si se pasa --origin
if [ -n "${ORIGIN}" ]; then
  if git remote get-url origin >/dev/null 2>&1; then
    if [ "$(git remote get-url origin)" != "${ORIGIN}" ]; then
      git remote set-url origin "${ORIGIN}"
      echo "Git remote 'origin' actualizado: ${ORIGIN}"
    else
      echo "Git remote 'origin' ya apunta a: ${ORIGIN}"
    fi
  else
    git remote add origin "${ORIGIN}"
    echo "Git remote 'origin' configurado: ${ORIGIN}"
  fi
fi

# Push si se solicita --push o si hay --origin
if [ -n "${PUSH}" ] || [ -n "${ORIGIN}" ]; then
  if git rev-parse --verify main >/dev/null 2>&1; then
    if git push -u origin main >/dev/null 2>&1; then
      echo "Cambios empujados a 'origin/main'."
    else
      echo "ADVERTENCIA: No se pudo hacer push a 'origin/main'. Verifica permisos/URL." >&2
    fi
  fi
fi

# checkpoint
CHK_PATH="Checkpoints/CHK_${DATESTAMP}.md"
cat > "$CHK_PATH" << EOF
# Checkpoint ${DATESTAMP}

Bootstrap ejecutado.

- Cliente: ${CLIENT}
- Proyecto: ${PROJECT}
- Fecha UTC: ${UTC_NOW}
- Artefactos: estructura creada/actualizada
EOF

echo "Bootstrap completado. Checkpoint: ${CHK_PATH}"
