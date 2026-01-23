# 🔍 AUDITORÍA DE CAMPOS Y CONSISTENCIA DE MÓDULOS
## AMI-SYSTEM - Enero 23, 2026

---

## 1. MAPEO DE CAMPOS POR MÓDULO

### 1.1 MOD-CLÍNICAS

**Modelo: Clinic**
```typescript
✅ id                    (CUID - OK)
✅ tenantId              (UUID - Consistente con otros módulos)
✅ name                  (VarChar 255)
✅ description           (Text, nullable)
✅ address               (VarChar 255)
✅ city                  (VarChar 100)
✅ state                 (VarChar 100)
✅ zipCode               (VarChar 10)
✅ phoneNumber           (VarChar 20, nullable)
✅ email                 (VarChar 255, nullable)
✅ totalBeds             (Int)
✅ availableBeds         (Int)
✅ isHeadquarters        (Boolean)
✅ status                (enum ClinicStatus)
✅ createdAt             (DateTime)
✅ updatedAt             (DateTime)
```

**Relaciones:**
- `schedules[]` → ClinicSchedule
- `services[]` → ClinicService
- `appointments[]` → Appointment
- `expedients[]` → Expedient
- `doctors[]` → Doctor

**Completitud:** ✅ **COMPLETA - Todos los campos especificados**

---

**Modelo: ClinicSchedule**
```typescript
✅ id                    (CUID)
✅ clinicId              (FK to Clinic)
✅ dayOfWeek             (SmallInt 0-6)
✅ openingTime           (HH:MM format)
✅ closingTime           (HH:MM format)
✅ lunchStart            (HH:MM, nullable)
✅ lunchEnd              (HH:MM, nullable)
✅ isOpen                (Boolean)
✅ maxAppointmentsDay    (Int)
✅ createdAt             (DateTime)
✅ updatedAt             (DateTime)
```

**Completitud:** ✅ **COMPLETA - Cubre horarios y disponibilidad**

---

**Modelo: ClinicService**
```typescript
✅ id                    (CUID)
✅ clinicId              (FK)
✅ serviceId             (FK)
✅ isAvailable           (Boolean)
✅ estimatedDays         (Int, nullable)
✅ price                 (Float, nullable)
✅ createdAt             (DateTime)
✅ updatedAt             (DateTime)
```

**Completitud:** ✅ **COMPLETA - Vinculación de servicios a clínicas**

---

**Modelo: Doctor**
```typescript
✅ id                    (CUID)
✅ tenantId              (UUID - Consistente)
✅ clinicId              (FK to Clinic)
✅ name                  (VarChar 255)
✅ cedula                (VarChar 20 - Unique per tenant)
✅ specialty             (VarChar 100)
✅ signature             (Json, nullable)
✅ createdAt             (DateTime)
✅ updatedAt             (DateTime)
```

**Completitud:** ✅ **COMPLETA - Médicos con cédula y firma**

**Nota Especial:** Campo `signature` en JSON - ¿DEBERÍA USAR ValidationTask.signedBy EN LUGAR?

⚠️ **INCONSISTENCIA DETECTADA:**
- Doctor tiene `signature` (Json)
- ValidationTask tiene `signedBy` (String UUID)
- Falta normalización: ¿guardar firma en Doctor o en ValidationTask?

---

### 1.2 MOD-SERVICIOS

**Modelo: Service**
```typescript
✅ id                    (CUID)
✅ tenantId              (UUID - Consistente)
✅ code                  (VarChar 50 - Unique per tenant)
✅ name                  (VarChar 255)
✅ description           (Text, nullable)
✅ category              (enum ServiceCategory)
✅ estimatedMinutes      (Int)
✅ requiresEquipment     (Boolean)
✅ equipmentName         (VarChar 255, nullable)
✅ costAmount            (Float - Costo base)
✅ sellingPrice          (Float, nullable - Precio venta)
✅ status                (enum ServiceStatus)
✅ createdAt             (DateTime)
✅ updatedAt             (DateTime)
✅ createdBy             (UUID, nullable)
✅ updatedBy             (UUID, nullable)
```

**Relaciones:**
- `batteries[]` → BatteryService
- `clinics[]` → ClinicService

**Completitud:** ✅ **COMPLETA - Incluye audit fields (createdBy, updatedBy)**

---

