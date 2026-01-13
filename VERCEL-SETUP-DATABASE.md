# Configuración de Vercel para DATABASE_URL

## Estado Actual

- **URL Vercel:** https://web-app-ecru-seven.vercel.app/
- **Problema:** Error 500 en /api/citas (DATABASE_URL probablemente no configurado)

## Solución

Agregar `DATABASE_URL` a las variables de entorno en Vercel:

### Opción 1: Via Vercel Dashboard (Recomendado)

1. Ir a: https://vercel.com/frank-saavedras-projects/web-app
2. Settings → Environment Variables
3. Agregar variable:
   - **Name:** `DATABASE_URL`
   - **Value:** `postgresql://postgres:BQPrZrCRNzGOYzkuhaAxECtHAtVSIIzA@hopper.proxy.rlwy.net:34060/railway`
   - **Environments:** Seleccionar "Production", "Preview", "Development"
4. Guardar y redeploy

### Opción 2: Via Vercel CLI

```bash
vercel env add DATABASE_URL
# Copiar y pegar: postgresql://postgres:BQPrZrCRNzGOYzkuhaAxECtHAtVSIIzA@hopper.proxy.rlwy.net:34060/railway
```

### Opción 3: Detectar URL correcta

El app está en: `web-app-ecru-seven.vercel.app`
Pero debería estar en: `ami-system.vercel.app`

**NOTA IMPORTANTE:** 
- Este deploy es del proyecto **web-app INCORRECTO** (debe ser el proyecto **ami-system**)
- La raíz debería ser el monorepo, no packages/web-app

Verificar:
```bash
vercel link
# Debería mostrar: Project "ami-system" linked
```

## Validación Post-Deploy

Una vez agregue DATABASE_URL en Vercel:

1. Redeploy:
   ```bash
   git push origin master
   # Vercel triggerá build automáticamente
   ```

2. Verificar diagnostics:
   ```bash
   curl https://web-app-ecru-seven.vercel.app/api/diagnostics
   ```
   Debería retornar: `"status": "✅ Connected"`

3. Verificar /api/citas:
   ```bash
   curl https://web-app-ecru-seven.vercel.app/api/citas?tenantId=default-tenant
   ```
   Debería retornar: `{"data": [], "total": 0, ...}` (sin error 500)

## Próximos Pasos

1. Configurar DATABASE_URL ✅ (ESTA TAREA)
2. Redeploy en Vercel (automático con git push)
3. Validar con /api/diagnostics
4. Si aún hay errores, revisar Vercel logs:
   https://vercel.com/frank-saavedras-projects/web-app/deployments
