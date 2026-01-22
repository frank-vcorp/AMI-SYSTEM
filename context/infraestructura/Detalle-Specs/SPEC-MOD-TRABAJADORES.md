# SPEC-MOD-TRABAJADORES (Pacientes/Workers)

> **ID Documento:** `IMPL-20260121-01`  
> **Versión:** 1.0.0  
> **Última Actualización:** 2026-01-21  
> **Autor:** SOFIA (Builder Agent)  
> **Módulo:** `mod-trabajadores` (código interno: Patient)

---

## 1. Resumen Ejecutivo

El módulo de **Trabajadores** gestiona el registro completo de los pacientes/empleados que acuden a exámenes médicos ocupacionales. Este es el módulo central del sistema ya que conecta Empresas, Citas y Expedientes.

### Decisión de Nomenclatura
- **Código (Prisma/API):** `Patient` (mantener por compatibilidad)
- **UI/Labels:** "Trabajadores"
- **Justificación:** Es medicina ocupacional, no clínica general

---

## 2. Modelo de Datos

### 2.1 Modelo Principal: Patient (Trabajador)

```prisma
// packages/core-database/prisma/schema.prisma

model Patient {
  id          String   @id @default(uuid())
  tenantId    String
  
  // ═══════════════════════════════════════════════════════════
  // IDENTIFICACIÓN ÚNICA
  // Formato: [DATOS_PERSONALES] + [FECHA_NAC] + [HOMOCLAVE]
  // Ejemplo: SAAG-19850315-M-AMI-CLI
  // ═══════════════════════════════════════════════════════════
  uniqueId    String   @unique  // Identificador único generado
  
  // ═══════════════════════════════════════════════════════════
  // DATOS PERSONALES BÁSICOS
  // ═══════════════════════════════════════════════════════════
  firstName       String              // Nombre
  paternalLastName String             // Apellido Paterno
  maternalLastName String?            // Apellido Materno (opcional en algunos casos)
  birthDate       DateTime            // Fecha de Nacimiento
  birthPlace      String?             // Lugar de Nacimiento
  gender          Gender              // Sexo (M/F)
  
  // ═══════════════════════════════════════════════════════════
  // DOCUMENTOS DE IDENTIDAD
  // ═══════════════════════════════════════════════════════════
  curp            String?  @unique    // CURP (18 caracteres)
  rfc             String?             // RFC (puede generarse)
  nss             String?             // Número de Seguro Social
  
  // ═══════════════════════════════════════════════════════════
  // DATOS DEMOGRÁFICOS
  // ═══════════════════════════════════════════════════════════
  nationality     String?  @default("MEXICANA")
  maritalStatus   MaritalStatus?      // Estado Civil
  educationLevel  EducationLevel?     // Escolaridad
  
  // ═══════════════════════════════════════════════════════════
  // CONTACTO
  // ═══════════════════════════════════════════════════════════
  phone           String              // Teléfono (requerido)
  email           String?             // Email (opcional)
  address         String?             // Dirección completa
  
  // ═══════════════════════════════════════════════════════════
  // DATOS LABORALES (Empleo Actual)
  // ═══════════════════════════════════════════════════════════
  currentPosition     String?         // Puesto Actual
  currentArea         String?         // Área
  positionSeniority   String?         // Antigüedad en Puesto
  areaSeniority       String?         // Antigüedad en Área
  riskFactor          String?         // Factor de Riesgo
  employeeNumber      String?         // Número de Empleado interno
  hireDate            DateTime?       // Fecha de ingreso
  
  // ═══════════════════════════════════════════════════════════
  // RELACIONES EMPRESARIALES
  // ═══════════════════════════════════════════════════════════
  // Un trabajador puede pertenecer a múltiples empresas
  // (ej: trabaja en PEMEX pero antes estuvo en CEMEX)
  companies       PatientCompany[]
  
  // ═══════════════════════════════════════════════════════════
  // HISTORIAL MÉDICO (JSON estructurado)
  // Se llena en primera entrevista, se actualiza si cambia
  // ═══════════════════════════════════════════════════════════
  medicalHistory  Json?   // Ver estructura en sección 2.3
  
  // ═══════════════════════════════════════════════════════════
  // ANTECEDENTES LABORALES
  // ═══════════════════════════════════════════════════════════
  hasWorkAccidents        Boolean @default(false)  // Antecedentes accidentes laborales
  workAccidentsDetail     String?                  // Especifique
  hasOccupationalDiseases Boolean @default(false)  // Enfermedades profesionales
  occupationalDiseasesDetail String?               // Especifique
  
  // ═══════════════════════════════════════════════════════════
  // METADATA Y ESTADO
  // ═══════════════════════════════════════════════════════════
  status          PatientStatus @default(ACTIVE)
  photoUrl        String?       // URL de foto (opcional)
  comments        String?       // Comentarios generales
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // ═══════════════════════════════════════════════════════════
  // RELACIONES
  // ═══════════════════════════════════════════════════════════
  appointments    Appointment[]
  expedients      Expedient[]
  
  @@index([tenantId])
  @@index([uniqueId])
  @@index([curp])
  @@index([firstName, paternalLastName])
  @@map("patients")
}

// Tabla de relación: Trabajador ↔ Empresa
model PatientCompany {
  id          String   @id @default(uuid())
  
  patientId   String
  patient     Patient  @relation(fields: [patientId], references: [id])
  
  companyId   String
  company     Company  @relation(fields: [companyId], references: [id])
  
  jobProfileId String?
  jobProfile   JobProfile? @relation(fields: [jobProfileId], references: [id])
  
  isActive    Boolean  @default(true)  // Si sigue activo en esta empresa
  startDate   DateTime @default(now())
  endDate     DateTime?
  
  createdAt   DateTime @default(now())
  
  @@unique([patientId, companyId])
  @@map("patient_companies")
}
```