**Modelo: Battery**
```typescript
✅ id                    (CUID)
✅ tenantId              (UUID - Consistente)
✅ name                  (VarChar 255)
✅ description           (Text, nullable)
✅ costTotal             (Float - Total costo)
✅ sellingPriceTotal     (Float, nullable)
✅ estimatedMinutes      (Int)
✅ status                (enum BatteryStatus)
✅ createdAt             (DateTime)
✅ updatedAt             (DateTime)
✅ createdBy             (UUID, nullable)
✅ updatedBy             (UUID, nullable)
```

**Relaciones:**
- `services[]` → BatteryService
- `contractedBatteries[]` → CompanyBattery

**Completitud:** ✅ **COMPLETA - Agrupación de servicios**

---

**Modelo: BatteryService**
```typescript
✅ id                    (CUID)
✅ batteryId             (FK)
✅ serviceId             (FK)
✅ order                 (Int - Orden en batería)
✅ costOverride          (Float, nullable)
✅ estimatedMinutesOverride (Int, nullable)
✅ createdAt             (DateTime)
✅ updatedAt             (DateTime)
```

**Completitud:** ✅ **COMPLETA - Permite personalizar por batería**

---

### 1.3 MOD-EMPRESAS

**Modelo: Company**
```typescript
✅ id                    (CUID)
✅ tenantId              (UUID - Consistente)
✅ name                  (VarChar 255)
✅ rfc                   (VarChar 13 - Globally unique ⚠️)
✅ description           (Text, nullable)
✅ address               (VarChar 255, nullable)
✅ city                  (VarChar 100, nullable)
✅ state                 (VarChar 100, nullable)
✅ zipCode               (VarChar 10, nullable)
✅ phoneNumber           (VarChar 20, nullable)
✅ email                 (VarChar 255, nullable)
✅ contactPerson         (VarChar 255, nullable)
✅ contactPhone          (VarChar 20, nullable)
✅ isHeadquarters        (Boolean)
✅ maxEmployees          (Int)
✅ status                (enum CompanyStatus)
✅ createdAt             (DateTime)
✅ updatedAt             (DateTime)
✅ createdBy             (UUID, nullable)
✅ updatedBy             (UUID, nullable)
```

**Relaciones:**
- `batteries[]` → CompanyBattery
- `jobProfiles[]` → JobProfile
- `patients[]` → Patient

**Completitud:** ✅ **COMPLETA - Incluye contactos y auditoría**

⚠️ **INCONSISTENCIA DETECTADA:**
- Clinic: usa `phoneNumber`, `email`
- Company: también usa `phoneNumber`, `email`
- PERO Company tiene `contactPerson` y `contactPhone` adicionales
- ¿DEBERÍA normalizarse?: ¿contact vs phone? Nombres no coinciden perfectamente

---

**Modelo: CompanyBattery**
```typescript
✅ id                    (CUID)
✅ companyId             (FK)
✅ batteryId             (FK)
✅ contractDate          (DateTime)
✅ validFrom             (DateTime)
✅ validUntil            (DateTime, nullable)
✅ isActive              (Boolean)
✅ createdAt             (DateTime)
✅ updatedAt             (DateTime)
```

**Completitud:** ✅ **COMPLETA - Contratos de baterías con validez temporal**

---

**Modelo: JobProfile**
```typescript
✅ id                    (CUID)
✅ tenantId              (UUID - Consistente)
✅ companyId             (FK)
✅ name                  (VarChar 255)
✅ description           (Text, nullable)
✅ riskLevel             (enum RiskLevel)
✅ requiredBatteryIds    (String[] - JSON array)
✅ createdAt             (DateTime)
✅ updatedAt             (DateTime)
✅ createdBy             (UUID, nullable)
✅ updatedBy             (UUID, nullable)
```

**Completitud:** ✅ **COMPLETA - Define qué baterías por rol**

---

### 1.4 MOD-CITAS

**Modelo: Appointment**
```typescript
✅ id                    (CUID)
✅ tenantId              (UUID - Consistente)
✅ clinicId              (FK)
✅ companyId             (FK, nullable - ¿DEBERÍA SER REQUIRED?)
✅ employeeId            (FK to Patient?, nullable - ¿INCONSISTENCIA?)
✅ appointmentDate       (DateTime)
✅ time                  (VarChar 5 - HH:MM)
✅ status                (enum AppointmentStatus)
✅ notes                 (Text, nullable)
✅ createdAt             (DateTime)
✅ updatedAt             (DateTime)
```

**Relaciones:**
- `clinic` → Clinic (required)
- `expedients[]` → Expedient

**Completitud:** 🟡 **INCOMPLETO/INCONSISTENTE**

