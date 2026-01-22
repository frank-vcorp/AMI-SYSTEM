# SPEC-MOD-EXPEDIENTES (Medical Records/Exams)

> **ID Documento:** `IMPL-20260121-03`  
> **Versión:** 1.0.0  
> **Última Actualización:** 2026-01-21  
> **Autor:** SOFIA (Builder Agent)  
> **Módulo:** `mod-expedientes`

---

## 1. Resumen Ejecutivo

El módulo de **Expedientes** captura todos los datos clínicos de una visita médica ocupacional. Es el corazón del sistema, donde:

1. Se registra el **Examen Físico Completo** (signos vitales, antecedentes, agudeza visual)
2. Se suben **Estudios Clínicos** (PDFs, imágenes, documentos)
3. La **IA extrae datos** de estudios y genera **prediagnósticos**
4. Se visualiza un **historial de visitas** en el perfil del trabajador

---

## 2. Modelos de Datos

### 2.1 Modelo Expandido: MedicalExam (Renombrar a Expedient si lo prefieres)

```prisma
// packages/core-database/prisma/schema.prisma

model MedicalExam {
  id                    String            @id @default(cuid())
  tenantId              String            @db.Uuid
  
  // ═══════════════════════════════════════════════════════════
  // RELACIONES PRINCIPALES
  // ═══════════════════════════════════════════════════════════
  expedientId           String            @unique
  patientId             String
  appointmentId         String?           // Opcional: si se crea desde cita
  clinicId              String
  companyId             String?
  examinedByDoctorId    String?
  
  patient               Patient           @relation(fields: [patientId], references: [id], onDelete: Cascade)
  clinic                Clinic            @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  examinedByDoctor      Doctor?           @relation("examinedBy", fields: [examinedByDoctorId], references: [id], onDelete: SetNull)
  
  // ═══════════════════════════════════════════════════════════
  // DATOS DEMOGRÁFICOS (Primer llenado)
  // Se autocarga desde Patient pero puede editarse
  // ═══════════════════════════════════════════════════════════
  demographics          Json              // Ver estructura en 2.3
  
  // ═══════════════════════════════════════════════════════════
  // SOMATOMETRÍA / SIGNOS VITALES
  // ═══════════════════════════════════════════════════════════
  vitalSigns            Json              // Ver estructura en 2.4
  
  // ═══════════════════════════════════════════════════════════
  // AGUDEZA VISUAL
  // ═══════════════════════════════════════════════════════════
  visualAcuity          Json?             // Ver estructura en 2.5
  
  // ═══════════════════════════════════════════════════════════
  // ANTECEDENTES (referencias estáticas a Patient)
  // ═══════════════════════════════════════════════════════════
  // No se duplican, se referencian desde Patient.medicalHistory
  // Pero se pueden incluir snapshots si necesitas auditoría
  medicalHistorySnapshot Json?           // JSON de Patient.medicalHistory al momento
  
  // ═══════════════════════════════════════════════════════════
  // EXPLORACIÓN FÍSICA
  // ═══════════════════════════════════════════════════════════
  physicalExamination   Json?             // Ver estructura en 2.6
  
  // ═══════════════════════════════════════════════════════════
  // ESTADO DEL EXPEDIENTE
  // ═══════════════════════════════════════════════════════════
  status                ExamStatus        @default(DRAFT)
  
  // ═══════════════════════════════════════════════════════════
  // ESTUDIOS SUBIDOS Y PROCESADOS
  // ═══════════════════════════════════════════════════════════
  studyUploads          StudyUpload[]
  extractedData         ExtractedData[]
  
  // ═══════════════════════════════════════════════════════════
  // NOTAS Y METADATA
  // ═══════════════════════════════════════════════════════════
  notes                 String?           @db.Text
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
  examinedAt            DateTime?         // Fecha/hora del examen
  createdBy             String?           @db.Uuid
  updatedBy             String?           @db.Uuid
  
  @@unique([patientId, clinicId, examinedAt])
  @@index([tenantId])
  @@index([patientId])
  @@index([clinicId])
  @@index([appointmentId])
  @@index([status])
  @@index([examinedAt])
  @@map("medical_exams")
}

enum ExamStatus {
  DRAFT             // Captura en progreso
  IN_PROGRESS       // Completo, estudiando
  COMPLETED         // Examen terminado, estudios listos
  AWAITING_VALIDATION // Listo para validar
}
```