### 2.2 Enums

```prisma
enum Gender {
  MALE        // Masculino
  FEMALE      // Femenino
}

enum MaritalStatus {
  SINGLE      // Soltero
  MARRIED     // Casado
  DIVORCED    // Divorciado
  WIDOWED     // Viudo
  COHABITING  // Unión libre
}

enum EducationLevel {
  NONE        // Sin estudios
  PRIMARY     // Primaria
  SECONDARY   // Secundaria
  HIGH_SCHOOL // Preparatoria
  TECHNICAL   // Técnico
  BACHELOR    // Licenciatura
  MASTER      // Maestría
  DOCTORATE   // Doctorado
}

enum PatientStatus {
  ACTIVE          // Activo
  INACTIVE        // Inactivo (baja)
  ON_LEAVE        // Incapacidad temporal
  PENDING_REVIEW  // Pendiente de revisión
}
```

### 2.3 Estructura JSON: medicalHistory

El historial médico se almacena como JSON estructurado para flexibilidad. Se captura en la primera entrevista.

```typescript
// packages/core-types/src/medical-history.types.ts

/**
 * Estructura completa del historial médico del trabajador
 * @doc context/modules/SPEC-MOD-TRABAJADORES.md
 */
interface MedicalHistory {
  // ═══════════════════════════════════════════════════════════
  // ANTECEDENTES HEREDO-FAMILIARES
  // Valores: "NONE" | "FATHER" | "MOTHER" | "BOTH" | "GRANDPARENTS"
  // ═══════════════════════════════════════════════════════════
  familyHistory: {
    diabetes: FamilyHistoryValue;
    hypertension: FamilyHistoryValue;      // HAS
    epilepsy: FamilyHistoryValue;
    heartDisease: FamilyHistoryValue;      // Cardiopatía
    kidneyDisease: FamilyHistoryValue;     // Renales
    asthma: FamilyHistoryValue;
    cancer: FamilyHistoryValue;
    mentalDisorders: FamilyHistoryValue;   // Mentales
    other: string | null;                  // Otras (texto libre)
  };
  
  // ═══════════════════════════════════════════════════════════
  // ANTECEDENTES PERSONALES NO PATOLÓGICOS Y TOXICOMANÍAS
  // ═══════════════════════════════════════════════════════════
  nonPathological: {
    // Alcohol
    alcohol: {
      status: SubstanceStatus;          // NEGATIVE | POSITIVE | SUSPENDED
      startAge: number | null;          // Edad de comienzo
      frequency: string | null;         // Diario, Semanal, Quincenal, Mensual
      isSuspended: boolean;
      suspendedTime: string | null;     // Tiempo suspendido
    };
    
    // Tabaco
    tobacco: {
      status: SubstanceStatus;
      startAge: number | null;
      frequency: string | null;
      isSuspended: boolean;
      suspendedTime: string | null;
      cigarettesPerDay: number | null;
    };
    
    // Drogas estimulantes
    drugs: {
      status: SubstanceStatus;
      detail: string | null;            // Especifique
      lastUse: string | null;           // Último consumo
    };
    
    // Ejercicio
    exercise: {
      status: SubstanceStatus;          // NEGATIVE = no hace
      detail: string | null;            // Tipo de ejercicio
      frequency: string | null;
    };
    
    // Otros hábitos
    diet: DietQuality;                  // POOR | REGULAR | GOOD | EXCELLENT
    bloodType: BloodType | null;        // Grupo y RH
    hasTattoos: boolean;
    tattoosDetail: string | null;
    currentMedicalTreatment: string | null;  // Tx. Médico Actual
  };
  
  // ═══════════════════════════════════════════════════════════
  // ANTECEDENTES PERSONALES PATOLÓGICOS
  // Cada uno es boolean (true = SÍ tiene/tuvo)
  // ═══════════════════════════════════════════════════════════
  pathological: {
    diabetes: boolean;
    typhoid: boolean;                   // Tifoidea
    kidneyDisease: boolean;             // Renales
    hernias: boolean;
    hypertension: boolean;              // HAS
    asthma: boolean;
    epilepsy: boolean;
    hemorrhoids: boolean;               // Hemorroides
    cancer: boolean;
    allergies: boolean;
    allergiesDetail: string | null;     // Especifique alergias
    vertigo: boolean;
    headTrauma: boolean;                // Traumatismos craneales
    heartDisease: boolean;              // Cardiopatías
    mumps: boolean;                     // Parotiditis
    fainting: boolean;                  // Desmayos
    bronchitis: boolean;
    dermatitis: boolean;
    fractures: boolean;
    gynecological: boolean;             // Ginecológicos
    spinalPathology: boolean;           // Pat. C. Vertebral
    pneumonia: boolean;                 // Neumonías
    varicoseVeins: boolean;             // Varices
    surgeries: boolean;                 // Cirugías
    surgeriesDetail: string | null;
    std: boolean;                       // Enf. Trans. Sexual
    tuberculosis: boolean;
    hepatitis: boolean;
    transfusions: boolean;
    endocrinopathies: boolean;          // Endocrinopatías
    rashes: boolean;                    // Exantemáticas
    psychiatric: boolean;               // Psiquiátricas
    colitis: boolean;
    gastritis: boolean;
    migraine: boolean;                  // Migraña
    other: string | null;               // Otras
    otherDetail: string | null;
  };
  
  // ═══════════════════════════════════════════════════════════
  // ANTECEDENTES REPRODUCTIVOS
  // ═══════════════════════════════════════════════════════════
  reproductive: {
    sexuallyActive: SexualActivityStatus;  // N/A | ACTIVE | INACTIVE
    sexualActivityStartAge: number | null; // I.V.S
    contraceptiveMethod: string | null;    // M.P.F
    prostateExamDate: string | null;       // D.O.C Próstata (para hombres)
    // Campos adicionales para mujeres (si aplica)
    lastMenstruation: string | null;
    pregnancies: number | null;
    births: number | null;
    cesareans: number | null;
    abortions: number | null;
  };
  
  // ═══════════════════════════════════════════════════════════
  // INMUNIZACIONES
  // Valores: fecha de aplicación o null si no tiene
  // ═══════════════════════════════════════════════════════════
  immunizations: {
    rubella: string | null;             // Rubeola
    measles: string | null;             // Sarampión
    tetanus: string | null;             // Toxoide Tetánico
    pneumococcal: string | null;        // Neumococo
    influenza: string | null;
    hepatitisB: string | null;
    other: string | null;
    nextDoseDate: string | null;        // Próxima dosis
  };
  
  // ═══════════════════════════════════════════════════════════
  // HISTORIAL LABORAL ANTERIOR (opcional, para referencia)
  // ═══════════════════════════════════════════════════════════
  previousEmployment?: {
    company: string | null;             // Último empleo
    position: string | null;            // Puesto
    riskFactor: string | null;          // Factor de riesgo
    duration: string | null;            // Antigüedad
  };
}

// Tipos auxiliares
type FamilyHistoryValue = 'NONE' | 'FATHER' | 'MOTHER' | 'BOTH' | 'GRANDPARENTS' | 'SIBLINGS';
type SubstanceStatus = 'NEGATIVE' | 'POSITIVE' | 'SUSPENDED';
type DietQuality = 'POOR' | 'REGULAR' | 'GOOD' | 'EXCELLENT';
type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'UNKNOWN';
type SexualActivityStatus = 'NA' | 'ACTIVE' | 'INACTIVE';
```