⚠️ **PROBLEMAS GRAVES:**

1. **employeeId sin relación definida:**
   - ¿Referencia a `Patient.id`?
   - ¿Referencia a un modelo `Employee` que no existe?
   - DEBERÍA ser:
     ```typescript
     employeeId        String  // FK to Patient
     patient           Patient @relation(fields: [employeeId], references: [id])
     ```

2. **companyId puede ser NULL:**
   - ¿Qué pasa si una cita no tiene empresa?
   - DEBERÍA ser required o tener lógica clara de cuándo es NULL

3. **Falta campo para identificar paciente:**
   - Appointment tiene `employeeId` vago
   - Expedient tiene `patientId` claro
   - Falta normalización: usar `patientId` en ambos

4. **No hay generación de folio (APT-XXXXXX):**
   - Especificación dice debe generarse
   - Schema NO tiene campo `displayId` o similar

---

### 1.5 MOD-EXPEDIENTES

**Modelo: Expedient**
```typescript
✅ id                    (CUID)
✅ tenantId              (UUID - Consistente)
✅ appointmentId         (FK, nullable - ¿Debería ser required?)
✅ patientId             (FK - Consistente nombre)
✅ clinicId              (FK)
✅ folio                 (VarChar - Unique, generado EXP-YYYYMMDD-NNNN)
✅ status                (enum ExpedientStatus)
✅ vitals                (Json, nullable)
✅ medicalNotes          (Text, nullable)
✅ createdAt             (DateTime)
✅ updatedAt             (DateTime)
```

**Relaciones:**
- `appointment` → Appointment (nullable)
- `patient` → Patient
- `clinic` → Clinic
- `studies[]` → Study
- `medicalExams[]` → MedicalExam
- `validationTask` → ValidationTask

**Completitud:** ✅ **CASI COMPLETO - Faltan algunas secciones de formulario**

⚠️ **CAMPOS FALTANTES vs. SPEC:**

Especificación dice expediente debe tener:
- ✅ Signos vitales (capturado en `vitals` JSON)
- ✅ Datos demográficos (referencia a Patient)
- ✅ Examen físico (en `medicalExams.physicalExam`)
- ✅ Agudeza visual (FALTA - debería estar en MedicalExam)
- ✅ Antecedentes (FALTA - no hay modelo AllergiesHistory, SurgeryHistory)
- ✅ Aptitud laboral (en ValidationTask, no aquí)

⚠️ **RECOMENDACIÓN:** Expandir MedicalExam:
```typescript
model MedicalExam {
  // ... campos actuales ...
  
  // FALTA: Agudeza Visual
  leftEyeAcuity        Float?
  rightEyeAcuity       Float?
  colorBlindnessTest   Boolean?
  
  // FALTA: Antecedentes
  surgeries            Json?        // [{date, description}]
  medications          Json?        // [{name, dosage}]
  allergies            Json?        // [{name, severity}]
  
  // FALTA: Aptitud
  restrictions         String[]?
  recommendations      String[]?
}
```

---

**Modelo: Patient**
```typescript
✅ id                    (CUID)
✅ tenantId              (UUID - Consistente)
✅ name                  (VarChar 255 - Nombre completo)
✅ documentType          (String - DNI, Pasaporte, etc)
✅ documentNumber        (String)
✅ dateOfBirth           (DateTime)
✅ gender                (String - M/F/O)
✅ phoneNumber           (VarChar 20, nullable)
✅ email                 (VarChar 255, nullable)
✅ address               (Text, nullable)
✅ city                  (VarChar 100, nullable)
✅ state                 (VarChar 100, nullable)
✅ zipCode               (VarChar 10, nullable)
✅ companyId             (FK, nullable - Empleador actual)
✅ status                (enum PatientStatus)
✅ createdAt             (DateTime)
✅ updatedAt             (DateTime)
```

**Relaciones:**
- `company` → Company
- `expedients[]` → Expedient

**Completitud:** ✅ **COMPLETA - Datos personales y de contacto**

---

**Modelo: Study**
```typescript
✅ id                    (CUID)
✅ expedientId           (FK)
✅ fileKey               (String - GCS storage key)
✅ fileName              (String)
✅ studyType             (enum StudyType)
✅ uploadedAt            (DateTime)
✅ fileSize              (Int, nullable - Bytes)
✅ mimeType              (String, nullable)
✅ createdAt             (DateTime)
```

**Completitud:** ✅ **COMPLETA - Gestión de archivos médicos**

