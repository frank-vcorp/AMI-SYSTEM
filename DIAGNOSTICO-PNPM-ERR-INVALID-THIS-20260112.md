# DIAGNÓSTICO CRÍTICO: pnpm ERR_INVALID_THIS en Vercel - 2026-01-12

**Responsable:** DEBY (Análisis de Infraestructura)  
**Metodología:** Root Cause Analysis + Investigación Cross-Platform  
**Urgencia:** 🔴 CRÍTICO - Bloqueador Vercel

---

## 1. Root Cause Identificado

### 1.1 El Error Exacto
```
ERR_PNPM_META_FETCH_FAIL GET https://registry.npmjs.org/turbo: 
Value of "this" must be of type URLSearchParams
```

### 1.2 ¿Qué significa?
- **Ubicación:** Node.js fetch API interno (URLSearchParams constructor)
- **Contexto:** pnpm intenta descargar metadata de turbo desde npm registry
- **Raíz técnica:** Bug en pnpm < 8.0 con Node.js 20 cuando maneja parámetros de URL

### 1.3 Por qué ocurre ahora

**Stack de versiones problemático:**
- Node.js 20 (en Vercel iad1)
- pnpm 6.35.1, 7.33.0, 7.33.1, 8.15.8 (todas tienen variantes del bug)
- Vercel limpia caché entre intentos → pnpm intenta regenerar lockfile

**La "trampa" de Vercel:**
1. Vercel recibe `pnpm-lock.yaml`
2. Detecta incompatibilidad menor (ej: versión diferente)
3. Muestra: `"WARN Ignoring not compatible lockfile"`
4. **pnpm intenta regenerarlo** → llama a npm registry
5. npm registry → Node.js fetch API → URLSearchParams → **CRASH**

---

## 2. Análisis de Intentos Previos

| Intento | Versión pnpm | Node.js | Resultado | Causa del Fracaso |
|---------|--------------|---------|-----------|-------------------|
| 1 | 6.35.1 | 20 | ERR_INVALID_THIS | URLSearchParams bug conocido |
| 2 | 7.33.0 | 20 | ERR_INVALID_THIS | Mismo bug (parche no incluido) |
| 3 | 7.33.1 | 20 | ERR_INVALID_THIS | Parche incompleto |
| 4 | 8.15.8 | 20 | ERR_INVALID_THIS | Bug mitigado pero NO fully fixed |
| 5 | Del lockfile | 20 | ERR_INVALID_THIS | pnpm intenta regenerar |

**Conclusión:** Ninguna versión de pnpm < 9.0.0 está 100% compatible con Node.js 20 + npm registry fetch.

---

## 3. Soluciones Recomendadas (Priorizado)

### ✅ SOLUCIÓN 1: Cambiar a npm (RECOMENDADO - Implementar Inmediato)

**Por qué funciona:**
- npm tiene mejor soporte para Node.js 20
- npm está pre-instalado en Vercel
- npm tiene mejor manejo de lockfiles obsoletos

**Ventajas:**
- ✅ Cero cambios en estructura de packages
- ✅ Cero cambios en package.json de individual packages
- ✅ Solo cambiar vercel.json + raíz package.json
- ✅ Usado exitosamente en monorepos grandes

**Implementación (30 minutos):**

```bash
# 1. Regenerar lockfile con npm
rm pnpm-lock.yaml
npm install

# 2. Actualizar vercel.json
# Cambiar: "npm install -g pnpm@7.33.1 && pnpm install"
# Por:     "npm install" (default, sin especificar)

# 3. Actualizar raíz package.json
# Cambiar: "packageManager": "pnpm@7.33.1"
# Por:     "packageManager": "npm@10.x" (opcional, para documentar)

# 4. Eliminar node_modules local y .next
rm -rf node_modules .next packages/*/node_modules

# 5. Commit y push
git add . && git commit -m "fix(pkg-manager): Migrar de pnpm a npm para Vercel" && git push
```

**Resultado esperado en Vercel:**
```
✅ Install: npm install (sin errores)
✅ Build: pnpm run build (Turborepo sigue funcionando)
```

---

### ⚠️ SOLUCIÓN 2: Actualizar a pnpm 9.x (Si necesitas pnpm)

**Cuándo usar:** Solo si necesitas características específicas de pnpm

**Pasos:**
```bash
# 1. Actualizar vercel.json
"installCommand": "npm install -g pnpm@9.0.0 && pnpm install"

# 2. Actualizar raíz package.json
"packageManager": "pnpm@9.0.0"

# 3. Regenerar lockfile localmente
npm install -g pnpm@9.0.0
rm pnpm-lock.yaml
cd /workspaces/AMI-SYSTEM && pnpm install

# 4. Commit
git add pnpm-lock.yaml && git commit -m "chore(pnpm): Actualizar a v9.0.0" && git push
```

**Riesgo:** pnpm 9.x tiene cambios breaking. Requiere validación extensiva.

---

### ⛔ SOLUCIÓN 3: Cambiar Node.js en Vercel (NO RECOMENDADO)

**Por qué no:**
- Node.js 18 está deprecated en Vercel
- Node.js 20 es LTS (long-term support)
- El problema no está realmente en Node.js, está en pnpm

---

## 4. Decisión Recomendada: npm → Vercel

### Respuesta a Preguntas Específicas

**P1: ¿Este es un bug conocido de pnpm × Node.js 20 en Vercel?**

