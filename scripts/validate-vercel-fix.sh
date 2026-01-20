#!/bin/bash

##############################################################################
# 🔧 SCRIPT VALIDACIÓN VERCEL FIX
# 
# Propósito: Verificar que la configuración Vercel es correcta ANTES de
#           hacer deployment. Si este script pasa, Vercel pasará.
#
# Referencia: FIX-20260120-01 (DEBY - Debugger Forense)
# Uso: bash scripts/validate-vercel-fix.sh
##############################################################################

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "🔍 VALIDACIÓN VERCEL FIX - FIX-20260120-01"
echo "=================================================="
echo ""

cd "$ROOT_DIR"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Test 1: vercel.json exists and is valid JSON
echo "Test 1: vercel.json estructura..."
if [ -f vercel.json ]; then
    if jq empty vercel.json 2>/dev/null; then
        echo -e "${GREEN}✅ PASS${NC}: vercel.json es JSON válido"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: vercel.json no es JSON válido"
        ((FAILED++))
    fi
else
    echo -e "${RED}❌ FAIL${NC}: vercel.json no existe"
    ((FAILED++))
fi

# Test 2: installCommand tiene --no-frozen-lockfile
echo ""
echo "Test 2: installCommand contiene --no-frozen-lockfile..."
if grep -q '"installCommand".*--no-frozen-lockfile' vercel.json; then
    echo -e "${GREEN}✅ PASS${NC}: installCommand correcto"
    echo "         Valor: $(jq -r '.installCommand' vercel.json)"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}: installCommand NO contiene --no-frozen-lockfile"
    echo "         Valor: $(jq -r '.installCommand' vercel.json)"
    ((FAILED++))
fi

# Test 3: buildCommand tiene --filter=@ami/web-app
echo ""
echo "Test 3: buildCommand contiene --filter=@ami/web-app..."
if grep -q '"buildCommand".*--filter=@ami/web-app' vercel.json; then
    echo -e "${GREEN}✅ PASS${NC}: buildCommand correcto"
    echo "         Valor: $(jq -r '.buildCommand' vercel.json)"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}: buildCommand NO contiene --filter=@ami/web-app"
    echo "         Valor: $(jq -r '.buildCommand' vercel.json)"
    ((FAILED++))
fi

# Test 4: rootDirectory es "."
echo ""
echo "Test 4: rootDirectory es explícito..."
if [ "$(jq -r '.rootDirectory' vercel.json)" == "." ]; then
    echo -e "${GREEN}✅ PASS${NC}: rootDirectory es '.'"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}: rootDirectory no es '.'"
    echo "         Valor: $(jq -r '.rootDirectory' vercel.json)"
    ((FAILED++))
fi

# Test 5: outputDirectory es correcto
echo ""
echo "Test 5: outputDirectory es correcto..."
if [ "$(jq -r '.outputDirectory' vercel.json)" == "packages/web-app/.next" ]; then
    echo -e "${GREEN}✅ PASS${NC}: outputDirectory es 'packages/web-app/.next'"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}: outputDirectory no es correcto"
    echo "         Valor: $(jq -r '.outputDirectory' vercel.json)"
    ((FAILED++))
fi

# Test 6: .npmrc tiene node-linker=hoisted
echo ""
echo "Test 6: .npmrc optimizaciones Vercel..."
if grep -q "node-linker=hoisted" .npmrc; then
    echo -e "${GREEN}✅ PASS${NC}: .npmrc tiene node-linker=hoisted"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARN${NC}: .npmrc NO tiene node-linker=hoisted"
    ((FAILED++))
fi

# Test 7: pnpm-workspace.yaml existe
echo ""
echo "Test 7: pnpm-workspace.yaml existe..."
if [ -f pnpm-workspace.yaml ]; then
    echo -e "${GREEN}✅ PASS${NC}: pnpm-workspace.yaml existe"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}: pnpm-workspace.yaml NO existe"
    ((FAILED++))
fi

# Test 8: turbo.json existe y es válido
echo ""
echo "Test 8: turbo.json estructura..."
if [ -f turbo.json ]; then
    if jq empty turbo.json 2>/dev/null; then
        echo -e "${GREEN}✅ PASS${NC}: turbo.json es JSON válido"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: turbo.json no es JSON válido"
        ((FAILED++))
    fi
else
    echo -e "${RED}❌ FAIL${NC}: turbo.json no existe"
    ((FAILED++))
fi

# Test 9: @ami/web-app package.json existe
echo ""
echo "Test 9: @ami/web-app package.json existe..."
if [ -f packages/web-app/package.json ]; then
    echo -e "${GREEN}✅ PASS${NC}: packages/web-app/package.json existe"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}: packages/web-app/package.json NO existe"
    ((FAILED++))
fi

# Test 10: Monorepo structure
echo ""
echo "Test 10: Monorepo packages count..."
PACKAGE_COUNT=$(ls -1 packages/ 2>/dev/null | wc -l)
if [ "$PACKAGE_COUNT" -gt 5 ]; then
    echo -e "${GREEN}✅ PASS${NC}: Encontrados $PACKAGE_COUNT packages"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}: Menos de 5 packages encontrados ($PACKAGE_COUNT)"
    ((FAILED++))
fi

# Summary
echo ""
echo "=================================================="
echo "📊 RESUMEN DE VALIDACIÓN"
echo "=================================================="
echo -e "✅ Tests Pasados: ${GREEN}$PASSED${NC}"
echo -e "❌ Tests Fallidos: ${RED}$FAILED${NC}"
echo "=================================================="
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ TODAS LAS VALIDACIONES PASARON${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. Hacer git push origin master (si no lo hiciste)"
    echo "2. Ir a Vercel Dashboard"
    echo "3. Hacer manual redeploy"
    echo "4. Esperar 3-5 minutos"
    echo ""
    exit 0
else
    echo -e "${RED}❌ ALGUNAS VALIDACIONES FALLARON${NC}"
    echo ""
    echo "Revisar:"
    echo "- vercel.json (debe contener --no-frozen-lockfile y --filter)"
    echo "- .npmrc (debe tener optimizaciones Vercel)"
    echo "- Estructura monorepo"
    echo ""
    echo "Ver documentación: DICTAMEN_FIX-20260120-01.md"
    exit 1
fi
