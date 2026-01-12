# CHECKPOINT: GEMINI-CLOUD-QA VERCEL DEBUG - 2026-01-12

**Tipo:** FIX INFRAESTRUCTURA
**Prioridad:** CRÍTICA
**Autor:** GEMINI-CLOUD-QA

## 🚨 Situación
El usuario reporta fallo continuo en Vercel tras correcciones previas.
No se tiene acceso directo a logs de Vercel.
Simulación local exitosa (`npx turbo run build`), pero con advertencias críticas.

## 🐛 Hallazgos (Simulación Local)
1. **Falta de dependencia `turbo` en root:**
   - El entorno local usaba `turbo` global (v2.7.4).
   - Vercel podría estar usando una versión incompatible o fallando al no encontrar el binario.
   - **Fix:** `pnpm add -D turbo -w`

2. **Falta de dependencia `eslint` en `web-app`:**
   - Build output warning: `⨯ ESLint must be installed in order to run during builds`.
   - Vercel es estricto con errores de build/lint.
   - **Fix:** `pnpm add -D eslint eslint-config-next --filter @ami/web-app`
   - **Fix:** Creado `.eslintrc.json` básico.

## 🛠️ Acciones Realizadas
- Instaladas dependencias faltantes.
- Configurado linter base.
- Verificado `layout.tsx` (viewport fix presente).

## ⏭️ Próximos Pasos recomendados
1. Commit & Push cambios.
2. Vercel Redeploy (sin cache si es posible).
3. Si falla, el usuario DEBE copiar el log exacto manualmente.
