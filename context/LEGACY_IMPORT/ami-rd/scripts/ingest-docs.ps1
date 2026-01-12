Param(
  [string]$OutputDir = "docs_ingested",
  [Parameter(Mandatory=$true, Position=1, ValueFromRemainingArguments=$true)]
  [string[]]$Files
)

$ErrorActionPreference = 'Stop'

function Ensure-Dir($Path) {
  if (-not (Test-Path $Path)) { New-Item -ItemType Directory -Force -Path $Path | Out-Null }
}

function Convert-Pdf($Src, $Base) {
  $Out = Join-Path $OutputDir ($Base + ".txt")
  if (Get-Command pdftotext -ErrorAction SilentlyContinue) {
    pdftotext -layout $Src $Out
  } elseif (Get-Command pandoc -ErrorAction SilentlyContinue) {
    pandoc -s $Src -t plain -o $Out
  } else {
    Write-Warning "Instala 'pdftotext' (poppler) o 'pandoc' para convertir PDF: $Src"
    return $false
  }
  Write-Host "PDF -> $Out"
  return $true
}

function Convert-Docx($Src, $Base) {
  $Out = Join-Path $OutputDir ($Base + ".md")
  if (Get-Command pandoc -ErrorAction SilentlyContinue) {
    pandoc -s $Src -t gfm -o $Out
    Write-Host "DOCX -> $Out"
    return $true
  } else {
    Write-Warning "Instala 'pandoc' para convertir DOCX: $Src"
    return $false
  }
}

function Convert-Xlsx($Src, $Base) {
  $Out = Join-Path $OutputDir ($Base + ".csv")
  if (Get-Command xlsx2csv -ErrorAction SilentlyContinue) {
    xlsx2csv $Src > $Out
    Write-Host "XLSX -> $Out"
    return $true
  } elseif (Get-Command soffice -ErrorAction SilentlyContinue) {
    $tmp = New-Item -ItemType Directory -Force -Path (Join-Path ([System.IO.Path]::GetTempPath()) ([System.IO.Path]::GetRandomFileName()))
    soffice --headless --convert-to csv --outdir $tmp $Src | Out-Null
    $csvs = Get-ChildItem -Path $tmp -Filter *.csv -ErrorAction SilentlyContinue
    if ($csvs) {
      $first = $true
      foreach ($f in $csvs) {
        if ($first) { Get-Content $f.FullName | Set-Content -Encoding UTF8 $Out; $first = $false }
        else { Add-Content -Encoding UTF8 -Value "" -Path $Out; Get-Content $f.FullName | Add-Content -Encoding UTF8 -Path $Out }
      }
      Write-Host "XLSX -> $Out"
      Remove-Item -Recurse -Force $tmp
      return $true
    } else {
      Write-Warning "LibreOffice no generó CSVs desde $Src"
      Remove-Item -Recurse -Force $tmp
      return $false
    }
  } else {
    Write-Warning "Instala 'xlsx2csv' (pip) o LibreOffice para convertir XLSX: $Src"
    return $false
  }
}

function Convert-Generic($Src, $Base) {
  $Out = Join-Path $OutputDir ($Base + ".md")
  if (Get-Command pandoc -ErrorAction SilentlyContinue) {
    pandoc -s $Src -t gfm -o $Out
    Write-Host "GEN -> $Out"
    return $true
  }
  Write-Warning "No hay conversor para $Src"
  return $false
}

Ensure-Dir $OutputDir

$Status = $true
foreach ($src in $Files) {
  if (-not (Test-Path $src)) { Write-Warning "No existe $src"; $Status = $false; continue }
  $fname = [System.IO.Path]::GetFileName($src)
  $base = [System.IO.Path]::GetFileNameWithoutExtension($src)
  $ext = ([System.IO.Path]::GetExtension($src)).TrimStart('.').ToLowerInvariant()
  switch ($ext) {
    'pdf' { if (-not (Convert-Pdf $src $base)) { $Status = $false } }
    'docx' { if (-not (Convert-Docx $src $base)) { $Status = $false } }
    'xlsx' { if (-not (Convert-Xlsx $src $base)) { $Status = $false } }
    'xls'  { if (-not (Convert-Xlsx $src $base)) { $Status = $false } }
    'md'   { Copy-Item $src (Join-Path $OutputDir $fname); Write-Host "COPIADO -> $(Join-Path $OutputDir $fname)" }
    'txt'  { Copy-Item $src (Join-Path $OutputDir $fname); Write-Host "COPIADO -> $(Join-Path $OutputDir $fname)" }
    Default { if (-not (Convert-Generic $src $base)) { $Status = $false } }
  }
}

if (-not $Status) { exit 1 }