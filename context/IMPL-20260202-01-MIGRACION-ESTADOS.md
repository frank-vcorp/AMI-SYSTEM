# IMPL-20260202-01: Plan de Migración de Estados

**Autor:** @SOFIA  
**Fecha:** 2026-02-02  
**Relacionado con:** ARCH-20260202-03  

---

## 🎯 Objetivo

Migrar datos existentes del sistema de estados antiguos a los nuevos estados granulares sin pérdida de información ni interrupción del servicio.

---

## 📊 Mapeo de Estados: Expedientes

### Migración de `ExpedientStatus`

| Estado Antiguo | Estado Nuevo | Lógica de Migración |
|----------------|--------------|---------------------|
| `DRAFT` | `DRAFT` | Mantener (legacy) |
| `PENDING` | `CHECKED_IN` | Asumir que ya pasó check-in |
| `IN_PROGRESS` | `IN_PHYSICAL_EXAM` | Examen en curso |
| `STUDIES_PENDING` | `AWAITING_STUDIES` | Esperando resultados |
| `VALIDATED` | `VALIDATED` | Mantener |
| `COMPLETED` | `DELIVERED` | Asumir que fue entregado |
| `SIGNED` | `VALIDATED` | Consolidar con VALIDATED |
| `DELIVERED` | `DELIVERED` | Mantener |
| `ARCHIVED` | `ARCHIVED` | Mantener |

### Script SQL de Migración

```sql
-- Migración de estados de expedientes
UPDATE expedients 
SET status = CASE 
  WHEN status = 'PENDING' THEN 'CHECKED_IN'
  WHEN status = 'IN_PROGRESS' THEN 'IN_PHYSICAL_EXAM'
  WHEN status = 'STUDIES_PENDING' THEN 'AWAITING_STUDIES'
  WHEN status = 'SIGNED' THEN 'VALIDATED'
  WHEN status = 'COMPLETED' THEN 'DELIVERED'
  ELSE status  -- DRAFT, VALIDATED, DELIVERED, ARCHIVED se mantienen
END;
```

---

## 📄 Mapeo de Estados: Estudios

### Migración de `UploadStatus` → `StudyStatus`

| Estado Antiguo | Estado Nuevo | Lógica |
|----------------|--------------|--------|
| `PENDING` | `UPLOADED` | Archivo ya está en el sistema |
| `PROCESSING` | `PROCESSING` | Mantener |
| `COMPLETED` | `EXTRACTED` | Datos ya fueron capturados |
| `FAILED` | `FAILED` | Mantener |

### Script SQL de Migración

```sql
-- Migración de estados de estudios
UPDATE study_uploads 
SET status = CASE 
  WHEN status = 'PENDING' THEN 'UPLOADED'
  WHEN status = 'COMPLETED' THEN 'EXTRACTED'
  ELSE status  -- PROCESSING, FAILED se mantienen
END;
```

---

## 🔄 Proceso de Migración

### Opción 1: Migración Automática (Recomendada para Dev/Staging)

```bash
# 1. Generar migración Prisma
npx prisma migrate dev --name refactor_async_states --schema=prisma/schema.prisma

# 2. Aplicar scripts de migración de datos
# (Prisma ejecutará los scripts SQL automáticamente)
```

### Opción 2: Migración Manual (Producción)

```bash
# 1. Crear migración sin aplicar
npx prisma migrate dev --create-only --name refactor_async_states

# 2. Revisar archivo de migración generado en:
# prisma/migrations/YYYYMMDDHHMMSS_refactor_async_states/migration.sql

# 3. Agregar scripts de migración de datos al archivo

# 4. Aplicar en producción
npx prisma migrate deploy
```

---

## ⚠️ Consideraciones Importantes

### 1. Compatibilidad Temporal

Durante el período de transición, las APIs deben:
- Aceptar tanto estados antiguos como nuevos en requests
- Mapear automáticamente estados antiguos a nuevos
- Loggear warnings cuando se usen estados deprecados

### 2. Rollback Plan

Si algo falla:
```bash
# Revertir última migración
npx prisma migrate resolve --rolled-back YYYYMMDDHHMMSS_refactor_async_states
```

### 3. Testing

Antes de aplicar en producción:
- [ ] Probar migración en base de datos de desarrollo
- [ ] Verificar que todas las APIs funcionen con nuevos estados
- [ ] Confirmar que reportes y dashboards muestren datos correctos
- [ ] Validar que no hay queries hardcodeadas con estados antiguos

---

## 📝 Checklist de Implementación

### Fase 1: Esquema (✅ COMPLETADO)
- [x] Actualizar `ExpedientStatus` enum
- [x] Crear `StudyStatus` enum (renombrado de `UploadStatus`)
- [x] Actualizar modelo `StudyUpload`
- [x] Sincronizar ambos esquemas (root + core-database)
- [x] Generar cliente Prisma

### Fase 2: Migración de Datos (PENDIENTE)
- [ ] Crear archivo de migración Prisma
- [ ] Agregar scripts SQL de transformación de datos
- [ ] Probar en desarrollo
- [ ] Aplicar en staging
- [ ] Validar resultados

### Fase 3: APIs (PENDIENTE - Ver IMPL-20260202-02)
- [ ] Actualizar `/api/expedientes` para usar nuevos estados
- [ ] Actualizar `/api/expedientes/[id]/studies` para StudyStatus
- [ ] Agregar capa de compatibilidad para estados legacy
- [ ] Actualizar validaciones de transiciones de estado

### Fase 4: Frontend (PENDIENTE - Ver IMPL-20260202-03)
- [ ] Actualizar componentes que muestran estados
- [ ] Actualizar filtros y búsquedas
- [ ] Agregar nuevos indicadores visuales por estado

---

## 🚀 Próximos Pasos

**@SOFIA reporta:**
✅ Fase 1 completada exitosamente
- Esquemas actualizados en ambas ubicaciones
- Cliente Prisma generado sin errores
- Nuevos enums disponibles para uso

**Esperando aprobación de @INTEGRA para:**
1. Crear migración Prisma con scripts de transformación de datos
2. Proceder con Fase 2 (Actualización de APIs)

---

**Jefe, ¿desea que proceda con la creación de la migración de base de datos o prefiere revisar primero los cambios del esquema?**
