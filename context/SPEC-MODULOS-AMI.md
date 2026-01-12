# SPEC-MODULOS-AMI: Especificación de Módulos AMI-SYSTEM

**ID:** SPEC-MODULOS-AMI  
**Versión:** 1.0  
**Fecha:** 2026-01-12  
**Autor:** INTEGRA (Arquitecto IA)  
**Estado:** Aprobado

---

## Objetivo

Definir los módulos funcionales de AMI-SYSTEM, sus responsabilidades, dependencias y orden de implementación.

---

## Contexto

AMI-SYSTEM es una plataforma modular para gestión de salud ocupacional. Cada módulo puede funcionar de forma independiente (con el Core) o integrado con los demás.

---

## Catálogo de Módulos

### CORE (Servicios Compartidos)

| Componente | Función | Dependencias |
|------------|---------|--------------|
| `core/auth` | Login, roles, permisos, sesiones | Firebase Auth |
| `core/database` | Conexión Prisma, middleware tenant | PostgreSQL |
| `core/storage` | Upload/download archivos | GCP Storage |
| `core/notifications` | Email, SMS, Push | Resend/Twilio |
| `core/ui` | Componentes reutilizables (mobile-first) | shadcn/ui |
| `core/signatures` | Generación de firma única por médico | Canvas/PDF |

---

### MÓDULOS OPERATIVOS

#### MOD-CLINICAS
| Aspecto | Detalle |
|---------|---------|
| **Función** | Administrar sedes, horarios, capacidad, servicios disponibles |
| **Usuarios** | Admin, Coordinador |
| **Entidades** | Clinic, ClinicSchedule, ClinicService, ClinicBlockedDate |
| **Dependencias** | Core |
| **Prioridad** | 🔴 ALTA (Fase 0) |

**Funcionalidades:**
- [ ] CRUD de clínicas
- [ ] Configuración de horarios por día
- [ ] Asignación de servicios disponibles
- [ ] Bloqueo de fechas (festivos, mantenimiento)
- [ ] Vista de capacidad actual

---

#### MOD-SERVICIOS
| Aspecto | Detalle |
|---------|---------|
| **Función** | Catálogo de estudios individuales y baterías (paquetes) |
| **Usuarios** | Admin |
| **Entidades** | Service, Battery, BatteryItem |
| **Dependencias** | Core |
| **Prioridad** | 🔴 ALTA (Fase 0) |

**Funcionalidades:**
- [ ] CRUD de servicios (estudios individuales)
- [ ] CRUD de baterías (paquetes)
- [ ] Asignación de servicios a baterías
- [ ] Cálculo automático de duración total
- [ ] Precios base y por paquete

---

#### MOD-EMPRESAS
| Aspecto | Detalle |
|---------|---------|
| **Función** | Catálogo de empresas cliente, contratos, perfiles de puesto |
| **Usuarios** | Admin, Coordinador |
| **Entidades** | Company, CompanyBattery, JobProfile |
| **Dependencias** | Core, MOD-SERVICIOS |
| **Prioridad** | 🔴 ALTA (Fase 0) |

**Funcionalidades:**
- [ ] CRUD de empresas
- [ ] Asignación de baterías contratadas
- [ ] CRUD de perfiles de puesto
- [ ] Configuración de entrega (electrónico/físico)
- [ ] Vista de métricas por empresa

---

#### MOD-CITAS
| Aspecto | Detalle |
|---------|---------|
| **Función** | Agenda de citas con disponibilidad, recordatorios |
| **Usuarios** | Coordinador, Recepcionista, (Portal Empresa) |
| **Entidades** | Appointment |
| **Dependencias** | Core, MOD-CLINICAS, MOD-EMPRESAS, MOD-SERVICIOS |
| **Prioridad** | 🔴 ALTA (Fase 1) |
| **Independiente** | ✅ Sí - puede usarse en otros proyectos |

**Funcionalidades:**
- [ ] Vista calendario por clínica
- [ ] Búsqueda de disponibilidad
- [ ] Creación de cita con selección inteligente de clínica
- [ ] Modificación/cancelación de citas
- [ ] Envío de confirmación automática
- [ ] Envío de recordatorios (24h, 2h antes)
- [ ] Registro de llegada (check-in)
- [ ] Manejo de no-shows
- [ ] Lista de espera