**Nota:** Falta `fileUrl` o método para generar URLs firmadas

---

**Modelo: MedicalExam**
```typescript
✅ id                    (CUID)
✅ expedientId           (FK)
✅ bloodPressure         (String - SYS/DIA format)
✅ heartRate             (Int - bpm)
✅ respiratoryRate       (Int - breaths/min)
✅ temperature           (Float - Celsius)
✅ weight                (Float - kg)
✅ height                (Int - cm)
✅ physicalExam          (Text - Notas de examen físico)
✅ notes                 (Text)
✅ createdAt             (DateTime)
✅ updatedAt             (DateTime)
```

**Completitud:** 🟡 **INCOMPLETO - Falta agudeza visual y antecedentes**

Campos faltantes (vs. SPEC-MOD-EXPEDIENTES):
- ❌ `leftEyeAcuity`, `rightEyeAcuity`, `colorBlindness`
- ❌ `surgicalHistory`, `medications`, `allergies`
- ❌ `imc` (Índice de Masa Corporal - puede calcularse de height/weight)
- ❌ `aptitudeVerdict`, `restrictions`, `recommendations`

---

### 1.6 MOD-VALIDACIÓN

**Modelo: ValidationTask**
```typescript
✅ id                    (CUID)
✅ tenantId              (UUID - Consistente)
✅ expedientId           (FK - Unique, 1:1 con Expedient)
✅ patientId             (FK - ¿REDUNDANTE? ya en Expedient)
✅ clinicId              (FK - ¿REDUNDANTE? ya en Expedient)
✅ status                (enum ValidationStatus)
✅ studies               (Json - Array de estudios con estado)
✅ extractedData         (Json - Datos extraídos por IA)
✅ medicalOpinion        (Text)
✅ verdict               (enum Verdict: APTO/APTO_CON_RESTRICCIONES/NO_APTO)
✅ restrictions          (String[] - Restricciones laborales)
✅ recommendations       (String[] - Recomendaciones)
✅ signedAt              (DateTime, nullable)
✅ signedBy              (UUID, nullable - UID del médico)
✅ validatedBy           (UUID, nullable - UID del validador)
✅ createdAt             (DateTime)
✅ updatedAt             (DateTime)
```

**Completitud:** ✅ **COMPLETA - Incluye validación, firma y veredicto**

⚠️ **REDUNDANCIA DETECTADA:**
- ValidationTask tiene `patientId` y `clinicId`
- Pero se pueden obtener desde ValidationTask → Expedient → Patient/Clinic
- Pero es OK por performance (evita JOIN)
- RECOMENDACIÓN: Mantener pero asegurar consistency

---

## 2. ANÁLISIS DE CONSISTENCIA CROSS-MÓDULO

### 2.1 Nombres de Campos Inconsistentes

| Campo | Ubicación | Nombre Usado | Recomendación |
|-------|-----------|--------------|---------------|
| Identificador principal | Todo | `id` | ✅ Consistente |
| Tenant | Todo | `tenantId` | ✅ Consistente |
| Fecha creación | Todo | `createdAt` | ✅ Consistente |
| Fecha actualización | Todo | `updatedAt` | ✅ Consistente |
| **Número de teléfono** | Clinic, Company, Patient | `phoneNumber` | ✅ Consistente |
| **Email** | Clinic, Company, Patient | `email` | ✅ Consistente |
| **Dirección** | Clinic, Company, Patient | `address` | ✅ Consistente |
| **Ciudad** | Clinic, Company, Patient | `city` | ✅ Consistente |
| **Estado/Provincia** | Clinic, Company, Patient | `state` | ✅ Consistente |
| **Código postal** | Clinic, Company, Patient | `zipCode` | ✅ Consistente |
| **ID Paciente** | Appointment (FALTA), Expedient | `patientId` vs `employeeId` | ⚠️ INCONSISTENCIA |
| **ID Clínica** | Appointment, Expedient, ValidationTask | `clinicId` | ✅ Consistente |
| **ID Empresa** | Appointment, Patient, Company | `companyId` | ✅ Consistente |

---

### 2.2 Estados (Enums) - Consistencia