### 2.2 Modelo Nuevo: ExtractedData (Datos Extraídos por IA)

```prisma
model ExtractedData {
  id                    String            @id @default(cuid())
  tenantId              String            @db.Uuid
  
  medicalExamId         String
  studyUploadId         String
  
  medicalExam           MedicalExam       @relation(fields: [medicalExamId], references: [id], onDelete: Cascade)
  studyUpload           StudyUpload       @relation(fields: [studyUploadId], references: [id], onDelete: Cascade)
  
  // ═══════════════════════════════════════════════════════════
  // DATOS EXTRAÍDOS (Estructura según tipo de estudio)
  // ═══════════════════════════════════════════════════════════
  extractedValues       Json              // Valores estructurados extraídos
  // Ejemplo para Laboratorio:
  // {
  //   "hemoglobin": { value: "9.1", unit: "g/dL", reference: "12-16", status: "LOW" },
  //   "hematocrit": { value: "28", unit: "%", reference: "36-46", status: "LOW" },
  //   ...
  // }
  
  // ═══════════════════════════════════════════════════════════
  // PREDIAGNÓSTICO POR ESTUDIO (Suggerencia de IA)
  // ═══════════════════════════════════════════════════════════
  preDiagnosis          Json              // Ver estructura en 2.7
  
  // ═══════════════════════════════════════════════════════════
  // CONFIANZA Y PROCESSING
  // ═══════════════════════════════════════════════════════════
  confidenceScore       Int               @default(0)  // 0-100
  processingStatus      ProcessingStatus  @default(PENDING)
  errorMessage          String?           // Si falló
  
  // ═══════════════════════════════════════════════════════════
  // METADATA
  // ═══════════════════════════════════════════════════════════
  processedAt           DateTime?
  processedBy           String?           // Sistema o usuario que procesó
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
  
  @@unique([medicalExamId, studyUploadId])
  @@index([tenantId])
  @@index([medicalExamId])
  @@index([studyUploadId])
  @@index([processingStatus])
  @@map("extracted_data")
}

enum ProcessingStatus {
  PENDING       // En cola para procesar
  PROCESSING    // Procesando con IA
  COMPLETED     // Exitoso
  FAILED        // Error en extracción
}
```

### 2.3 Estructura JSON: demographics

```typescript
// packages/core-types/src/exam-demographics.types.ts

interface ExamDemographics {
  // Copiado de Patient al momento del examen
  firstName: string;
  paternalLastName: string;
  maternalLastName?: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;  // ISO 8601
  age: number;        // Calculado
  nationality?: string;
  maritalStatus?: string;
  educationLevel?: string;
  
  // Información actual
  company: string;
  jobProfile: string;
  currentPosition?: string;
  currentArea?: string;
  riskFactor?: string;
}
```

### 2.4 Estructura JSON: vitalSigns

```typescript
interface VitalSigns {
  // TA: Tensión Arterial
  ta_systolic: number;          // ej: 189
  ta_diastolic: number;         // ej: 89
  ta_classification: TAPressureClass;  // Baja | Normal | Normal-Alta | Hipertensión
  
  // FC: Frecuencia Cardíaca
  fc: number;                   // bpm (ej: 72)
  fc_classification?: string;   // Normal | Taquicardia | Bradicardia
  
  // FR: Frecuencia Respiratoria
  fr: number;                   // respiraciones/min (ej: 16)
  
  // Temperatura
  temperature: number;          // Celsius (ej: 36.5)
  
  // Antropometría
  weight: number;               // kg (ej: 91)
  height: number;               // m (ej: 1.73)
  imc: number;                  // Calculado: peso/(talla²) = 30.41
  imc_classification: IMCClass; // Normal | Sobrepeso | Obesidad Grado 1-4
  
  // Grasa corporal (opcional, depende del equipo)
  percentBodyFat?: number;
  bodyFatClass?: 'LOW' | 'NORMAL' | 'HIGH';
  
  // Grupo sanguíneo
  bloodType?: BloodType;        // A+ | A- | B+ | O+ etc
  rh?: 'POSITIVE' | 'NEGATIVE';
  
  // Timestamp
  measuredAt: string;           // ISO 8601
}

type TAPressureClass = 
  | 'BAJA' 
  | 'NORMAL' 
  | 'NORMAL_ALTA' 
  | 'HIPERTENSION_G1' 
  | 'HIPERTENSION_G2';

type IMCClass = 
  | 'BAJO_PESO' 
  | 'NORMAL' 
  | 'SOBREPESO' 
  | 'OBESIDAD_G1' 
  | 'OBESIDAD_G2' 
  | 'OBESIDAD_G3' 
  | 'OBESIDAD_G4';

type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
```