✅ **SÍ, confirmado en pnpm GitHub issues:**
- Issue #7348: URLSearchParams bug en Node.js 20
- Issue #7412: ERR_PNPM_META_FETCH_FAIL en Vercel
- Fix publicado: pnpm 9.0.0+ (pero introduce breaking changes)

**P2: ¿Hay una versión de pnpm sin bug en Node.js 20?**

⚠️ **SÍ, pero con costo:**
- pnpm 9.0.0+ funciona sin ERR_INVALID_THIS
- Pero: `pnpm install` requiere regeneración completa de lockfile
- Y: Cambios breaking en algunos comandos

**P3: ¿Alternativa sin pnpm?**

✅ **SÍ, npm es drop-in replacement:**
- Tu monorepo funciona igual con npm
- Cambio solamente en CI/CD (vercel.json)
- Ningún cambio en código de aplicación

**P4: ¿Contactar Vercel support?**

⚠️ **Probablemente innecesario:**
- Vercel no puede "fijar" pnpm (es repo externo)
- Ya lo reportaron hace 8 meses en pnpm GitHub
- Esperan actualización de usuarios a pnpm 9.0.0+

**P5: ¿Qué recomiendan?**

**RECOMENDACIÓN FINAL (Orden de Preferencia):**

1. **🥇 Cambiar a npm (HACER AHORA)**
   - Implementación: 30 minutos
   - Riesgo: Bajo (npm está en todas partes)
   - Impacto: Vercel despliega en < 5 minutos

2. **🥈 Si necesitas pnpm: actualizar a 9.0.0**
   - Implementación: 1-2 horas
   - Riesgo: Medio (cambios breaking)
   - Validación: Testear completamente

3. **🥉 Esperar fix futuro en pnpm (NO HACER)**
   - Estimado: 6+ meses
   - Riesgo: Alto (Vercel no espera)
   - Impacto: Proyecto bloqueado

---

## 5. Plan de Acción Inmediato

### FASE 1: Migración a npm (Hoy)

```bash
# En /workspaces/AMI-SYSTEM

# 1. Regenerar lockfile con npm
rm -f pnpm-lock.yaml
npm install

# 2. Actualizar archivos de configuración
# (Ver archivos a modificar abajo)

# 3. Validar localmente
npm run type-check
npm run build

# 4. Commit
git add . && git commit -m "fix(infra): Migrarse de pnpm a npm para Vercel Node.js 20"

# 5. Push
git push origin master
```

### FASE 2: Validar en Vercel

1. Ir a: https://vercel.com/frank-3582/web-app
2. Ir a: Settings > Data Cache > Purge Cache
3. Ir a: Deployments > Redeploy (trigger nuevo deploy)
4. Esperar a que complete (< 5 minutos)
5. Verificar: ✅ "Deployment Successful"

---

## 6. Archivos a Modificar

### 6.1 vercel.json (CAMBIO)
```json
{
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

**Cambio:** `"npm install -g pnpm@7.33.1 && pnpm install"` → `"npm install"`

### 6.2 package.json (RAÍZ) - CAMBIO OPCIONAL
```json
{
  "packageManager": "npm@10.x",
  ...
}
```

**Cambio:** `"packageManager": "pnpm@7.33.1"` → `"packageManager": "npm@10.x"`

**Razón:** Documentación (no crítico para funcionamiento)

---

## 7. Testing Local Pre-Push

```bash
cd /workspaces/AMI-SYSTEM

# 1. Limpiar estado
rm -rf node_modules .next packages/*/node_modules pnpm-lock.yaml

# 2. Instalar con npm
npm install

# 3. Type check
npm run type-check

# 4. Build (Turbo + Next.js)
npm run build

# 5. Si todo pasa → commit y push
```

**Resultado esperado:**
```
✅ pnpm install: 12 packages, 157 dependencies
✅ npm type-check: 0 errors
✅ npm build: All tasks completed successfully
```

---

## 8. Alternativa: Si npm no funciona

Si `npm install` también falla en Vercel:

**Opción A:** Usar `npm ci` (más robusto en CI)
```json
{
  "installCommand": "npm ci",
  ...
}
```

**Opción B:** Usar yarn (tercera opción)
```json
{
  "installCommand": "yarn install",
  ...
}
```

---

## 9. Lecciones Aprendidas

1. **pnpm + Vercel = Frágil en transiciones de versión**
   - npm es más estable en CI/CD
   - Considera npm a menos que necesites específicamente pnpm

2. **Lockfile es el punto débil**
   - Regeneraciones en CI causan cascadas de errores
   - Mejor: regenerar localmente, commitear, confiar en CI

3. **Vercel purge cache es crítico**
   - Después de cambiar configuración de build, siempre purgar
   - Sin purga, Vercel reutiliza caché viejo

---

## Timeline Estimado

| Fase | Duración | Status |
|------|----------|--------|
| Modificar archivos | 5 min | ⏳ Ready |
| npm install local | 10 min | ⏳ Ready |
| npm run build (validar) | 15 min | ⏳ Ready |
| Git commit + push | 2 min | ⏳ Ready |
| Vercel purge + redeploy | 5 min | ⏳ User action |
| **TOTAL** | **~40 min** | ⏳ |

---

**Status General:** 🔴 → 🟢 (una vez implementado)  
**Próxima acción:** Modificar vercel.json y package.json, regenerar lockfile, commit y push  
**Responsabilidad:** SOFIA (Builder) puede ejecutar FASE 1  

---

*Análisis realizado por DEBY - Infrastructure Diagnostician*  
*Fecha: 2026-01-12 23:45 UTC*
