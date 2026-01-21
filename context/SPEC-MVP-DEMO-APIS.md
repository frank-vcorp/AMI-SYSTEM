# SPEC-MVP-DEMO-APIS

**ID de Intervención:** `IMPL-20260121-01`  
**Fecha:** 2026-01-21  
**Autor:** SOFIA (Claude Opus 4.5)  
**Estado:** Pendiente  
**Demo:** Jueves 23 de Enero de 2026

---

## 🎯 Objetivo

Documentar completamente el mapa de APIs del sistema AMI-SYSTEM para el MVP de demostración, incluyendo:
- APIs existentes y su estado (real vs mock)
- APIs faltantes que deben crearse
- Conexiones entre Modelos → APIs → Páginas
- Recursos de ClinicMaster a utilizar
- Plan de implementación para agentes IA

---

## 📋 Contexto

El sistema AMI-SYSTEM es una plataforma de gestión médica ocupacional que permite:
1. Registrar clínicas, médicos, empresas y pacientes
2. Agendar citas con baterías de servicios
3. Generar expedientes con exámenes y estudios médicos
4. Validar resultados y emitir certificados
5. Entregar reportes a empresas

**Requisitos MVP:**
- ✅ CRUD completo para todos los módulos
- ✅ Sin datos de ejemplo (usuario genera datos reales)
- ✅ Persistencia en PostgreSQL (Prisma)
- ✅ URL de Vercel abre directamente el dashboard (no landing)
- ✅ Estilo visual basado en ClinicMaster template

---

## 🗄️ Modelos Prisma (16 totales)

| Modelo | Descripción | API Existe | Prioridad |
|--------|-------------|------------|-----------|
| `Clinic` | Clínicas/sucursales | ✅ Parcial | 🔥 Crítica |
| `ClinicSchedule` | Horarios de clínica | ❌ No | Media |
| `Doctor` | Médicos validadores | ✅ Completa | 🔥 Crítica |
| `Company` | Empresas cliente | ❌ No | 🔥 Crítica |
| `JobProfile` | Perfiles de puesto | ❌ No | Alta |
| `Patient` | Pacientes/empleados | ❌ No | 🔥 Crítica |
| `Service` | Servicios individuales | ❌ No | Alta |
| `Battery` | Baterías (grupos de servicios) | ❌ No | Alta |
| `BatteryService` | Relación Battery↔Service | ❌ No | Alta |
| `ClinicService` | Servicios disponibles por clínica | ❌ No | Media |
| `CompanyBattery` | Baterías contratadas por empresa | ❌ No | Media |
| `Appointment` | Citas agendadas | ✅ Parcial | 🔥 Crítica |
| `Expedient` | Expedientes médicos | ✅ Completa | 🔥 Crítica |
| `MedicalExam` | Exámenes físicos | ✅ Completa | Alta |
| `Study` | Estudios (lab, rayos X, etc.) | ✅ Completa | Alta |
| `ValidationTask` | Tareas de validación | ✅ Completa | Alta |

---

## 🌐 MAPA COMPLETO DE APIs

### LEYENDA DE ESTADOS

| Estado | Significado |
|--------|-------------|
| 🟢 REAL | Conectado a Prisma real, funcionando |
| 🟡 MOCK | Usa mockPrisma, debe corregirse |
| 🔴 NO EXISTE | API no creada, debe implementarse |
| ⏳ PLACEHOLDER | Endpoint existe pero no funcional |

---

### 1. MÓDULO CLÍNICAS (`/api/clinicas`)

#### 1.1 `/api/clinicas` - GET, POST
**Estado:** 🟢 REAL  
**Archivo:** `packages/web-app/src/app/api/clinicas/route.ts`  
**Usa:** `ClinicService` de `@ami/mod-clinicas` + Prisma real

| Método | Descripción | Parámetros |
|--------|-------------|------------|
| GET | Listar clínicas | `tenantId`, `page`, `pageSize`, `search`, `status`, `city` |
| POST | Crear clínica | `tenantId`, `createdBy`, `name`, `address`, `city`, `phone`, `email` |

