Param(
  [string]$Client = "AMI",
  [string]$Project = "RD-Residente-Digital",
  [string]$Origin = "",
  [switch]$Push
)

$ErrorActionPreference = 'Stop'

# Helpers
function Write-File($Path, $Content) {
  $dir = Split-Path -Parent $Path
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

# Timestamps (UTC)
$nowUtc = (Get-Date).ToUniversalTime()
$utcIso = $nowUtc.ToString('yyyy-MM-ddTHH:mm:ssZ')
$datestamp = $nowUtc.ToString('yyyy-MM-dd_HHmm')

# Ensure directories
$dirs = @('context','context/varios','propuestas','Checkpoints','meta','scripts','api','.continue/assistants')
foreach ($d in $dirs) { New-Item -ItemType Directory -Force -Path $d | Out-Null }

# .gitignore
Write-File -Path '.gitignore' -Content @"
.env
node_modules/
dist/
.DS_Store
.vscode/
.idea/
"@

# .env.example
Write-File -Path '.env.example' -Content @"
OPENAI_API_KEY=
ENV=dev
CLIENT=$Client
PROJECT=$Project
"@

# PROYECTO.md
Write-File -Path 'PROYECTO.md' -Content @"
# PROYECTO: $Project (Cliente: $Client)

## Flujo de estados
- [ ] Pendiente
- [ ] En Progreso
- [ ] Hecho
- [ ] Aprobado

## Backlog inicial
- Bootstrap de estructura y artefactos
"@

# context files
Write-File -Path 'context/00_ARQUITECTURA_PROPUESTA.md' -Content @"
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
"@

Write-File -Path 'context/dossier_tecnico.md' -Content @"
# Dossier Técnico

## Decisiones técnicas

## Supuestos

## Riesgos

## Enlaces
"@

# meta
Write-File -Path 'meta/plantilla_control.md' -Content @"
tarea:
cambios:
supuestos:
riesgos:
próximos pasos:
"@

# bootstrap.md
Write-File -Path 'bootstrap.md' -Content @"
Fecha (UTC): $utcIso
Cliente: $Client
Proyecto: $Project
"@

# Continue assistants
Write-File -Path '.continue/assistants/aria-arquitecta.json' -Content @"
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
"@

Write-File -Path '.continue/assistants/ines-ejecutora.json' -Content @"
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
"@

# .gitkeep for empty dirs
Write-File -Path 'api/.gitkeep' -Content ''
Write-File -Path 'context/varios/.gitkeep' -Content ''
Write-File -Path 'propuestas/.gitkeep' -Content ''

# Initialize git if needed
$gitExists = (Get-Command git -ErrorAction SilentlyContinue) -ne $null
if ($gitExists) {
  if (-not (Test-Path '.git')) {
    git init -b main 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) { git init | Out-Null }
  }
  git add . | Out-Null
  git commit -m "feat: bootstrap inicial $Client/$Project" 2>$null | Out-Null
  # Ensure main branch name
  try { $current = (& git rev-parse --abbrev-ref HEAD 2>$null).Trim() } catch { $current = "" }
  if ($current -ne "main" -and $current) { git branch -M main | Out-Null }

  # Configure/Update remote if provided
  if ($Origin) {
    $existingOrigin = ""
    try { $existingOrigin = (git remote get-url origin 2>$null) } catch { $existingOrigin = "" }
    if ($existingOrigin) {
      if ($existingOrigin -ne $Origin) {
        git remote set-url origin $Origin | Out-Null
        Write-Output "Git remote 'origin' actualizado: $Origin"
      } else {
        Write-Output "Git remote 'origin' ya apunta a: $Origin"
      }
    } else {
      git remote add origin $Origin | Out-Null
      Write-Output "Git remote 'origin' configurado: $Origin"
    }
  }

  # Push if requested or origin provided
  if ($Push -or $Origin) {
    try {
      git push -u origin main 2>$null | Out-Null
      Write-Output "Cambios empujados a 'origin/main'."
    } catch {
      Write-Warning "No se pudo hacer push a 'origin/main'. Verifica permisos/URL."
    }
  }
}

# Create checkpoint
$chkPath = "Checkpoints/CHK_${datestamp}.md"
Write-File -Path $chkPath -Content @"
# Checkpoint $datestamp

Bootstrap ejecutado.

- Cliente: $Client
- Proyecto: $Project
- Fecha UTC: $utcIso
- Artefactos: estructura creada/actualizada
"@

Write-Output "Bootstrap completado. Checkpoint: $chkPath"