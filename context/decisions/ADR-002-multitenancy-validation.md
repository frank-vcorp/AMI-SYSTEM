# ADR-002: Validación Explícita de tenantId en Métodos de Servicio

**Estado:** ACEPTADO
**Fecha:** 2026-01-12
**Decisor:** GEMINI-CLOUD-QA (validación), INTEGRA (aprobación arquitectura)

## Problema

En ClinicService.upsertSchedule(), la firma original no recibía `tenantId` como parámetro. Esto crea riesgo de:
- Violación de aislamiento multi-tenant si clinicId es adivinable
- Impossibilidad de auditar acceso cross-tenant
- Inconsistencia con métodos como createClinic(tenantId, data)

## Decisión

Todos los métodos públicos de ClinicService deben recibir `tenantId: string` como **primer parámetro** después de `this`, y validar que la entidad a operar pertenece a ese tenant.

```typescript
async createClinic(tenantId: string, data: CreateClinicRequest): Promise<Clinic>
async getClinic(tenantId: string, clinicId: string): Promise<Clinic>
async upsertSchedule(tenantId: string, data: CreateScheduleRequest): Promise<ClinicSchedule>
```

## Justificación

1. **Seguridad:** Previene acceso cross-tenant por guessing de IDs
2. **Auditoría:** Cada operación registra qué tenant la ejecutó
3. **Escalabilidad:** Preparado para RBAC/permisos granulares
4. **Consistencia:** Patrón único en todo el codebase

## Consecuencias

- (+) Imposible acceder data de otro tenant accidentalmente
- (+) Código más seguro y testeable
- (-) Todos los callers deben pasar tenantId (origen: sesión/JWT)
- (-) Validación extra en cada método (costo CPU negligible)

## Referencias

- SPEC-CODIGO.md - Multi-tenancy
- Prisma docs - Multi-tenant best practices
- OWASP - Broken Access Control