**Response GET:**
```json
{
  "data": [{ "id": "...", "name": "...", "status": "ACTIVE" }],
  "pagination": { "total": 10, "page": 1, "pageSize": 20, "totalPages": 1 }
}
```

#### 1.2 `/api/clinicas/[id]` - GET, PUT, DELETE
**Estado:** 🟡 MOCK ⚠️ NECESITA CORRECCIÓN  
**Archivo:** `packages/web-app/src/app/api/clinicas/[id]/route.ts`  
**Problema:** Usa `mockPrisma` en lugar de Prisma real

| Método | Descripción | Parámetros |
|--------|-------------|------------|
| GET | Obtener clínica por ID | `id` (path), `tenantId` (query) |
| PUT | Actualizar clínica | `id` (path), body con campos a actualizar |
| DELETE | Eliminar clínica (soft delete) | `id` (path), `tenantId` (query) |

**🔧 CORRECCIÓN REQUERIDA:**
```typescript
// ANTES (líneas 4-13):
const mockPrisma = {
  clinic: {
    findMany: async () => [],
    findFirst: async () => null,
    ...
  }
};

// DESPUÉS:
import { prisma } from '@/lib/prisma';
// Usar prisma directamente en lugar de mockPrisma
```

---

### 2. MÓDULO DOCTORES (`/api/doctors`)

#### 2.1 `/api/doctors` - GET, POST
**Estado:** 🟢 REAL  
**Archivo:** `packages/web-app/src/app/api/doctors/route.ts`  
**Usa:** Prisma directamente

| Método | Descripción | Parámetros |
|--------|-------------|------------|
| GET | Listar doctores | `tenantId`, `clinicId` |
| POST | Crear doctor | `tenantId`, `clinicId`, `name`, `specialty`, `licenseNumber`, `email`, `phone`, `signature` (Json) |

**Nota:** El campo `signature` es de tipo `Json` para almacenar firma digital (base64 o metadata).

#### 2.2 `/api/doctors/[id]` - GET, PUT, DELETE
**Estado:** 🟢 REAL  
**Archivo:** `packages/web-app/src/app/api/doctors/[id]/route.ts`  
**Usa:** Funciones de `@ami/core-database` (`getDoctor`, `updateDoctor`, `deleteDoctor`)

| Método | Descripción |
|--------|-------------|
| GET | Obtener doctor por ID |
| PUT | Actualizar doctor |
| DELETE | Eliminar doctor |

---

### 3. MÓDULO CITAS (`/api/citas`)

#### 3.1 `/api/citas` - GET, POST
**Estado:** 🟢 REAL  
**Archivo:** `packages/web-app/src/app/api/citas/route.ts`  
**Usa:** `AppointmentService` de `@ami/mod-citas` + Prisma real

| Método | Descripción | Parámetros |
|--------|-------------|------------|
| GET | Listar citas | `tenantId`, `clinicId`, `employeeId`, `status`, `page`, `pageSize` |
| POST | Crear cita | `tenantId`, `clinicId`, `companyId`, `patientId`, `batteryId`, `scheduledAt`, `notes` |

#### 3.2 `/api/citas/[id]` - GET, PUT, DELETE
**Estado:** 🟡 MOCK ⚠️ NECESITA CORRECCIÓN  
**Archivo:** `packages/web-app/src/app/api/citas/[id]/route.ts`  
**Problema:** Usa `mockPrisma`

| Método | Descripción |
|--------|-------------|
| GET | Obtener cita por ID |
| PUT | Actualizar cita |
| DELETE | Cancelar cita (soft delete via status) |

**🔧 CORRECCIÓN REQUERIDA:** Reemplazar mockPrisma por prisma real

#### 3.3 `/api/citas/availability` - POST
**Estado:** 🟡 MOCK ⚠️ NECESITA CORRECCIÓN  
**Archivo:** `packages/web-app/src/app/api/citas/availability/route.ts`  
**Problema:** Usa `mockPrisma`

| Método | Descripción | Parámetros |
|--------|-------------|------------|
| POST | Buscar horarios disponibles | `clinicId`, `dateFrom`, `dateTo`, `serviceIds`, `durationMin` |

