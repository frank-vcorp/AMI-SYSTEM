# SPEC-MOD-VALIDACIONES (Medical Validation & Signing)

> **ID Documento:** `IMPL-20260122-04`  
> **Versión:** 1.0.0  
> **Última Actualización:** 2026-01-22  
> **Autor:** SOFIA (Builder Agent)  
> **Módulo:** `mod-validaciones`

---

## 1. Resumen Ejecutivo

El módulo de **Validaciones** es donde el **Médico Validador** revisa TODOS los datos extraídos por IA, puede editarlos si hay errores, define el dictamen final y **firma electrónicamente** el expediente.

**Flujo:** Expedient (COMPLETED) → ValidationTask (PENDING) → [Médico revisa] → SIGNED → PDF generado → REPORTES

---

## 2. Modelos de Datos

### 2.1 Modelo Expandido: ValidationTask

```prisma
// packages/core-database/prisma/schema.prisma

model ValidationTask {
  id                String            @id @default(cuid())
  tenantId          String            @db.Uuid
  
  // ═══════════════════════════════════════════════════════════
  // RELACIONES
  // ═══════════════════════════════════════════════════════════
  expedientId       String
  patientId         String
  clinicId          String
  
  expedient         Expedient         @relation(fields: [expedientId], references: [id], onDelete: Cascade)
  
  // ═══════════════════════════════════════════════════════════
  // ESTADO
  // ═══════════════════════════════════════════════════════════
  status            ValidationStatus  @default(PENDING)
  
  // ═══════════════════════════════════════════════════════════
  // ESTUDIOS PROCESADOS
  // ═══════════════════════════════════════════════════════════
  studies           Json              // Array de estudios con datos extraídos
  // Estructura en 2.2
  
  // ═══════════════════════════════════════════════════════════
  // DATOS EXTRAÍDOS (Editables por médico)
  // ═══════════════════════════════════════════════════════════
  extractedData     Json              // Todos los datos extraídos
  // Estructura en 2.3
  
  // ═══════════════════════════════════════════════════════════
  // REVISIÓN MÉDICA
  // ═══════════════════════════════════════════════════════════
  medicalOpinion    String?           @db.Text
  verdictType       VerdictType       @default(APTO)
  restrictions      String[]          @default([])
  recommendations   String[]          @default([])
  observations      String?           @db.Text
  
  // ═══════════════════════════════════════════════════════════
  // FIRMA ELECTRÓNICA (se genera al hacer SIGN)
  // ═══════════════════════════════════════════════════════════
  electronicSignature Json?           // Ver estructura en 2.4
  // {
  //   signedBy: "doctor-uuid",
  //   signedAt: "2026-01-22T14:35:00Z",
  //   signatureHash: "hash_value"
  // }
  
  // ═══════════════════════════════════════════════════════════
  // PDF GENERADO
  // ═══════════════════════════════════════════════════════════
  generatedPdfUrl   String?           // URL al PDF almacenado
  pdfGeneratedAt    DateTime?
  
  // ═══════════════════════════════════════════════════════════
  // AUDIT TRAIL
  // ═══════════════════════════════════════════════════════════
  auditTrail        Json              @default("[]")
  // Array de cambios: { timestamp, action, changedBy, oldValue, newValue }
  
  // ═══════════════════════════════════════════════════════════
  // METADATA
  // ═══════════════════════════════════════════════════════════
  validatedBy       String?           @db.Uuid // ID del médico validador
  validatedAt       DateTime?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  @@unique([expedientId])
  @@index([tenantId])
  @@index([patientId])
  @@index([status])
  @@index([verdictType])
  @@map("validation_tasks")
}

enum ValidationStatus {
  PENDING           // Esperando validación
  IN_REVIEW         // Médico está revisando
  COMPLETED         // Completado, listo para firmar
  SIGNED            // Firmado, listo para reportes
  REJECTED          // Rechazado, vuelve a expediente
}

enum VerdictType {
  APTO
  APTO_CON_RESTRICCIONES
  NO_APTO
}
```

### 2.2 Estructura JSON: studies

```typescript
// Estructura de estudios en ValidationTask.studies
interface StudyInValidation {
  id: string;                       // ID del StudyUpload
  type: 'LABORATORIO_HEMATOLOGIA' | 'ESPIROMETRIA' | etc;
  name: string;                     // "Laboratorio - Biometría Hematológica"
  fileName: string;
  fileUrl: string;                  // URL a PDF/imagen
  uploadedAt: string;               // ISO 8601
  
  extractedDataId: string;          // ID del ExtractedData
  extractedValues: Record<string, any>;  // Datos extraídos, editables
  preDiagnosis: {
    studyType: string;
    findings: string;
    suggestion: string;
    riskLevel: 'CRITICAL' | 'SEGMENTO' | 'NORMAL';
    confidenceLevel: number;        // 0-100
  };
}
```

