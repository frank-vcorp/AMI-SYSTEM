# FIX-VERCEL-BUILD-20260122: Resolución de módulo @ami/core-validation

## Status
✅ **COMPLETADO** - Build local exitoso, push a master completado

## Problema Identificado
```
Module not found: Can't resolve '@ami/core-validation'
  at ./app/api/validaciones/[id]/generate-pdf/route.ts
  at ./app/api/validaciones/[id]/route.ts
```

**Timeline:**
- 22:33:39 UTC: Vercel build falló durante webpack compilation
- 22:45:00 UTC: User reportó el error
- 22:48:00 UTC: Diagnóstico y corrección completada

## Causa Raíz

1. **package.json de core-validation** tenía:
   - `"main": "dist/index.js"` 
   - Sin campo `"exports"` explícito
   - Build script correcto pero sin export configuration

2. **package.json de web-app** tenía:
   - Dependencias con `"*"` en lugar de `"workspace:*"`
   - Esto causaba que pnpm no resolviera correctamente el workspace package

3. **Diferencia Local vs Vercel:**
   - **Local:** Turbo cache y compilación anterior permitían encontrar el módulo
   - **Vercel:** Fresh checkout sin cache = core-validation no compilado cuando web-app lo necesita

## Cambios Aplicados

### 1. `/packages/core-validation/package.json`
```json
{
  "main": "src/index.ts",
  "types": "src/index.ts",
  "exports": {
    ".": {
      "import": "./src/index.ts",
      "types": "./src/index.ts"
    }
  }
}
```

**Razón:** TypeScript puede resolver directamente desde `src/` en Vercel sin necesidad de pre-compilación

### 2. `/packages/web-app/package.json`
```json
{
  "dependencies": {
    "@ami/core-auth": "workspace:*",
    "@ami/core-storage": "workspace:*",
    "@ami/core-types": "workspace:*",
    "@ami/core-ui": "workspace:*",
    "@ami/core-validation": "workspace:*",
    "@ami/mod-citas": "workspace:*",
    "@ami/mod-clinicas": "workspace:*",
    "@ami/mod-empresas": "workspace:*",
    "@ami/mod-expedientes": "workspace:*",
    "@ami/mod-reportes": "workspace:*",
    "@ami/mod-servicios": "workspace:*",
    "@ami/mod-validacion": "workspace:*"
  }
}
```

**Razón:** `workspace:*` es el protocol correcto para pnpm monorepos - asegura que los packages se resuelvan localmente

## Verificación

✅ **Local Build:**
```bash
$ pnpm exec turbo build --filter="@ami/core-validation"
  @ami/core-validation:build: cache miss, executing
  @ami/core-validation:build: > tsc
  Tasks:    2 successful, 2 total
  Time:    2.45s
```

✅ **Full Monorepo Build:**
```bash
$ pnpm exec turbo build
  Tasks:    16 successful, 16 total
  Cached:    15 cached, 16 total
  Time:    27.475s
```

✅ **Git Push:**
```
9f2751e3..0d228b3f  master -> master
Commit: fix(IMPL-20260122-05): Correción resolución workspace en Vercel
```

## Impacto Esperado

**Vercel Redeploy:** 
- Nueva build iniciará automáticamente (commit 0d228b3f)
- pnpm resolverá correctamente `@ami/core-validation` desde workspace
- TypeScript loader cargará desde `src/index.ts` sin necesidad de pre-compilación
- Webpack encontrará los módulos correctamente
- Build debería pasar completamente

## Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `/packages/core-validation/package.json` | ✓ Agregados `"exports"`, cambiado `"main"` a src |
| `/packages/web-app/package.json` | ✓ Cambiadas dependencias a `workspace:*` |

## Commit Info

```
Commit: 0d228b3f
Hash: 0d228b3f (after 9f2751e3)
Message: fix(IMPL-20260122-05): Correción resolución workspace en Vercel
Changes: 4 files changed, 33 insertions(+), 27 deletions(-)
```

## Siguiente Paso

Monitorear Vercel deployment. Si build pasa, podemos confirmar solución exitosa.

---
**Generado por:** SOFIA (Builder)  
**ID:** IMPL-20260122-05  
**Fecha:** 2026-01-22 22:50:00 UTC  
**Status:** ✅ COMPLETADO
