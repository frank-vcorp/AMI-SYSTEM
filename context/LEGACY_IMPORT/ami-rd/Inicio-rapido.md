# Inicio rápido — Plantilla {{CLIENT}} / {{PROJECT}}

Guía paso a paso para iniciar un proyecto nuevo a partir de esta plantilla.

## Requisitos
- VS Code (recomendado con WSL si usas Windows)
- Extensión Continue para VS Code (OPENAI_API_KEY ya configurado en Continue Hub)
- Git instalado
- Opcional (para ingesta de documentos): pdftotext/pandoc/xlsx2csv o LibreOffice

## 1) Clonar y abrir el proyecto
- En VS Code: “Use this template” en GitHub para crear tu repo; clónalo y abre la carpeta.
- Si usas WSL: abre la carpeta desde la terminal WSL con `code .` y confía en el workspace cuando se te solicite.

## 2) Bootstrap (parametrizar y publicar)
- Bash (WSL/macOS/Linux/Git Bash):
```
./scripts/bootstrap.sh {{CLIENT}} {{PROJECT}} --origin https://github.com/ORG/{{PROJECT}}.git --push
```
- PowerShell (Windows):
```
powershell -ExecutionPolicy Bypass -File ./scripts/bootstrap.ps1 -Client "{{CLIENT}}" -Project "{{PROJECT}}" -Origin "https://github.com/ORG/{{PROJECT}}.git" -Push
```
Qué hace:
- Asegura estructura, genera/actualiza artefactos base
- Inicializa git (si falta), asegura rama main y hace el push inicial
- Crea un checkpoint en Checkpoints/

Verificación (opcional):
```
git remote -v ; git log -1 --oneline ; git status
```

## 3) Aria (Arquitecta): propuesta de arquitectura
- Abre y copia el prompt: `meta/prompts/aria_kickoff.txt`
- En Continue selecciona Aria, pega el prompt, sustituye `{{CLIENT}}` y `{{PROJECT}}`, y envía.
- Si tienes fuentes externas (PDF/DOCX/XLSX), conviértelas antes y adjunta los convertidos:
```
# Bash
./scripts/ingest-docs.sh docs_ingested ruta/*.pdf ruta/*.docx ruta/*.xlsx
# PowerShell
./scripts/ingest-docs.ps1 -OutputDir docs_ingested ruta/*.pdf ruta/*.docx ruta/*.xlsx
```

Base tecnológica preferida (no excluyente):
- Web: Next.js + TypeScript + Tailwind CSS + shadcn/ui (Radix UI) + Framer Motion
- Mobile: Expo (React Native) + NativeWind
- Plataforma: considerar GCP/Firebase cuando aporte velocidad, manteniendo independencia con adaptadores

## 4) Inés (Ejecutora): construcción del primer incremento
- Abre y copia el prompt: `meta/prompts/ines_kickoff.txt`
- En Continue, selecciona Inés, pega el prompt y ejecuta el scaffolding/entregables definidos por Aria.
- Asegura lint/format, README de ejecución local, .env.example, layout accesible, estados de carga y manejo de errores.

## 5) Criterios de calidad (aplicar desde el inicio)
- Revisa y usa la checklist end-to-end: `meta/criterios_calidad.md`
- Úsala en PRs y previo a releases.

## One-liners útiles
- Bootstrap + push:
```
./scripts/bootstrap.sh {{CLIENT}} {{PROJECT}} --origin https://github.com/ORG/{{PROJECT}}.git --push
```
- Ver estado git:
```
git remote -v ; git log -1 --oneline ; git status
```
- Notas de release (opcional):
```
./scripts/release-notes.sh
```

## Notas y troubleshooting
- Aria no lee todo por defecto: adjunta o indica exactamente qué archivos usar.
- Si ves error de fin de línea en scripts .sh, normaliza:
```
dos2unix scripts/*.sh
```
- Modelos: Aria usa `gpt-5` (respaldo `gpt-4o`); Inés usa `gpt-4o` (respaldo `gpt-5`).
- OPENAI_API_KEY debe estar en Continue Hub (ya considerado en esta plantilla).
- La plantilla está “limpia”: sin checkpoints previos ni artefactos de sesión.