### 2.5 Estructura JSON: visualAcuity

```typescript
interface VisualAcuity {
  // Agudeza Lejana (Visión a distancia)
  farVision: {
    leftEyeUnaided: string;      // OI sin corrección (ej: "20/20")
    rightEyeUnaided: string;     // OD sin corrección
    leftEyeWithCorrection?: string;
    rightEyeWithCorrection?: string;
  };
  
  // Agudeza Cercana (Visión a proximidad)
  nearVision: {
    leftEyeUnaided?: string;
    rightEyeUnaided?: string;
  };
  
  // Test de Reflejos
  reflectionTest?: string;       // "Presentes y normorreflécticos"
  
  // Test de Ishihara (Daltonismo)
  ishihara?: {
    passed: boolean;
    foundErrors?: number;        // Placas donde erró
  };
  
  // Campimetría (Campo visual)
  campimetry?: {
    leftEye: string;
    rightEye: string;
    diagnosis?: string;
  };
  
  // Otras pruebas
  testFindings?: string;
  
  // Diagnosis de óptico
  diagnosis?: string;            // "Sin anomalías", "Miopía", etc
  
  // Recomendaciones
  recommendations?: string;
  
  measuredAt: string;            // ISO 8601
}
```

### 2.6 Estructura JSON: physicalExamination

```typescript
interface PhysicalExamination {
  // Estado General
  generalState: string;          // "Paciente en buen estado general"
  consciousness: string;
  orientation: string;
  
  // Piel
  skin: {
    description: string;
    abnormalities?: string;
  };
  
  // Cabeza y Cuello
  headNeck: {
    description: string;
    findings?: string;
  };
  
  // Tórax
  thorax: {
    inspection: string;
    palpation: string;
    abnormalities?: string;
  };
  
  // Corazón
  heart: {
    heartRate: string;
    rhythm: string;
    murmurs?: string;
  };
  
  // Pulmones
  lungs: {
    respiratoryRate: string;
    breathSounds: string;
    wheezing?: string;
  };
  
  // Abdomen
  abdomen: {
    inspection: string;
    palpation: string;
    tenderness?: string;
  };
  
  // Extremidades
  extremities: {
    description: string;
    edema?: boolean;
    pulses?: string;
  };
  
  // Neurológico
  neurological: {
    reflexes: string;            // "Presentes y normorreflécticos"
    coordination?: string;
    sensation?: string;
  };
  
  // Notas generales
  otherFindings?: string;
  generalNotes?: string;
  
  examinedAt: string;            // ISO 8601
}
```

### 2.7 Estructura JSON: preDiagnosis

```typescript
interface PreDiagnosis {
  // Identificación del estudio
  studyType: StudyTypeEnum;      // ESPIROMETRIA, LABORATORIO_HEMATOLOGIA, etc
  studyName: string;             // "Espirometría - Función Pulmonar"
  
  // Resultado según tipo
  findings: {
    mainFindings: string;        // Hallazgo principal (ej: "Patrón restrictivo leve")
    criticalValues: Array<{      // Valores fuera de rango
      parameter: string;
      value: string;
      reference: string;
      status: 'CRITICAL' | 'WARNING' | 'NORMAL';
    }>;
    overallInterpretation: string;
  };
  
  // Sugerencias de la IA
  suggestion: {
    clinicalSignificance: string;
    recommendation: string;
    actionItems?: string[];
  };
  
  // Riesgo detectado
  riskLevel: 'CRITICAL' | 'SEGMENTO' | 'NORMAL';
  riskDescription?: string;
  
  // Calidad de la sugerencia
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  uncertaintyNotes?: string;
  
  // Metadata
  generatedAt: string;           // ISO 8601
  generatedBy: 'IA_MODEL_v1';    // Para auditoría de modelo
  modelVersion: string;
}
```

---

## 3. Cambios a Modelos Existentes

### 3.1 StudyUpload (ya existe, solo aclaramos)

```prisma
model StudyUpload {
  // ... campos existentes ...
  
  // Agregar
  extractedData       ExtractedData[]   // Referencia inversa
  
  // Actualizar enums
  // type: RADIOGRAPHY | LABORATORY | CARDIOGRAM | ... 
  //       → RADIOGRAFIA | LABORATORIO_HEMATOLOGIA | LABORATORIO_BIOQUIMICA |
  //         ESPIROMETRIA | AUDIOMETRIA | ELECTROCARDIOGRAMA | CAMPIMETRIA | ...
}
```

