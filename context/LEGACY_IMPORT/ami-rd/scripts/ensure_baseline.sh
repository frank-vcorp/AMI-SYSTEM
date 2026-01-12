#!/usr/bin/env bash
set -euo pipefail

ensure_dir() { mkdir -p "$1"; }
ensure_file() { local path="$1"; shift; if [ ! -f "$path" ]; then printf "%s" "$*" > "$path"; echo "Created $path"; fi; }

# Derive CLIENT and PROJECT
GITHUB_REPOSITORY=${GITHUB_REPOSITORY:-local/local}
REPO_NAME="${GITHUB_REPOSITORY##*/}"
CLIENT="Farienergy"
PROJECT="$REPO_NAME"
if [ -f ".env.example" ]; then
  C1=$(grep -E '^CLIENT=' .env.example | head -n1 | cut -d= -f2- || true)
  P1=$(grep -E '^PROJECT=' .env.example | head -n1 | cut -d= -f2- || true)
  if [ -n "${C1:-}" ]; then CLIENT="$C1"; fi
  if [ -n "${P1:-}" ]; then PROJECT="$P1"; fi
fi
if [ -f "PROYECTO.md" ]; then
  TITLE=$(head -n1 PROYECTO.md || true)
  TP=$(echo "$TITLE" | sed -n 's/^# PROYECTO: \(.*\) (Cliente: .*).*$/\1/p' | sed 's/[[:space:]]*$//' || true)
  TC=$(echo "$TITLE" | sed -n 's/^# PROYECTO: .* (Cliente: \(.*\)).*$/\1/p' | sed 's/[[:space:]]*$//' || true)
  if [ -n "$TP" ]; then PROJECT="$TP"; fi
  if [ -n "$TC" ]; then CLIENT="$TC"; fi
fi

# Ensure directories
ensure_dir context
ensure_dir context/varios
ensure_dir propuestas
ensure_dir Checkpoints
ensure_dir meta
ensure_dir meta/plantillas
ensure_dir scripts
ensure_dir api
ensure_dir .continue/assistants

# Ensure files
ensure_file ".gitignore" $'.env\nnode_modules/\ndist/\n.DS_Store\n.vscode/\n.idea/\n'
ensure_file ".env.example" "$(printf 'OPENAI_API_KEY=\nENV=dev\nCLIENT=%s\nPROJECT=%s\n' "$CLIENT" "$PROJECT")"

if [ ! -f "PROYECTO.md" ]; then
  cat > PROYECTO.md <<EOF_CONTENT
# PROYECTO: ${PROJECT} (Cliente: ${CLIENT})

## Flujo de estados
- [ ] Pendiente
- [ ] En Progreso
- [ ] Hecho
- [ ] Aprobado

## Backlog inicial
- Bootstrap de estructura y artefactos
- Publicar plantilla en GitHub como repo template y documentar proceso de clonación
EOF_CONTENT
  echo "Created PROYECTO.md"
fi

ensure_file "context/00_ARQUITECTURA_PROPUESTA.md" $'# Arquitectura Propuesta: Integra Evolucionada\n\nEsta propuesta presenta una arquitectura Integra Evolucionada, centrada en:\n\n- Simplicidad operativa y modularidad.\n- Estándares claros de entrega y trazabilidad.\n- Capas separadas para dominio, aplicación y plataforma.\n\nEstructura estándar sugerida:\n- context/: documentación de arquitectura y decisiones.\n- api/: endpoints, contratos y adaptadores.\n- scripts/: automatizaciones (bootstrap, tareas rutinarias).\n- meta/: plantillas de control y trazabilidad.\n- Checkpoints/: hitos y estados del proyecto.\n- propuestas/: espacio para alternativas y POCs.\n\nPrincipios:\n- Evolución incremental, cambios pequeños y seguros.\n- Observabilidad y checklist de calidad.\n- Política fast-path: crear/editar sin pedir confirmación; confirmar solo acciones destructivas.\n'

ensure_file "context/dossier_tecnico.md" $'# Dossier Técnico\n\n## Decisiones técnicas\n\n## Supuestos\n\n## Riesgos\n\n## Enlaces\n'
ensure_file "meta/plantilla_control.md" $'tarea:\ncambios:\nsupuestos:\nriesgos:\npróximos pasos:\n'

if [ ! -f "bootstrap.md" ]; then
  UTC_NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  cat > bootstrap.md <<EOF_BOOT
Fecha (UTC): ${UTC_NOW}
Cliente: ${CLIENT}
Proyecto: ${PROJECT}
EOF_BOOT
  echo "Created bootstrap.md"
fi

ensure_file "api/.gitkeep" ""
ensure_file "context/varios/.gitkeep" ""
ensure_file "propuestas/.gitkeep" ""

ensure_file ".continue/assistants/aria-arquitecta.json" $'{\n  "name": "Aria (Arquitecta)",\n  "defaultModel": "gpt-5",\n  "models": ["gpt-5", "gpt-4o"],\n  "provider": "OpenAI",\n  "apiKey": "${{ secrets.OPENAI_API_KEY }}",\n  "apiBase": "https://api.openai.com/v1",\n  "identity": "Arquitecta, Integra Evolucionada, español",\n  "rules": [\n    "Usar PROYECTO.md como fuente de verdad",\n    "Política fast-path: crear/editar sin pedir confirmación; confirmar solo acciones destructivas"\n  ],\n  "notes": "Si gpt-5 no existe en la API, usar gpt-4o como predeterminado."\n}\n'

ensure_file ".continue/assistants/ines-ejecutora.json" $'{\n  "name": "Inés (Ejecutora)",\n  "defaultModel": "gpt-4o",\n  "models": ["gpt-4o", "gpt-5"],\n  "provider": "OpenAI",\n  "apiKey": "${{ secrets.OPENAI_API_KEY }}",\n  "apiBase": "https://api.openai.com/v1",\n  "rules": [\n    "Modo ejecutor directo",\n    "Producir artefactos y checkpoints sin pedir confirmación"\n  ],\n  "notes": "Predeterminada gpt-4o; respaldo gpt-5 si está disponible."\n}\n'

ensure_file ".editorconfig" $'root = true\n\n[*]\ncharset = utf-8\nend_of_line = lf\ninsert_final_newline = true\nindent_style = space\nindent_size = 2\ntrim_trailing_whitespace = true\n\n[*.ps1]\nend_of_line = crlf\nindent_size = 2\n\n[*.md]\nmax_line_length = off\ntrim_trailing_whitespace = false\n'

ensure_file ".gitattributes" $'# Normalize line endings and enforce consistent diffs\n* text=auto\n\n# Scripts\n*.sh text eol=lf\n*.ps1 text eol=crlf\n\n# Markdown and docs\n*.md text eol=lf\n*.txt text eol=lf\n\n# JSON/YAML\n*.json text eol=lf\n*.yml  text eol=lf\n*.yaml text eol=lf\n\n# Images (binary)\n*.png binary\n*.jpg binary\n*.jpeg binary\n*.gif binary\n*.svg text eol=lf\n'

ensure_file "LICENSE" $'MIT License\n\nCopyright (c) 2025 Farienergy\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n'