**Response:**
```json
{
  "slots": [
    { "date": "2026-01-23", "startTime": "09:00", "endTime": "09:30", "available": true }
  ]
}
```

---

### 4. MÓDULO EXPEDIENTES (`/api/expedientes`)

#### 4.1 `/api/expedientes` - GET, POST
**Estado:** 🟢 REAL  
**Archivo:** `packages/web-app/src/app/api/expedientes/route.ts`

| Método | Descripción | Parámetros |
|--------|-------------|------------|
| GET | Listar expedientes | `tenantId`, `clinicId`, `patientId`, `status`, `page`, `pageSize` |
| POST | Crear expediente | `tenantId`, `appointmentId`, `patientId`, `notes` |

**Lógica POST:**
1. Valida que appointment existe
2. Valida que patient existe
3. Genera folio único: `EXP-{CLINIC_ID_SHORT}-{SEQ}`
4. Crea expediente con status `PENDING`

#### 4.2 `/api/expedientes/[id]` - GET, PUT, DELETE
**Estado:** 🟢 REAL  
**Archivo:** `packages/web-app/src/app/api/expedientes/[id]/route.ts`

| Método | Descripción |
|--------|-------------|
| GET | Obtener expediente con relaciones (patient, clinic, medicalExams, studies) |
| PUT | Actualizar status y notas (valida máquina de estados) |
| DELETE | Soft delete (status → ARCHIVED) |

**Máquina de Estados:**
```
PENDING → IN_PROGRESS → STUDIES_PENDING → VALIDATED → COMPLETED → ARCHIVED
```

#### 4.3 `/api/expedientes/[id]/exam` - POST
**Estado:** 🟢 REAL  
**Archivo:** `packages/web-app/src/app/api/expedientes/[id]/exam/route.ts`

**Body:**
```json
{
  "bloodPressure": "120/80",
  "heartRate": 72,
  "respiratoryRate": 16,
  "temperature": 37.5,
  "weight": 75.5,
  "height": 175,
  "physicalExam": "Sin alteraciones",
  "notes": "Paciente en buen estado"
}
```

**Validaciones:**
- `bloodPressure`: formato "SYS/DIA", SYS: 50-250, DIA: 30-150
- `heartRate`: 40-200 bpm
- `respiratoryRate`: 4-60
- `temperature`: 35-42 °C
- `weight`: 2-300 kg
- `height`: 50-250 cm

#### 4.4 `/api/expedientes/[id]/studies` - GET, POST
**Estado:** 🟢 REAL  
**Archivo:** `packages/web-app/src/app/api/expedientes/[id]/studies/route.ts`

| Método | Descripción |
|--------|-------------|
| GET | Listar estudios del expediente |
| POST | Subir estudio (FormData: file + studyType) |

**StudyType válidos:** `RADIOGRAFIA`, `LABORATORIO`, `ECG`, `ESPIROMETRIA`, `AUDIOMETRIA`, `OTROS`

**Validaciones archivo:**
- Tipos: `application/pdf`, `image/jpeg`, `image/png`
- Tamaño máximo: 50MB

---

### 5. MÓDULO PAPELETAS (`/api/papeletas`)

#### 5.1 `/api/papeletas` - POST
**Estado:** 🟢 REAL  
**Archivo:** `packages/web-app/src/app/api/papeletas/route.ts`

**Descripción:** Crear papeleta de admisión (genera expediente desde recepción)

**Body:**
```json
{
  "tenantId": "...",
  "clinicId": "...",
  "patientId": "...",
  "studies": ["RADIOGRAFIA", "LABORATORIO"]
}
```

**Response:**
```json
{
  "success": true,
  "folio": "EXP-CLIN-20260121-001",
  "expedientId": "...",
  "message": "✅ Papeleta guardada exitosamente"
}
```

#### 5.2 `/api/papeletas/folio` - GET
**Estado:** 🟢 REAL  
**Descripción:** Generar folio único sin crear expediente

---

### 6. MÓDULO EXÁMENES (`/api/exams`)