### 2.3 Estructura JSON: extractedData (Agregado)

```typescript
interface AggregatedExtractedData {
  // Se agrupa por tipo de estudio
  laboratorio?: {
    biometria?: {
      hemoglobin: { value: string; unit: string; reference: string; status: string };
      hematocrit: { value: string; unit: string; reference: string; status: string };
      // ... más parámetros
    };
    bioquimica?: { /* ... */ };
    toxicologia?: { /* ... */ };
  };
  
  espirometria?: {
    fvc: { value: string; unit: string; classification: string };
    fev1: { value: string; unit: string; classification: string };
    // ... más parámetros
  };
  
  audiometria?: { /* ... */ };
  radiografia?: { /* ... */ };
  
  // Resumen de riesgos
  riskSummary: {
    critical: number;   // Cantidad de valores críticos
    warning: number;    // Cantidad de valores warning
    normal: number;     // Cantidad de valores normales
  };
  
  allPredictions: Array<{
    studyType: string;
    riskLevel: 'CRITICAL' | 'SEGMENTO' | 'NORMAL';
    suggestion: string;
  }>;
}
```

### 2.4 Estructura JSON: electronicSignature

```typescript
interface ElectronicSignature {
  // Información del firmante
  signedBy: string;               // ID UUID del médico
  signedByName?: string;          // Nombre del médico (snapshot)
  signedByRole?: string;          // Ej: "Médico Ocupacional"
  
  // Timestamp exacto
  signedAt: string;               // ISO 8601: "2026-01-22T14:35:42.123Z"
  signedAtUnix: number;           // timestamp Unix en ms
  
  // Firma (mock para MVP)
  signatureHash: string;          // SHA256 hash o UUID
  // Hash = SHA256(signedBy + signedAt + expedientId + verdict)
  
  // Datos del expediente en el momento de firma (snapshot)
  expedientId: string;
  verdictAtSigning: string;       // El dictamen que se firmó
  
  // Validación (para verificar)
  signatureAlgorithm: string;     // "SHA256" o "mock"
  signatureVersion: string;       // "1.0" (para cambios futuros)
  
  // Timestamp de verificación (cuando se verificó)
  verifiedAt?: string;
  verifiedBy?: string;            // Quién verificó la firma
}
```

---

## 3. Cambios a Modelos Existentes

### 3.1 Expedient

```prisma
model Expedient {
  // ... campos existentes ...
  
  // Agregar relación a ValidationTask
  validationTask    ValidationTask?
}
```

---

## 4. APIs de Validaciones

### 4.1 Listado y Detalle

```typescript
// GET /api/validaciones
// Listar tareas de validación pendientes
interface GetValidacionesQuery {
  status?: ValidationStatus;  // PENDING, IN_REVIEW, COMPLETED, SIGNED
  page?: number;
  limit?: number;
  searchTerm?: string;        // Busca nombre paciente
}

// Response:
{
  data: ValidationTask[];
  pagination: { total, limit, page, pages };
}

// ─────────────────────────────────────────────────────────

// GET /api/validaciones/:id
// Detalle completo para revisar en UI
interface ValidationDetailResponse {
  validationTask: ValidationTask;
  expedient: Expedient;
  patient: Patient;
  studies: StudyInValidation[];
  extractedDataAggregated: AggregatedExtractedData;
  riskSummary: {
    critical: number;
    warning: number;
    normal: number;
  };
}
```

### 4.2 Actualización y Edición

```typescript
// PATCH /api/validaciones/:id/review
// Médico está revisando, guarda cambios parciales
interface UpdateValidationPayload {
  // Puede editar cualquiera de estos
  extractedData?: Record<string, any>;  // Valores editados
  medicalOpinion?: string;
  observations?: string;
  restrictions?: string[];
  recommendations?: string[];
  status?: 'IN_REVIEW' | 'COMPLETED';
}

// Response: ValidationTask actualizado

// ─────────────────────────────────────────────────────────

// PUT /api/validaciones/:id/change-verdict
// Cambiar el dictamen (y recalcular si es necesario)
interface ChangeVerdictPayload {
  newVerdict: VerdictType;  // APTO | APTO_CON_RESTRICCIONES | NO_APTO
  reason?: string;          // Por qué cambió
}

// Response: ValidationTask con nuevo verdict
```

