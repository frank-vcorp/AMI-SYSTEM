#!/usr/bin/env bash
set -euo pipefail

# Ingesta/Conversión de documentos a texto/markdown para facilitar el contexto al asistente.
# Uso:
#   ./scripts/ingest-docs.sh [OUTPUT_DIR] <archivo1> <archivo2> ...
# Ejemplos:
#   ./scripts/ingest-docs.sh docs_ingested assets/spec.pdf assets/requisitos.docx data/tablas.xlsx
#   ./scripts/ingest-docs.sh assets/*.pdf

if [ $# -lt 1 ]; then
  echo "Uso: $0 [OUTPUT_DIR] <archivo1> <archivo2> ..." >&2
  exit 1
fi

OUTPUT_DIR="docs_ingested"
ARGS=()

# Si el primer argumento es un directorio destino
if [ $# -ge 2 ] && [ ! -e "$1" ] && [[ "$1" != *.* ]]; then
  OUTPUT_DIR="$1"
  shift
fi

mkdir -p "$OUTPUT_DIR"

convert_pdf() {
  local src="$1"; local base="$2"; local out="$OUTPUT_DIR/${base}.txt"
  if command -v pdftotext >/dev/null 2>&1; then
    pdftotext -layout "$src" "$out"
  elif command -v pandoc >/dev/null 2>&1; then
    pandoc -s "$src" -t plain -o "$out" || {
      echo "ADVERTENCIA: pandoc no pudo convertir $src" >&2; return 1;
    }
  else
    echo "ADVERTENCIA: instala 'pdftotext' (poppler-utils) o 'pandoc' para convertir PDF: $src" >&2
    return 1
  fi
  echo "PDF -> $out"
}

convert_docx() {
  local src="$1"; local base="$2"; local out="$OUTPUT_DIR/${base}.md"
  if command -v pandoc >/dev/null 2>&1; then
    pandoc -s "$src" -t gfm -o "$out"
    echo "DOCX -> $out"
  else
    echo "ADVERTENCIA: instala 'pandoc' para convertir DOCX: $src" >&2
    return 1
  fi
}

convert_xlsx() {
  local src="$1"; local base="$2"; local out="$OUTPUT_DIR/${base}.csv"
  if command -v xlsx2csv >/dev/null 2>&1; then
    xlsx2csv "$src" > "$out"
    echo "XLSX -> $out"
  elif command -v libreoffice >/dev/null 2>&1; then
    # LibreOffice exporta cada hoja a un CSV separado; como fallback generamos uno por defecto
    tmpdir=$(mktemp -d)
    libreoffice --headless --convert-to csv --outdir "$tmpdir" "$src" >/dev/null 2>&1 || {
      echo "ADVERTENCIA: LibreOffice no pudo convertir $src" >&2; rm -rf "$tmpdir"; return 1;
    }
    # Si hay múltiples CSV, concatenamos con cabeceras separadas
    if ls "$tmpdir"/*.csv >/dev/null 2>&1; then
      first=true
      for f in "$tmpdir"/*.csv; do
        if [ "$first" = true ]; then
          cat "$f" > "$out"
          first=false
        else
          printf '\n' >> "$out"
          cat "$f" >> "$out"
        fi
      done
      echo "XLSX -> $out"
    else
      echo "ADVERTENCIA: no se generaron CSVs desde $src" >&2
      rm -rf "$tmpdir"; return 1
    fi
    rm -rf "$tmpdir"
  else
    echo "ADVERTENCIA: instala 'xlsx2csv' (pip install xlsx2csv) o 'LibreOffice' para convertir XLSX: $src" >&2
    return 1
  fi
}

convert_generic() {
  local src="$1"; local base="$2"; local out="$OUTPUT_DIR/${base}.md"
  if command -v pandoc >/dev/null 2>&1; then
    pandoc -s "$src" -t gfm -o "$out" && { echo "GEN -> $out"; return 0; }
  fi
  echo "ADVERTENCIA: no hay conversor para $src" >&2
  return 1
}

status=0
for src in "$@"; do
  if [ ! -e "$src" ]; then echo "ADVERTENCIA: no existe $src" >&2; status=1; continue; fi
  fname=$(basename -- "$src")
  base="${fname%.*}"
  ext="${fname##*.}"
  shopt -s nocasematch || true
  case "$ext" in
    pdf) convert_pdf "$src" "$base" || status=1 ;;
    docx) convert_docx "$src" "$base" || status=1 ;;
    xlsx|xls) convert_xlsx "$src" "$base" || status=1 ;;
    md|txt) cp "$src" "$OUTPUT_DIR/" && echo "COPIADO -> $OUTPUT_DIR/$fname" ;;
    *) convert_generic "$src" "$base" || status=1 ;;
  esac
  shopt -u nocasematch || true
done

exit $status
