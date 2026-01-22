# 🏢 SPEC-MOD-EMPRESAS: Módulo de Empresas Cliente

> **ID Documento:** SPEC-MOD-EMPRESAS-v1.0  
> **Fecha:** 2026-01-21  
> **Estado:** ✅ Validado para MVP  
> **Autor:** SOFIA (Constructora Principal)  
> **Revisado por:** Frank Saavedra (Product Owner)

---

## 1. 📋 Resumen Ejecutivo

### 1.1 Propósito
El módulo de Empresas gestiona los **clientes corporativos** de AMI. Cada empresa contiene pacientes (empleados), se le asignan clínicas, y tiene perfiles de puesto que definen qué exámenes médicos requieren sus trabajadores.

### 1.2 Alcance MVP
| Funcionalidad | MVP | Futuro |
|---------------|-----|--------|
| CRUD de empresas | ✅ | ✅ |
| Estructura matriz/sucursales | ✅ | ✅ |
| ID corto automático | ✅ | ✅ |
| Asignación de clínica(s) | ✅ | ✅ |
| Industria/Giro | ✅ | ✅ |
| Estado (Activo/Inactivo) | ✅ | ✅ |
| Contacto RH por sucursal | ✅ | ✅ |
| Job Profiles globales | ✅ | ✅ |
| Datos fiscales (RFC) | ❌ | ✅ |
| Contratos/Convenios | ❌ | ✅ |
| Facturación | ❌ | ✅ |
| Logo de empresa | ❌ | ✅ |
| Límites mensuales | ❌ | ✅ |

---

## 2. 🏗️ Modelo de Datos

### 2.1 Entidad Principal: `Company`

```prisma
model Company {
  id              String          @id @default(cuid())
  tenantId        String          @db.Uuid
  
  // Identificación
  name            String          @db.VarChar(255)
  code            String          @db.VarChar(10)    // Siglas: PEMEX, CFE, BIMBO
  locationCode    String?         @db.VarChar(10)    // Código ubicación: MTY, CDMX, GDL
  branchNumber    Int             @default(1)        // Consecutivo sucursal
  shortId         String          @unique            // Generado: PEMEX-MTY-01
  
  // Clasificación
  industry        Industry        @default(OTHER)    // Giro/Industria
  status          CompanyStatus   @default(ACTIVE)   // Estado
  
  // Estructura jerárquica (Matriz/Sucursal)
  parentId        String?                            // Si es sucursal, ID de la matriz
  isHeadquarters  Boolean         @default(true)     // true = Matriz, false = Sucursal
  
  // Contacto
  address         String?         @db.Text
  city            String?         @db.VarChar(100)
  state           String?         @db.VarChar(100)
  postalCode      String?         @db.VarChar(10)
  phone           String?         @db.VarChar(20)
  email           String?         @db.VarChar(255)
  
  // Datos del contacto RH
  hrContactName   String?         @db.VarChar(255)
  hrContactEmail  String?         @db.VarChar(255)
  hrContactPhone  String?         @db.VarChar(20)
  
  // Metadata
  isActive        Boolean         @default(true)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  // Relaciones
  tenant          Tenant          @relation(fields: [tenantId], references: [id])
  parent          Company?        @relation("CompanyHierarchy", fields: [parentId], references: [id])
  branches        Company[]       @relation("CompanyHierarchy")
  clinics         CompanyClinic[]
  patients        Patient[]
  jobProfiles     JobProfile[]
  appointments    Appointment[]

  // Indices
  @@unique([tenantId, shortId])
  @@index([tenantId])
  @@index([parentId])
  @@index([status])
  @@index([industry])
  @@map("companies")
}

enum Industry {
  MINING          // Minería
  CONSTRUCTION    // Construcción
  OIL_GAS         // Petróleo y Gas
  FOOD            // Alimentos y Bebidas
  MANUFACTURING   // Manufactura
  TRANSPORTATION  // Transporte
  HEALTHCARE      // Salud
  RETAIL          // Comercio
  SERVICES        // Servicios
  GOVERNMENT      // Gobierno
  EDUCATION       // Educación
  OTHER           // Otro
}

enum CompanyStatus {
  ACTIVE          // Puede agendar citas normalmente
  INACTIVE        // No puede agendar (contrato pausado)
  SUSPENDED       // Suspendido (deuda, problemas)
  PENDING         // Pendiente de activación
}
```