### 4.3 Firma y Generación

```typescript
// PUT /api/validaciones/:id/sign
// FIRMA ELECTRÓNICA + genera PDF
// Este es el endpoint crítico que cierra el flujo
interface SignValidationPayload {
  doctorId: string;         // ID del médico validador
  // El sistema genera automáticamente:
  // - electronicSignature (con timestamp + hash)
  // - PDF (con todos los datos + firma)
  // - Cambia status a SIGNED
}

// Response:
{
  validationTask: {
    // ... todo actualizado
    electronicSignature: { /* ... */ };
    generatedPdfUrl: "https://storage/.../EXP-202600001.pdf";
    status: "SIGNED";
    validatedBy: "doctor-uuid";
    validatedAt: "2026-01-22T14:35:42Z";
  };
  message: "Expediente validado y firmado correctamente";
}

// ─────────────────────────────────────────────────────────

// GET /api/validaciones/:id/pdf
// Descargar el PDF generado
// Devuelve el PDF o URL según config

// ─────────────────────────────────────────────────────────

// PUT /api/validaciones/:id/reject
// Rechazar validación (vuelve a expediente para correcciones)
interface RejectValidationPayload {
  reason: string;           // Por qué se rechaza
  observations?: string;
}

// Response: ValidationTask con status REJECTED
```

### 4.4 Risk Summary

```typescript
// GET /api/validaciones/:id/risk-summary
// Resumen visual de riesgos para el semáforo
interface RiskSummaryResponse {
  critical: {
    count: number;
    items: Array<{ study: string; finding: string; value: string }>;
  };
  warning: {
    count: number;
    items: Array<{ study: string; finding: string; value: string }>;
  };
  normal: {
    count: number;
  };
  overallRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedVerdict: VerdictType;
}
```

---

## 5. Lógica de Firma Electrónica

```typescript
// packages/mod-validaciones/src/services/signature.service.ts

import crypto from 'crypto';

interface SignatureData {
  doctorId: string;
  expedientId: string;
  verdict: VerdictType;
  timestamp: Date;
}

/**
 * Genera firma electrónica (mock para MVP)
 */
export function generateElectronicSignature(data: SignatureData): ElectronicSignature {
  const signedAt = new Date();
  
  // Generar hash SHA256
  const hashInput = `${data.doctorId}|${data.expedientId}|${data.verdict}|${signedAt.toISOString()}`;
  const signatureHash = crypto
    .createHash('sha256')
    .update(hashInput)
    .digest('hex');
  
  return {
    signedBy: data.doctorId,
    signedAt: signedAt.toISOString(),
    signedAtUnix: signedAt.getTime(),
    signatureHash,
    expedientId: data.expedientId,
    verdictAtSigning: data.verdict,
    signatureAlgorithm: 'SHA256',
    signatureVersion: '1.0',
  };
}

/**
 * Verifica integridad de firma
 */
export function verifySignature(signature: ElectronicSignature): boolean {
  const hashInput = `${signature.signedBy}|${signature.expedientId}|${signature.verdictAtSigning}|${signature.signedAt}`;
  const computedHash = crypto
    .createHash('sha256')
    .update(hashInput)
    .digest('hex');
  
  return computedHash === signature.signatureHash;
}
```

---

## 6. Generación de PDF (Mock)