#### 6.1 `/api/exams` - GET, POST
**Estado:** 🟢 REAL  
**Archivo:** `packages/web-app/src/app/api/exams/route.ts`

| Método | Descripción | Parámetros |
|--------|-------------|------------|
| GET | Obtener examen por expediente | `expedientId` (query) |
| POST | Guardar examen médico completo | `expedientId`, `examData` |

**POST actualiza expediente a status `VALIDATED`**

---

### 7. MÓDULO VALIDACIONES (`/api/validaciones`)

#### 7.1 `/api/validaciones` - GET, POST
**Estado:** 🟢 REAL  
**Archivo:** `packages/web-app/src/app/api/validaciones/route.ts`

| Método | Descripción | Parámetros |
|--------|-------------|------------|
| GET | Listar tareas de validación | `tenantId`, `status`, `limit`, `offset` |
| POST | Crear tarea de validación | `tenantId`, `expedientId` |

#### 7.2 `/api/validaciones/[id]` - GET, PATCH
**Estado:** 🟢 REAL  
**Archivo:** `packages/web-app/src/app/api/validaciones/[id]/route.ts`

| Método | Descripción |
|--------|-------------|
| GET | Obtener detalle de validación con expedient y patient |
| PATCH | Actualizar datos extraídos, opinión médica, veredicto |

**Veredictos:** `APTO`, `NO_APTO`, `APTO_CON_RESTRICCIONES`

---

### 8. MÓDULO ENTREGAS (`/api/deliveries`)

#### 8.1 `/api/deliveries` - POST
**Estado:** 🟢 REAL  
**Archivo:** `packages/web-app/src/app/api/deliveries/route.ts`

**Body:**
```json
{
  "expedientId": "...",
  "tenantId": "...",
  "method": "EMAIL | TEMPORAL_LINK | DOWNLOAD",
  "email": "empresa@email.com",
  "expiresIn": 168
}
```

**Actualiza expediente a status `COMPLETED`**

---

### 9. MÓDULO REPORTES (`/api/reportes`)

#### 9.1 `/api/reportes/[expedientId]/export-pdf` - POST
**Estado:** ⏳ PLACEHOLDER  
**Archivo:** `packages/web-app/src/app/api/reportes/[expedientId]/export-pdf/route.ts`

**Pendiente:**
1. Integrar jsPDF o pdfkit
2. Obtener datos de BD
3. Generar PDF con certificado
4. Guardar en GCS via core-storage
5. Retornar URL descargable

---

### 10. MÓDULO ARCHIVOS (`/api/files`)

#### 10.1 `/api/files/upload` - POST
**Estado:** 🟢 REAL  
**Archivo:** `packages/web-app/src/app/api/files/upload/route.ts`

**FormData:**
- `file`: Archivo a subir
- `tenantId`: ID del tenant

**Validaciones:**
- Tipos: `application/pdf`, `image/jpeg`, `image/png`
- Tamaño máximo: 50MB

**Ruta en GCS:** `uploads/{tenantId}/{timestamp}-{fileName}`

---

### 11. MÓDULO AUTH (`/api/auth`)

#### 11.1 `/api/auth/verify` - GET
**Estado:** 🟢 REAL  
**Descripción:** Verificar sesión activa

#### 11.2 `/api/auth/logout` - POST
**Estado:** 🟢 REAL  
**Descripción:** Cerrar sesión

---

### 12. DIAGNÓSTICO (`/api/diagnostics`)

#### 12.1 `/api/diagnostics` - GET
**Estado:** 🟢 REAL  
**Descripción:** Estado del sistema y conexiones

---

## 🔴 APIs QUE DEBEN CREARSE

### A. `/api/patients` - CRUD Pacientes
**Prioridad:** 🔥 CRÍTICA  
**Modelo:** `Patient`

```typescript
// packages/web-app/src/app/api/patients/route.ts
// GET: Listar pacientes con filtros
// POST: Crear paciente

// packages/web-app/src/app/api/patients/[id]/route.ts
// GET: Obtener paciente
// PUT: Actualizar paciente
// DELETE: Eliminar paciente
```

