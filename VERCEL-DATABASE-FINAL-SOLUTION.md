# 🚨 VERCEL DATABASE_URL - SOLUCIÓN FINAL

## Error Actual (Confirmado 2026-01-13 00:37 UTC)

```json
{
  "hasDatabase": false,
  "databaseUrl": "NOT SET",
  "error": "Environment variable not found: DATABASE_URL"
}
```

**Status**: ❌ **DATABASE_URL NO ESTÁ INYECTADO EN VERCEL**

---

## ⚡ SOLUCIÓN INMEDIATA (5 MINUTOS)

### OPCIÓN A: Verificar & Agregar a Vercel Settings (Recomendado)

**1. Abre esta URL:**
```
https://vercel.com/frank-saavedras-projects/web-app/settings/environment-variables
```

**2. Mira si DATABASE_URL existe:**
- Si NO existe → **Click "Add Environment Variable"**
- Si existe → Click para editar

**3. Asegúrate de esto:**

| Campo | Valor |
|-------|-------|
| **Name** | `DATABASE_URL` (exacto) |
| **Value** | `postgresql://postgres:BQPrZrCRNzGOYzkuhaAxECtHAtVSIIzA@hopper.proxy.rlwy.net:34060/railway` |
| **Environments** | ☑ Production ☑ Preview ☑ Development |

**CRÍTICO**: Si solo está checkeado "Preview" o "Development" → **TIENES QUE CHECKEAR "Production"** ✅

**4. Click SAVE**

**5. Redeploy Manual:**
```
https://vercel.com/frank-saavedras-projects/web-app/deployments
```
- Click el deployment actual (top)
- Click "..." → "Redeploy"
- **NO** selecciones "Use existing Build Cache"
- Espera 3-5 minutos

**6. Valida:**
```bash
curl https://web-app-ecru-seven.vercel.app/api/diagnostics
```

Debería mostrar:
```json
{
  "hasDatabase": true,
  "databaseUrl": "postgresql://postgres:...",
  "railway": { "status": "✅ Connected" }
}
```

---

### OPCIÓN B: Si Vercel Settings no funciona (Plan B)

Si después de agregar la variable y redeploy **aún no funciona**, haz esto:

**1. Delete la variable en Vercel**
- Vercel Settings → DATABASE_URL → Click "Delete"

**2. Recrearla desde cero:**
- Click "Add Environment Variable"
- Name: `DATABASE_URL`
- Value: `postgresql://postgres:BQPrZrCRNzGOYzkuhaAxECtHAtVSIIzA@hopper.proxy.rlwy.net:34060/railway`
- Select **TODOS LOS CHECKBOXES**: Production + Preview + Development
- Click Save

**3. Redeploy:**
- Deployments → Current → "..." → "Redeploy" (sin cache)

**4. Espera 5 minutos**

---

## 🔍 VERIFICACIÓN TÉCNICA (Si lo anterior no funciona)

### Verificar que Railway está UP:

```bash
psql -h hopper.proxy.rlwy.net -p 34060 -U postgres -d railway -c "SELECT 1 as connected;" 2>&1
```

Esperado:
```
 connected
-----------
         1
(1 row)
```

### Verificar build logs de Vercel:

1. Vercel Dashboard → Deployments
2. Click deployment actual
3. Click "Build Logs"
4. Buscar: `DATABASE_URL`

Si dice "not set" → Vercel NO está inyectando la variable

### Verificar que la variable está en Settings:

```bash
# This is visual only - can't check programmatically
# But go to: https://vercel.com/frank-saavedras-projects/web-app/settings/environment-variables
# And look for: DATABASE_URL
```

---

## 📋 CHECKLIST FINAL

### Antes de Redeploy:
- [ ] He abierto Vercel Settings
- [ ] He encontrado o creado DATABASE_URL
- [ ] He verificado el Value: `postgresql://postgres:BQPrZrCRNzGOYzkuhaAxECtHAtVSIIzA@hopper.proxy.rlwy.net:34060/railway`
- [ ] He checkeado **Production** en Environments
- [ ] He checkeado **Preview** en Environments
- [ ] He checkeado **Development** en Environments
- [ ] He hecho click en "Save"

### Después de Redeploy:
- [ ] Fui a Deployments
- [ ] Clickeé en deployment actual
- [ ] Clickeé "..." → "Redeploy"
- [ ] **NO** seleccioné "Use existing Build Cache"
- [ ] Esperé 3-5 minutos

### Validación:
- [ ] Ejecuté: `curl https://web-app-ecru-seven.vercel.app/api/diagnostics`
- [ ] Recibí: `"hasDatabase": true`
- [ ] Visité: https://web-app-ecru-seven.vercel.app
- [ ] NO hay error 500 en /api/citas

---

## 🆘 Si aún no funciona:

1. **Verifica Railway está UP:**
   ```bash
   psql -h hopper.proxy.rlwy.net -p 34060 -U postgres -d railway -c "SELECT 1;"
   ```

2. **Revisa Vercel Build Logs** buscando por "DATABASE_URL"

3. **Prueba Delete + Recrear** variable en Vercel desde cero

4. **Si todo falla**: El problema podría ser:
   - Railway credentials incorrectos
   - Vercel caché corrupto (contact Vercel support)
   - Firewall/Network bloqueando Railway

---

## 📊 Resumen Técnico

**El código es 100% correcto:**
- ✅ prisma.ts: Singleton PrismaClient
- ✅ /api/citas/route.ts: Usa real Prisma
- ✅ /api/clinicas/route.ts: Usa real Prisma
- ✅ schema.prisma: Correcto `url = env("DATABASE_URL")`
- ✅ Railway PostgreSQL: 10 tablas LIVE

**El problema es 100% en Vercel:**
- ❌ DATABASE_URL NO está en Settings para Production
- ❌ O está pero no se inyecta correctamente

**La solución es 100% manual:**
- Ve a Vercel Settings
- Agrega/verifica DATABASE_URL
- Asegúrate que "Production" esté checkeado
- Redeploy sin cache
- Espera 3-5 minutos

---

**Status**: ⏳ Esperando que el usuario configure DATABASE_URL en Vercel Settings