```typescript
// packages/mod-validaciones/src/services/pdf-generator.service.ts

import PDFDocument from 'pdfkit';
import { ElectronicSignature, ValidationTask } from '@prisma/client';

export async function generateValidationPDF(
  validation: ValidationTask,
  signature: ElectronicSignature,
  expedient: any,
  patient: any
): Promise<Buffer> {
  const doc = new PDFDocument();
  const buffers: Buffer[] = [];
  
  doc.on('data', (chunk) => buffers.push(chunk));
  doc.on('end', () => {});
  
  // HEADER
  doc
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('DICTAMEN MÉDICO VALIDADO', { align: 'center' })
    .fontSize(10)
    .font('Helvetica')
    .text(`Folio: ${expedient.expedientId}`, { align: 'center' })
    .moveDown();
  
  // DATOS DEL PACIENTE
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('DATOS DEL PACIENTE', { underline: true })
    .fontSize(10)
    .font('Helvetica')
    .text(`Nombre: ${patient.firstName} ${patient.paternalLastName} ${patient.maternalLastName || ''}`)
    .text(`ID Único: ${patient.uniqueId}`)
    .text(`Empresa: ${validation.company?.name || 'N/A'}`)
    .text(`Fecha Examen: ${new Date(expedient.examinedAt).toLocaleDateString('es-MX')}`)
    .moveDown();
  
  // DICTAMEN
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('DICTAMEN FINAL', { underline: true })
    .fontSize(14)
    .font('Helvetica-Bold')
    .text(validation.verdictType, {
      align: 'center',
      color: validation.verdictType === 'APTO' ? 'green' : 'orange',
    })
    .moveDown()
    .fontSize(10)
    .font('Helvetica');
  
  if (validation.restrictions.length > 0) {
    doc.text('Restricciones:', { underline: true });
    validation.restrictions.forEach((r) => doc.text(`• ${r}`));
    doc.moveDown();
  }
  
  if (validation.recommendations.length > 0) {
    doc.text('Recomendaciones:', { underline: true });
    validation.recommendations.forEach((r) => doc.text(`• ${r}`));
    doc.moveDown();
  }
  
  if (validation.observations) {
    doc.text('Observaciones:', { underline: true });
    doc.text(validation.observations);
    doc.moveDown();
  }
  
  // FIRMA ELECTRÓNICA
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('FIRMA ELECTRÓNICA', { underline: true })
    .fontSize(9)
    .font('Helvetica')
    .text(`Firmado por: ${signature.signedByName || signature.signedBy}`)
    .text(`Fecha: ${new Date(signature.signedAt).toLocaleString('es-MX')}`)
    .text(`Hash: ${signature.signatureHash.substring(0, 20)}...`)
    .moveDown();
  
  // FOOTER
  doc
    .fontSize(8)
    .text('Documento generado electrónicamente. Válido con firma digital.', {
      align: 'center',
      color: 'gray',
    });
  
  doc.end();
  
  return Buffer.concat(buffers);
}
```

---

## 7. Wireframes UI

### 7.1 Pantalla Principal de Validación (Panel Dividido)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ VALIDACIÓN MÉDICA - Revisión y validación de datos extraídos por IA         │
│                                                                             │
│ Paciente: CONTADOR FRANCO, YERALDÍN | Empresa: ABBOTT MEDICAL MÉXICO       │
│ Folio: #RD-2025-001  | Estado: ⚫ Pendiente Validación                      │
├─────────────────────────────────┬──────────────────────────────────────────┤
│                                 │                                          │
│  DOCUMENTOS FUENTE              │  DATOS EXTRAÍDOS + PREDIAGNÓSTICOS      │
│  (Panel Izquierdo 35%)          │  (Panel Derecho 65%)                   │
│                                 │                                          │
│  Tabs de Estudios:              │  ┌──────────────────────────────────┐   │
│  ✅ Laboratorio (1)             │  │ Laboratorio - Biometría Hematológica
│  [ ] Espirometría (2)           │  │ Confianza: 96% ⭐⭐⭐⭐           │   │
│  [ ] Audiometría (3)            │  │                                   │   │
│  [ ] Radiografías (4)           │  │ Hemoglobina (g/dL)               │   │
│                                 │  │ [9.1 🔴 BAJO]     (Ref: 12-16)   │   │
│  [Visualizador PDF]             │  │ ☑ Editar                          │   │
│  Mostrando: Laboratorio.pdf     │  │                                   │   │
│                                 │  │ VCM (fL)                          │   │
│  • Hemoglobina: 9.1             │  │ [61.9 ⚪ NORMAL]  (Ref: 80-100)   │   │
│    Valores resaltados en PDF    │  │ ☑ Editar                          │   │
│  • VCM: 61.9                    │  │                                   │   │
│  • ...                          │  │ 💡 Sugerencia IA:                 │   │
│                                 │  │ "Anemia microcítica hipocrómica.  │   │
│                                 │  │  Recomendación: evaluación        │   │
│  [Descargar PDF]                │  │  hematológica y estudio de        │   │
│  [Ir a PDF completo]            │  │  hierro."                         │   │
│                                 │  │                                   │   │
│                                 │  │ Riesgo: 🟡 SEGMENTO              │   │
│                                 │  │ Confianza: 96%                    │   │
│                                 │  │                                   │   │
│                                 │  │ [Rechazar] [Aprobar ✓]            │   │
│                                 │  └──────────────────────────────────┘   │
│                                 │                                          │
│                                 │  ┌──────────────────────────────────┐   │
│                                 │  │ Espirometría                     │   │
│                                 │  │ Confianza: 94% ⭐⭐⭐⭐          │   │
│                                 │  │ ...                               │   │
│                                 │  └──────────────────────────────────┘   │
│                                 │  [Scroll para más estudios...]          │
│                                 │                                          │
├─────────────────────────────────┴──────────────────────────────────────────┤
│                                                                             │
│  EVALUACIÓN GLOBAL Y DICTAMEN                                               │
│  ────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Resumen de Riesgos:                                                        │
│  🔴 1 Crítico  |  🟡 4 Segmento  |  🟢 2 Normal                            │
│                                                                             │
│  Dictamen: [Apto con Restricciones ▼]                                     │
│  (Predeterminado por IA según riesgos)                                    │
│                                                                             │
│  Restricciones:                                                             │
│  [ ] Evitar cargas > 10kg                                                  │
│  [✓] Uso obligatorio de lentes                                             │
│  [ ] Horario limitado a 4 horas                                            │
│  [✓] Manejo de anemia; ejercicios respiratorios                            │
│                                                                             │
│  Recomendaciones:                                                           │
│  ☑ Seguimiento hematológico                                                │
│  ☑ Evaluación respiratoria cada 6 meses                                    │
│  ☑ Higiene postural y ejercicios                                           │
│                                                                             │
│  Observaciones (Texto Libre):                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Paciente presenta anemia leve con patrón restrictivo en pulmones.  │   │
│  │ Se recomienda derivación a hematología y neumología. Manejo de      │   │
│  │ anemia, ejercicios respiratorios; uso obligatorio de correctivos    │   │
│  │ visuales.                                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                              [Editar]  [Validar y Firmar ✓]                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Modal de Edición (Cuando hace clic en "Editar" de un valor)