**Campos del modelo Patient:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | UUID |
| tenantId | String | Multi-tenant |
| companyId | String? | Empresa (opcional) |
| firstName | String | Nombre |
| lastName | String | Apellido |
| email | String? | Email |
| phone | String? | Teléfono |
| birthDate | DateTime? | Fecha nacimiento |
| gender | String? | Género |
| curp | String? | CURP |
| nss | String? | NSS |
| bloodType | String? | Tipo sangre |
| allergies | String? | Alergias |
| createdAt | DateTime | Creación |
| updatedAt | DateTime | Actualización |

### B. `/api/empresas` - CRUD Empresas
**Prioridad:** 🔥 CRÍTICA  
**Modelo:** `Company`

```typescript
// packages/web-app/src/app/api/empresas/route.ts
// GET: Listar empresas
// POST: Crear empresa

// packages/web-app/src/app/api/empresas/[id]/route.ts
// GET: Obtener empresa
// PUT: Actualizar empresa
// DELETE: Eliminar empresa
```

**Campos del modelo Company:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | UUID |
| tenantId | String | Multi-tenant |
| name | String | Razón social |
| rfc | String? | RFC |
| address | String? | Dirección |
| city | String? | Ciudad |
| phone | String? | Teléfono |
| email | String? | Email |
| contactName | String? | Contacto |
| status | String | ACTIVE/INACTIVE |
| createdAt | DateTime | Creación |
| updatedAt | DateTime | Actualización |

### C. `/api/services` - CRUD Servicios
**Prioridad:** ⚠️ ALTA  
**Modelo:** `Service`

```typescript
// packages/web-app/src/app/api/services/route.ts
// packages/web-app/src/app/api/services/[id]/route.ts
```

**Campos:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | UUID |
| tenantId | String | Multi-tenant |
| name | String | Nombre del servicio |
| code | String | Código interno |
| category | String | Categoría |
| description | String? | Descripción |
| duration | Int | Duración en minutos |
| price | Decimal? | Precio base |
| status | String | ACTIVE/INACTIVE |

### D. `/api/batteries` - CRUD Baterías
**Prioridad:** ⚠️ ALTA  
**Modelo:** `Battery`

```typescript
// packages/web-app/src/app/api/batteries/route.ts
// packages/web-app/src/app/api/batteries/[id]/route.ts
```

**Campos:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | UUID |
| tenantId | String | Multi-tenant |
| name | String | Nombre de la batería |
| code | String | Código |
| description | String? | Descripción |
| services | BatteryService[] | Servicios incluidos |
| price | Decimal? | Precio total |
| status | String | ACTIVE/INACTIVE |

### E. `/api/job-profiles` - CRUD Perfiles de Puesto
**Prioridad:** MEDIA  
**Modelo:** `JobProfile`

```typescript
// packages/web-app/src/app/api/job-profiles/route.ts
// packages/web-app/src/app/api/job-profiles/[id]/route.ts
```

---

## 🔗 DIAGRAMA DE CONEXIONES

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FLUJO PRINCIPAL MVP                              │
└─────────────────────────────────────────────────────────────────────────┘

CONFIGURACIÓN INICIAL (Admin)
═══════════════════════════════════════════════════════════════════════════

     ┌──────────────┐
     │   /admin     │ ◄─── Landing redirige aquí
     └──────┬───────┘
            │
     ┌──────▼───────┐         ┌─────────────────┐
     │   Clínicas   │─────────►  /api/clinicas  │──► Clinic
     └──────┬───────┘         └─────────────────┘
            │
     ┌──────▼───────┐         ┌─────────────────┐
     │   Doctores   │─────────►  /api/doctors   │──► Doctor
     └──────────────┘         └─────────────────┘
            
     ┌──────────────┐         ┌─────────────────┐
     │   Empresas   │─────────►  /api/empresas  │──► Company (❌ NO EXISTE)
     └──────────────┘         └─────────────────┘

     ┌──────────────┐         ┌─────────────────┐
     │   Servicios  │─────────►  /api/services  │──► Service (❌ NO EXISTE)
     └──────┬───────┘         └─────────────────┘
            │
     ┌──────▼───────┐         ┌─────────────────┐
     │   Baterías   │─────────►  /api/batteries │──► Battery (❌ NO EXISTE)
     └──────────────┘         └─────────────────┘


