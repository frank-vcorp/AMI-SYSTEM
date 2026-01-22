# SPEC-MOD-CITAS (Appointments)

> **ID Documento:** `IMPL-20260121-02`  
> **Versión:** 1.0.0  
> **Última Actualización:** 2026-01-21  
> **Autor:** SOFIA (Builder Agent)  
> **Módulo:** `mod-citas`

---

## 1. Resumen Ejecutivo

El módulo de **Citas** gestiona la programación de exámenes ocupacionales. Es el evento desencadenante que genera un Expediente y vincula al trabajador con la clínica, el perfil de puesto y la batería de exámenes.

**Punto crítico:** Al agendar se genera automáticamente un **ID de Papeleta** (EXP-YYYYNNN) con **QR** que se envía vía WhatsApp como "pase de entrada".

---

## 2. Modelo de Datos

### 2.1 Modelo Principal: Appointment (Cita)

```prisma
// packages/core-database/prisma/schema.prisma

model Appointment {
  id              String   @id @default(uuid())
  tenantId        String
  
  // ═══════════════════════════════════════════════════════════
  // IDENTIFICACIÓN (única, generada al crear)
  // Formato: EXP-YYYYNNN (ej: EXP-202600001)
  // ═══════════════════════════════════════════════════════════
  expedientId     String   @unique  // ID de papeleta, generado automáticamente
  
  // ═══════════════════════════════════════════════════════════
  // RELACIONES PRINCIPALES
  // ═══════════════════════════════════════════════════════════
  patientId       String
  patient         Patient     @relation(fields: [patientId], references: [id])
  
  clinicId        String
  clinic          Clinic      @relation(fields: [clinicId], references: [id])
  
  jobProfileId    String
  jobProfile      JobProfile  @relation(fields: [jobProfileId], references: [id])
  
  companyId       String?
  company         Company?    @relation(fields: [companyId], references: [id])
  
  // ═══════════════════════════════════════════════════════════
  // PROGRAMACIÓN
  // ═══════════════════════════════════════════════════════════
  scheduledDate   DateTime            // Fecha/hora programada
  duration        Int                 // Duración en minutos
  
  // ═══════════════════════════════════════════════════════════
  // BATERÍA DE EXÁMENES
  // El jobProfile determina qué exámenes hacer
  // ═══════════════════════════════════════════════════════════
  examBatteries   String              // Referencia a batería (ej: "BASIC", "EXTENDED")
  
  // ═══════════════════════════════════════════════════════════
  // ESTADO DE LA CITA
  // ═══════════════════════════════════════════════════════════
  status          AppointmentStatus   @default(SCHEDULED)
  
  // ═══════════════════════════════════════════════════════════
  // DOCUMENTO GENERADO (QR + Pase)
  // ═══════════════════════════════════════════════════════════
  qrCode          String?             // Código QR codificado
  qrImageUrl      String?             // URL imagen del QR
  passUrl         String?             // URL del pase digital
  
  // ═══════════════════════════════════════════════════════════
  // DATOS DE LLEGADA
  // ═══════════════════════════════════════════════════════════
  arrivedAt       DateTime?           // Timestamp de llegada (CHECK_IN)
  noShowReason    String?             // Si no llegó, por qué
  
  // ═══════════════════════════════════════════════════════════
  // CANCELACIÓN / REAGENDAMIENTO
  // ═══════════════════════════════════════════════════════════
  cancelledAt     DateTime?
  cancellationReason  String?
  cancellationNotes   String?
  
  rescheduledFrom String?             // ID de cita anterior (si fue reagendada)
  rescheduledTo   String?             // ID de nueva cita (si fue reagendada)
  rescheduleReason    String?
  rescheduleNotes     String?
  
  // ═══════════════════════════════════════════════════════════
  // EXPEDIENTE GENERADO
  // Se crea cuando status = COMPLETED
  // ═══════════════════════════════════════════════════════════
  expedient       Expedient?
  
  // ═══════════════════════════════════════════════════════════
  // DATOS ADICIONALES
  // ═══════════════════════════════════════════════════════════
  notes           String?             // Notas del personal AMI
  createdBy       String              // Usuario que creó la cita
  confirmedAt     DateTime @default(now())  // Se confirma al momento
  
  // ═══════════════════════════════════════════════════════════
  // AUDIT TRAIL (para historial)
  // ═══════════════════════════════════════════════════════════
  auditTrail      Json                @default("[]")  // Array de cambios
  
  // ═══════════════════════════════════════════════════════════
  // NOTIFICACIONES
  // ═══════════════════════════════════════════════════════════
  whatsappSentAt  DateTime?           // Cuándo se envió el pase
  whatsappMessageId String?           // ID del mensaje WhatsApp
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([tenantId])
  @@index([expedientId])
  @@index([patientId])
  @@index([clinicId])
  @@index([scheduledDate])
  @@index([status])
  @@map("appointments")
}
```

