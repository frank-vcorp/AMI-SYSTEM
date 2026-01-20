#!/bin/bash
# VERCEL-BUILD-SAFETY-CHECK.sh
# Script para diagnosticar problemas de build en Vercel
# Uso: bash VERCEL-BUILD-SAFETY-CHECK.sh

echo "🔍 VERCEL BUILD SAFETY CHECK"
echo "======================================"
echo ""

echo "1️⃣  Verificar vercel.json..."
if [ -f "vercel.json" ]; then
    echo "✅ vercel.json existe"
    cat vercel.json | jq . 2>/dev/null && echo "✅ JSON válido" || echo "❌ JSON inválido"
else
    echo "❌ vercel.json NO EXISTE"
fi
echo ""

echo "2️⃣  Verificar pnpm-lock.yaml..."
if [ -f "pnpm-lock.yaml" ]; then
    echo "✅ pnpm-lock.yaml existe"
    wc -l pnpm-lock.yaml
else
    echo "❌ pnpm-lock.yaml NO EXISTE"
fi
echo ""

echo "3️⃣  Verificar pnpm-workspace.yaml..."
if [ -f "pnpm-workspace.yaml" ]; then
    echo "✅ pnpm-workspace.yaml existe"
    cat pnpm-workspace.yaml
else
    echo "❌ pnpm-workspace.yaml NO EXISTE"
fi
echo ""

echo "4️⃣  Verificar packageManager en root package.json..."
cat package.json | jq '.packageManager' 2>/dev/null || echo "❌ No encontrado"
echo ""

echo "5️⃣  Verificar transpilePackages en next.config.js..."
cat packages/web-app/next.config.js | grep -A 15 "transpilePackages"
echo ""

echo "6️⃣  Ejecutar build local..."
npm run build > /tmp/build.log 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Build LOCAL PASSOU"
    echo ""
    echo "   Build output (últimas 30 líneas):"
    tail -30 /tmp/build.log
else
    echo "❌ Build LOCAL FALLÓ"
    echo ""
    echo "   Errores encontrados:"
    grep -i "error\|failed" /tmp/build.log | head -20
fi
echo ""
echo "======================================"
echo "🎯 Si el build local pasa pero Vercel falla:"
echo "   1. Revisar logs de Vercel en dashboard.vercel.com"
echo "   2. Buscar errores específicos (module not found, type errors, etc.)"
echo "   3. Verificar variables de entorno en Vercel Settings"
echo "   4. Intentar: git push --force-with-lease para forzar rebuild"