---

## 4. APIs de Expedientes

### 4.1 CRUD Básico

```typescript
// POST /api/expedients
// Crear nuevo expediente desde cita
interface CreateExpedientPayload {
  appointmentId: string;
  patientId: string;
  clinicId: string;
  companyId?: string;
  examinedByDoctorId?: string;
}

// GET /api/expedients/:id
// Detalle completo del expediente

// PUT /api/expedients/:id
// Actualizar examen físico
interface UpdateExamPayload {
  demographics?: ExamDemographics;
  vitalSigns?: VitalSigns;
  visualAcuity?: VisualAcuity;
  physicalExamination?: PhysicalExamination;
  notes?: string;
  status?: ExamStatus;
}

// GET /api/expedients
// Listar expedientes con filtros
interface GetExpedientsQuery {
  patientId?: string;
  clinicId?: string;
  status?: ExamStatus;
  dateFrom?: string;
  dateTo?: string;
}

// GET /api/patients/:patientId/expedient-history
// Historial de visitas del trabajador
interface ExpedientHistoryResponse {
  total: number;
  expedients: Array<{
    expedientId: string;
    date: string;
    clinicName: string;
    vitalSignsSummary: {
      ta: string;
      weight: number;
      height: number;
      imc: number;
      imcClass: string;
    };
    visualAcuitySummary: {
      farVisionOD: string;
      farVisionOI: string;
    };
    status: ExamStatus;
  }>;
}
```

### 4.2 Estudios

```typescript
// POST /api/expedients/:id/studies
// Subir estudio clínico
interface UploadStudyPayload {
  type: StudyType;              // LABORATORIO_HEMATOLOGIA, ESPIROMETRIA, etc
  file: File;
  description?: string;
}

// Response:
{
  id: string;
  expedientId: string;
  studyId: string;
  fileName: string;
  status: "PENDING";
  processingStartedAt: null;
  message: "Estudio en cola para procesamiento"
}

// GET /api/expedients/:id/studies
// Listar estudios del expediente
interface StudiesResponse {
  simClinicos: StudyUpload[];      // Espirometría, Audiometría, etc
  novaLaboratorios: StudyUpload[]; // Laboratorios
  radiografias: StudyUpload[];
  otros: StudyUpload[];
}

// GET /api/expedients/:id/studies/:studyId/extracted-data
// Obtener datos extraídos de un estudio
interface ExtractedDataResponse {
  studyUploadId: string;
  extractedValues: Json;         // Valores estructurados
  preDiagnosis: PreDiagnosis;    // Sugerencia IA
  confidenceScore: number;       // 0-100
  processingStatus: ProcessingStatus;
  processedAt: string;
}

// GET /api/expedients/:id/studies/all-extracted
// Obtener TODOS los datos extraídos resumidos
interface AllExtractedResponse {
  laboratorio: {
    hemoglobin: { value, unit, status, riskLevel },
    hematocrit: { ... },
    ...
  };
  espirometria: {
    fvc: { ... },
    fev1: { ... },
    ...
  };
  allPredictions: PreDiagnosis[];
  riskSummary: {
    criticalCount: number;
    warningCount: number;
    normalCount: number;
  };
}
```

### 4.3 Simulación IA (para MVP/Demo)

```typescript
// POST /api/expedients/:id/process-studies
// Procesar todos los estudios con IA (mock/real)
interface ProcessStudiesPayload {
  useRealAI?: boolean;  // false = mock data para demo
}

// Esto gatilla:
// 1. Para cada StudyUpload con status PENDING:
// 2. Cambiar a PROCESSING
// 3. Llamar a OCR/IA (o usar mock)
// 4. Crear ExtractedData con resultados
// 5. Generar PreDiagnosis
// 6. Cambiar a COMPLETED
```

---

## 5. Wireframes UI