### 2.2 Enums

```prisma
enum AppointmentStatus {
  SCHEDULED       // Agendada, confirmada
  ARRIVED         // Trabajador llegó (CHECK_IN)
  IN_PROGRESS     // En atención (médico está registrando)
  COMPLETED       // Terminada, Expedient generado
  NO_SHOW         // No llegó (without valid reason initially)
  CANCELLED       // Cancelada (por empresa o AMI)
  RESCHEDULED     // Reagendada a nueva fecha
}
```

### 2.3 Audit Trail Entry

```typescript
// packages/core-types/src/appointment-audit.types.ts

interface AppointmentAuditEntry {
  timestamp: string;          // ISO 8601
  action: AuditAction;        // Ver enum abajo
  changedBy: string;          // Usuario que hizo el cambio
  oldStatus?: AppointmentStatus;
  newStatus?: AppointmentStatus;
  reason?: string;            // Por qué cambió (cancelación, reagendamiento)
  details?: Record<string, any>;
}

type AuditAction = 
  | 'CREATED'
  | 'CONFIRMED'
  | 'CHECK_IN'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'NOTES_ADDED'
  | 'STATUS_CHANGED';
```

---

## 3. Generación del ID de Papeleta (Expedient ID) y QR

### 3.1 Formato del ID

```
EXP-YYYYNNN

Ej: EXP-202600001
    EXP-202600002
    
Resetea cada año (contador anual)
```

### 3.2 Implementación

```typescript
// packages/core/src/utils/generate-expedient-id.ts

/**
 * Genera el ID único de papeleta (expediente)
 * Formato: EXP-YYYYNNN
 * Reinicia contador cada año
 * 
 * @doc context/modules/SPEC-MOD-CITAS.md
 */
export async function generateExpedientId(
  prisma: PrismaClient,
  tenantId: string
): Promise<string> {
  const year = new Date().getFullYear();
  
  // Buscar el último expediente del año
  const lastExpedient = await prisma.appointment.findFirst({
    where: {
      tenantId,
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
    orderBy: { createdAt: 'desc' },
    select: { expedientId: true },
  });
  
  // Extraer número del último ID o empezar en 1
  let nextNumber = 1;
  if (lastExpedient && lastExpedient.expedientId) {
    const match = lastExpedient.expedientId.match(/EXP-(\d{4})(\d+)/);
    if (match) {
      nextNumber = parseInt(match[2]) + 1;
    }
  }
  
  const paddedNumber = String(nextNumber).padStart(5, '0');
  return `EXP-${year}${paddedNumber}`;
}

// Ejemplo:
// await generateExpedientId(prisma, tenantId)
// → "EXP-202600001"
```

### 3.3 Generación de QR

```typescript
// packages/core/src/utils/generate-qr.ts

import QRCode from 'qrcode';

interface QRData {
  expedientId: string;
  patientName: string;
  clinicName: string;
  scheduledDate: string;
  appointmentId: string;
}

/**
 * Genera código QR con datos de la cita
 * Formato QR: datos en JSON
 */
export async function generateAppointmentQR(data: QRData): Promise<{
  qrCode: string;           // String codificado en base64
  qrImageUrl: string;       // URL temporal o almacenada
}> {
  const qrContent = JSON.stringify(data);
  
  // Generar como PNG base64
  const qrCode = await QRCode.toDataURL(qrContent, {
    errorCorrectionLevel: 'H',
    width: 300,
    margin: 1,
  });
  
  return {
    qrCode,
    qrImageUrl: qrCode,  // En prod, guardar en Storage
  };
}
```

---

## 4. Flujo de Creación de Cita

