# ADR-005: Automatización de Documentación Viva (Dashboard)

**Estatus:** ✅ Aceptado  
**Fecha:** 2026-01-20  
**Responsable:** SOFIA (Implementación) + INTEGRA (Validación Arquitectónica)  
**Refs:** [PROYECTO.md](../../PROYECTO.md), [ADR-002](./ADR-002-multitenancy-validation.md)

---

## 1. Problema

En proyectos ágiles de gran escala como **AMI-SYSTEM** (17 módulos, 4 fases, equipo distribuido), la documentación de estado se vuelve rápidamente **obsoleta o divergente**:

- ❌ Cambios en `PROYECTO.md` no se reflejan automáticamente en dashboards visuales
- ❌ `README-DASHBOARD.md` requiere generación manual
- ❌ `project_data.json` (fuente del dashboard web) se desincroniza
- ❌ Riesgo de tomar decisiones sobre datos stale

**Síntoma:** Dashboard en `vcorp.mx/progress-ami/progressdashboard/` mostraba **MOD-EXPEDIENTES en 5%** cuando realmente estaba en **90%** (Phase 1.3 completa).

---

## 2. Decisión

**Implementar un pipeline de CI (GitHub Actions) que:**

1. **Se ejecuta** post-merge a rama principal (`main` o `master`)
2. **Lee** metadatos técnicos:
   - `PROYECTO.md` (tabla de módulos, fechas de actualización)
   - Prisma schema y package.json (para inferir estado técnico)
3. **Regenera** documentación en tiempo real:
   - `README-DASHBOARD.md` (para GitHub)
   - `progressdashboard/data/project_data.json` (para frontend web)
4. **Commitea automáticamente** los cambios con mensaje `[skip ci]` para evitar loops

### Flujo Adoptado

```
Feature Branch
     ↓
Pull Request + Merge a master
     ↓
GitHub Actions despierta: "update-dashboard.yml"
     ↓
pnpm run dashboard:update
     ↓
Cambios en README-DASHBOARD.md / project_data.json
     ↓
Auto-commit: "chore(docs): update dashboard status [skip ci]"
     ↓
PROYECTO.md ↔️ Dashboard Web SIEMPRE sincronizados
```

---

## 3. Justificación

### ✅ Alineación con INTEGRA v2.0

| Principio INTEGRA | Cumplimiento | Detalle |
|------------------|--------------|---------|
| **Single Source of Truth** | ✅ | PROYECTO.md es la fuente; Dashboard es proyección |
| **Automatización de Tareas Repetitivas** | ✅ | Generación manual → CI automático |
| **Documentación Viva** | ✅ | Docs siempre sincronizadas con código/estado |
| **Separación de Responsabilidades** | ✅ | Workflow separate de lógica de aplicación |
| **Trazabilidad de Cambios** | ✅ | Cada actualización genera commit con timestamp |

### 📊 Impacto Esperado

| Métrica | Antes | Después |
|---------|-------|---------|
| Latencia dashboard→realidad | Manual (horas/días) | <1 min |
| Error humano en sync | Alto (olvidar ejecutar) | Cero (automático) |
| Confianza en datos de gestión | Media (pueden ser stale) | Alta (siempre fresh) |
| Overhead SOFIA | ~5 min/push | ~1 seg automático |

---

## 4. Implementación

### A. Estructura de Archivos

```
.github/workflows/
  └── update-dashboard.yml          ← Nuevo workflow
context/decisions/
  └── ADR-005-AUTOMATIZACION-DOCUMENTACION.md  ← Este archivo
package.json
  "scripts": {
    "dashboard:update": "node progressdashboard/parser.js"  ← Script existente
  }
```

### B. Configuración del Workflow

**Archivo:** `.github/workflows/update-dashboard.yml`

```yaml
name: 📊 Update Dashboard Status

on:
  push:
    branches: [ main, master ]
    paths:
      - 'PROYECTO.md'
      - 'packages/**/package.json'
      - 'scripts/**'
      - 'progressdashboard/**'
      - '.github/workflows/update-dashboard.yml'

permissions:
  contents: write

concurrency:
  group: dashboard-update
  cancel-in-progress: false

jobs:
  update-dashboard:
    name: Generate Dashboard
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Dashboard
        run: pnpm run dashboard:update

      - name: Commit changes
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore(docs): update dashboard status [skip ci]"
          file_pattern: |
            README-DASHBOARD.md
            progressdashboard/data/project_data.json
          commit_options: --no-verify
          create_branch: false
```

### C. Validaciones Post-Implementación

- ✅ Workflow ejecuta solo si hay cambios en PROYECTO.md o scripts
- ✅ `[skip ci]` previene loops infinitos
- ✅ `concurrency` evita condiciones de carrera
- ✅ Commits automáticos tienen firma clara: `chore(docs):`

---

## 5. Consideraciones de Seguridad

| Riesgo | Mitigación |
|--------|-----------|
| **Loop infinito de CI** | Usar `[skip ci]` en commit automático |
| **Permisos excesivos** | Workflow solo puede escribir en `contents` |
| **Cambios no autorizados** | Auto-commit restringido a archivos específicos |
| **Timing de merge** | `concurrency` previene múltiples ejecuciones simultáneas |

---

## 6. Alternativas Consideradas y Rechazadas

| Alternativa | Razón de Rechazo |
|------------|-----------------|
| **Manual (SOFIA lo hace en cada push)** | ❌ Propenso a olvido, no escala |
| **Cron diario (genera dashboard cada 24h)** | ❌ Demasiado lag; stale data en desarrollo |
| **Webhook personalizado** | ❌ Complejidad operativa innecesaria |
| **Branch automático (PR) → merge automático** | ⚠️ Overkill; workflow simple es suficiente |

---

## 7. Consecuencias

### Positivas ✅
- Dashboard siempre sincronizado con realidad operacional
- Cero overhead manual para mantenimiento
- Trazabilidad completa de cambios (historial Git)
- Mejor visibilidad para stakeholders remotos

### Negativas ⚠️
- Requiere permisos de escritura en repo (GITHUB_TOKEN)
- Pequeño overhead de CI/CD (CPU, tiempo)
- Si el script de generación falla, el commit no sucede (necesita manual)

### Mitigaciones 🔧
- Monitoreo: Cada workflow genera entrada en "Actions" de GitHub
- Rollback: Si hay problema, SOFIA puede revertir último commit automático
- Mantenimiento: Script de generación debe estar bien testeado (lo está)

---

## 8. Próximos Pasos

1. **SOFIA (Implementación):** Crear workflow en `.github/workflows/update-dashboard.yml`
2. **SOFIA (Validación):** Probar manual 1x antes de merge a master
3. **INTEGRA (Aprobación Final):** Validar que workflow cumple ADR-005
4. **GEMINI-CLOUD-QA:** Auditoría de seguridad de workflow

---

## 9. Referencias

- [PROYECTO.md](../../PROYECTO.md) - Fuente de verdad del progreso
- [ADR-002: Multitenancy Validation](./ADR-002-multitenancy-validation.md) - Refs compartidas
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Metodología INTEGRA v2.0](../../meta/AGENTES.md)

---

**Aceptado por:** INTEGRA - Arquitecto (2026-01-20)  
**Implementado por:** SOFIA - Builder (2026-01-20)