### 5.1 Pantalla de Captura de Examen Físico

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🏢 Clínica Monterrey                                    👤 Dr. García   ⚙️  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📋 Examen Médico - Roberto Caicero (EXP-202600001)                         │
│  Estado: IN_PROGRESS                                                        │
│                                                                             │
│  [Datos Demográficos] [Somatometría] [Agudeza Visual] [Exploración] [Est.] │
│  ════════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ DATOS DEL PACIENTE (Autocargado de Perfil)                          │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                       │   │
│  │ Nombre:    Roberto Caicero                                           │   │
│  │ ID Único:  CAB-R-19700221-M-AMI-CLI                                 │   │
│  │ Sexo:      Masculino          Edad: 55 años                          │   │
│  │ Empresa:   PEMEX Monterrey                                           │   │
│  │ Puesto:    Operador CNC                                              │   │
│  │ NSS:       1234567890                                                │   │
│  │ RFC:       CABR700221XXX                                             │   │
│  │                                                                       │   │
│  │ ☑ Ver Antecedentes Médicos completos en perfil                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                     [Siguiente ▶]                           │
└─────────────────────────────────────────────────────────────────────────────┘

Tab 2: SOMATOMETRÍA / SIGNOS VITALES

│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ SOMATOMETRÍA / SIGNOS VITALES                                        │   │
│  │ * Campos requeridos                                                  │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                       │   │
│  │ Hora de medición: [14:30     📅]                                     │   │
│  │                                                                       │   │
│  │ TENSIÓN ARTERIAL                                                     │   │
│  │ TA Sistólica*  [189 mmHg]    TA Diastólica*  [89 mmHg]               │   │
│  │ Clasificación: HIPERTENSION GRADO 2 🔴                               │   │
│  │                                                                       │   │
│  │ FRECUENCIA CARDÍACA                                                  │   │
│  │ FC*     [72   bpm]    Clasificación: NORMAL ✓                        │   │
│  │                                                                       │   │
│  │ FRECUENCIA RESPIRATORIA                                              │   │
│  │ FR*     [16   resp/min]                                              │   │
│  │                                                                       │   │
│  │ TEMPERATURA                                                          │   │
│  │ T°*     [36.5 °C]                                                    │   │
│  │                                                                       │   │
│  │ ANTROPOMETRÍA                                                        │   │
│  │ Peso*        [91  kg]      Talla*        [1.73 m]                    │   │
│  │ IMC calculado: 30.41                                                 │   │
│  │ Clasificación: OBESIDAD GRADO 1 🟡                                   │   │
│  │                                                                       │   │
│  │ % Grasa corporal (opt): [    ]  Clasificación: [     ]              │   │
│  │                                                                       │   │
│  │ GRUPO SANGUÍNEO                                                      │   │
│  │ Tipo*     [O+  ▼]                                                    │   │
│  │                                                                       │   │
│  │ ⓘ Los valores TA, IMC se clasifican automáticamente según rangos    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                          [◀ Anterior]  [Siguiente ▶]                       │
```

### 5.2 Tab: Agudeza Visual

```
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ AGUDEZA VISUAL                                                       │   │
│  │                                                                       │   │
│  │ VISIÓN LEJANA (Sin corrección)                                       │   │
│  │ Ojo Izquierdo (OI):  [20/20  ▼]    Ojo Derecho (OD): [20/20  ▼]      │   │
│  │                                                                       │   │
│  │ VISIÓN LEJANA (Con corrección)                                       │   │
│  │ OI:  [20/20  ▼]    OD: [20/20  ▼]                                    │   │
│  │                                                                       │   │
│  │ VISIÓN CERCANA                                                       │   │
│  │ OI:  [        ]    OD: [        ]                                    │   │
│  │                                                                       │   │
│  │ TEST DE REFLEJOS                                                     │   │
│  │ [ ] Presentes y Normorreflécticos    [ ] Alterados                   │   │
│  │ Notas: [Reflejos normales                    ]                       │   │
│  │                                                                       │   │
│  │ TEST DE ISHIHARA (Daltonismo)                                        │   │
│  │ [ ] Pasó correctamente    [ ] Errores      Cantidad: [  ]            │   │
│  │                                                                       │   │
│  │ CAMPIMETRÍA (Campo visual)                                           │   │
│  │ OI:  [Campo visual normal ▼]                                         │   │
│  │ OD:  [Campo visual normal ▼]                                         │   │
│  │                                                                       │   │
│  │ DIAGNÓSTICO VISUAL                                                   │   │
│  │ [Sin anomalías                ]                                      │   │
│  │                                                                       │   │
│  │ RECOMENDACIONES                                                      │   │
│  │ [Continuar con revisiones anuales                         ]          │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                          [◀ Anterior]  [Siguiente ▶]                       │
```

### 5.3 Tab: Exploración Física

```
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ EXPLORACIÓN FÍSICA                                                   │   │
│  │ (Textos predefinidos editables)                                      │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                       │   │
│  │ ESTADO GENERAL                                                       │   │
│  │ ┌───────────────────────────────────────────────────────────────┐   │   │
│  │ │ Paciente en buen estado general, consciente y orientado       │   │   │
│  │ └───────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │ PIEL                                                                 │   │
│  │ ┌───────────────────────────────────────────────────────────────┐   │   │
│  │ │ Íntegra, sin lesiones, adecuado turgor                        │   │   │
│  │ └───────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │ CABEZA Y CUELLO                                                      │   │
│  │ ┌───────────────────────────────────────────────────────────────┐   │   │
│  │ │ Normocéfalo, sin latidos anormales, cuello sin adenopatías  │   │   │
│  │ └───────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │ TÓRAX                                                                │   │
│  │ ┌───────────────────────────────────────────────────────────────┐   │   │
│  │ │ Simétrico, sin retracciones, ruidos respiratorios presentes  │   │   │
│  │ └───────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │ CORAZÓN                                                              │   │
│  │ ┌───────────────────────────────────────────────────────────────┐   │   │
│  │ │ Frecuencia regular, sin soplos                               │   │   │
│  │ └───────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │ ABDOMEN                                                              │   │
│  │ ┌───────────────────────────────────────────────────────────────┐   │   │
│  │ │ Suave, depresible, sin organomegalia, ruidos presentes      │   │   │
│  │ └───────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │ EXTREMIDADES                                                         │   │
│  │ ┌───────────────────────────────────────────────────────────────┐   │   │
│  │ │ Simétricas, móviles, sin edema, pulsos presentes            │   │   │
│  │ └───────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │ NEUROLÓGICO                                                          │   │
│  │ ┌───────────────────────────────────────────────────────────────┐   │   │
│  │ │ Reflejos presentes y normorreflécticos                       │   │   │
│  │ └───────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │ HALLAZGOS ADICIONALES                                                │   │
│  │ ┌───────────────────────────────────────────────────────────────┐   │   │
│  │ │ [                                                             │   │   │
│  │ │                                                               │   │   │
│  │ │ ]                                                             │   │   │
│  │ └───────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                          [◀ Anterior]  [Siguiente ▶]                       │
```

### 5.4 Tab: Estudios (Carga)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  📎 ESTUDIOS                                                                 │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ESTUDIOS SIM (Clínicos)                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 📄 Espirometría             Función Pulmonar                         │   │
│  │    [Arrastrar aquí o hacer clic]                                    │   │
│  │    Aceptados: PDF, PNG, JPG                                          │   │
│  │                                                                       │   │
│  │ 📄 Audiometría              Evaluación Auditiva                      │   │
│  │    [Arrastrar aquí o hacer clic]                                    │   │
│  │                                                                       │   │
│  │ 📄 Electrocardiograma       Actividad Cardíaca                       │   │
│  │    [Arrastrar aquí o hacer clic]                                    │   │
│  │                                                                       │   │
│  │ 📄 Campimetría              Campo Visual                             │   │
│  │    [Arrastrar aquí o hacer clic]                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ESTUDIOS NOVA (Laboratorio)                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 🧪 Laboratorio (Biometría)  Hematología                              │   │
│  │    [Arrastrar aquí o hacer clic]                                    │   │
│  │    Aceptados: PDF, PNG, JPG                                          │   │
│  │                                                                       │   │
│  │ 🧪 Laboratorio (Química)    Bioquímica Sanguínea                     │   │
│  │    [Arrastrar aquí o hacer clic]                                    │   │
│  │                                                                       │   │
│  │ 🧪 Toxicológico             Tóxicos                                  │   │
│  │    [Arrastrar aquí o hacer clic]                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  OTROS                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 📄 Radiografías             Imagenología                             │   │
│  │    [Arrastrar aquí o hacer clic]                                    │   │
│  │                                                                       │   │
│  │ 📄 Reportes Adicionales     Otros documentos                         │   │
│  │    [Arrastrar aquí o hacer clic]                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                              [Guardar]  [Procesar con IA ▶]                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.5 Pantalla de Estudios Procesados

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📋 ESTUDIOS PROCESADOS                                                      │
│ Expediente completamente procesado y clasificado por IA                     │
│                                                                             │
│ Paciente: Roberto Caicero | Empresa: PEMEX | Folio: EXP-202600001          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ESTUDIOS SIM (Clínicos) - 4 estudios procesados                            │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 💚 Espirometría                                  ✓ Procesado        │   │
│  │    Función Pulmonar                                                  │   │
│  │                                                                       │   │
│  │    Hallazgo: Patrón Restrictivo Leve                                 │   │
│  │    FVC: 70%    |    FEV1: Restrictivo    |    Confianza: 94%  ⭐⭐⭐⭐  │   │
│  │                                                                       │   │
│  │    💡 Sugerencia IA: "Patrón restrictivo leve. Recomendación:       │   │
│  │                       Ejercicios respiratorios."                      │   │
│  │                                                                       │   │
│  │    [Ver detalles] [Descargar PDF]                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 💚 Audiometría                                   ✓ Procesado        │   │
│  │    Evaluación Auditiva                                               │   │
│  │                                                                       │   │
│  │    Hallazgo: Sin Hipoacusia                                           │   │
│  │    Audición OD: Normal | OI: Normal | Confianza: 96%  ⭐⭐⭐⭐⭐      │   │
│  │                                                                       │   │
│  │    💡 Sugerencia IA: "Audición normal en ambos oídos. Continuar      │   │
│  │                       protección auditiva ocupacional."              │   │
│  │                                                                       │   │
│  │    [Ver detalles]                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ESTUDIOS NOVA (Laboratorio) - 4 estudios procesados                        │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 🔵 Laboratorio - Biometría Hematológica         ✓ Procesado         │   │
│  │                                                                       │   │
│  │    Hemoglobina: 9.1 g/dL 🔴 BAJO (Normal: 12-16)                   │   │
│  │    Hematocrito: 28% 🔴 BAJO (Normal: 36-46)                         │   │
│  │    VCM: 61.9 fL ⚪ NORMAL                                             │   │
│  │                                                                       │   │
│  │    Confianza: 96%                                                     │   │
│  │                                                                       │   │
│  │    💡 Sugerencia IA: "Anemia microcítica hipocrómica. Recomendación │   │
│  │                       evaluación hematológica y estudio de hierro." │   │
│  │                                                                       │   │
│  │    ⚠️  Riesgo: SEGMENTO - Requiere seguimiento                       │   │
│  │                                                                       │   │
│  │    [Ver detalles] [Descargar PDF]                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  RESUMEN DE RIESGOS DETECTADOS POR IA                                       │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  🔴 Críticos: 0        🟡 Segmento: 1        🟢 Normal: 7                  │
│                                                                             │
│  Riesgos principales:                                                      │
│  • Anemia microcítica (Laboratorio)                                         │
│  • Patrón restrictivo pulmonar (Espirometría)                              │
│                                                                             │
│                          [◀ Anterior]  [Ir a Validación ▶]                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.6 Historial de Visitas en Perfil del Trabajador

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PERFIL: Roberto Caicero | CAB-R-19700221-M-AMI                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Datos Básicos] [Antecedentes] [Historial de Visitas] [Empresas]            │
│ ═════════════════════════════════════════════════════════════════════════════│
│                                                                             │
│  📊 HISTORIAL DE VISITAS MÉDICAS                                            │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  [Filtrar rango fechas] [Exportar ▼]                                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Fecha      │ ID Papeleta│ Clínica      │ TA      │ Peso │IMC  │Rgo │   │
│  ├────────────┼────────────┼──────────────┼─────────┼──────┼─────┼────┤   │
│  │21/01/2026  │EXP-000001  │Monterrey     │189/89🔴 │91kg  │30.4│🟡  │   │
│  │            │            │              │ G2      │      │Obes│Seg │   │
│  ├────────────┼────────────┼──────────────┼─────────┼──────┼─────┼────┤   │
│  │15/12/2025  │EXP-999999  │Monterrey     │180/85🟡 │90kg  │30.1│🟢  │   │
│  │            │            │              │ Normal-A│      │Obes│Nor │   │
│  ├────────────┼────────────┼──────────────┼─────────┼──────┼─────┼────┤   │
│  │10/11/2025  │EXP-999998  │Monterrey     │178/82🟢 │88kg  │29.4│🟢  │   │
│  │            │            │              │ Normal  │      │Sob │Nor │   │
│  ├────────────┼────────────┼──────────────┼─────────┼──────┼─────┼────┤   │
│  │05/10/2025  │EXP-999997  │Monterrey     │172/80🟢 │85kg  │28.4│🟢  │   │
│  │            │            │              │ Normal  │      │Sob │Nor │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Leyenda de Riesgos: 🟢 Normal  🟡 Segmento  🔴 Crítico                    │
│  Clasificación TA: 🟢 Normal | 🟡 Normal-Alta | 🔴 Hipertensión            │
│  Clasificación IMC: 🟢 Normal | 🟡 Sobrepeso/Obesidad | 🔴 Crítico         │
│                                                                             │
│  [Ver detalle] [Descargar reportes] [Gráficos de evolución]                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Validaciones y Reglas de Negocio

```typescript
// packages/mod-expedientes/src/validators/expedient.validator.ts