```
┌─────────────────────────────────────┐
│ Editar Valor - Hemoglobina          │
├─────────────────────────────────────┤
│                                     │
│ Parámetro: Hemoglobina              │
│ Unidad: g/dL                        │
│                                     │
│ Valor Original: 9.1                 │
│ Valor Nuevo*: [9.1    ]             │
│                                     │
│ Referencia: 12-16 g/dL              │
│ Estado: 🔴 BAJO                     │
│                                     │
│ Notas (opcional):                   │
│ ┌─────────────────────────────────┐ │
│ │ Error en OCR, valor verificado  │ │
│ └─────────────────────────────────┘ │
│                                     │
│      [Cancelar]  [Guardar ✓]        │
└─────────────────────────────────────┘
```

### 7.3 Resumen Pre-Firma

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ RESUMEN - Validación y Firma Electrónica                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ✅ Revisión Completa                                                        │
│    • 8 estudios revisados                                                   │
│    • 3 valores editados                                                     │
│    • Prediagnósticos validados                                              │
│                                                                             │
│ 📋 Dictamen Final: APTO CON RESTRICCIONES                                 │
│    • Restricciones: 2 aplicadas                                             │
│    • Recomendaciones: 3 aplicadas                                           │
│                                                                             │
│ 🔐 Firma Electrónica                                                        │
│    Firmante: Dr. García López (doctor-uuid-123)                             │
│    Fecha: 22/01/2026 a las 14:35:42                                         │
│    Hash: SHA256 (será generado)                                             │
│                                                                             │
│ 📄 PDF a Generar                                                            │
│    • Incluirá todos los datos validados                                     │
│    • Con firma electrónica                                                  │
│    • Listo para descargar y enviar a empresa                                │
│                                                                             │
│                   [Cancelar]  [Confirmar y Firmar ✓]                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.4 Confirmación Post-Firma

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ✅ EXPEDIENTE VALIDADO Y FIRMADO                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Folio: #RD-2025-001                                                         │
│ Estado: 🟢 SIGNED                                                            │
│                                                                             │
│ Dictamen: APTO CON RESTRICCIONES                                            │
│                                                                             │
│ Firmado por: Dr. García López                                               │
│ Fecha: 22/01/2026 a las 14:35:42                                            │
│ Hash de Firma: 3c8f2d... (primeros 20 caracteres)                           │
│                                                                             │
│ Próximos Pasos:                                                             │
│ 1. ✅ PDF generado y almacenado                                             │
│ 2. ⏳ Listo para Reportes (generación de papeleta + reporte)               │
│ 3. ⏳ Entrega controlada a empresa                                          │
│                                                                             │
│ [Descargar PDF] [Ir a Reportes ▶] [Ir a Lista ▶]                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Flujo Completo de Estados

