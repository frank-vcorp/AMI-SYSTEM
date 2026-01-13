# Verificación de DATABASE_URL en Vercel

**Status: ❌ NOT WORKING (2026-01-13 00:32 UTC)**

## Problema Reportado
- `/api/citas` retorna HTTP 500
- `/api/diagnostics` muestra `hasDatabase: false`
- `databaseUrl: "NOT SET"`

## Diagnóstico

### 1. Variable definida en Vercel ✅
```
Railway PostgreSQL URL: postgresql://postgres:BQPrZrCRNzGOYzkuhaAxECtHAtVSIIzA@hopper.proxy.rlwy.net:34060/railway
```
**Confirmado**: Usuario subió screenshot de Vercel Settings mostrando DATABASE_URL presente.

### 2. Variable en Vercel Environment ❌
```
Current Vercel Deploy Output:
  hasDatabase: false
  databaseUrl: "NOT SET"
  railway.status: "❌ Not configured"
```

## Causa Probable

Vercel está usando **CACHE de build anterior** que no tenía DATABASE_URL inyectado.

## Solución Agresiva

### Opción 1: Forzar Redeploy en Vercel Dashboard
1. Ir a: https://vercel.com/frank-saavedras-projects/web-app/deployments
2. Encontrar el deployment actual
3. Click en "..." → "Redeploy"
4. Esperar 3-5 minutos

### Opción 2: Commit que cambia archivo crítico (LOCAL)
```bash
# Hacer un cambio en un archivo que Vercel DEBE recompilar
cd /workspaces/AMI-SYSTEM
echo "// Force rebuild with DATABASE_URL - $(date)" >> packages/web-app/src/lib/prisma.ts
git add -A
git commit -m "Force Vercel redeploy with DATABASE_URL injection"
git push origin master
# Esperar 3-5 minutos
```

### Opción 3: Limpiar build cache en Vercel
1. Vercel Dashboard → Project Settings
2. "Git" → Toggle OFF "Skip queuing deployment builds for unchanged files"
3. Push nuevo commit

## Validación

Una vez DATABASE_URL esté inyectado:

```bash
# Test 1: API Diagnostics
curl https://web-app-ecru-seven.vercel.app/api/diagnostics

# Esperado:
# {
#   "hasDatabase": true,
#   "databaseUrl": "postgresql://...",
#   "railway": { "status": "✅ Connected" },
#   "prisma": { "status": "✅ OK", "clinicCount": 0 }
# }

# Test 2: API Citas
curl https://web-app-ecru-seven.vercel.app/api/citas?tenantId=default-tenant&pageSize=10

# Esperado:
# {
#   "total": 0,
#   "page": 1,
#   "pageSize": 10,
#   "data": [],
#   "hasMore": false
# }
```

## Railway Verificación (Independiente)

```bash
# Conectar directamente a Railway PostgreSQL
psql -h hopper.proxy.rlwy.net -p 34060 -U postgres -d railway -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='public';"

# Esperado:
# table_count
# -----------
#         10
```

## Timeline

| Tiempo | Evento |
|--------|--------|
| 00:15 UTC | User reports 500 error on /api/citas |
| 00:16 UTC | Created /api/diagnostics endpoint |
| 00:20 UTC | Confirmed DATABASE_URL in Vercel Settings (user screenshot) |
| 00:25 UTC | Fixed manifest.json JSON syntax error |
| 00:30 UTC | DATABASE_URL STILL NOT INJECTED in Vercel |
| **00:32 UTC** | **Initiating aggressive redeploy** |

## Próximos Pasos

1. **AHORA**: Commit + push para trigger Vercel rebuild
2. **+3 min**: Vercel should detect new push and rebuild
3. **+5 min**: New deployment should have DATABASE_URL injected
4. **+6 min**: Test `/api/diagnostics` to confirm connection
5. **+7 min**: If still failing, use Vercel Dashboard manual redeploy