### 2.2 Entidad: `CompanyClinic` (Clínicas Asignadas)

```prisma
model CompanyClinic {
  id          String   @id @default(cuid())
  companyId   String
  clinicId    String
  isPrimary   Boolean  @default(false)  // Clínica principal
  createdAt   DateTime @default(now())

  company     Company  @relation(fields: [companyId], references: [id])
  clinic      Clinic   @relation(fields: [clinicId], references: [id])

  @@unique([companyId, clinicId])
  @@map("company_clinics")
}
```

### 2.3 Diagrama de Relaciones

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MÓDULO EMPRESAS                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│    ┌──────────┐         ┌─────────────────┐                        │
│    │  Tenant  │────────▶│     Company     │◄────────┐              │
│    └──────────┘   1:N   │                 │         │              │
│                         │ • name          │    (parentId)          │
│                         │ • code          │         │              │
│                         │ • shortId       │─────────┘              │
│                         │ • industry      │   Self-reference       │
│                         │ • status        │   (Matriz/Sucursal)    │
│                         └────────┬────────┘                        │
│                                  │                                 │
│         ┌────────────────────────┼────────────────────────┐        │
│         │                        │                        │        │
│         ▼                        ▼                        ▼        │
│  ┌─────────────┐        ┌──────────────┐         ┌─────────────┐  │
│  │CompanyClinic│        │   Patient    │         │  JobProfile │  │
│  │             │        │              │         │             │  │
│  │ • isPrimary │        │ (empleados)  │         │ • name      │  │
│  │             │        │              │         │ • services  │  │
│  └──────┬──────┘        └──────────────┘         └─────────────┘  │
│         │                                                          │
│         ▼                                                          │
│  ┌──────────────┐                                                  │
│  │    Clinic    │                                                  │
│  │  (externo)   │                                                  │
│  └──────────────┘                                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. 📖 Definición Funcional

### 3.1 ¿Qué es una Empresa en AMI?

Una **empresa** es el cliente corporativo que:

1. **Contrata servicios de AMI** - Exámenes médicos ocupacionales para sus empleados
2. **Contiene pacientes** - Los empleados son los pacientes que se atienden
3. **Tiene clínicas asignadas** - Dónde sus empleados pueden atenderse
4. **Define Job Profiles** - Baterías de exámenes según puesto de trabajo

### 3.2 Estructura Matriz/Sucursal

```
                    PEMEX (Matriz)
                    code: PEMEX
                    shortId: PEMEX-CDMX-01
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
    PEMEX Monterrey  PEMEX Tampico  PEMEX Villahermosa
    shortId:         shortId:       shortId:
    PEMEX-MTY-02     PEMEX-TAM-03   PEMEX-VH-04
```

**Reglas:**
- La **matriz** tiene `isHeadquarters = true` y `parentId = null`
- Las **sucursales** tienen `isHeadquarters = false` y `parentId = ID_matriz`
- El **código** (`code`) se hereda de la matriz
- Los **Job Profiles** son globales (se definen en matriz, aplican a todas)
- El **contacto RH** es por sucursal

### 3.3 ID Corto (shortId)

**Formato:** `{CODE}-{LOCATION}-{NUMBER}`

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `CODE` | Siglas de la empresa matriz | PEMEX, CFE, BIMBO |
| `LOCATION` | Código de ubicación/ciudad | MTY, CDMX, GDL, VH |
| `NUMBER` | Consecutivo de 2 dígitos | 01, 02, 03 |

**Algoritmo de generación:**
```typescript
function generateShortId(company: Company): string {
  const code = company.parent?.code ?? company.code;
  const location = company.locationCode ?? 'HQ';
  const number = String(company.branchNumber).padStart(2, '0');
  return `${code}-${location}-${number}`;
}
```

### 3.4 Industria/Giro

Define el sector económico y puede determinar qué NOMs aplican:

| Industria | NOM Relacionadas | Exámenes Típicos |
|-----------|------------------|------------------|
| MINING | NOM-023, NOM-024 | Espirometría, Audiometría, Rx Tórax |
| OIL_GAS | NOM-027, NOM-029 | Toxicológico, Cardio, EKG |
| CONSTRUCTION | NOM-031 | Prueba de altura, Espirometría |
| FOOD | NOM-251 | Coproparasitoscópico, VDRL |
| TRANSPORTATION | NOM-012-SCT | Agudeza visual, Reflejos |