```
PENDING
  ↓
  └─→ Médico abre validación → Cambia a IN_REVIEW
        ↓
        ├─→ Revisa estudios
        ├─→ Edita valores (si hay errores)
        ├─→ Cambia dictamen (opcional)
        ├─→ Agrega restricciones/recomendaciones
        ├─→ Escribe observaciones
        │
        ├─→ RECHAZA (opcional)
        │   └─→ Status = REJECTED
        │       └─→ Vuelve a Expediente para correcciones
        │
        └─→ Hace clic: "Validar y Firmar"
            ↓
            ├─→ Genera firma electrónica
            ├─→ Genera PDF con firma
            ├─→ Cambia status a SIGNED
            └─→ Listop para REPORTES
```

---

## 9. Validaciones y Reglas de Negocio

| Regla | Descripción |
|-------|-------------|
| **RN-001** | No se puede ir a SIGNED sin completar: dictamen + observaciones |
| **RN-002** | Firma se genera automáticamente con timestamp exacto + hash |
| **RN-003** | Valores editados quedan registrados en auditTrail |
| **RN-004** | El PDF se genera inmediatamente después de la firma |
| **RN-005** | Solo médicos validadores pueden firmar (validar permisos) |
| **RN-006** | No se puede cambiar status a SIGNED dos veces |
| **RN-007** | Si se rechaza, ValidationTask vuelve a PENDING |
| **RN-008** | El dictamen puede cambiar, se sugiere automáticamente según riesgos |

---

## 10. Checklist de Implementación

### 10.1 MVP (Demo 23-Ene-2026)

- [ ] **Modelo Prisma**
  - [ ] Expandir ValidationTask
  - [ ] Agregar campos de firma
  - [ ] Migración

- [ ] **Servicios**
  - [ ] Generador de firma electrónica (mock)
  - [ ] Generador de PDF (mock/template)
  - [ ] Recálculo de dictamen según riesgos

- [ ] **APIs**
  - [ ] GET /api/validaciones
  - [ ] GET /api/validaciones/:id
  - [ ] PATCH /api/validaciones/:id/review
  - [ ] PUT /api/validaciones/:id/change-verdict
  - [ ] PUT /api/validaciones/:id/sign (crítica)
  - [ ] GET /api/validaciones/:id/risk-summary

- [ ] **UI**
  - [ ] Pantalla principal (panel dividido)
  - [ ] Edición de valores
  - [ ] Cambio de dictamen
  - [ ] Firma y confirmación
  - [ ] Modal de resumen

- [ ] **Integración**
  - [ ] Generar firma electrónica al hacer click Sign
  - [ ] Generar PDF automáticamente
  - [ ] Actualizar status a SIGNED
  - [ ] Audit trail de cambios

### 10.2 Post-MVP

- [ ] Integración real con firmas digitales (certificado)
- [ ] Entrega automática a empresa (email)
- [ ] Verificación de firmas
- [ ] Archivo a largo plazo

---

## 11. Casos de Prueba

| ID | Escenario | Pasos | Resultado |
|----|-----------|-------|-----------|
| TC-01 | Validación simple | Abrir → revisar → firmar | PDF generado, status SIGNED |
| TC-02 | Editar valor con error | Clic Editar → cambiar → guardar | Valor actualizado en UI y BD |
| TC-03 | Cambiar dictamen | Seleccionar nuevo dictamen | Se recalcula y se sugieren restricciones |
| TC-04 | Rechazar validación | Clic Rechazar → motivo | Status REJECTED, vuelve a expediente |
| TC-05 | Verificar firma | Abrir PDF y verificar hash | Firma válida y legible |

---

## 12. Integración con REPORTES (Post-MVP)

Una vez SIGNED, el ValidationTask pasa automáticamente a REPORTES donde se genera:

1. **Papeleta de Aptitud** (compacta, para entrega)
2. **Reporte Completo** (detallado con todos los datos)
3. **Entrega Controlada** (email + enlace temporal)

---

## Historial de Cambios

| Fecha | Versión | Cambios | Autor |
|-------|---------|---------|-------|
| 2026-01-22 | 1.0.0 | Creación inicial | SOFIA |

---

> **Documento de respaldo:** `context/modules/SPEC-MOD-VALIDACIONES.md`  
> **ID de Intervención:** `IMPL-20260122-04`