FLUJO OPERATIVO (Usuario)
═══════════════════════════════════════════════════════════════════════════

1. REGISTRO PACIENTE
   ┌──────────────┐         ┌─────────────────┐
   │  Pacientes   │─────────►  /api/patients  │──► Patient (❌ NO EXISTE)
   └──────────────┘         └─────────────────┘

2. AGENDAR CITA
   ┌──────────────┐         ┌─────────────────┐
   │    Citas     │─────────►  /api/citas     │──► Appointment
   └──────────────┘         │  /availability  │    (🟡 MOCK en [id])
                            └─────────────────┘

3. RECEPCIÓN (Paciente llega)
   ┌──────────────┐         ┌─────────────────┐
   │  Papeleta    │─────────►  /api/papeletas │──► Expedient (genera folio)
   └──────────────┘         └─────────────────┘

4. EXAMEN MÉDICO
   ┌──────────────┐         ┌─────────────────────────────┐
   │ Expedientes  │─────────►  /api/expedientes/[id]/exam │──► MedicalExam
   └──────────────┘         │  /api/expedientes/[id]/studies │──► Study
                            └─────────────────────────────┘

5. VALIDACIÓN (Doctor)
   ┌──────────────┐         ┌───────────────────┐
   │ Validaciones │─────────►  /api/validaciones│──► ValidationTask
   └──────────────┘         └───────────────────┘
                                     │
                                     ▼
                            verdict: APTO / NO_APTO / APTO_CON_RESTRICCIONES

6. ENTREGA
   ┌──────────────┐         ┌─────────────────┐
   │   Reportes   │─────────►  /api/deliveries│──► Status → COMPLETED
   └──────────────┘         │  /api/reportes  │    (⏳ PDF placeholder)
                            └─────────────────┘
```

---

## 🎨 RECURSOS CLINICMASTER

### Ubicación
```
context/Tailwind-ClinicMaster/
├── doc/                    # Documentación
│   ├── index.html          # Guía de instalación
│   └── css/style.css       # Estilos doc
└── package/                # Template completo
    ├── assets/             # Recursos compartidos
    │   ├── css/style.css   # 27,900 líneas Tailwind 4.1.12
    │   ├── fonts/          # Fuentes
    │   ├── icons/          # FontAwesome, Flaticon, Feather
    │   └── js/             # Scripts
    └── medical/            # Variante médica (USAR ESTA)
        ├── index.html      # Homepage
        ├── appointment.html# Formulario citas
        ├── services.html   # Lista servicios
        └── images/         # Imágenes médicas
```

### Paleta de Colores (Medical Skin)
```css
:root {
  /* Colores Primarios */
  --primary: #00BDE0;           /* Cyan médico - botones, links */
  --primary-rgb: 0, 189, 224;
  --secondary: #0A3366;         /* Azul oscuro - headers, textos */
  --secondary-rgb: 10, 51, 102;
  
  /* Colores de Fondo */
  --body-bg: #FFFFFF;
  --light: #ECF5FB;             /* Fondo claro para cards */
  
  /* Colores Semánticos */
  --success: #31A56D;           /* Verde - aprobado, completado */
  --info: #0194D9;              /* Azul info */
  --warning: #E79600;           /* Amarillo - alertas */
  --danger: #D23636;            /* Rojo - errores, eliminar */
  
  /* Bordes y Separadores */
  --border: #E1EBF1;
}
```

### Fuentes
```css
--font-base: "Poppins", sans-serif;
--font-title: "Poppins", sans-serif;
```

### Componentes a Utilizar

#### 1. Layout Principal (Dashboard)
```html
<!-- Sidebar izquierdo fijo -->
<nav class="fixed left-0 top-0 h-full w-64 bg-secondary">
  <!-- Logo -->
  <!-- Menú navegación -->
</nav>

<!-- Contenido principal -->
<main class="ml-64 p-6">
  <!-- Header con breadcrumb -->
  <!-- Contenido de página -->