| Entidad | Estados | ¿Consistentes? |
|---------|---------|---|
| Clinic | ACTIVE, INACTIVE, ARCHIVED | ✅ OK |
| Service | ACTIVE, INACTIVE, DEPRECATED, ARCHIVED | ✅ OK (más opciones) |
| Battery | ACTIVE, INACTIVE, ARCHIVED | ✅ OK |
| Company | ACTIVE, INACTIVE, SUSPENDED, ARCHIVED | ✅ OK |
| Appointment | PENDING, SCHEDULED, CONFIRMED, CHECK_IN, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW | ✅ OK |
| Expedient | PENDING, IN_PROGRESS, STUDIES_PENDING, VALIDATED, COMPLETED, ARCHIVED | ✅ OK |
| Patient | ACTIVE, INACTIVE, ARCHIVED | ✅ OK |
| ValidationTask | PENDING, IN_REVIEW, COMPLETED, SIGNED, REJECTED | ✅ OK |
| Verdict | APTO, APTO_CON_RESTRICCIONES, NO_APTO | ✅ OK |

**Conclusión:** ✅ Enums bien definidos, sin conflictos

---

### 2.3 Relaciones Críticas Faltantes

#### Problema 1: Appointment.employeeId sin relación explícita
```typescript
// ACTUAL (INCORRECTO):
model Appointment {
  employeeId   String?  // FK implícito a Patient.id ❌ NO DECLARADO
}

// DEBERÍA SER:
model Appointment {
  patientId    String
  patient      Patient @relation(fields: [patientId], references: [id])
}
```

#### Problema 2: ValidationTask.signedBy sin relación a Doctor
```typescript
// ACTUAL (INCOMPLETO):
model ValidationTask {
  signedBy     String?  @db.Uuid  // ¿Quién? ¿Un Doctor? ¿Un User?
}

// DEBERÍA SER:
model ValidationTask {
  signedBy     String?
  signedByDoctor Doctor? @relation(fields: [signedBy], references: [id])
}
```

#### Problema 3: Doctor.signature debería estar en ValidationTask
```typescript
// ACTUAL (CONFUSO):
model Doctor {
  signature    Json?  // ¿Cuál es la firma? ¿La del doctor en general?
}

// DEBERÍA SER:
model ValidationTask {
  signature    Json?  // Firma específica para este validación
}
```

---

### 2.4 Validación de Unicidad

| Campo | Modelo | Unique? | Multi-Tenant Safe? | ✓/✗ |
|-------|--------|---------|-------------------|-----|
| `name` | Clinic | Sí (per tenant) | ✅ | ✓ |
| `code` | Service | Sí (per tenant) | ✅ | ✓ |
| `rfc` | Company | Sí (GLOBAL!) | ❌ **INSEGURO** | ✗ |
| `name` | Company | Sí (per tenant) | ✅ | ✓ |
| `folio` | Expedient | Sí (GLOBAL) | ❌ **INSEGURO** | ✗ |
| `name` | Battery | Sí (per tenant) | ✅ | ✓ |
| `name` | JobProfile | Sí (per tenant) | ✅ | ✓ |
| `documentNumber` | Patient | Sí (per tenant) | ✅ | ✓ |
| `cedula` | Doctor | Sí (per tenant) | ✅ | ✓ |

⚠️ **PROBLEMAS GRAVES:**
1. **Company.rfc** es globalmente único - ¿qué pasa si dos tenants usan el mismo RFC? (Imposible en México, pero vulnerable)
2. **Expedient.folio** es globalmente único - ¿qué pasa con 2 tenants? Debería incluir tenantId

---

## 3. CAMPOS QUE FALTAN (vs. Especificaciones)

### 3.1 MOD-CITAS - FALTA

```typescript
// Especificado pero NO en schema:
- ❌ displayId (APT-XXXXXX)       // ← CRÍTICO para UI
- ❌ qrCode                        // ← Papeleta física
- ❌ qrImageUrl                    // ← URL del QR
- ❌ passUrl                       // ← Pase digital
- ❌ arrivedAt                     // ← Timestamp CHECK_IN real
- ❌ noShowReason                  // ← Causa si no llegó
- ❌ appointmentDuration           // ← Minutos agendados
- ❌ examBatteryIds                // ← ¿Qué se va a hacer?
```

**Impacto:** 🔴 CRÍTICO
- Sin `displayId`, la UI muestra IDs CUID largos en lugar de "APT-123456"
- Sin duración, no hay validación de disponibilidad correcta

---

### 3.2 MOD-EXPEDIENTES - FALTA

