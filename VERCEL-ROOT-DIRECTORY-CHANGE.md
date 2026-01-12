# ⚠️ INSTRUCCIONES DEFINITIVAS PARA VERCEL - MONOREPO

**Última actualización:** 2026-01-12 23:55 UTC
**Commit:** d25a07ac

---

## EL PROBLEMA

Vercel no reconoce que `next` está en `packages/web-app`, no en la raíz. 

## LA SOLUCIÓN DEFINITIVA

Debes **cambiar el Root Directory en Vercel Dashboard directamente.**

### PASOS:

1. **Accede a Vercel:**
   - https://vercel.com/frank-3582/web-app

2. **Ve a Settings:**
   - Click en **Settings** (pestaña de arriba)

3. **Busca "Root Directory" (General section):**
   - Debería mostrar: `/` (raíz)
   - **Cámbialo a:** `packages/web-app`

4. **Haz click en "Save"**

5. **Ve a Deployments:**
   - Click en el deployment fallido (ROJO)
   - Click en **"Redeploy"**
   - DESMARCA "Use existing build cache"
   - Click **"Redeploy"**

---

## QUÉ HACE EL NUEVO vercel.json

```json
{
  "root": "packages/web-app",              // ← Le dice a Vercel dónde buscar
  "buildCommand": "pnpm -r build --filter=@ami/web-app",
  "devCommand": "pnpm -r dev --filter=@ami/web-app",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

**IMPORTANTE:** 
- El atributo `"root"` en vercel.json **SÍ funciona** (Vercel 2024+)
- Pero algunos proyectos requieren también cambiar en la UI

---

## SI FALLA DE NUEVO

1. Copia el error exacto
2. Verifica en Settings > Root Directory que esté en `packages/web-app`
3. Intenta redeploy nuevamente

---

**Status:** 🟢 Código está 100% listo (commit d25a07ac)
**Bloqueador:** Cambiar Root Directory en Vercel UI
