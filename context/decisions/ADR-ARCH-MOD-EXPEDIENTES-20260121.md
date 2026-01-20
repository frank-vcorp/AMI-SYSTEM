# ADR-ARCH-MOD-EXPEDIENTES-20260121: Arquitectura de MOD-EXPEDIENTES

*   **Estado:** Proposed
*   **Fecha:** 2026-01-21
*   **Autor:** Integra (AI Architect)

## Contexto

El sistema AMI requiere un módulo central para gestionar el ciclo de vida del proceso médico de un paciente, desde su llegada a la clínica hasta la generación de un dictamen. Este concepto se materializa en el "Expediente" (`Expedient`), que actúa como agregador de:
1.  Datos demográficos del paciente (snapshot o referencia).
2.  Examen médico físico (`MedicalExam`).
3.  Estudios auxiliares (`Studies`).
4.  Estado del flujo de validación.

Actualmente existen `MOD-CLINICAS` (lugares), `MOD-EMPRESAS` (clientes) y `MOD-CITAS` (origen). `MOD-EXPEDIENTES` debe orquestar la operación clínica diaria.

## Decisión

Se decide implementar `MOD-EXPEDIENTES` como un módulo backend aislado dentro del monorepo, siguiendo los siguientes principios arquitectónicos:

1.  **Patrón de Diseño:** Service Repository Pattern (similar a `MOD-CITAS`).
    *   `ExpedientService`: Encapsula la lógica de negocio y transiciones de estado.
    *   Uso directo de Prisma Client para acceso a datos.

2.  **Integración de Datos:**
    *   **Coupling a nivel de DB:** Relaciones foráneas directas (`appointmentId`, `patientId`, `clinicId`) en lugar de comunicación por eventos o HTTP interno, aprovechando que comparten la misma base de datos PostgreSQL.
    *   **Lectura de Referencias:** El módulo leerá datos de Pacientes y Empresas, pero no los modificará (responsabilidad de sus respectivos módulos).

3.  **Estrategia Multi-Tenant:**
    *   Aplicación estricta de filtros `where: { tenantId }` en todas las operaciones de lectura/escritura.
    *   El `tenantId` debe propagarse desde la sesión de usuario o la cita origen.

4.  **Almacenamiento de Archivos (Estudios):**
    *   Los metadatos se guardan en PostgreSQL (`Study` model).
    *   Los binarios residen en Object Storage (GCS/S3), referenciados por `fileKey`. El módulo es responsable de generar las URLs firmadas de subida/bajada mediante `packages/core-storage`.

## Alternativas Evaluadas

### 1. Microservicio Independiente
*   *Pros:* Desacoplamiento total.
*   *Contras:* Excesiva complejidad para el tamaño actual del equipo/fase. Requiere sincronización de datos de pacientes/citas.
*   *Veredicto:* Descartado por overhead operativo.

### 2. Extensión de MOD-CITAS
*   *Pros:* Simplicidad inicial (todo en un lugar).
*   *Contras:* Viola el principio de responsabilidad única. Un expediente es conceptualmente distinto a una cita (una cita es logística, un expediente es clínico/legal).
*   *Veredicto:* Descartado por coherencia de dominio.

## Consecuencias

*   **Positivas:**
    *   Clara separación de preocupaciones: Logística (`CITAS`) vs Clínica (`EXPEDIENTES`).
    *   Reutilización de infraestructura existente (Prisma, Auth).
    *   Facilita la auditoría clínica al tener una entidad dedicada.

*   **Negativas:**
    *   Aumenta la superficie de la API.
    *   Requiere coordinación cuidadosa en transacciones distribuidas (ej: actualizar estado de cita y crear expediente).

## Plan de Implementación Técnica

La implementación seguirá la estructura de paquetes:
`packages/mod-expedientes/`
  `src/`
    `api/` (Service)
    `types/` (Zod schemas & interfaces)
    `components/` (React UI components)

El servicio expondrá métodos tipados que serán consumidos por los Server Actions o API Routes de la aplicación principal (`web-app`).
