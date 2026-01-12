#!/bin/bash

# 🚀 BUILD MAX PERFORMANCE - Con guardrails anti-cuelgue
# Uso: ./scripts/build-max.sh
# 
# Características:
# - Máxima potencia (6GB RAM, 3 CPUs)
# - Deja CPU y RAM libres para el servidor
# - Monitoreo activo para detectar problemas
# - Se detiene si detecta saturación

set -e

BUILD_PID=""
MONITOR_PID=""

# Función de limpieza
cleanup() {
    if [ ! -z "$BUILD_PID" ]; then
        echo "🛑 Deteniendo build..."
        kill $BUILD_PID 2>/dev/null || true
    fi
    if [ ! -z "$MONITOR_PID" ]; then
        kill $MONITOR_PID 2>/dev/null || true
    fi
    echo "✅ Limpieza completada"
}

# Trap para ctrl+c
trap cleanup SIGINT SIGTERM

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        🚀 BUILD MAX PERFORMANCE (Seguro)                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 1. Mostrar estado actual
echo "📊 Estado del servidor:"
free -h | head -2
echo "CPUs: $(nproc)"
echo ""

# 2. Aumentar límites de archivo
echo "⚙️  Configurando límites..."
ulimit -n 8192

# 3. Limpiar cachés para liberar memoria
echo "🧹 Limpiando cachés..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf .next 2>/dev/null || true
rm -rf dist 2>/dev/null || true
pnpm store prune 2>/dev/null || true

# 4. Configurar Node.js para máximo rendimiento
# 6GB para Node (deja 1.7GB para sistema)
export NODE_OPTIONS="--max-old-space-size=6144"

echo ""
echo "🔧 Configuración:"
echo "  • Node Memory: 6GB"
echo "  • CPUs: 3 (deja 1 libre)"
echo "  • RAM Sistema: ~1.7GB libre"
echo ""

# 5. Función de monitoreo
monitor_resources() {
    while true; do
        MEM_USED=$(free | awk 'NR==2 {print int($3/$2 * 100)}')
        
        # Si usa más del 90% de RAM, cancelar build
        if [ $MEM_USED -gt 90 ]; then
            echo ""
            echo "⚠️  ALERTA: Memoria en 90%+ ($MEM_USED%)"
            echo "🛑 Deteniendo build para evitar cuelgue..."
            kill $BUILD_PID 2>/dev/null || true
            exit 1
        fi
        
        sleep 2
    done
}

# 6. Iniciar monitoreo en background
monitor_resources &
MONITOR_PID=$!

# 7. Ejecutar build con máximo rendimiento
echo "🚀 Iniciando compilación..."
echo "=================================================="
echo ""

if [ -f "turbo.json" ]; then
    export TURBO_NUM_CPUS=3
    pnpm turbo build --concurrency=3 2>&1 &
else
    pnpm --recursive build 2>&1 &
fi

BUILD_PID=$!

# Esperar a que termine el build
wait $BUILD_PID
BUILD_EXIT=$?

# Detener monitoreo
kill $MONITOR_PID 2>/dev/null || true

echo ""
echo "=================================================="
if [ $BUILD_EXIT -eq 0 ]; then
    echo "✅ BUILD EXITOSO"
else
    echo "❌ BUILD FALLÓ (Código: $BUILD_EXIT)"
fi
echo ""
echo "📊 Recursos finales:"
free -h | head -2
echo ""
