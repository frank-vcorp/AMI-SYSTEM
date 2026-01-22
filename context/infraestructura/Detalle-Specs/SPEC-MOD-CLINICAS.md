# 🏥 SPEC-MOD-CLINICAS: Módulo de Clínicas y Sucursales

> **ID Documento:** SPEC-MOD-CLINICAS-v1.0  
> **Fecha:** 2026-01-21  
> **Estado:** ✅ Validado para MVP  
> **Autor:** SOFIA (Constructora Principal)  
> **Revisado por:** Frank Saavedra (Product Owner)

---

## 1. 📋 Resumen Ejecutivo

### 1.1 Propósito
El módulo de Clínicas gestiona las **ubicaciones físicas** donde se prestan los servicios médicos de AMI. Cada clínica es una entidad con recursos propios (médicos, horarios, capacidad) que atiende a los pacientes de las empresas cliente.

### 1.2 Alcance MVP
| Funcionalidad | MVP | Futuro |
|---------------|-----|--------|
| CRUD de clínicas | ✅ | ✅ |
| Horarios de operación | ✅ | ✅ |
| Asignación de médicos | ✅ | ✅ |
| Capacidad diaria máxima | ✅ | ✅ |
| Gestión de recursos/salas | ❌ | ✅ |
| Servicios por clínica | ❌ | ✅ |
| Equipamiento por clínica | ❌ | ✅ |

---

## 2. 🏗️ Modelo de Datos

### 2.1 Entidad Principal: `Clinic`

```prisma
model Clinic {
  id                   String   @id @default(uuid())
  tenantId             String
  name                 String
  address              String?
  city                 String?
  state                String?
  postalCode           String?
  phone                String?
  email                String?
  isHeadquarters       Boolean  @default(false)  // Matriz vs Sucursal
  maxAppointmentsDay   Int      @default(50)     // Capacidad física
  isActive             Boolean  @default(true)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  // Relaciones
  tenant               Tenant   @relation(fields: [tenantId], references: [id])
  schedules            ClinicSchedule[]
  doctors              ClinicDoctor[]
  appointments         Appointment[]
}
```

### 2.2 Entidad: `ClinicSchedule` (Horarios de Operación)

```prisma
model ClinicSchedule {
  id          String   @id @default(uuid())
  clinicId    String
  dayOfWeek   Int      // 0=Domingo, 1=Lunes, ..., 6=Sábado
  openTime    String   // "08:00" formato 24h
  closeTime   String   // "18:00" formato 24h
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  clinic      Clinic   @relation(fields: [clinicId], references: [id])

  @@unique([clinicId, dayOfWeek])
}
```

### 2.3 Entidad: `ClinicDoctor` (Asignación de Médicos)

```prisma
model ClinicDoctor {
  id        String   @id @default(uuid())
  clinicId  String
  doctorId  String
  isPrimary Boolean  @default(false)  // Médico principal de la clínica
  createdAt DateTime @default(now())

  clinic    Clinic   @relation(fields: [clinicId], references: [id])
  doctor    Doctor   @relation(fields: [doctorId], references: [id])

  @@unique([clinicId, doctorId])
}
```

### 2.4 Diagrama de Relaciones

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MÓDULO CLÍNICAS                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│    ┌──────────┐         ┌─────────────────┐                        │
│    │  Tenant  │────────▶│     Clinic      │                        │
│    └──────────┘   1:N   │                 │                        │
│                         │ • name          │                        │
│                         │ • address       │                        │
│                         │ • isHeadquarters│                        │
│                         │ • maxApptDay    │                        │
│                         └────────┬────────┘                        │
│                                  │                                 │
│              ┌───────────────────┼───────────────────┐             │
│              │                   │                   │             │
│              ▼                   ▼                   ▼             │
│    ┌─────────────────┐  ┌──────────────┐  ┌─────────────────┐     │
│    │ ClinicSchedule  │  │ ClinicDoctor │  │   Appointment   │     │
│    │                 │  │              │  │                 │     │
│    │ • dayOfWeek     │  │ • isPrimary  │  │ (ver mod-citas) │     │
│    │ • openTime      │  │              │  │                 │     │
│    │ • closeTime     │  │      │       │  │                 │     │
│    └─────────────────┘  └──────┼───────┘  └─────────────────┘     │
│                                │                                   │
│                                ▼                                   │
│                         ┌──────────────┐                           │
│                         │    Doctor    │                           │
│                         │ (externo)    │                           │
│                         └──────────────┘                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. 📖 Definición Funcional