### 3.5 Estados de Empresa

| Estado | Descripción | ¿Puede agendar? |
|--------|-------------|-----------------|
| `ACTIVE` | Contrato vigente, operación normal | ✅ Sí |
| `INACTIVE` | Contrato pausado/terminado | ❌ No |
| `SUSPENDED` | Problemas de pago u otros | ❌ No |
| `PENDING` | En proceso de alta | ❌ No |

---

## 4. 🔄 Flujos de Negocio

### 4.1 Flujo: Crear Nueva Empresa

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Admin ingresa datos básicos                                  │
│    └─► nombre, código (siglas), dirección                       │
│                                                                 │
│ 2. Selecciona industria/giro                                    │
│    └─► MINING, OIL_GAS, CONSTRUCTION, etc.                      │
│                                                                 │
│ 3. Define si es Matriz o Sucursal                               │
│    └─► Si sucursal: seleccionar empresa matriz                  │
│                                                                 │
│ 4. Ingresa código de ubicación                                  │
│    └─► MTY, CDMX, GDL (auto-sugiere por ciudad)                 │
│                                                                 │
│ 5. Sistema genera shortId automático                            │
│    └─► PEMEX-MTY-02                                             │
│                                                                 │
│ 6. Ingresa contacto de RH                                       │
│    └─► Nombre, email, teléfono                                  │
│                                                                 │
│ 7. Asigna clínica(s) donde se atenderán                         │
│    └─► Puede tener múltiples, una es primaria                   │
│                                                                 │
│ 8. Empresa creada con estado ACTIVE                             │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Flujo: Validar Empresa al Agendar Cita

```
Entrada: companyId

1. Buscar empresa por ID
   └─► Si no existe → Error 404

2. Verificar estado
   └─► Si status ≠ ACTIVE → Error "Empresa no activa"

3. Verificar clínica asignada
   └─► Si clinicId no está en CompanyClinic → Error "Clínica no autorizada"

4. Permitir agendar cita
```

---

## 5. 🌐 APIs Disponibles

### 5.1 CRUD Principal

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/empresas?tenantId=X` | Listar empresas |
| `GET` | `/api/empresas/[id]?tenantId=X` | Obtener empresa |
| `POST` | `/api/empresas` | Crear empresa |
| `PUT` | `/api/empresas/[id]` | Actualizar empresa |
| `DELETE` | `/api/empresas/[id]?tenantId=X` | Eliminar empresa |

### 5.2 Sucursales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/empresas/[id]/branches` | Listar sucursales de una matriz |
| `POST` | `/api/empresas/[id]/branches` | Crear sucursal |

### 5.3 Clínicas Asignadas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/empresas/[id]/clinics` | Clínicas asignadas |
| `POST` | `/api/empresas/[id]/clinics` | Asignar clínica |
| `DELETE` | `/api/empresas/[id]/clinics/[clinicId]` | Desasignar clínica |

### 5.4 Job Profiles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/empresas/[id]/job-profiles` | Perfiles de la empresa |
| `POST` | `/api/empresas/[id]/job-profiles` | Crear perfil |

### 5.5 Ejemplos de Payload

**POST /api/empresas** (Crear matriz):
```json
{
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Petróleos Mexicanos",
  "code": "PEMEX",
  "locationCode": "CDMX",
  "industry": "OIL_GAS",
  "isHeadquarters": true,
  "address": "Av. Marina Nacional 329",
  "city": "Ciudad de México",
  "state": "CDMX",
  "hrContactName": "María García",
  "hrContactEmail": "maria.garcia@pemex.com",
  "hrContactPhone": "55-1234-5678"
}
```

**POST /api/empresas** (Crear sucursal):
```json
{
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "PEMEX Refinería Monterrey",
  "parentId": "clm123abc...",
  "locationCode": "MTY",
  "isHeadquarters": false,
  "city": "Monterrey",
  "state": "Nuevo León",
  "hrContactName": "Juan Pérez",
  "hrContactEmail": "juan.perez@pemex.com"
}
```