```typescript
model MedicalExam (INCOMPLETE):
- ❌ leftEyeAcuity       // Visión OD
- ❌ rightEyeAcuity      // Visión OI
- ❌ colorBlindnessTest  // Daltonismo
- ❌ imc                 // Índice masa corporal (calculable)

model Expedient (INCOMPLETE):
- ❌ demographics        // Edad, género, tipo sangre (debería estar)
- ❌ surgeryHistory      // Antecedentes quirúrgicos
- ❌ medicationHistory   // Medicamentos actuales
- ❌ allergies           // Alergias
- ❌ restrictions        // Restricciones laborales
- ❌ recommendations     // Recomendaciones médicas
```

**Impacto:** 🟡 ALTO
- Especificación dice 6 secciones, faltan 2-3

---

### 3.3 MOD-VALIDACIÓN - FALTA

```typescript
model ValidationTask (INCOMPLETE):
- ❌ signatureImage      // Base64 o URL de firma
- ❌ signatureTimestamp  // Hora exacta de firma
- ❌ extractionConfidence // % de confianza en IA
- ❌ requiresReview      // Flag si necesita revisión adicional
```

**Impacto:** 🟠 MEDIA
- Sin signatureImage, ¿cómo se guarda la firma?

---

## 4. MATRIZ DE COMPLETITUD FINAL

| Módulo | Modelo | Campos | Completo | Observación |
|--------|--------|--------|----------|------------|
| MOD-CLINICAS | Clinic | 15/15 | ✅ | OK |
| | ClinicSchedule | 11/11 | ✅ | OK |
| | ClinicService | 8/8 | ✅ | OK |
| | Doctor | 8/8 | ✅ | Firma debería estar en ValidationTask |
| MOD-SERVICIOS | Service | 14/14 | ✅ | OK |
| | Battery | 11/11 | ✅ | OK |
| | BatteryService | 8/8 | ✅ | OK |
| MOD-EMPRESAS | Company | 21/21 | ✅ | OK |
| | CompanyBattery | 8/8 | ✅ | OK |
| | JobProfile | 10/10 | ✅ | OK |
| MOD-CITAS | Appointment | 12/20 | 🟡 60% | FALTA displayId, duración, folio, QR |
| MOD-EXPEDIENTES | Expedient | 11/14 | 🟡 78% | OK pero vinculado a Appointment inconsistente |
| | Patient | 14/14 | ✅ | OK |
| | Study | 8/8 | ✅ | OK |
| | MedicalExam | 9/15 | 🟡 60% | FALTA visión, antecedentes, aptitud |
| MOD-VALIDACIÓN | ValidationTask | 15/18 | 🟡 83% | FALTA firma image/timestamp, confianza IA |

---

## 5. RECOMENDACIONES INMEDIATAS

### 🔴 CRÍTICAS (Arreglar YA)

1. **Appointment.employeeId → Appointment.patientId**
   - Cambiar nombre para consistencia
   - Añadir relación explícita a Patient

2. **Appointment agregar campos faltantes:**
   ```typescript
   displayId          String           // APT-XXXXXX
   appointmentDuration Int             // minutos
   ```

3. **ValidationTask referenciar Doctor properly**
   ```typescript
   signedBy           String?
   signedByDoctor     Doctor? @relation(fields: [signedBy], references: [id])
   ```

4. **MedicalExam completar campos de examen:**
   ```typescript
   // Visión
   leftEyeAcuity      Float?
   rightEyeAcuity     Float?
   colorBlindness     Boolean?
   
   // Antecedentes
   surgeries          Json?
   medications        Json?
   allergies          Json?
   ```

### 🟡 ALTAS (Próximo sprint)

5. **ValidationTask agregar firma:**
   ```typescript
   signatureImage     String?          // Base64 encoded
   signatureTimestamp DateTime?
   ```

6. **Expedient expandir para datos demográficos:**
   ```typescript
   demographics       Json?            // edad, género, sangre
   ```

7. **Doctor.signature mover a ValidationTask**

---

## 6. MATRIZ ANTES/DESPUÉS

### Antes (Estado actual)
```
MOD-CITAS:         60% campos ❌
MOD-EXPEDIENTES:   78% campos 🟡
MOD-VALIDACIÓN:    83% campos 🟡
CONSISTENCIA:      Varios problemas ⚠️
```

### Después (Con fixes)
```
MOD-CITAS:         95% campos ✅
MOD-EXPEDIENTES:   95% campos ✅
MOD-VALIDACIÓN:    95% campos ✅
CONSISTENCIA:      Normalizado ✅
```

---

**Audit completado: 23 Enero 2026**

*Prioridad: Aplicar fixes CRÍTICOS antes de FASE 1 final*