---

#### MOD-EXPEDIENTES
| Aspecto | Detalle |
|---------|---------|
| **Función** | Flujo médico completo (check-in → examen → estudios) |
| **Usuarios** | Recepcionista, Médico Examinador, Técnico |
| **Entidades** | Expediente, ExamResult, Study |
| **Dependencias** | Core, MOD-CITAS |
| **Prioridad** | 🔴 ALTA (Fase 1) |

**Funcionalidades:**
- [ ] Check-in desde cita (genera expediente y folio)
- [ ] Captura de examen médico (signos vitales, exploración)
- [ ] Cálculo automático de IMC
- [ ] Upload de PDFs de estudios
- [ ] Clasificación automática por tipo
- [ ] Vista de estado del expediente
- [ ] Timeline de progreso

---

#### MOD-VALIDACION
| Aspecto | Detalle |
|---------|---------|
| **Función** | Extracción IA, semáforos, revisión médica, firma |
| **Usuarios** | Médico Validador |
| **Entidades** | ExtractedData, Dictamen |
| **Dependencias** | Core, MOD-EXPEDIENTES, OpenAI API |
| **Prioridad** | 🔴 ALTA (Fase 1) |

**Funcionalidades:**
- [ ] Extracción de datos con IA (OpenAI)
- [ ] Cálculo de semáforos según umbrales
- [ ] Vista dual (PDF original + datos extraídos)
- [ ] Edición de valores extraídos
- [ ] Sugerencia de dictamen por IA
- [ ] Selección de dictamen final
- [ ] Captura de restricciones y recomendaciones
- [ ] Firma digital del médico
- [ ] Generación automática de TAT

---

#### MOD-REPORTES
| Aspecto | Detalle |
|---------|---------|
| **Función** | Generación de papeleta y expediente completo, envío |
| **Usuarios** | Coordinador, (Automático) |
| **Entidades** | (usa Expediente, Dictamen) |
| **Dependencias** | Core, MOD-VALIDACION |
| **Prioridad** | 🔴 ALTA (Fase 1) |

**Funcionalidades:**
- [ ] Generación de papeleta PDF
- [ ] Generación de expediente completo PDF
- [ ] Vista previa de documentos
- [ ] Descarga directa
- [ ] Envío por email con enlace seguro
- [ ] Generación de enlaces temporales
- [ ] Configuración de caducidad
- [ ] Historial de envíos

---

#### MOD-DASHBOARD
| Aspecto | Detalle |
|---------|---------|
| **Función** | Vista ejecutiva, KPIs, alertas |
| **Usuarios** | Todos (según rol) |
| **Entidades** | (Agregaciones) |
| **Dependencias** | Core, todos los módulos |
| **Prioridad** | 🟡 MEDIA (Fase 2) |

**Funcionalidades:**
- [ ] KPIs del día (expedientes, TAT, completados)
- [ ] Gráfica de estado de expedientes
- [ ] Gráfica de productividad por clínica
- [ ] Lista de pendientes por etapa
- [ ] Alertas de valores críticos
- [ ] Alertas de TAT excedido

---

#### MOD-BITACORA
| Aspecto | Detalle |
|---------|---------|
| **Función** | Audit log, trazabilidad completa |
| **Usuarios** | Admin, Coordinador |
| **Entidades** | AuditLog |
| **Dependencias** | Core |
| **Prioridad** | 🟡 MEDIA (Fase 2) |

**Funcionalidades:**
- [ ] Timeline de eventos
- [ ] Filtros (tipo, usuario, folio, fecha)
- [ ] Detalle de cambios (before/after)
- [ ] Exportación a Excel

---

#### MOD-CALIDAD
| Aspecto | Detalle |
|---------|---------|
| **Función** | Control de precisión IA, alertas, auditorías |
| **Usuarios** | Coordinador de Calidad, Admin |
| **Entidades** | (Agregaciones, configuración) |
| **Dependencias** | Core, MOD-VALIDACION |
| **Prioridad** | 🟡 MEDIA (Fase 2) |

