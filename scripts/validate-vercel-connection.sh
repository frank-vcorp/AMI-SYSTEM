#!/bin/bash

# Script para validar la conexión de Vercel a Railway PostgreSQL
# Uso: ./scripts/validate-vercel-connection.sh

VERCEL_URL="https://web-app-ecru-seven.vercel.app"

echo "🔍 Validando conexión Vercel → Railway PostgreSQL"
echo "═════════════════════════════════════════════════"
echo ""

# 1. Endpoint de diagnostics
echo "1️⃣  Verificando /api/diagnostics..."
echo "GET $VERCEL_URL/api/diagnostics"
echo ""

DIAG_RESPONSE=$(curl -s "$VERCEL_URL/api/diagnostics" 2>&1)
echo "Respuesta:"
echo "$DIAG_RESPONSE" | jq '.' 2>/dev/null || echo "$DIAG_RESPONSE"
echo ""

# Verificar si DATABASE_URL está set
if echo "$DIAG_RESPONSE" | grep -q "Connected"; then
    echo "✅ DATABASE_URL está configurado en Vercel"
else
    echo "❌ DATABASE_URL AÚN NO ESTÁ CONFIGURADO"
fi
echo ""

# 2. Endpoint /api/citas (debe retornar datos o array vacío, no 500)
echo "2️⃣  Verificando /api/citas..."
echo "GET $VERCEL_URL/api/citas?tenantId=default-tenant&pageSize=10"
echo ""

CITAS_RESPONSE=$(curl -s "$VERCEL_URL/api/citas?tenantId=default-tenant&pageSize=10" 2>&1)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$VERCEL_URL/api/citas?tenantId=default-tenant&pageSize=10")

echo "HTTP Status: $HTTP_CODE"
echo "Respuesta:"
echo "$CITAS_RESPONSE" | jq '.' 2>/dev/null || echo "$CITAS_RESPONSE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ API /api/citas respondiendo correctamente (HTTP 200)"
else
    echo "❌ API /api/citas retornó HTTP $HTTP_CODE (esperado: 200)"
fi
echo ""

# 3. Resumen final
echo "═════════════════════════════════════════════════"
echo "RESUMEN:"
if [ "$HTTP_CODE" = "200" ] && echo "$DIAG_RESPONSE" | grep -q "Connected"; then
    echo "✅ SISTEMA OPERATIVO - Vercel ↔️ Railway conectado correctamente"
else
    echo "⚠️  REVISAR - Algunos servicios aún no están operacionales"
    echo ""
    echo "Próximos pasos:"
    echo "1. Esperar a que Vercel complete el build (2-3 minutos)"
    echo "2. Refrescar browser: $VERCEL_URL"
    echo "3. Ejecutar nuevamente este script"
fi
echo ""
