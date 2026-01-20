# GUÍA VERCEL DEPLOYMENT - AMI-SYSTEM
**Metodología:** INTEGRA v2.0  
**Status:** 🟢 ACTIVA  
**Última actualización:** 2026-01-22  
**Responsable:** SOFIA (Builder) / GEMINI (QA Infrastructure)

---

## 1. Visión & Contexto

**Problema:** AMI-SYSTEM es un monorepo con **pnpm + Turborepo + Next.js 14**, pero Vercel estaba configurado con `npm`, causando builds fallidos.

**Solución:** Configurar correctamente `vercel.json` y `.vercelignore` para que Vercel entienda la estructura del monorepo.

**Alcance:** Este documento guía deployments exitosos en Vercel y troubleshooting de issues comunes.

---

## 2. Configuración Correcta

### 2.1 `vercel.json` (ROOT del proyecto)

```json
{
  "installCommand": "cd ../.. && pnpm install",
  "buildCommand": "cd ../.. && pnpm run build",
  "framework": "nextjs",
  "outputDirectory": "packages/web-app/.next",
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "NEXTAUTH_URL": "@nextauth_url",
    "NEXT_PUBLIC_FIREBASE_API_KEY": "@firebase_api_key",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN": "@firebase_auth_domain",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID": "@firebase_project_id",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET": "@firebase_storage_bucket",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID": "@firebase_messaging_sender_id",
    "NEXT_PUBLIC_FIREBASE_APP_ID": "@firebase_app_id"
  }
}
```

**Puntos críticos:**
- ✅ Usar `pnpm` (no `npm`)
- ✅ `outputDirectory` apunta a `packages/web-app/.next`
- ✅ Variables de environment con prefijo `@` para Vercel secrets
- ✅ Los comandos incluyen `cd ../..` porque Vercel root es diferente

### 2.2 `.vercelignore` (ROOT del proyecto)

```
.git
.gitignore
README.md
PROYECTO.md
progressdashboard/
scripts/
context/
Checkpoints/
templates/
.env.example
.env.local
node_modules/
dist/
.next/
.turbo/
```

**Por qué:** Reduce el tamaño de deploy y evita rebuilds innecesarios.

---

## 3. Variables de Environment

### 3.1 Configurar en Vercel Dashboard

1. Ve a **Settings → Environment Variables**
2. Agrega cada variable (usa `@` prefix en `vercel.json` para referencia):

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/ami_db` |
| `NEXTAUTH_SECRET` | Clave secreta para NextAuth | Genera con `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL pública de la app | `https://ami-system.vercel.app` |
| `NEXT_PUBLIC_FIREBASE_*` | Keys públicas de Firebase | Desde Firebase Console |

### 3.2 Obtener Firebase Keys

1. Firebase Console → Project Settings
2. Copia todas las `NEXT_PUBLIC_*` keys
3. Pega en Vercel Environment Variables

### 3.3 PostgreSQL Connection

Si usas **Railway.app**:
```bash
# En Railway: Copy connection string
postgresql://user:pass@host.railway.app:5432/database
```

---

## 4. Troubleshooting Común

### Issue #1: "npm: command not found"

**Síntoma:** Build fails con `npm: command not found`

**Causa:** `vercel.json` usa `npm` en lugar de `pnpm`

**Fix:**
```json
// ❌ INCORRECTO
"installCommand": "npm install",
"buildCommand": "npm run build",

// ✅ CORRECTO
"installCommand": "pnpm install",
"buildCommand": "pnpm run build"
```

---

### Issue #2: ".next directory not found"

**Síntoma:** Deployment fails, says `.next` doesn't exist

**Causa:** `outputDirectory` apunta a locación incorrecta

**Fix:**
```json
// ❌ INCORRECTO
"outputDirectory": ".next"

// ✅ CORRECTO
"outputDirectory": "packages/web-app/.next"
```

---

### Issue #3: "DATABASE_URL is not defined"

**Síntoma:** Build falla durante Prisma generate

**Causa:** Environment variables no configuradas en Vercel

**Fix:**
1. Ve a Vercel Settings → Environment Variables
2. Agrega `DATABASE_URL` = tu PostgreSQL connection string
3. Asegúrate que está configurada para los environments correctos (Production, Preview, Development)
4. Redeploy

---

### Issue #4: "Prisma schema not found"

**Síntoma:** Error durante `prisma generate`

**Causa:** Ruta del schema es relativa y Vercel build context es diferente

**Fix:** En `vercel.json`, asegúrate que los comandos incluyen `cd ../..`:
```json
"installCommand": "cd ../.. && pnpm install",
"buildCommand": "cd ../.. && pnpm run build"
```

---

### Issue #5: "Module not found: @ami/mod-*"

**Síntoma:** Build falla porque no encuentra módulos del monorepo

**Causa:** Turborepo cache corrupta o pnpm-workspace.yaml no sincronizado

**Fix:**
1. En Vercel, rebuild sin cache:
   - Settings → Deployment → Clear Build Cache
   - Rebuild project
2. O fuerza Turbo a regenerar:
```json
"buildCommand": "cd ../.. && pnpm install && pnpm exec turbo run build --force"
```

---

### Issue #6: Firebase credentials not working

**Síntoma:** App deploya pero dice "Firebase not initialized"

**Causa:** `NEXT_PUBLIC_*` variables no están prefixadas correctamente