---

## 3. Generación del Identificador Único

El identificador único se genera automáticamente siguiendo la especificación acordada:

```typescript
// packages/core/src/utils/generate-patient-id.ts

/**
 * Genera el identificador único del paciente
 * Formato: [DATOS_PERSONALES]-[FECHA_NAC]-[HOMOCLAVE]
 * Ejemplo: SAAG-19850315-M-AMI-CLI
 * 
 * @doc context/Procedimiento Sistema AMI.md
 */
export function generatePatientUniqueId(params: {
  firstName: string;
  paternalLastName: string;
  maternalLastName?: string;
  birthDate: Date;
  gender: 'MALE' | 'FEMALE';
  entity: 'AMI' | 'SOL';      // AMI o Soluciones
  type: 'CLI' | 'MUL';        // Clínicas o Multicliente
}): string {
  const {
    firstName,
    paternalLastName,
    maternalLastName,
    birthDate,
    gender,
    entity,
    type
  } = params;
  
  // 1. DATOS PERSONALES (primeras 2 letras de cada apellido + primera del nombre)
  const datosPersonales = [
    paternalLastName.substring(0, 2).toUpperCase(),
    (maternalLastName || 'X').substring(0, 1).toUpperCase(),
    firstName.substring(0, 1).toUpperCase()
  ].join('');
  
  // 2. FECHA DE NACIMIENTO (YYYYMMDD)
  const fechaNac = birthDate.toISOString().split('T')[0].replace(/-/g, '');
  
  // 3. HOMOCLAVE INTERNA
  const sexo = gender === 'MALE' ? 'M' : 'F';
  const homoclave = `${sexo}-${entity}-${type}`;
  
  return `${datosPersonales}-${fechaNac}-${homoclave}`;
}

// Ejemplo de uso:
// generatePatientUniqueId({
//   firstName: 'Roberto',
//   paternalLastName: 'Caicero',
//   maternalLastName: 'Beltran',
//   birthDate: new Date('1970-02-21'),
//   gender: 'MALE',
//   entity: 'AMI',
//   type: 'CLI'
// })
// Resultado: "CAB-R-19700221-M-AMI-CLI"
```