```
┌─────────────────────────────────────────────────────────────┐
│ 1. PERSONAL AMI RECIBE LLAMADA/WHATSAPP                    │
│    "Quiero agendar examen para Roberto Caicero"            │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. BÚSQUEDA DE TRABAJADOR                                  │
│    ¿Existe en sistema?                                      │
└─────────────────────────────────────────────────────────────┘
          │
          ├─→ SÍ (ya tiene Patient) → Ir a paso 4
          │
          └─→ NO → Paso 3 (captura rápida)
                        ↓
        ┌─────────────────────────────────────────────────────┐
        │ 3. CAPTURA MÍNIMA Y CREAR PATIENT                  │
        │    - Nombre, Apellido Paterno                       │
        │    - Fecha Nac, Sexo                                │
        │    - Teléfono, Empresa                              │
        │    - Generar uniqueId automático                    │
        │    → Crear Patient en base de datos                 │
        └─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. SELECCIONAR DATOS DE CITA                               │
│    - Empresa (si no estaba)                                 │
│    - Puesto / JobProfile (la batería se liga aquí)         │
│    - Clínica disponible                                     │
│    - Fecha/Hora disponible (según ocupación)               │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. CALCULAR DURACIÓN                                        │
│    duration = jobProfile.estimatedDuration                 │
│    (ej: Operador CNC = 45 minutos)                         │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. GENERAR ID Y QR                                          │
│    - expedientId = await generateExpedientId()             │
│      → "EXP-202600001"                                      │
│    - qrCode = await generateAppointmentQR(...)             │
│      → Base64 image                                         │
│    - Generar "pase digital" (PDF/HTML)                     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. CREAR APPOINTMENT EN BD                                  │
│    - status = SCHEDULED (confirmado al momento)             │
│    - auditTrail = [{ action: CREATED, ... }]               │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. ENVIAR WHATSAPP                                          │
│    "Hola Roberto, tu cita está confirmada para:"            │
│    "Fecha: 25/01/2026 a las 09:00"                         │
│    "[QR IMAGE]"                                             │
│    "[Agregar a calendario ▶]"                              │
│    whatsappSentAt = now()                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Disponibilidad de Slots

### 5.1 Lógica de Ocupación

```typescript
// packages/mod-citas/src/services/appointment-availability.service.ts

interface ClinicSlot {
  clinicId: string;
  date: string;           // YYYY-MM-DD
  startTime: string;      // HH:mm
  endTime: string;        // HH:mm
  duration: number;       // minutos
  isAvailable: boolean;
  occupancyPercentage: number;  // 0-100
}

/**
 * Calcula slots disponibles en una clínica
 * Basado en ocupación actual (no en doctores)
 */
export async function getAvailableSlots(params: {
  clinicId: string;
  fromDate: Date;
  toDate: Date;
  requiredDuration: number;  // minutos que necesita la cita
  prisma: PrismaClient;
}): Promise<ClinicSlot[]> {
  const { clinicId, fromDate, toDate, requiredDuration, prisma } = params;
  
  // 1. Obtener horarios de operación de la clínica
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: {
      operatingHours: true,  // JSON: { monday: { start: "08:00", end: "17:00" } }
      maxDailyCapacity: true, // ej: 20 citas/día
    },
  });
  
  // 2. Iterar días entre fromDate y toDate
  const slots: ClinicSlot[] = [];
  for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = getDayName(d);
    const hours = clinic.operatingHours[dayOfWeek];
    
    if (!hours) continue;  // Clínica cerrada ese día
    
    // 3. Generar slots de 30 min en ese día
    const daySlots = generateDaySlots(hours, requiredDuration);
    
    // 4. Verificar cuáles están ocupados
    for (const slot of daySlots) {
      const conflictingAppointments = await prisma.appointment.count({
        where: {
          clinicId,
          status: { in: ['SCHEDULED', 'ARRIVED', 'IN_PROGRESS'] },
          scheduledDate: {
            gte: slot.startTime,
            lt: slot.endTime,
          },
        },
      });
      
      slot.isAvailable = conflictingAppointments === 0;
    }
    
    // 5. Calcular ocupación diaria
    const appointmentsThisDay = await prisma.appointment.count({
      where: {
        clinicId,
        status: { in: ['SCHEDULED', 'ARRIVED', 'IN_PROGRESS'] },
        scheduledDate: {
          gte: new Date(d.toDateString()),
          lt: new Date(new Date(d).setDate(d.getDate() + 1)),
        },
      },
    });
    
    for (const slot of daySlots) {
      const occupancy = (appointmentsThisDay / clinic.maxDailyCapacity) * 100;
      slot.occupancyPercentage = occupancy;
    }
    
    slots.push(...daySlots);
  }
  
  return slots;
}
```

### 5.2 Configuración de Clínica

```prisma
model Clinic {
  // ... otros campos
  
  // Capacidad y horarios
  maxDailyCapacity  Int  @default(20)  // Máx citas/día
  
  operatingHours    Json  // Horarios de funcionamiento
  // {
  //   "monday": { "start": "08:00", "end": "17:00" },
  //   "tuesday": { "start": "08:00", "end": "17:00" },
  //   ...
  //   "sunday": null  // Cerrada
  // }
  
  @@map("clinics")
}