</main>
```

#### 2. Tablas de Datos
```html
<table class="w-full border-collapse">
  <thead class="bg-light">
    <tr>
      <th class="p-4 text-left text-secondary font-semibold">Columna</th>
    </tr>
  </thead>
  <tbody>
    <tr class="border-b border-border hover:bg-gray-50">
      <td class="p-4">Dato</td>
    </tr>
  </tbody>
</table>
```

#### 3. Botones
```html
<!-- Primario -->
<button class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">
  Guardar
</button>

<!-- Secundario -->
<button class="bg-secondary text-white px-6 py-2 rounded-lg">
  Cancelar
</button>

<!-- Peligro -->
<button class="bg-danger text-white px-6 py-2 rounded-lg">
  Eliminar
</button>
```

#### 4. Cards
```html
<div class="bg-white rounded-2xl shadow-sm border border-border p-6">
  <h3 class="text-xl font-semibold text-secondary mb-4">Título</h3>
  <p class="text-gray-600">Contenido</p>
</div>
```

#### 5. Formularios
```html
<div class="mb-4">
  <label class="block text-secondary font-medium mb-2">Campo</label>
  <input type="text" 
         class="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
</div>
```

#### 6. Badges de Estado
```html
<span class="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success">ACTIVO</span>
<span class="px-3 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">PENDIENTE</span>
<span class="px-3 py-1 rounded-full text-xs font-medium bg-danger/10 text-danger">INACTIVO</span>
```

### Iconos Disponibles
- **FontAwesome 6:** `fas fa-*`, `far fa-*`
- **Feather Icons:** `feather icon-*`
- **Flaticon:** `.flaticon-*`

---

## 📊 MAPA PÁGINA → API

| Página Admin | APIs Requeridas | Estado |
|--------------|-----------------|--------|
| `/admin` | Dashboard resumen | ✅ |
| `/admin/clinicas` | `/api/clinicas`, `/api/clinicas/[id]`, `/api/doctors` | 🟡 Parcial |
| `/admin/empresas` | `/api/empresas`, `/api/empresas/[id]` | ❌ No existe |
| `/admin/pacientes` | `/api/patients`, `/api/patients/[id]` | ❌ No existe |
| `/admin/citas` | `/api/citas`, `/api/citas/[id]`, `/api/citas/availability` | 🟡 Parcial |
| `/admin/servicios` | `/api/services`, `/api/batteries` | ❌ No existe |
| `/admin/expedientes` | `/api/expedientes/*`, `/api/exams` | ✅ Completo |
| `/admin/validaciones` | `/api/validaciones/*` | ✅ Completo |
| `/admin/reportes` | `/api/deliveries`, `/api/reportes/*/export-pdf` | ⏳ Parcial |

---

## 📋 PLAN DE IMPLEMENTACIÓN

### FASE 1: APIs Críticas (4-6 horas)
**Prioridad:** 🔥 Bloquea MVP

| # | Tarea | Archivo | Esfuerzo |
|---|-------|---------|----------|
| 1.1 | Crear `/api/patients` CRUD | `api/patients/route.ts`, `api/patients/[id]/route.ts` | 1h |
| 1.2 | Crear `/api/empresas` CRUD | `api/empresas/route.ts`, `api/empresas/[id]/route.ts` | 1h |
| 1.3 | Arreglar `/api/clinicas/[id]` mock | `api/clinicas/[id]/route.ts` | 30m |
| 1.4 | Arreglar `/api/citas/[id]` mock | `api/citas/[id]/route.ts` | 30m |
| 1.5 | Arreglar `/api/citas/availability` mock | `api/citas/availability/route.ts` | 30m |

### FASE 2: APIs Alta Prioridad (2-3 horas)

| # | Tarea | Archivo | Esfuerzo |
|---|-------|---------|----------|
| 2.1 | Crear `/api/services` CRUD | `api/services/route.ts`, `[id]/route.ts` | 1h |
| 2.2 | Crear `/api/batteries` CRUD | `api/batteries/route.ts`, `[id]/route.ts` | 1h |
| 2.3 | Crear `/api/job-profiles` CRUD | `api/job-profiles/route.ts`, `[id]/route.ts` | 45m |

### FASE 3: Páginas Admin (3-4 horas)

| # | Tarea | Archivo |
|---|-------|---------|
| 3.1 | Conectar `/admin/clinicas` a APIs reales | `app/admin/clinicas/page.tsx` |
| 3.2 | Crear `/admin/pacientes` completo | `app/admin/pacientes/page.tsx` |
| 3.3 | Conectar `/admin/empresas` a API | `app/admin/empresas/page.tsx` |
| 3.4 | Conectar `/admin/citas` a APIs reales | `app/admin/citas/page.tsx` |
| 3.5 | Conectar `/admin/servicios` a APIs | `app/admin/servicios/page.tsx` |

### FASE 4: Styling ClinicMaster (2-3 horas)

| # | Tarea |
|---|-------|
| 4.1 | Implementar layout con sidebar ClinicMaster |
| 4.2 | Aplicar paleta de colores a componentes |
| 4.3 | Actualizar tablas con estilo ClinicMaster |
| 4.4 | Actualizar formularios y botones |
| 4.5 | Agregar iconos Feather/FontAwesome |

### FASE 5: Redirect y Deploy (30 min)

| # | Tarea |
|---|-------|
| 5.1 | Cambiar página raíz para redirigir a `/admin` |
| 5.2 | Verificar build `turbo build` |
| 5.3 | Push y verificar deploy en Vercel |

---

## ✅ CRITERIOS DE ACEPTACIÓN

### APIs
- [ ] Todas las APIs responden correctamente (200, 201, 400, 404, 500)
- [ ] Validación de `tenantId` en todas las rutas
- [ ] Paginación funcional en listados
- [ ] Soft delete implementado (no hard delete)
- [ ] Mensajes de error descriptivos

### Páginas Admin
- [ ] CRUD completo: Crear, Leer, Actualizar, Eliminar
- [ ] Tablas con paginación y búsqueda
- [ ] Formularios con validación
- [ ] Confirmación antes de eliminar
- [ ] Feedback visual (loading, success, error)

### Estilo
- [ ] Sidebar de navegación visible en todas las páginas
- [ ] Colores consistentes con ClinicMaster
- [ ] Responsive en desktop (mobile nice-to-have)
- [ ] Iconos apropiados para cada acción

### Build
- [ ] `turbo build` pasa sin errores
- [ ] 0 errores de TypeScript
- [ ] Vercel deploy exitoso

---

## 📝 NOTAS PARA AGENTES IA

### Convenciones de Código
1. **Imports:** Usar `@/lib/prisma` para Prisma client
2. **Auth:** Usar `getTenantIdFromRequest(request)` para obtener tenantId
3. **Respuestas:** Siempre retornar JSON con estructura consistente
4. **Errores:** Loguear con `console.error('[RUTA]', error)`

### Estructura de Response Estándar
```typescript
// Éxito listado
{ data: [], pagination: { total, page, pageSize, totalPages } }

// Éxito individual
{ id, ...campos }

// Error
{ error: "Mensaje descriptivo" }
```

### Multi-tenancy
Todas las queries deben incluir filtro por `tenantId`:
```typescript
const items = await prisma.model.findMany({
  where: { tenantId, ...otrosFiltros }
});
```

### Marca de Agua (Watermark)
Todo código nuevo debe incluir:
```typescript
/**
 * ⚙️ IMPL REFERENCE: IMPL-20260121-01
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 */
```

---

## 🔗 Referencias

- **Sistema de IDs:** [meta/SISTEMA-IDS.md](../meta/SISTEMA-IDS.md)
- **Especificación de Código:** [meta/SPEC-CODIGO.md](../meta/SPEC-CODIGO.md)
- **ClinicMaster Template:** [context/Tailwind-ClinicMaster](./Tailwind-ClinicMaster)
- **Prisma Schema:** [packages/core-database/prisma/schema.prisma](../packages/core-database/prisma/schema.prisma)

---

**Fin del documento SPEC-MVP-DEMO-APIS**