**Response:**
```json
{
  "id": "clm456def...",
  "shortId": "PEMEX-MTY-02",
  "name": "PEMEX Refinería Monterrey",
  "code": "PEMEX",
  "industry": "OIL_GAS",
  "status": "ACTIVE",
  "isHeadquarters": false,
  "parentId": "clm123abc..."
}
```

---

## 6. 🖥️ Interfaz de Usuario

### 6.1 Vista Admin: Lista de Empresas

```
┌─────────────────────────────────────────────────────────────────┐
│  🏢 Empresas                                    [+ Nueva Empresa]│
├─────────────────────────────────────────────────────────────────┤
│  🔍 Buscar...       [Industria ▼]  [Estado ▼]  [Solo Matrices ▼]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🏛️ PEMEX-CDMX-01                    ⛽ Petróleo y Gas   │   │
│  │    Petróleos Mexicanos (Matriz)     🟢 Activo          │   │
│  │    📍 Ciudad de México | 3 sucursales | 450 empleados  │   │
│  │    👤 RH: María García              [Ver] [Editar]     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🏢 PEMEX-MTY-02                      ⛽ Petróleo y Gas  │   │
│  │    PEMEX Refinería Monterrey         🟢 Activo         │   │
│  │    📍 Monterrey, NL | Sucursal | 120 empleados         │   │
│  │    👤 RH: Juan Pérez                 [Ver] [Editar]    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🏛️ BIMBO-CDMX-01                    🍞 Alimentos       │   │
│  │    Grupo Bimbo (Matriz)              🟡 Pendiente      │   │
│  │    📍 Ciudad de México | 0 sucursales | 0 empleados    │   │
│  │    👤 RH: Sin asignar                [Ver] [Editar]    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Vista Admin: Detalle de Empresa (Tabs)

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Volver    🏢 PEMEX-CDMX-01  Petróleos Mexicanos   🟢 Activo  │
├─────────────────────────────────────────────────────────────────┤
│  [Información]  [Sucursales]  [Clínicas]  [Job Profiles]        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TAB: Información                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Nombre:        [Petróleos Mexicanos            ]        │   │
│  │ Código:        [PEMEX]  Ubicación: [CDMX]               │   │
│  │ ID Corto:      PEMEX-CDMX-01 (auto-generado)            │   │
│  │ Industria:     [⛽ Petróleo y Gas           ▼]          │   │
│  │ Estado:        (●) Activo  ( ) Inactivo  ( ) Suspendido │   │
│  │ ─────────────────────────────────────────────────────── │   │
│  │ Dirección:     [Av. Marina Nacional 329       ]         │   │
│  │ Ciudad:        [Ciudad de México  ]  CP: [11320]        │   │
│  │ ─────────────────────────────────────────────────────── │   │
│  │ Contacto RH:   [María García                  ]         │   │
│  │ Email RH:      [maria.garcia@pemex.com        ]         │   │
│  │ Teléfono RH:   [55-1234-5678                  ]         │   │
│  │                                          [Guardar]      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  TAB: Sucursales                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [+ Nueva Sucursal]                                     │   │
│  │                                                         │   │
│  │  🏢 PEMEX-MTY-02    Monterrey, NL      120 empleados   │   │
│  │  🏢 PEMEX-TAM-03    Tampico, Tamps     85 empleados    │   │
│  │  🏢 PEMEX-VH-04     Villahermosa, Tab  200 empleados   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  TAB: Clínicas                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [+ Asignar Clínica]                                    │   │
│  │                                                         │   │
│  │  🏥 AMI Matriz CDMX        ⭐ Principal       [Quitar]  │   │
│  │  🏥 AMI Sucursal Norte     Secundaria        [Quitar]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  TAB: Job Profiles                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [+ Nuevo Perfil]                                       │   │
│  │                                                         │   │
│  │  👷 Operador de Plataforma    12 servicios   [Editar]   │   │
│  │  🔧 Técnico de Mantenimiento   8 servicios   [Editar]   │   │
│  │  👔 Administrativo             5 servicios   [Editar]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. 🔗 Relaciones con Otros Módulos

### 7.1 Dependencias Entrantes (Quién usa Empresas)

| Módulo | Relación | Descripción |
|--------|----------|-------------|
| **mod-pacientes** | `Patient.companyId` | Empleados pertenecen a empresa |
| **mod-citas** | `Appointment.companyId` | Cita vinculada a empresa |
| **mod-expedientes** | Vía paciente | Trazabilidad por empresa |

### 7.2 Dependencias Salientes (Qué usa Empresas)

| Módulo | Relación | Descripción |
|--------|----------|-------------|
| **mod-clinicas** | `CompanyClinic` | Clínicas asignadas |
| **mod-servicios** | `JobProfile.services` | Servicios en perfiles |
| **Tenant** | `Company.tenantId` | Multi-tenancy |

### 7.3 Diagrama de Dependencias

```
                    ┌──────────────┐
                    │    Tenant    │
                    └──────┬───────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
     ┌──────────┐   ┌──────────┐   ┌──────────┐
     │ Clínicas │◄──│ EMPRESAS │──▶│Servicios │
     └──────────┘   └────┬─────┘   └──────────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
            ▼            ▼            ▼
     ┌──────────┐  ┌──────────┐  ┌──────────┐
     │ Patients │  │JobProfile│  │Companies │
     │(empleados)│  │(baterías)│  │(sucursales)
     └────┬─────┘  └──────────┘  └──────────┘
          │
          ▼
   ┌──────────────┐
   │    Citas     │
   │(Appointment) │
   └──────────────┘