model JobProfile {
  // ... otros campos
  
  estimatedDuration  Int  @default(45)  // Duración en minutos
  
  @@map("job_profiles")
}
```

---

## 6. Validaciones y Reglas de Negocio

### 6.1 Validaciones

```typescript
// packages/mod-citas/src/validators/appointment.validator.ts

const createAppointmentSchema = z.object({
  // Si es nuevo trabajador
  patientData: z.object({
    firstName: z.string().min(2),
    paternalLastName: z.string().min(2),
    birthDate: z.string(),
    gender: z.enum(['MALE', 'FEMALE']),
    phone: z.string().regex(/^\d{10}$/),
  }).optional(),
  
  // Si es trabajador existente
  patientId: z.string().uuid().optional(),
  
  // Datos obligatorios de cita
  companyId: z.string().uuid(),
  jobProfileId: z.string().uuid(),
  clinicId: z.string().uuid(),
  scheduledDate: z.string().datetime(),
  
  // Datos opcionales
  notes: z.string().max(500).optional(),
}).refine(
  (data) => data.patientData || data.patientId,
  { message: 'Debe proporcionar paciente existente o datos básicos' }
);
```

### 6.2 Reglas de Negocio

| Regla | Descripción |
|-------|-------------|
| **RN-001** | Un trabajador NO puede tener dos citas SCHEDULED/ARRIVED/IN_PROGRESS simultáneamente |
| **RN-002** | Una cita debe estar en slot disponible según ocupación de clínica |
| **RN-003** | La duración se calcula desde `jobProfile.estimatedDuration` |
| **RN-004** | El `expedientId` es único e inmutable (generado al crear) |
| **RN-005** | Al reagendar, la cita original CAMBIA status a RESCHEDULED, no se elimina |
| **RN-006** | Cancelación requiere motivo obligatorio |
| **RN-007** | El QR se genera al crear la cita, incluye expedientId + datos básicos |
| **RN-008** | WhatsApp se envía automáticamente al confirmar (status = SCHEDULED) |
| **RN-009** | NO_SHOW solo se marca en el día si no llegó (CHECK_IN fallido) |
| **RN-010** | Confirmación es automática al momento de agendar (no hay estado PENDING) |

---

## 7. API Endpoints

### 7.1 Gestión de Citas

```typescript
// POST /api/appointments
// Crear nueva cita
interface CreateAppointmentPayload {
  // Paciente: existente o nuevo
  patientId?: string;
  patientData?: {
    firstName: string;
    paternalLastName: string;
    birthDate: string;
    gender: 'MALE' | 'FEMALE';
    phone: string;
    companyId: string;  // Empresa donde trabajará
  };
  
  // Datos de cita
  companyId: string;
  jobProfileId: string;
  clinicId: string;
  scheduledDate: string;  // ISO 8601
  
  notes?: string;
  createdBy: string;  // Usuario AMI que agenda
}

// Response:
{
  id: string;
  expedientId: "EXP-202600001";
  status: "SCHEDULED";
  patientName: "Roberto Caicero";
  scheduledDate: "2026-01-25T09:00:00Z";
  qrCode: "data:image/png;base64,...";
  whatsappMessage: {
    status: "sent",
    sentAt: "2026-01-21T14:30:00Z"
  }
}

// ─────────────────────────────────────────────────────────

// GET /api/appointments/:id
// Detalle de cita con audit trail

// PUT /api/appointments/:id/check-in
// Registrar llegada del trabajador (CHECK_IN → ARRIVED)

// PUT /api/appointments/:id/complete
// Marcar como completada (genera Expedient)

// PUT /api/appointments/:id/cancel
interface CancelAppointmentPayload {
  reason: string;
  notes?: string;
}