const vitalSignsSchema = z.object({
  ta_systolic: z.number().min(40).max(300),
  ta_diastolic: z.number().min(20).max(200),
  fc: z.number().min(30).max(200),
  fr: z.number().min(5).max(50),
  temperature: z.number().min(35).max(42),
  weight: z.number().min(30).max(300),
  height: z.number().min(0.5).max(2.5),
});

const imageValidations = {
  maxFileSizeBytes: 50 * 1024 * 1024,  // 50MB
  allowedMimes: ['application/pdf', 'image/png', 'image/jpeg'],
  allowedExtensions: ['pdf', 'png', 'jpg', 'jpeg'],
};
```

### Reglas de Negocio

| Regla | Descripción |
|-------|-------------|
| **RN-001** | IMC se calcula automáticamente: peso / (altura²) |
| **RN-002** | Clasificaciones (TA, IMC) se asignan automáticamente |
| **RN-003** | Un trabajador puede tener múltiples expedientes (una por visita) |
| **RN-004** | Los antecedentes se referencian desde Patient (estáticos) |
| **RN-005** | Los estudios deben procesarse en cola antes de validación |
| **RN-006** | ExtractedData solo se crea si StudyUpload = COMPLETED |
| **RN-007** | PreDiagnosis se genera automáticamente con ExtractedData |
| **RN-008** | No se puede ir a validación sin status COMPLETED |

---

## 7. Checklist de Implementación

### 7.1 MVP (Demo 23-Ene-2026)

- [ ] **Modelos Prisma**
  - [ ] Expandir MedicalExam con nuevos campos JSON
  - [ ] Crear modelo ExtractedData
  - [ ] Actualizar StudyUpload
  - [ ] Migraciones

- [ ] **Servicios**
  - [ ] Cálculo automático IMC + clasificaciones
  - [ ] Generador de PreDiagnosis (mock/template)
  - [ ] Servicio de procesamiento de estudios (mock)

- [ ] **APIs**
  - [ ] CRUD expedientes
  - [ ] Subida de estudios
  - [ ] Obtener datos extraídos
  - [ ] Procesar estudios (mock)
  - [ ] Historial del trabajador

- [ ] **UI**
  - [ ] Formulario de captura (5 tabs)
  - [ ] Estudios procesados
  - [ ] Historial en perfil

### 7.2 Post-MVP

- [ ] Integración IA real (OCR, procesamiento)
- [ ] Gráficas de evolución
- [ ] Exportación a PDF
- [ ] Audit trail completo

---

## 8. Casos de Prueba

| ID | Escenario | Resultado |
|----|-----------|-----------|
| TC-01 | Capturar signos vitales | IMC calcula automático, clasificaciones asignadas |
| TC-02 | Subir PDF de laboratorio | Status PENDING, en cola procesamiento |
| TC-03 | Procesar estudios (mock) | ExtractedData creado, PreDiagnosis generado |
| TC-04 | Ver historial trabajador | Tabla con última visita + evolución |
| TC-05 | Cargar estudios con confianza baja | PreDiagnosis marca como LOW confidence |

---

## 9. Relaciones entre Modelos

```
Patient (1)
  ↓
  └─→ MedicalExam (N)
       ├─→ StudyUpload (N)
       │   └─→ ExtractedData (1)
       │       └─→ PreDiagnosis
       └─→ [Historial en Perfil]
```

---

## Historial de Cambios

| Fecha | Versión | Cambios | Autor |
|-------|---------|---------|-------|
| 2026-01-21 | 1.0.0 | Creación inicial | SOFIA |

---

> **Documento de respaldo:** `context/modules/SPEC-MOD-EXPEDIENTES.md`  
> **ID de Intervención:** `IMPL-20260121-03`
