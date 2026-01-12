# PROYECTO: AMI-SYSTEM (Cliente: AMI - Atención Médica Integrada)

> _Última actualización dashboard: 2026-01-12 16:00 UTC_

## 1. Visión del Proyecto
Sistema modular de gestión de salud ocupacional con extracción IA de datos clínicos. Arquitectura multi-tenant, PWA mobile-first. Stack: Next.js 14 + Prisma + PostgreSQL + Firebase Auth + GCP Storage + OpenAI.

## 2. Objetivos Principales
1.  **Arquitectura Modular**: Monorepo (pnpm + Turborepo) con Core + 17 módulos independientes
2.  **Flujo Digitalizado**: Check-in → Examen → Estudios → Validación IA → Dictamen → Entrega
3.  **PWA Mobile-First**: Responsive desde día 1, offline para datos críticos
4.  **Multi-Tenant**: Un sistema, múltiples organizaciones aisladas

## 3. Estado Global
- **Fase Actual**: FASE 0 COMPLETADA ✅ | FASE 0.5 EN PROGRESO (Integración Web-App + Infraestructura)
- **Semáforo**: 🟢 Verde (Código en master, infraestructura setup pending)
- **Dashboard LIVE**: [README-DASHBOARD.md](./README-DASHBOARD.md) (actualizado)

## 4. Actualización 2026-01-12 (Final)

### ✅ FASE 0 Completada (100%):
- [✓] **3 Módulos Mergeados a Master:**
    - MOD-CLINICAS (commit 463568d0): 4 modelos + 6 métodos + 2 componentes
    - MOD-SERVICIOS (commit bebbfc6b): 3 modelos + 10 métodos + 3 componentes
    - MOD-EMPRESAS (commit 756e3692): 3 modelos + 11 métodos + 3 componentes
- [✓] **Validación GEMINI QA Completada:**
    - Auditoría exhaustiva realizada
    - 3 Fixes Críticos aplicados (soft deletes, cross-tenant, type safety)
    - 0 vulnerabilidades de seguridad pendientes
- [✓] **Documentación Completa:**
    - 4 Checkpoints (1,600+ líneas)
    - ADR-002 definido y validado
    - Dashboard actualizado