---

## 4. Diagrama de Relaciones

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TRABAJADOR (Patient)                            │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  uniqueId: CAB-R-19700221-M-AMI-CLI                                 │    │
│  │  firstName: Roberto                                                  │    │
│  │  paternalLastName: Caicero                                          │    │
│  │  maternalLastName: Beltran                                          │    │
│  │  birthDate: 1970-02-21                                              │    │
│  │  gender: MALE                                                        │    │
│  │  phone: 4427042916                                                   │    │
│  │  status: ACTIVE                                                      │    │
│  │  medicalHistory: { familyHistory: {...}, pathological: {...} }      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
           │                           │                          │
           ▼                           ▼                          ▼
┌─────────────────┐         ┌─────────────────┐        ┌─────────────────┐
│ PatientCompany  │         │   Appointment   │        │    Expedient    │
├─────────────────┤         ├─────────────────┤        ├─────────────────┤
│ patientId       │         │ patientId       │        │ patientId       │
│ companyId ──────┼──┐      │ date            │        │ vitalSigns (JSON)│
│ jobProfileId    │  │      │ type            │        │ visualAcuity    │
│ isActive: true  │  │      │ status          │        │ examResults     │
└─────────────────┘  │      └─────────────────┘        └─────────────────┘
                     │
                     ▼
        ┌─────────────────────┐
        │      Company        │
        ├─────────────────────┤
        │ PEMEX-MTY-01        │
        │ jobProfiles[]       │
        └─────────────────────┘