// PUT /api/appointments/:id/reschedule
interface RescheduleAppointmentPayload {
  newScheduledDate: string;
  reason: string;
  notes?: string;
}

// GET /api/appointments/clinic/:clinicId/availability
// Slots disponibles (para elegir al agendar)
interface GetAvailabilityQuery {
  fromDate: string;  // ISO 8601
  toDate: string;
  jobProfileId: string;  // Para calcular duración
}
```

### 7.2 Búsqueda y Filtros

```typescript
// GET /api/appointments
interface GetAppointmentsQuery {
  page?: number;
  limit?: number;
  status?: AppointmentStatus;
  clinicId?: string;
  patientId?: string;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;  // Nombre paciente, expedientId
}
```

---

## 8. Wireframes UI

### 8.1 Pantalla de Agendamiento (Paso a Paso)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🏢 Clínica Norte                                    👤 Personal AMI    ⚙️    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📅 Agendar Cita Médica                                                     │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  [Paso 1: Trabajador] [Paso 2: Empresa] [Paso 3: Clínica] [Paso 4: Fecha]  │
│  ════════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  PASO 1: IDENTIFICAR TRABAJADOR                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  🔍 [Buscar trabajador...]                                                 │
│                                                                             │
│  Resultados:
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ✓ Roberto Caicero (CAB-R-19700221-M-AMI)     Teléfono: 4427042916  │   │
│  │   Empresa: PEMEX Monterrey                                          │   │
│  │                                                                       │   │
│  │   Juan Pérez (PEJ-19900305-M-AMI)            Teléfono: 4421234567  │   │
│  │   Empresa: CEMEX                                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ¿No lo encuentras? [Crear nuevo trabajador ▶]                             │
│                                                                             │
│                                     [Cancelar]  [Siguiente ▶]              │
└─────────────────────────────────────────────────────────────────────────────┘

Si selecciona "Crear nuevo":
│
├─ Se abre modal con captura rápida:
│  • Nombre, Apellido Paterno
│  • Fecha nacimiento, Sexo
│  • Teléfono, Empresa
│  [Crear y Continuar]
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PASO 2: SELECCIONAR PUESTO                                                 │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Trabajador: Roberto Caicero                                                │
│  Empresa: PEMEX Monterrey                                                   │
│                                                                             │
│  Puesto / Perfil *                                                          │
│  [Operador CNC (Duración: 45 min, Batería: EXTENDED) ▼]                    │
│                                                                             │
│  Información del Perfil:                                                    │
│  • Tipo: Técnico/Operativo                                                  │
│  • Duración estimada: 45 minutos                                            │
│  • Exámenes: Signos vitales, Agudeza visual, Laboratorio                    │
│                                                                             │
│                                     [◀ Anterior]  [Siguiente ▶]             │
└─────────────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PASO 3: SELECCIONAR CLÍNICA Y HORARIO                                      │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Clínica * [Clínica Monterrey             ▼]                               │
│                                                                             │
│  Disponibilidad:                                                            │
│  Ocupación: [████████░░] 80%                                                │
│  Capacidad máxima: 20 citas/día                                             │
│                                                                             │
│  Fecha *                                                                     │
│  [25/01/2026    📅]                                                         │
│                                                                             │
│  Horarios disponibles para 45 minutos:                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ☐ 08:00 - 08:45                                                     │   │
│  │ ☐ 08:45 - 09:30                                                     │   │
│  │ ☑ 09:30 - 10:15  ← Seleccionado                                     │   │
│  │ ☐ 10:15 - 11:00                                                     │   │
│  │ ☐ 14:00 - 14:45  (solo 3 disponibles hoy)                           │   │
│  │ ☐ 14:45 - 15:30                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                                     [◀ Anterior]  [Siguiente ▶]             │
└─────────────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PASO 4: CONFIRMACIÓN Y ENVÍO DE PASE                                       │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  📋 RESUMEN DE CITA                                                         │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Trabajador:    Roberto Caicero (CAB-R-19700221-M-AMI)                     │
│  Empresa:       PEMEX Monterrey                                             │
│  Puesto:        Operador CNC                                                │
│  Clínica:       Clínica Monterrey                                           │
│  Fecha/Hora:    25/01/2026 a las 09:30                                      │
│  Duración:      45 minutos                                                  │
│  ID Papeleta:   EXP-202600001  [QR CODE IMAGE]                              │
│  Teléfono:      4427042916                                                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Notas (opcional):                                                    │   │
│  │ [                                                                    │   │
│  │                                                                      │   │
│  │ ]                                                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [✓] Enviar pase por WhatsApp                                              │
│      "Hola Roberto, tu cita está confirmada para..."                       │
│                                                                             │
│                                     [◀ Anterior]  [Agendar ✓]               │
└─────────────────────────────────────────────────────────────────────────────┘

Al hacer click en [Agendar]:
├─ Genera expedientId: EXP-202600001
├─ Genera QR con datos
├─ Crea Appointment en BD
├─ status = SCHEDULED
├─ Envía WhatsApp
└─ Muestra confirmación:
   "✓ Cita agendada correctamente
    ID Papeleta: EXP-202600001
    WhatsApp enviado a 4427042916"
```