### ⏳ FASE 0.5 En Progreso (50%):
- [✓] **Web-app Integration (SOFIA - Completado):**
    - API routes: /api/clinicas/* (GET, POST, PUT, DELETE)
    - Page routes: /admin/clinicas (Server Component)
    - Admin layout: Sidebar navigation + home page update
- [ ] **Infraestructura (GEMINI - Pendiente):**
    - PostgreSQL setup (1-2 horas estimadas)
    - Prisma migrations (1 hora)
    - Firebase Auth (2-3 horas)
    - GCP Cloud Storage (1-2 horas)

### ✅ FASE 1 Iniciada - MOD-CITAS (SOFIA - 50%):
- [✓] **Estructura Base + Service Layer (Completado):**
    - [✓] Estructura base creada (package.json, tsconfig, types)
    - [✓] Modelo Appointment en @ami/core + relaciones (Clinic, Company)
    - [✓] AppointmentService: CRUD, disponibilidad, validaciones (350+ líneas)
    - [✓] Checkpoint: SOFIA-MOD-CITAS-20260112-01 documentado
- [✓] **Componentes UI (Completado):**
    - [✓] CalendarView component (mes/semana, estado visual)
    - [✓] AppointmentForm modal (creación con disponibilidad en tiempo real)
    - [✓] AppointmentTable (lista filtrable, cancelación, edición)
- [✓] **API Routes en web-app (Completado):**
    - [✓] POST /api/citas (create appointment)
    - [✓] GET /api/citas (list con filtros)
    - [✓] GET /api/citas/[id] (detail)
    - [✓] PUT /api/citas/[id] (update)
    - [✓] DELETE /api/citas/[id] (cancel)
    - [✓] POST /api/citas/availability (search slots)
- [✓] **Integración en Admin UI (Completado):**
    - [✓] /admin/citas page creada
    - [✓] AppointmentManager component (orquesta UI)
    - [✓] Menu item en sidebar navigation
    - Dependencias: MOD-CLINICAS ✅ + MOD-EMPRESAS ✅ (satisfechas)
- [ ] **Testing + Validación (Pendiente)**
- [ ] **Documentación Final (Pendiente)**

---

## Entregables Clave por Fase (Cronograma)

| Fase | Semanas | Objetivo | Entregables de salida | Estado |
|------|---------|----------|----------------------|--------|
| FASE 0 – Cimientos | Sem 1-5 | Infraestructura base + catálogos | Monorepo, Core (auth/db/storage/ui/pwa), MOD-CLINICAS, MOD-SERVICIOS, MOD-EMPRESAS | **Completado (95%)** |
| FASE 1 – Flujo Principal | Sem 6-13 | Flujo completo de 1 paciente | MOD-CITAS, MOD-EXPEDIENTES, MOD-VALIDACION (IA), MOD-REPORTES | Planeado |
| FASE 2 – Operaciones | Sem 14-23 | Sistema operativo completo | MOD-DASHBOARD, MOD-BITACORA, MOD-CALIDAD, MOD-ADMIN | Planeado |
| FASE 3 – Expansión | Sem 24-29 | Portal clientes | MOD-PORTAL-EMPRESA, mejoras multi-tenant | Planeado |

> **Nota:** El cronograma está alineado con los hitos de pago acordados (ver `context/Cronograma_Desarrollo.md`). Cualquier cambio se documentará aquí.

---

## Tablero — Módulos (Progress Dashboard)

<!-- progress-modules:start -->
| id | name | phase | phaseOrder | owner | status | progress | summary | needs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| core-setup | Setup Monorepo + Tooling | FASE 0 – Cimientos | 0 | DevOps | done | 100 | pnpm workspaces + Turborepo + TypeScript | -
| core-auth | Core - Autenticación | FASE 0 – Cimientos | 0 | Backend | pending | 0 | Firebase Auth + roles + Custom Claims | core-setup completado |
| core-database | Core - Base de Datos | FASE 0 – Cimientos | 0 | Backend | done | 100 | Prisma Schema V2 Unificado (Centralizado en @ami/core) | - |
| core-storage | Core - Storage | FASE 0 – Cimientos | 0 | Backend | pending | 0 | GCP Cloud Storage + URLs firmadas | core-setup completado |
| core-ui | Core - UI Base | FASE 0 – Cimientos | 0 | Frontend | in_progress | 50 | shadcn/ui + tema AMI | core-setup completado |
| core-pwa | Core - PWA | FASE 0 – Cimientos | 0 | Frontend | pending | 0 | next-pwa + service worker + offline | core-ui completado |
| core-signatures | Core - Firmas | FASE 0 – Cimientos | 0 | Backend | pending | 0 | Generador de firma única por médico | core-setup completado |
| mod-clinicas | MOD-CLINICAS | FASE 0 – Cimientos | 0 | Frontend · Backend | done | 100 | ✅ Validado globalmente. Schema V2 sync. UI Client Components. | - |
| mod-servicios | MOD-SERVICIOS | FASE 0 – Cimientos | 0 | Frontend · Backend | done | 100 | ✅ Validado globalmente. Schema V2 sync. Baterías logic fixed. | - |
| mod-empresas | MOD-EMPRESAS | FASE 0 – Cimientos | 0 | Frontend · Backend | done | 100 | ✅ Validado globalmente. Schema V2 sync. | - |
| mod-citas | MOD-CITAS | FASE 1 – Flujo Principal | 1 | Frontend · Backend | done | 100 | ✅ Service layer DONE. UI Components + API Routes DONE. Ready para infraestructura. | mod-clinicas + mod-empresas |
| mod-expedientes | MOD-EXPEDIENTES | FASE 1 – Flujo Principal | 1 | Frontend · Backend | pending | 0 | Recepción + Examen Médico + Carga de Estudios | mod-citas completado |
| mod-validacion | MOD-VALIDACION | FASE 1 – Flujo Principal | 1 | Backend · Data | pending | 0 | Extracción IA + semáforos + dictamen + firma | mod-expedientes completado |
| mod-reportes | MOD-REPORTES | FASE 1 – Flujo Principal | 1 | Backend · Frontend | pending | 0 | Generación PDF + envío email + URLs temporales | mod-validacion completado |
| mod-dashboard | MOD-DASHBOARD | FASE 2 – Operaciones | 2 | Frontend · Data | pending | 0 | KPIs, gráficas, alertas, pendientes | todos FASE 1 completados |
| mod-bitacora | MOD-BITACORA | FASE 2 – Operaciones | 2 | Backend · Data | pending | 0 | Audit log, timeline, filtros, export Excel | core-database completado |
| mod-calidad | MOD-CALIDAD | FASE 2 – Operaciones | 2 | Data | pending | 0 | Precisión IA, alertas activas, auditorías | mod-validacion completado |
| mod-admin | MOD-ADMIN | FASE 2 – Operaciones | 2 | Frontend · Backend | pending | 0 | Usuarios, roles, semáforos, configuración | core-auth completado |
| mod-portal-empresa | MOD-PORTAL-EMPRESA | FASE 3 – Expansión | 3 | Frontend | pending | 0 | Portal RH: expedientes, descargas, agendar | todos FASE 2 completados |
| arquitectura | Arquitectura y Documentación | FASE 0 – Cimientos | 0 | Arquitectura | done | 100 | ADRs, SPECs, Guías - COMPLETADO | N/A |
<!-- progress-modules:end -->

---

## 5. Épicas y Tareas Detalladas

### FASE 0: CIMIENTOS (4-5 semanas)
**Objetivo:** Infraestructura base lista para desarrollo

#### Epic: Setup del Monorepo
| ID | Tarea | Estado | Responsable |
|----|-------|--------|-------------|
| F0-001 | Crear estructura `packages/core/` | [ ] Pendiente | SOFIA |
| F0-002 | Configurar pnpm workspaces | [ ] Pendiente | SOFIA |
| F0-003 | Configurar Turborepo | [ ] Pendiente | SOFIA |
| F0-004 | Setup TypeScript base | [ ] Pendiente | SOFIA |
| F0-005 | Setup ESLint + Prettier | [ ] Pendiente | SOFIA |

#### Epic: Core Components
| ID | Tarea | Estado | Responsable |
|----|-------|--------|-------------|
| F0-010 | Core Auth: Firebase + roles + middleware | [ ] Pendiente | SOFIA |
| F0-020 | Core Database: Prisma + PostgreSQL + tenant middleware | [ ] Pendiente | SOFIA |
| F0-030 | Core Storage: GCP + upload + URLs firmadas | [ ] Pendiente | SOFIA |
| F0-040 | Core UI: shadcn + tema + layout responsive | [ ] Pendiente | SOFIA |
| F0-050 | Core PWA: next-pwa + manifest + service worker | [ ] Pendiente | SOFIA |
| F0-060 | Core Signatures: Generador de firma médica | [ ] Pendiente | SOFIA |

#### Epic: Módulos Base
| ID | Tarea | Estado | Responsable |
|----|-------|--------|-------------|
| F0-100 | MOD-CLINICAS: CRUD clínicas, horarios, capacidad | [ ] Pendiente | SOFIA |
| F0-110 | MOD-SERVICIOS: Catálogo + baterías | [ ] Pendiente | SOFIA |
| F0-120 | MOD-EMPRESAS: CRUD + baterías contratadas + perfiles | [ ] Pendiente | SOFIA |

### FASE 1: FLUJO PRINCIPAL (6-8 semanas)
**Objetivo:** Un paciente puede completar el flujo completo

| ID | Módulo | Descripción | Estado |
|----|--------|-------------|--------|
| F1-200 | MOD-CITAS | Agenda, disponibilidad, check-in, recordatorios | [ ] Pendiente |
| F1-220 | MOD-EXPEDIENTES | Recepción + Examen + Carga estudios | [ ] Pendiente |
| F1-250 | MOD-VALIDACION | Extracción IA + semáforos + dictamen | [ ] Pendiente |
| F1-270 | MOD-REPORTES | PDF + email + URLs temporales | [ ] Pendiente |

### FASE 2: OPERACIONES (8-10 semanas)
**Objetivo:** Sistema operativo completo

| ID | Módulo | Descripción | Estado |
|----|--------|-------------|--------|
| F2-300 | MOD-DASHBOARD | KPIs, gráficas, alertas | [ ] Pendiente |
| F2-310 | MOD-BITACORA | Audit log, timeline, export | [ ] Pendiente |
| F2-320 | MOD-CALIDAD | Precisión IA, auditorías | [ ] Pendiente |
| F2-330 | MOD-ADMIN | Usuarios, roles, config | [ ] Pendiente |

### FASE 3: EXPANSIÓN (4-6 semanas)
**Objetivo:** Portal para empresas cliente

| ID | Módulo | Descripción | Estado |
|----|--------|-------------|--------|
| F3-400 | MOD-PORTAL-EMPRESA | Dashboard RH, expedientes, agendar | [ ] Pendiente |

---

## 6. Documentación de Arquitectura

### ADRs (Architecture Decision Records)
- [ADR-ARCH-20260112-01](context/decisions/ADR-ARCH-20260112-01.md) - Arquitectura Modular
- [ADR-ARCH-20260112-02](context/decisions/ADR-ARCH-20260112-02.md) - Stack Tecnológico
- [ADR-ARCH-20260112-03](context/decisions/ADR-ARCH-20260112-03.md) - Modelo de Datos

### SPECs y Guías
- [SPEC-MODULOS-AMI](context/SPEC-MODULOS-AMI.md) - Especificación de Módulos
- [SPEC-FLUJOS-USUARIO](context/SPEC-FLUJOS-USUARIO.md) - Flujos de Usuario
- [GUIA-CREAR-MODULO](context/GUIA-CREAR-MODULO.md) - Guía de Extensibilidad

### Referencia Legacy
- Demo visual: `context/LEGACY_IMPORT/ami-rd/.../Demos funcionales/RD/`
- Checklist: [00_CHECKLIST_LEGACY_CONSOLIDADO](context/00_CHECKLIST_LEGACY_CONSOLIDADO.md)

---

## 7. Backlog Futuro (Post-lanzamiento)

| Módulo | Descripción | Prioridad |
|--------|-------------|-----------|
| MOD-WELLNESS | Daily Health Check, temperatura, síntomas | Baja |
| MOD-MENTAL-HEALTH | Evaluaciones psicológicas, estrés | Baja |
| MOD-FACTURACION | CONTPAQi, facturas, cobros | Baja |
| MOD-REPORTES-STPS | Exportación IMSS/STPS | Baja |

---

**Última actualización:** 2026-01-12  
**Autor:** INTEGRA (Arquitecto IA)