**Funcionalidades:**
- [ ] Precisión IA por tipo de estudio
- [ ] Alertas activas (críticos, discrepancias)
- [ ] Registro de auditorías
- [ ] Acciones de calibración

---

#### MOD-ADMIN
| Aspecto | Detalle |
|---------|---------|
| **Función** | Configuración del sistema, usuarios, semáforos |
| **Usuarios** | Admin |
| **Entidades** | User, configuración |
| **Dependencias** | Core |
| **Prioridad** | 🟡 MEDIA (Fase 2) |

**Funcionalidades:**
- [ ] CRUD de usuarios
- [ ] Asignación de roles
- [ ] Configuración de semáforos (umbrales editables)
- [ ] Configuración general (TAT objetivo, retención)
- [ ] Respaldos y mantenimiento
- [ ] Generación de firma para médicos nuevos

---

### MÓDULOS PORTAL

#### MOD-PORTAL-EMPRESA
| Aspecto | Detalle |
|---------|---------|
| **Función** | Portal para RH de empresas cliente |
| **Usuarios** | EMPRESA_RH |
| **Entidades** | (Vista limitada) |
| **Dependencias** | Core, MOD-CITAS, MOD-EXPEDIENTES |
| **Prioridad** | 🔵 BAJA (Fase 3) |

**Funcionalidades:**
- [ ] Ver expedientes de su empresa
- [ ] Descargar reportes
- [ ] Agendar citas para trabajadores
- [ ] Ver estadísticas de su empresa
- [ ] (Permisos exactos por definir)

---

### MÓDULOS FUTUROS

| Módulo | Descripción | Prioridad |
|--------|-------------|-----------|
| MOD-WELLNESS | Control de salud diaria (Daily Health Check) | Post-lanzamiento |
| MOD-MENTAL-HEALTH | Evaluaciones psicológicas, estrés | Post-lanzamiento |
| MOD-FACTURACION | Cobros + integración CONTPAQi | Post-lanzamiento |
| MOD-REPORTES-STPS | Exportación a dependencias | Post-lanzamiento |

---

## Plan de Fases

### FASE 0: Cimientos (4-5 semanas)
```
Core (Auth, DB, Storage, UI, Signatures)
├── MOD-CLINICAS
├── MOD-SERVICIOS
└── MOD-EMPRESAS
```
**Entregable:** Catálogos configurados, usuarios creados

### FASE 1: Flujo Principal (6-8 semanas)
```
MOD-CITAS
├── MOD-EXPEDIENTES
├── MOD-VALIDACION
└── MOD-REPORTES
```
**Entregable:** Un paciente puede completar todo el flujo

### FASE 2: Operaciones (8-10 semanas)
```
MOD-DASHBOARD
├── MOD-BITACORA
├── MOD-CALIDAD
└── MOD-ADMIN
```
**Entregable:** Sistema operativo completo

### FASE 3: Expansión (4-6 semanas)
```
MOD-PORTAL-EMPRESA
└── Mejoras multi-tenant
```
**Entregable:** Portal para clientes

---

## Criterios de Aceptación Global

- [ ] Cada módulo funciona independiente con Core
- [ ] UI 100% responsive (PWA ready)
- [ ] Tests unitarios >80% cobertura por módulo
- [ ] Documentación README por módulo
- [ ] Multi-tenant desde día 1

---

## Referencias

- [ADR-ARCH-20260112-01](decisions/ADR-ARCH-20260112-01.md) - Arquitectura Modular
- [ADR-ARCH-20260112-02](decisions/ADR-ARCH-20260112-02.md) - Stack Tecnológico
- [ADR-ARCH-20260112-03](decisions/ADR-ARCH-20260112-03.md) - Modelo de Datos
- Demo visual: `context/LEGACY_IMPORT/ami-rd/.../Demos funcionales/RD/`

---

**🏗️ ARCH REFERENCE:** ARCH-20260112-04  
**🤖 AUTHOR:** INTEGRA (Arquitecto IA)