### 8.2 Pantalla de Citas del Día

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🏢 Clínica Monterrey                           👤 Dr. García      ⚙️        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📅 Citas de Hoy (25/01/2026)                                               │
│                                                                             │
│  🔍 [Buscar por nombre, ID papeleta...]      [Ocupación: 80% - 12/15]      │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Hora   │ ID Papeleta│ Trabajador       │ Puesto      │ Estado     │ Acc │
│  ├────────┼────────────┼──────────────────┼─────────────┼────────────┼─────┤   │
│  │ 09:00  │EXP-000001  │Roberto Caicero   │ Operador    │ 🟢 Llegó   │ ✓✗ │   │
│  │ 09:45  │EXP-000002  │Maria López       │ Administr.  │ ⚪ Pendiente│ ℹ✗  │   │
│  │ 10:30  │EXP-000003  │Juan Pérez        │ Técnico     │ 🔵 En curso│ ...│   │
│  │ 11:15  │EXP-000004  │Ana Martínez      │ Operador    │ ⚪ Pendiente│ ℹ✗  │   │
│  │ 14:00  │EXP-000005  │Carlos López      │ Admin       │ ⚪ Pendiente│ ℹ✗  │   │
│  │ 14:45  │EXP-000006  │Diana Ruiz        │ Técnico     │ ⚪ Pendiente│ ℹ✗  │   │
│  │ 15:30  │EXP-000007  │Roberto Santos    │ Operador    │ ⚪ Pendiente│ ℹ✗  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Leyenda: 🟢 Llegó  🔵 En atención  ⚫ Completada  ⚪ Pendiente  ❌ No llegó  │
│  Acciones: ✓=CHECK_IN/COMPLETE  ✗=CANCELAR  ℹ=DETALLES  ...=MÁS            │
│                                                                             │
│                                              [Crear nueva cita +]           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Audit Trail - Ejemplo

```json
{
  "auditTrail": [
    {
      "timestamp": "2026-01-21T14:30:00Z",
      "action": "CREATED",
      "changedBy": "usuario@ami.com",
      "newStatus": "SCHEDULED",
      "details": {
        "createdFrom": "phone_call",
        "clinicId": "clinic-123",
        "jobProfileId": "profile-456"
      }
    },
    {
      "timestamp": "2026-01-21T14:31:00Z",
      "action": "CONFIRMED",
      "changedBy": "sistema",
      "details": {
        "qrGenerated": "EXP-202600001",
        "whatsappSent": true
      }
    },
    {
      "timestamp": "2026-01-25T09:15:00Z",
      "action": "CHECK_IN",
      "changedBy": "recepcion@ami.com",
      "oldStatus": "SCHEDULED",
      "newStatus": "ARRIVED",
      "details": {
        "arrivedAt": "2026-01-25T09:15:00Z"
      }
    },
    {
      "timestamp": "2026-01-25T10:05:00Z",
      "action": "COMPLETED",
      "changedBy": "doctor@ami.com",
      "oldStatus": "ARRIVED",
      "newStatus": "COMPLETED",
      "details": {
        "expedientCreated": "exp-uuid-789",
        "findings": "Sin anomalías"
      }
    }
  ]
}
```

---

## 10. Casos de Prueba

### 10.1 Happy Path

| ID | Escenario | Pasos | Resultado |
|----|-----------|-------|-----------|
| TC-01 | Agendar cita nuevo paciente | Crear trabajador mínimo + seleccionar empresa, puesto, clínica, hora | Cita confirmada, QR generado, WhatsApp enviado |
| TC-02 | Agendar cita paciente existente | Buscar paciente + seleccionar empresa, puesto, clínica, hora | Cita confirmada, expedientId único |
| TC-03 | CHECK_IN llega a tiempo | Cita SCHEDULED → Trabajador llega → CHECK_IN | Status ARRIVED, timestamp registrado |
| TC-04 | Completar cita | Status ARRIVED → Doctor cierra → Complete | Expedient creado, status COMPLETED |