### 3.1 ¿Qué es una Clínica en AMI?

Una **clínica o sucursal** es una entidad física donde:

1. **Se asignan médicos** - Doctores que atienden en esa ubicación
2. **Se reciben pacientes** - Según las empresas que atiende la clínica
3. **Se agendan citas** - Vinculadas a fecha, hora, médico y servicio
4. **Se realizan estudios** - Exámenes médicos ocupacionales

### 3.2 Tipos de Clínica

| Tipo | `isHeadquarters` | Descripción |
|------|------------------|-------------|
| **Matriz** | `true` | Sede principal, puede tener más servicios |
| **Sucursal** | `false` | Ubicación secundaria, servicios limitados |

### 3.3 Espacios de la Clínica

#### 3.3.1 Espacios Físicos (Capacidad)
- **`maxAppointmentsDay`**: Número máximo de citas que puede recibir la clínica en un día
- **Justificación MVP**: Usamos un número simple en lugar de modelar salas/consultorios
- **Evolución futura**: Tabla `ClinicRoom` con tipo (consultorio, laboratorio, rayos X)

#### 3.3.2 Espacios Temporales (Horarios)
- **`ClinicSchedule`**: Define qué días y horas opera la clínica
- **Granularidad**: Por día de semana con hora inicio/fin
- **Ejemplo**: Lunes-Viernes 08:00-18:00, Sábado 08:00-14:00

---

## 4. 🔄 Flujos de Negocio

### 4.1 Flujo: Crear Nueva Clínica

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Admin ingresa datos básicos                                  │
│    └─► nombre, dirección, teléfono, email                       │
│                                                                 │
│ 2. Define tipo de clínica                                       │
│    └─► isHeadquarters: true/false                               │
│                                                                 │
│ 3. Configura horarios de operación                              │
│    └─► Por cada día: hora apertura y cierre                     │
│                                                                 │
│ 4. Asigna médicos disponibles                                   │
│    └─► Selecciona de lista de doctores del tenant               │
│                                                                 │
│ 5. Define capacidad diaria                                      │
│    └─► maxAppointmentsDay (default: 50)                         │
│                                                                 │
│ 6. Clínica lista para recibir citas                             │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Flujo: Calcular Disponibilidad

```
Entrada: clinicId, fecha, servicioId (opcional)

1. Obtener horario del día (ClinicSchedule)
   └─► Si no hay horario → día no disponible

2. Generar slots base (cada 30 min MVP)
   └─► Desde openTime hasta closeTime

3. Obtener citas existentes del día
   └─► Filtrar por clinicId y fecha

4. Marcar slots ocupados
   └─► Slot ocupado si ya tiene cita

5. Verificar capacidad máxima
   └─► Si citas >= maxAppointmentsDay → todo bloqueado

6. Retornar slots disponibles
   └─► Array de { time, available, appointmentId? }
```

---

## 5. ⚙️ Decisiones Técnicas

### 5.1 ADR: Duración de Slots (Opción A vs B)

| Aspecto | Opción A (MVP) | Opción B (Producción) |
|---------|----------------|----------------------|
| **Duración slot** | Fija 30 min | Dinámica según servicio |
| **Implementación** | Slots consecutivos bloqueados | Recursos paralelos |
| **Complejidad** | 🟢 Baja | 🔴 Alta |
| **Ejemplo** | Servicio 60 min = 2 slots | Servicio 60 min = 1 recurso |

#### ✅ Decisión MVP: Opción A
**Justificación:**
- Tiempo limitado (demo jueves 23 enero)
- Funcionalidad equivalente para el usuario
- Menor riesgo de bugs
- Documentado como deuda técnica consciente

#### 📝 Deuda Técnica Registrada
```
ID: DT-CLINICAS-001
Descripción: Migrar de slots fijos a duración dinámica por servicio
Prioridad: Media
Sprint estimado: Post-MVP (Febrero 2026)
Impacto: Mejora throughput de clínicas con múltiples recursos
```

### 5.2 Servicios por Clínica (No implementado MVP)

**Situación actual:** Todas las clínicas pueden ofrecer todos los servicios.

**Realidad del negocio:**
- No todas las sucursales tienen el mismo equipamiento
- Ejemplo: Solo matriz tiene equipo de rayos X
- Paciente debe ir a otra clínica si servicio no disponible

**Solución futura:**
```prisma
model ClinicService {
  id        String  @id @default(uuid())
  clinicId  String
  serviceId String
  isActive  Boolean @default(true)
  
  clinic    Clinic  @relation(...)
  service   Service @relation(...)
  
  @@unique([clinicId, serviceId])
}
```