```

---

## 8. 📋 Checklist de Implementación

### 8.1 MVP (Sprint Actual)

- [x] Modelo Prisma `Company` (básico)
- [ ] Campos adicionales: `code`, `locationCode`, `branchNumber`, `shortId`
- [ ] Enum `Industry`
- [ ] Enum `CompanyStatus`
- [ ] Modelo `CompanyClinic`
- [ ] API CRUD `/api/empresas`
- [ ] API sucursales `/api/empresas/[id]/branches`
- [ ] API clínicas `/api/empresas/[id]/clinics`
- [ ] Generación automática de `shortId`
- [ ] UI Lista de empresas con filtros
- [ ] UI Detalle con tabs
- [ ] Validación de estado al agendar cita

### 8.2 Post-MVP (Backlog)

- [ ] Datos fiscales (RFC, razón social fiscal)
- [ ] Modelo `Contract` (convenios/contratos)
- [ ] Límites mensuales de exámenes
- [ ] Logo de empresa
- [ ] Integración con facturación
- [ ] Dashboard de estadísticas por empresa
- [ ] Exportación de reportes por empresa

---

## 9. 🧪 Casos de Prueba

### 9.1 Happy Path

| # | Caso | Resultado Esperado |
|---|------|-------------------|
| 1 | Crear empresa matriz | Empresa creada, shortId = CODE-LOC-01 |
| 2 | Crear sucursal de empresa existente | shortId hereda código de matriz |
| 3 | Asignar clínica a empresa | Registro en CompanyClinic |
| 4 | Listar sucursales de matriz | Array de empresas con parentId |
| 5 | Filtrar por industria | Solo empresas del giro seleccionado |
| 6 | Cambiar estado a INACTIVE | Empresa no puede agendar citas |

### 9.2 Edge Cases

| # | Caso | Resultado Esperado |
|---|------|-------------------|
| 1 | Crear empresa sin código | Error 400: código requerido |
| 2 | Código duplicado en mismo tenant | Ajustar branchNumber automáticamente |
| 3 | Eliminar matriz con sucursales | Error 400: primero eliminar sucursales |
| 4 | Agendar cita con empresa SUSPENDED | Error 403: empresa no activa |
| 5 | Asignar clínica ya asignada | Error 409: duplicado |
| 6 | Crear sucursal de sucursal | Error 400: solo matriz puede tener sucursales |

---

## 10. 📚 Referencias

- [SPEC-MOD-CLINICAS.md](./SPEC-MOD-CLINICAS.md) - Módulo de clínicas relacionado
- [SPEC-MVP-DEMO-APIS.md](../SPEC-MVP-DEMO-APIS.md) - APIs del MVP
- [ADR-002-multitenancy-validation.md](../decisions/ADR-002-multitenancy-validation.md) - Validación multi-tenant
- [Prisma Schema](../../packages/web-app/prisma/schema.prisma) - Modelos de datos

---

## 11. 📝 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-21 | SOFIA | Documento inicial completo |

---

> **Nota:** Este documento es la fuente de verdad para el módulo de Empresas. Cualquier cambio debe reflejarse aquí antes de implementarse.