```

---

## 5. API Endpoints

### 5.1 CRUD Básico

```typescript
// GET /api/patients
// Lista de trabajadores con paginación y filtros
interface GetPatientsQuery {
  page?: number;
  limit?: number;
  search?: string;           // Busca en nombre, CURP, uniqueId
  companyId?: string;        // Filtrar por empresa
  status?: PatientStatus;
  gender?: Gender;
}

// GET /api/patients/:id
// Detalle completo de un trabajador

// POST /api/patients
// Crear nuevo trabajador
interface CreatePatientPayload {
  // Datos básicos (requeridos)
  firstName: string;
  paternalLastName: string;
  maternalLastName?: string;
  birthDate: string;          // ISO 8601
  gender: 'MALE' | 'FEMALE';
  phone: string;
  
  // Datos opcionales
  curp?: string;
  rfc?: string;
  nss?: string;
  birthPlace?: string;
  nationality?: string;
  maritalStatus?: MaritalStatus;
  educationLevel?: EducationLevel;
  email?: string;
  address?: string;
  
  // Datos laborales
  companyId: string;          // Empresa principal
  jobProfileId?: string;
  currentPosition?: string;
  currentArea?: string;
  employeeNumber?: string;
  
  // Configuración ID único
  entity: 'AMI' | 'SOL';
  type: 'CLI' | 'MUL';
  
  // Foto
  photoUrl?: string;
  comments?: string;
}

// PUT /api/patients/:id
// Actualizar trabajador

// DELETE /api/patients/:id (soft delete → status: INACTIVE)
```

### 5.2 Historial Médico

```typescript
// GET /api/patients/:id/medical-history
// Obtiene el historial médico completo

// PUT /api/patients/:id/medical-history
// Actualiza el historial médico (primera entrevista o actualizaciones)
interface UpdateMedicalHistoryPayload {
  familyHistory?: FamilyHistory;
  nonPathological?: NonPathological;
  pathological?: Pathological;
  reproductive?: Reproductive;
  immunizations?: Immunizations;
}
```

### 5.3 Relaciones con Empresas

```typescript
// GET /api/patients/:id/companies
// Lista de empresas donde trabaja/trabajó

// POST /api/patients/:id/companies
// Agregar trabajador a una empresa
interface AddPatientToCompanyPayload {
  companyId: string;
  jobProfileId?: string;
  startDate?: string;
}

// DELETE /api/patients/:id/companies/:companyId
// Dar de baja de una empresa (soft delete)
```

---

## 6. Validaciones y Reglas de Negocio

### 6.1 Validaciones de Campos

```typescript
// packages/mod-trabajadores/src/validators/patient.validator.ts