---

## 6. 🌐 APIs Disponibles

### 6.1 CRUD Principal

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/clinicas?tenantId=X` | Listar clínicas |
| `GET` | `/api/clinicas/[id]?tenantId=X` | Obtener clínica |
| `POST` | `/api/clinicas` | Crear clínica |
| `PUT` | `/api/clinicas/[id]` | Actualizar clínica |
| `DELETE` | `/api/clinicas/[id]?tenantId=X` | Eliminar clínica |

### 6.2 Horarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/clinicas/[id]/schedules` | Obtener horarios |
| `PUT` | `/api/clinicas/[id]/schedules` | Actualizar horarios (batch) |

**Payload PUT schedules:**
```json
{
  "schedules": [
    { "dayOfWeek": 1, "openTime": "08:00", "closeTime": "18:00", "isActive": true },
    { "dayOfWeek": 2, "openTime": "08:00", "closeTime": "18:00", "isActive": true }
  ]
}
```

### 6.3 Médicos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/clinicas/[id]/doctors` | Médicos asignados |
| `POST` | `/api/clinicas/[id]/doctors` | Asignar médico |
| `DELETE` | `/api/clinicas/[id]/doctors/[doctorId]` | Desasignar médico |

### 6.4 Disponibilidad

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/clinicas/[id]/availability?date=YYYY-MM-DD` | Slots disponibles |

**Response:**
```json
{
  "clinicId": "uuid",
  "date": "2026-01-23",
  "schedule": { "openTime": "08:00", "closeTime": "18:00" },
  "slots": [
    { "time": "08:00", "available": true },
    { "time": "08:30", "available": false, "appointmentId": "uuid" },
    { "time": "09:00", "available": true }
  ],
  "summary": { "total": 20, "available": 15, "occupied": 5 }
}
```

---

## 7. 🖥️ Interfaz de Usuario

### 7.1 Vista Admin: Lista de Clínicas

```
┌─────────────────────────────────────────────────────────────────┐
│  🏥 Clínicas                                    [+ Nueva Clínica]│
├─────────────────────────────────────────────────────────────────┤
│  🔍 Buscar...                         Filtro: [Todas ▼]         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🏛️ AMI Matriz              📍 Av. Principal #123        │   │
│  │    Matriz | 3 médicos | Cap: 50/día                     │   │
│  │    Horario: L-V 08:00-18:00                    [Editar] │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🏢 AMI Sucursal Norte      📍 Calle Norte #456          │   │
│  │    Sucursal | 2 médicos | Cap: 30/día                   │   │
│  │    Horario: L-S 08:00-14:00                   [Editar]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Vista Admin: Detalle de Clínica (Tabs)

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Volver    🏥 AMI Matriz                                      │
├─────────────────────────────────────────────────────────────────┤
│  [Información]  [Horarios]  [Médicos]                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TAB: Información                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Nombre:        [AMI Matriz                    ]         │   │
│  │ Dirección:     [Av. Principal #123            ]         │   │
│  │ Ciudad:        [Ciudad de México              ]         │   │
│  │ Teléfono:      [55-1234-5678                  ]         │   │
│  │ Email:         [matriz@ami.com                ]         │   │
│  │ Tipo:          (●) Matriz  ( ) Sucursal                 │   │
│  │ Capacidad/día: [50]                                     │   │
│  │                                         [Guardar]       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  TAB: Horarios                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Día        Activo    Apertura    Cierre                │   │
│  │  ─────────────────────────────────────────              │   │
│  │  Lunes      [✓]       [08:00]     [18:00]               │   │
│  │  Martes     [✓]       [08:00]     [18:00]               │   │
│  │  Miércoles  [✓]       [08:00]     [18:00]               │   │
│  │  Jueves     [✓]       [08:00]     [18:00]               │   │
│  │  Viernes    [✓]       [08:00]     [18:00]               │   │
│  │  Sábado     [✓]       [08:00]     [14:00]               │   │
│  │  Domingo    [ ]       [--:--]     [--:--]               │   │
│  │                                         [Guardar]       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  TAB: Médicos                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [+ Asignar Médico]                                     │   │
│  │                                                         │   │
│  │  👨‍⚕️ Dr. Juan Pérez         Medicina General  [Quitar]   │   │
│  │  👩‍⚕️ Dra. María López        Cardiología       [Quitar]   │   │
│  │  👨‍⚕️ Dr. Carlos Ruiz         Laboratorio       [Quitar]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. 🔗 Relaciones con Otros Módulos

### 8.1 Dependencias Entrantes (Quién usa Clínicas)

| Módulo | Relación | Descripción |
|--------|----------|-------------|
| **mod-citas** | `Appointment.clinicId` | Citas se agendan en una clínica |
| **mod-pacientes** | Indirecta vía empresa | Pacientes van a clínica asignada |
| **mod-expedientes** | Vía cita | Expediente registra dónde se realizó |

### 8.2 Dependencias Salientes (Qué usa Clínicas)

| Módulo | Relación | Descripción |
|--------|----------|-------------|
| **Doctors** | `ClinicDoctor` | Médicos asignados a clínica |
| **Tenant** | `Clinic.tenantId` | Pertenencia multi-tenant |

### 8.3 Diagrama de Dependencias

```
                    ┌──────────────┐
                    │    Tenant    │
                    └──────┬───────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
     ┌──────────┐   ┌──────────┐   ┌──────────┐
     │ Empresas │   │ CLÍNICAS │   │  Doctors │
     └────┬─────┘   └────┬─────┘   └────┬─────┘
          │              │              │
          │         ┌────┴────┐         │
          │         │         │         │
          ▼         ▼         ▼         │
     ┌──────────┐  ┌─────────────────┐  │
     │Pacientes │  │ClinicSchedule   │  │
     └────┬─────┘  │ClinicDoctor ◄───┼──┘
          │        └─────────────────┘
          │              │
          └──────┬───────┘
                 │
                 ▼
          ┌──────────────┐
          │    Citas     │
          │ (Appointment)│
          └──────────────┘
```

---

## 9. 📋 Checklist de Implementación

### 9.1 MVP (Sprint Actual)

- [x] Modelo Prisma `Clinic`
- [x] Modelo Prisma `ClinicSchedule`
- [x] Modelo Prisma `ClinicDoctor`
- [x] API CRUD `/api/clinicas`
- [x] API horarios `/api/clinicas/[id]/schedules`
- [x] API médicos `/api/clinicas/[id]/doctors`
- [x] API disponibilidad `/api/clinicas/[id]/availability`
- [x] UI Lista de clínicas
- [x] UI Detalle con tabs (info/horarios/médicos)
- [ ] Validación de capacidad máxima en citas
- [ ] Tests unitarios básicos

### 9.2 Post-MVP (Backlog)

- [ ] Tabla `ClinicService` (servicios por clínica)
- [ ] Tabla `ClinicRoom` (salas/consultorios)
- [ ] Duración dinámica de slots según servicio
- [ ] Gestión de recursos paralelos
- [ ] Dashboard de ocupación por clínica
- [ ] Reportes de productividad

---

## 10. 🧪 Casos de Prueba

### 10.1 Happy Path

| # | Caso | Resultado Esperado |
|---|------|-------------------|
| 1 | Crear clínica con datos válidos | Clínica creada, ID generado |
| 2 | Configurar horario L-V 08-18 | 5 registros en ClinicSchedule |
| 3 | Asignar médico existente | Registro en ClinicDoctor |
| 4 | Consultar disponibilidad día hábil | Slots según horario |
| 5 | Consultar disponibilidad domingo | Array vacío (sin horario) |

### 10.2 Edge Cases

| # | Caso | Resultado Esperado |
|---|------|-------------------|
| 1 | Crear clínica sin nombre | Error 400: nombre requerido |
| 2 | Asignar médico ya asignado | Error 409: duplicado |
| 3 | Horario con closeTime < openTime | Error 400: rango inválido |
| 4 | Disponibilidad con capacidad llena | Todos slots ocupados |
| 5 | Clínica de otro tenant | Error 403: acceso denegado |

---

## 11. 📚 Referencias

- [SPEC-MVP-DEMO-APIS.md](./SPEC-MVP-DEMO-APIS.md) - APIs del MVP
- [SPEC-MODULOS-AMI.md](./SPEC-MODULOS-AMI.md) - Especificación general de módulos
- [ADR-002-multitenancy-validation.md](./decisions/ADR-002-multitenancy-validation.md) - Validación multi-tenant
- [Prisma Schema](../packages/web-app/prisma/schema.prisma) - Modelos de datos

---

## 12. 📝 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-21 | SOFIA | Documento inicial completo |

---

> **Nota:** Este documento es la fuente de verdad para el módulo de Clínicas. Cualquier cambio debe reflejarse aquí antes de implementarse.
