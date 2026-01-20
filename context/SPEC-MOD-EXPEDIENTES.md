# SPEC-MOD-EXPEDIENTES: Sistema de Gestión de Expedientes Médicos

**Versión:** 1.0
**Fecha:** 2026-01-21
**Estado:** Draft - Approved for Implementation
**Target:** FASE 1 - Demo 23 Enero

## 1. Resumen Ejecutivo
Este módulo gestiona el núcleo de la operación clínica: el `Expediente`. Es el contenedor de toda la información médica generada durante una visita. Actúa como el puente entre la logística de `MOD-CITAS` y la auditoría de `MOD-VALIDACION`.

## 2. Modelado de Datos (Prisma)

El esquema ya está definido en `prisma/schema.prisma`. Los modelos clave son:

*   **`Expedient`**: Entidad raíz.
    *   Relación 1:1 (opcional) con `Appointment`.
    *   Relacion N:1 con `Patient` y `Clinic`.
    *   Contiene `vitals` (JSON) y `medicalNotes`.
*   **`MedicalExam`**: Detalle del examen físico.
    *   Relación N:1 con `Expedient` (usualmente 1:1 en paráctica, pero flexible).
*   **`Study`**: Archivos y metadatos de estudios auxiliares.
    *   Tipos: `RADIOGRAFIA`, `LABORATORIO`, `ECG`, etc.

### Diagrama de Estados (ExpedientStatus)

1.  **`PENDING`**: Expediente creado (check-in), paciente en espera.
2.  **`IN_PROGRESS`**: Médico inicia captura de datos / signos vitales.
3.  **`STUDIES_PENDING`**: Examen físico completo, esperando carga de archivos (Rx, Lab).
4.  **`VALIDATED`**: Todos los datos y archivos completos. Listo para dictamen médico.
    *   *Nota:* Este estado dispara la cola de trabajo de `MOD-VALIDACION`.
5.  **`COMPLETED`**: Dictamen emitido y expediente cerrado.

## 3. Arquitectura del Servicio (Backend)

Ubicación: `packages/mod-expedientes/src/api/expedient.service.ts`

### Interface `ExpedientService`

```typescript
interface IExpedientService {
  /**
   * Crea un expediente a partir de una cita confirmada.
   * Valida tenant y estado de la cita.
   */
  createFromAppointment(
    tenantId: string, 
    appointmentId: string, 
    userId: string
  ): Promise<Expedient>;

  /**
   * Busca expediente por ID, asegurando aislamiento de tenant.
   * Incluye relaciones (Patient, Exam, Studies) si se solicita.
   */
  findById(
    tenantId: string, 
    expedientId: string
  ): Promise<ExpedientDetail>;

  /**
   * Actualiza signos vitales y notas iniciales.
   * Transición: PENDING -> IN_PROGRESS
   */
  updateVitals(
    tenantId: string, 
    expedientId: string, 
    vitals: VitalsData
  ): Promise<Expedient>;

  /**
   * Guarda o actualiza el examen médico.
   */
  saveMedicalExam(
    tenantId: string, 
    expedientId: string, 
    data: MedicalExamInput
  ): Promise<MedicalExam>;

  /**
   * Registra metadata de un estudio subido.
   * Transición automática sugerida hacia VALIDATED si se cumplen requisitos.
   */
  addStudy(
    tenantId: string, 
    expedientId: string, 
    studyData: StudyInput
  ): Promise<Study>;

  /**
   * Marca el expediente como listo para validación.
   * Validaciones: Debe tener examen físico y estudios mínimos requeridos (según perfil).
   */
  submitForValidation(
    tenantId: string, 
    expedientId: string
  ): Promise<Expedient>;
}
```

### Contrato de API (Next.js Routes / Server Actions)

Se expondrán endpoints RESTful para consumo del frontend:

*   `POST /api/expedients/check-in`: Crea expediente desde cita.
*   `GET /api/expedients/:id`: Obtiene detalle completo.
*   `PUT /api/expedients/:id/vitals`: Actualiza signos.
*   `POST /api/expedients/:id/exams`: Crea/Actualiza examen médico.
*   `POST /api/expedients/:id/studies`: Registra estudio subido.
*   `POST /api/expedients/:id/finalize`: Cierra fase de captura.

## 4. Especificación de Integración

### Flujo: Check-in (MOD-CITAS -> MOD-EXPEDIENTES)
1.  Recepcionista busca cita en Dashboard de Citas.
2.  Clic en "Iniciar Atención" (Check-in).
3.  **Backend Action**:
    *   Verifica `Appointment.status != CANCELLED`.
    *   Cambia `Appointment.status` a `IN_PROGRESS`.
    *   Llama `ExpedientService.createFromAppointment`.
    *   Crea registro en tabla `expedients` copiando `patientId`, `clinicId`.
    *   Genera `folio` único.
4.  Redirección a UI de Expediente (`/dashboard/medical/expedient/:id`).

### Multi-tenancy
*   Cada consulta a base de datos **DEBE** incluir `where: { tenantId: user.tenantId }`.
*   El `folio` debe ser único por Tenant (o global, según unicidad del campo db).

## 5. Timeline de Implementación

**Viernes 21 Enero: Core & Data Layer**
*   Scaffold del paquete `mod-expedientes`.
*   Definición de tipos Zod (`packages/mod-expedientes/src/types`).
*   Implementación de `ExpedientService` (CRUD básico + lógica de creación).
*   Tests unitarios del servicio.

**Sábado 22 Enero: API & Integración**
*   API Routes / Server Actions en `web-app`.
*   Integración con botón "Check-in" de `MOD-CITAS`.
*   Componente UI: `VitalsForm` y `MedicalExamForm`.

**Domingo 23 Enero: Estudios & Cierre**
*   Integración con `core-storage` para subida de estudios.
*   Componente UI: `StudiesUploader`.
*   Flujo de cierre (`submitForValidation`).
*   **Checkpoint**: Demo funcional "Check-in -> Captura -> Cierre".

## 6. Referencias UI inspiracionales
*   **Vitals**: Panel lateral derecho, siempre visible o colapsable.
*   **Examen Físico**: Formulario largo con secciones colapsables (Cabeza, Torax, Abdomen...).
*   **Estudios**: Grid de tarjetas mostrando miniaturas (si es imagen) o iconos (PDF), con estado de carga.