### 10.2 Edge Cases

| ID | Escenario | Pasos | Resultado |
|----|-----------|-------|-----------|
| TC-10 | Paciente con dos citas activas | Intenta agendar 2da cita mientras tiene SCHEDULED | Error: "Trabajador tiene cita activa" |
| TC-11 | No llega el trabajador | Cita SCHEDULED, no hace CHECK_IN en 2h después de hora | Admin marca como NO_SHOW con motivo |
| TC-12 | Cancelación sin motivo | Intenta cancelar cita sin proporcionar razón | Error: Motivo requerido |
| TC-13 | Reagendamiento | Cita SCHEDULED → Reagendar 1 semana después | Cita anterior RESCHEDULED, nueva cita SCHEDULED |
| TC-14 | Ocupación máxima | Clínica llena (20 citas) para ese día | No ofrece slots ese día en disponibilidad |

---

## 11. Checklist de Implementación

### 11.1 MVP (Demo 23-Ene-2026)

- [ ] **Modelo Prisma**
  - [ ] Modelo Appointment
  - [ ] Enum AppointmentStatus
  - [ ] Relaciones con Patient, Clinic, JobProfile, Company
  - [ ] Campo auditTrail (Json)
  - [ ] Migración de BD

- [ ] **Generador de IDs**
  - [ ] Función `generateExpedientId()`
  - [ ] Función `generateAppointmentQR()`
  - [ ] Tests unitarios

- [ ] **Disponibilidad**
  - [ ] Función `getAvailableSlots()`
  - [ ] Configuración operatingHours en Clinic
  - [ ] Cálculo ocupación por clínica

- [ ] **APIs**
  - [ ] `POST /api/appointments` (crear)
  - [ ] `GET /api/appointments/:id`
  - [ ] `GET /api/appointments/clinic/:clinicId/availability`
  - [ ] `PUT /api/appointments/:id/check-in`
  - [ ] `PUT /api/appointments/:id/cancel`
  - [ ] `PUT /api/appointments/:id/reschedule`

- [ ] **UI**
  - [ ] Flujo de agendamiento (4 pasos)
  - [ ] Pantalla de citas del día
  - [ ] Búsqueda y filtros

- [ ] **Integraciones**
  - [ ] Crear Patient mínimo si no existe
  - [ ] Generar QR y enviar WhatsApp (mock)

### 11.2 Post-MVP

- [ ] WhatsApp real integration
- [ ] Google Calendar / iOS integration
- [ ] Notificaciones automáticas
- [ ] Reportes de ocupación
- [ ] Self-service (app mobile)

---

## 12. Notas de Implementación

### 12.1 WhatsApp Message

```
Hola Roberto 👋

Tu cita está confirmada ✓

📋 ID Papeleta: EXP-202600001
📅 Fecha: 25 de enero de 2026
⏰ Hora: 09:30
🏥 Clínica: Clínica Monterrey
📍 Dirección: Calle Principal #123

[QR CODE]

Asegúrate de presentar este pase en la recepción.

[Agregar a Google Calendar]
[Agregar a Calendario iPhone]
```

### 12.2 Configuración Inicial de Clínicas

```sql
UPDATE clinics 
SET 
  maxDailyCapacity = 20,
  operatingHours = '{
    "monday": {"start": "08:00", "end": "17:00"},
    "tuesday": {"start": "08:00", "end": "17:00"},
    "wednesday": {"start": "08:00", "end": "17:00"},
    "thursday": {"start": "08:00", "end": "17:00"},
    "friday": {"start": "08:00", "end": "17:00"},
    "saturday": null,
    "sunday": null
  }'
WHERE tenantId = '550e8400-e29b-41d4-a716-446655440000';
```

---

## Historial de Cambios

| Fecha | Versión | Cambios | Autor |
|-------|---------|---------|-------|
| 2026-01-21 | 1.0.0 | Creación inicial del documento | SOFIA |

---

> **Documento de respaldo:** `context/modules/SPEC-MOD-CITAS.md`  
> **ID de Intervención:** `IMPL-20260121-02`
