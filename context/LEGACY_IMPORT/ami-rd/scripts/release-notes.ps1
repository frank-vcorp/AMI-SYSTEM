Param(
  [string]$From = "",
  [string]$To = "HEAD"
)

$ErrorActionPreference = 'Stop'

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "git no está disponible en el PATH"
}

# Si no se especifica $From, intenta usar el último tag
if (-not $From) {
  try {
    $From = (git describe --tags --abbrev=0 2>$null)
  } catch {
    $From = ""
  }
}

Write-Host "Generando notas de la release desde: '$From' hasta: '$To'" -ForegroundColor Cyan

$range = if ($From) { "$From..$To" } else { $To }

$log = git log $range --pretty=format:"- %s (%h)" --no-merges

"# Notas de Release" + [Environment]::NewLine + $log | Out-File -Encoding UTF8 -FilePath "RELEASE_NOTES.md"

Write-Host "Notas generadas en RELEASE_NOTES.md" -ForegroundColor Green