const patientSchema = z.object({
  // Requeridos
  firstName: z.string()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(50),
  paternalLastName: z.string()
    .min(2, 'Apellido debe tener al menos 2 caracteres')
    .max(50),
  birthDate: z.string()
    .refine(date => {
      const birth = new Date(date);
      const age = calculateAge(birth);
      return age >= 16 && age <= 100;
    }, 'Edad debe estar entre 16 y 100 años'),
  gender: z.enum(['MALE', 'FEMALE']),
  phone: z.string()
    .regex(/^\d{10}$/, 'Teléfono debe tener 10 dígitos'),
  companyId: z.string().uuid('Empresa inválida'),
  
  // Opcionales con validación
  curp: z.string()
    .length(18, 'CURP debe tener 18 caracteres')
    .regex(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/)
    .optional()
    .nullable(),
  rfc: z.string()
    .min(12).max(13)
    .optional()
    .nullable(),
  email: z.string().email().optional().nullable(),
});
```

### 6.2 Reglas de Negocio

| Regla | Descripción |
|-------|-------------|
| **RN-001** | El `uniqueId` se genera automáticamente, no es editable |
| **RN-002** | CURP debe ser único en el sistema (si se proporciona) |
| **RN-003** | Un trabajador DEBE estar asociado a al menos una empresa |
| **RN-004** | La edad mínima es 16 años (trabajo legal en México) |
| **RN-005** | Campos de historial médico NO son requeridos en alta inicial |
| **RN-006** | Al dar de baja, se cambia status a INACTIVE, no se elimina |
| **RN-007** | La foto es opcional pero recomendada para identificación |
| **RN-008** | RFC puede generarse automáticamente desde CURP |

---

## 7. Checklist de Implementación

### 7.1 MVP (Demo 23-Ene-2026)

- [ ] **Modelo Prisma**
  - [ ] Crear modelo Patient con campos básicos
  - [ ] Crear modelo PatientCompany (relación N:N)
  - [ ] Agregar enums (Gender, MaritalStatus, etc.)
  - [ ] Migración de base de datos

- [ ] **API Endpoints**
  - [ ] `GET /api/patients` - Lista con paginación
  - [ ] `GET /api/patients/:id` - Detalle
  - [ ] `POST /api/patients` - Crear (datos básicos)
  - [ ] `PUT /api/patients/:id` - Actualizar
  - [ ] `DELETE /api/patients/:id` - Soft delete

- [ ] **Generador de ID**
  - [ ] Implementar `generatePatientUniqueId()`
  - [ ] Tests unitarios

- [ ] **UI Básica**
  - [ ] Página lista de trabajadores
  - [ ] Formulario de alta (Tab 1: Datos básicos)
  - [ ] Búsqueda y filtros básicos
  - [ ] Estados visuales

### 7.2 Post-MVP

- [ ] **Historial Médico Completo**
  - [ ] Endpoints para actualizar medicalHistory
  - [ ] UI Tabs (Antecedentes, Toxicomanías, etc.)
  - [ ] Validaciones específicas por sección

- [ ] **Funcionalidades Avanzadas**
  - [ ] Carga de foto (integración Storage)
  - [ ] Generación automática de RFC
  - [ ] Validación CURP contra RENAPO (API externa)
  - [ ] Historial de cambios (audit log)
  - [ ] Exportación a Excel/PDF

- [ ] **Integraciones**
  - [ ] Vincular con módulo de Citas
  - [ ] Vincular con módulo de Expedientes
  - [ ] Migración de datos desde sistema legacy

---

## 8. Casos de Prueba

### 8.1 Happy Path

| ID | Escenario | Pasos | Resultado Esperado |
|----|-----------|-------|-------------------|
| TC-01 | Alta trabajador básica | Llenar datos mínimos, guardar | Se genera uniqueId, status ACTIVE |
| TC-02 | Búsqueda por CURP | Buscar CURP existente | Retorna trabajador correcto |
| TC-03 | Filtrar por empresa | Seleccionar empresa en filtro | Solo muestra trabajadores de esa empresa |
| TC-04 | Agregar a segunda empresa | Asignar trabajador a nueva empresa | Aparece en ambas empresas |

### 8.2 Edge Cases

| ID | Escenario | Pasos | Resultado Esperado |
|----|-----------|-------|-------------------|
| TC-10 | CURP duplicado | Crear trabajador con CURP existente | Error: CURP ya registrado |
| TC-11 | Sin apellido materno | Crear trabajador sin apellido materno | Se genera ID con 'X' en posición |
| TC-12 | Edad límite | Crear con fecha nac. hace 15 años | Error: Edad mínima 16 años |
| TC-13 | Dar de baja activo en cita | Intentar dar de baja con cita pendiente | Warning: Tiene citas programadas |

---

## Historial de Cambios

| Fecha | Versión | Cambios | Autor |
|-------|---------|---------|-------|
| 2026-01-21 | 1.0.0 | Creación inicial del documento | SOFIA |

---

> **Documento de respaldo:** `context/modules/SPEC-MOD-TRABAJADORES.md`  
> **ID de Intervención:** `IMPL-20260121-01`