**Fix:**
1. En Vercel: variables deben estar como `NEXT_PUBLIC_FIREBASE_API_KEY`, etc.
2. En código: accede con `process.env.NEXT_PUBLIC_FIREBASE_API_KEY`
3. Next.js only expone variables con prefijo `NEXT_PUBLIC_` al browser

---

## 5. Checklist Pre-Deploy

Antes de hacer push a master:

- [ ] `vercel.json` usa `pnpm` (no `npm`)
- [ ] `outputDirectory` = `packages/web-app/.next`
- [ ] `.vercelignore` existe en root
- [ ] Local build pasa: `pnpm run build`
- [ ] Todas las variables en Vercel Settings están configuradas
- [ ] `DATABASE_URL` está definida y es accesible desde Vercel
- [ ] Firebase keys son correctas (verifica copiando a una app test)
- [ ] `.env.local` NO está commiteado (verifica `.gitignore`)

---

## 6. Deploy Workflow

### Paso 1: Verificar Build Local
```bash
cd /workspaces/AMI-SYSTEM
pnpm run build
# Debe completar sin errores
```

### Paso 2: Commit y Push
```bash
git add .
git commit -m "feat: ...message"
git push origin master
```

### Paso 3: Monitorear en Vercel
1. Ve a https://vercel.com/dashboard
2. Abre el proyecto AMI-SYSTEM
3. Mira la pestaña "Deployments"
4. Espera a que complete (usualmente 2-3 minutos)
5. Si falla, expande el error y busca en esta guía

### Paso 4: Verificar en Producción
```bash
# Verifica que la app esté en línea
curl https://ami-system.vercel.app
# Debe retornar HTML (no 404 o 500)
```

---

## 7. Log Analysis

### Buscar Errores en Vercel Build Logs

**Patrón:** `error TS...`
- **Causa:** TypeScript compilation error
- **Fix:** Revisa local con `pnpm run build` y arregla tipos

**Patrón:** `Cannot find module '@ami/...`
- **Causa:** Monorepo module no está incluido
- **Fix:** Verifica que está en `pnpm-workspace.yaml` y que `packages/*/package.json` tiene `"version"`

**Patrón:** `DATABASE_URL is required`
- **Causa:** Prisma no puede generar sin DATABASE_URL
- **Fix:** Agrega en Vercel Environment Variables

**Patrón:** `ENOENT: no such file or directory, open '...schema.prisma'`
- **Causa:** Ruta relativa incorrecta
- **Fix:** Verifica `cd ../..` en vercel.json commands

---

## 8. Testing Post-Deploy

```bash
# 1. Check health endpoint (si existe)
curl https://ami-system.vercel.app/api/health

# 2. Check que las páginas cargan
curl https://ami-system.vercel.app/admin/expedientes

# 3. Verifica que puede conectar a BD
# (Si la app tiene un endpoint que usa DB)
```

---

## 9. Rollback en Caso de Error

Si el deployment falla:

1. **Opción 1: Revert el commit**
   ```bash
   git revert HEAD
   git push origin master
   # Vercel rebuildeará automáticamente
   ```

2. **Opción 2: Deploy una versión anterior**
   - En Vercel Dashboard → Deployments
   - Busca el último deployment exitoso
   - Haz clic en los tres puntos → Promote to Production

---

## 10. Monitoring

### Verificar Vercel Logs en Tiempo Real

```bash
# Si tienes Vercel CLI instalado:
vercel logs --tail

# Sino, ve a:
# https://vercel.com/[team]/ami-system/monitoring
```

### Alertas Recomendadas

Configura en Vercel Settings → Integrations:
- Email notification on failed deployment
- Slack notification (optional)

---

## 11. Performance Tips

Para optimizar builds en Vercel:

1. **Reducir tamaño de artifacts:**
   ```json
   "env": {
     "TURBO_TEAM": "@tuteam",
     "TURBO_TOKEN": "@turbo_token"
   }
   ```
   (Esto habilita Turbo Remote Caching)

2. **Excluir más archivos en `.vercelignore`:**
   - Agrega cualquier directorio que no sea necesario para el build

3. **Incrementar build timeout** (si builds tardan >15 min):
   - Vercel → Settings → Build & Development Settings → Timeout

---

## 12. Referencias

- **Vercel Next.js Deployment:** https://vercel.com/docs/frameworks/nextjs
- **pnpm Monorepo:** https://pnpm.io/workspaces
- **Turborepo + Vercel:** https://turbo.build/repo/docs/deployment/vercel
- **Next.js Environment Variables:** https://nextjs.org/docs/basic-features/environment-variables

---

## 13. Contacto & Escalación

| Problema | Responsable | Escalación |
|----------|-------------|-----------|
| Build compilation errors | SOFIA | INTEGRA (architecture review) |
| Database connection issues | GEMINI | Devops/Railway team |
| Environment variables | GEMINI | Vercel support |
| Performance/Caching | GEMINI | Vercel pro support |

---

**Última validación:** 2026-01-22 ✅  
**Build status en Vercel:** Debe mejorar con este fix  
**Próxima review:** Post-demo (Thursday 23 January)

---

*Documento creado bajo Metodología INTEGRA v2.0*  
*Responsable: SOFIA (Builder) → GEMINI (QA Infrastructure)*  
*Para actualizar: Editar este archivo y crear ADR si hay cambios arquitectónicos*
