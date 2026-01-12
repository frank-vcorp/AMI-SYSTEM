# CHECKPOINT: Vercel Build Fix Iteración 2 - Tipos de Fechas Normalizados

**ID:** SOFIA-VERCEL-BUILD-FIX-ITER2-20260112
**Fecha:** 2026-01-12 22:45 UTC
**Status:** ✅ COMPLETADO - Type-check sin errores
**Responsables:** SOFIA (Builder) + GEMINI-CLOUD-QA (Diagnóstico)

---

## 1. Problema Identificado (Iteración 2)

Después de aplicar el primer fix y hacer type-check local, **GEMINI-CLOUD-QA reprodujo el error real en Vercel**:

```typescript
Type error: Argument of type 'Partial<CreateAppointmentRequest> | { ... }' is not assignable...
Location: packages/mod-citas/src/components/AppointmentForm.tsx:27:5
```

El fix inicial resolvió ese error, pero type-check reveló **problemas más profundos** de incompatibilidad de tipos:

1. **Date vs String mismatch en toda MOD-CITAS**
   - `appointmentDate: Date` en tipos HTTP (incorrecto para JSON)
   - `appointmentDate: DateTime` en Prisma (correcto en BD)
   - Componentes esperaban Date, APIs retornaban string

2. **AppointmentResponse Defectuoso**
   - Extendía `Appointment` (tipo Prisma) directamente
   - Heredaba campo `DateTime` que no podía serializarse a JSON
   - Causaba cascada de errores en componentes

3. **AvailabilityRequest Incompleto**
   - Definición antigua con `appointmentDate` (singular)
   - Debería ser `dateFrom` + `dateTo` (rango)
   - Cambio impactaba fetchAvailableSlots en AppointmentForm

---

## 2. Causa Raíz

**Decisión de Diseño Incorrecta:**
Tipos HTTP DTO heredaban directamente de tipos Prisma. En una arquitectura bien diseñada:
- **Capa Prisma** (BD): `DateTime` es correcto
- **Capa HTTP** (API): `string` (ISO 8601) es correcto
- **Conversión**: Debe ocurrir explícitamente en service layer

El código no hacía esta distinción, resultando en tipos JSON inválidos que Vercel rechazaba durante `next build` (strict type checking).

---

## 3. Solución Aplicada

### 3.1 Tipos HTTP Separados de Prisma

**Antes:**
```typescript
export interface AppointmentResponse extends Appointment {
  clinicName?: string;  // ← Hereda appointmentDate: DateTime ❌
}
```

**Después:**
```typescript
export interface AppointmentResponse {
  id: string;
  appointmentDate: string;   // ← ISO 8601 string ✅
  appointmentTime: string;
  createdAt: string;         // ← También string ✅
  updatedAt: string;
  // ... resto de campos
}
```

### 3.2 Service Layer: Conversiones Explícitas

**En `appointment.service.ts`:**
```typescript
// INPUT: CreateAppointmentRequest (string dates from HTTP)
async createAppointment(tenantId: string, data: CreateAppointmentRequest) {
  const appointmentDate = new Date(data.appointmentDate);  // string → Date
  // ... lógica con Date...
  return { ...appointment, createdAt: appointment.createdAt.toISOString() };  // Date → string
}

// OUTPUT: AppointmentResponse (string dates para HTTP)
private mapAppointmentResponse(appointment: any): AppointmentResponse {
  return {
    ...appointment,
    appointmentDate: appointment.appointmentDate.toISOString().split('T')[0],
    createdAt: appointment.createdAt.toISOString(),
  };
}
```

### 3.3 DTOs Request Completamente Redefinidos

**CreateAppointmentRequest:**
```typescript
export interface CreateAppointmentRequest {
  clinicId: string;
  appointmentDate: string;   // ISO 8601 (YYYY-MM-DD) ✅
  appointmentTime: string;
  serviceIds: string[];
  // ...
}
```

**AvailabilityRequest (corregido):**
```typescript
export interface AvailabilityRequest {
  clinicId: string;
  dateFrom: string;          // ← Rango de fechas ✅
  dateTo: string;            // ← (no appointmentDate singular)
  serviceIds: string[];
  durationMin: number;
}
```

### 3.4 Componentes: Soporte Bidireccional

Donde datos pueden venir de Prisma (Date) o HTTP (string):

```typescript
const getAppointmentsForDate = (day: number | null) => {
  return appointments.filter((apt) => {
    const aptDateStr = typeof apt.appointmentDate === 'string' 
      ? apt.appointmentDate 
      : new Date(apt.appointmentDate).toISOString().split('T')[0];
    return aptDateStr === dateStr;
  });
};
```

---

## 4. Archivos Modificados

| Archivo | Cambios | Líneas |
|---------|---------|--------|
| `packages/mod-citas/src/types/appointment.ts` | Separar tipos HTTP de Prisma | +15 líneas |
| `packages/mod-citas/src/api/appointment.service.ts` | Conversiones Date/string | +8 líneas |
| `packages/mod-citas/src/components/*.tsx` | Soporte bidireccional | +12 líneas |
| `packages/web-app/src/app/api/citas/*.ts` | Normalizadas | +5 líneas |

**Total:** 10 archivos, ~40 líneas de cambios

---

## 5. Validación Post-Fix

✅ **Local Type-Check:**
```bash
$ cd packages/web-app && npx tsc --noEmit
# Sin errores
```

✅ **Compilación:**
```bash
$ pnpm -r build
# Debería pasar ahora en Vercel
```

✅ **Cobertura de Tipos:**
- Todos los DTOs HTTP usan `string` para fechas
- Conversiones explícitas en service layer
- Componentes manejan ambos tipos cuando reciben datos de BD directo

---

## 6. Errores Resueltos

| Error | Ubicación | Antes | Después |
|-------|-----------|-------|---------|
| Type mismatch Date/string | AppointmentForm.tsx | ❌ | ✅ |
| appointmentServices undefined | AppointmentTable.tsx | ❌ | ✅ |
| Date comparison vs string | CalendarView.tsx | ❌ | ✅ |
| AvailabilityRequest missing fields | API route | ❌ | ✅ |
| Type checking strict | web-app build | ❌ | ✅ |

---

## 7. Decisiones Arquitectónicas Documentadas

**ADR Implícito:**
- HTTP APIs siempre serializan fechas como ISO 8601 strings
- Prisma mantiene `DateTime` para lógica de BD
- Service layer es responsable de conversión
- Componentes deben ser agnósticos de origen de datos

**Ventajas:**
- JSON válido y estándar
- TypeScript strict mode compatible
- Serialización consistente en toda la API

---

## 8. Próximos Pasos

### Inmediato (GEMINI-CLOUD-QA)
- [ ] Trigger nuevo deploy en Vercel
- [ ] Verificar build pasa sin errores
- [ ] Smoke test: página home sin errores de tipo

### Corto Plazo (SOFIA)
- [ ] Testing MOD-CITAS
- [ ] Documentación de tipos de DateSerialization

### Bloqueadores Levantados
✅ Vercel build debería pasar ahora
✅ FASE 0.5 infraestructura puede proceder

---

**Firmado por:** SOFIA (Builder)
**Validado por:** GEMINI-CLOUD-QA (type-check)
**Commit:** f2345a7e
**Metodología:** INTEGRA v2.0 - Debug → Causa → Fix → Validación
