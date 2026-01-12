# CHECKPOINT: FASE 0 – Cimientos (Planificación)

**ID:** CHECKPOINT-FASE0-PLAN-20260112  
**Fecha:** 2026-01-12  
**Estado:** 🟡 En Planificación  
**Responsable:** SOFIA  
**Duración Estimada:** 5 semanas (Sem 1-5)

---

## 1. Objetivo FASE 0

**Entregar:** Infraestructura base + catálogos configurables para que FASE 1 pueda iniciar flujo principal.

| Componente | Descripción | Hito |
|-----------|-----------|------|
| **Core Setup** | Monorepo con pnpm + Turborepo + TypeScript | Sem 1 |
| **Core Services** | Auth (Firebase) + DB (Prisma) + Storage (GCP) | Sem 1-2 |
| **Core UI** | Design system (shadcn) + PWA + Firmas | Sem 2-3 |
| **Base Modules** | MOD-CLINICAS + MOD-SERVICIOS + MOD-EMPRESAS | Sem 2-5 |

---

## 2. Necesidades Funcionales por Módulo

### 2.1 CORE-SETUP (DevOps)
**Necesidad:** Infraestructura base para que todos los packages compartan código y tooling.

**Flujo de trabajo:**
```
Dev → pnpm dev → Turborepo orquesta monorepo → Outputs: /packages/*/dist
```

**Entregables:**
- [ ] `pnpm-workspace.yaml` configurado
- [ ] `turbo.json` con pipelines (build, dev, test, lint)
- [ ] `tsconfig.base.json` compartido
- [ ] `.eslintrc.js` + `.prettierrc` centralizados
- [ ] Scripts: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm lint`
- [ ] GitHub Actions: build + lint (soft-gates ya existe)
- [ ] `packages/core-types/` para tipos compartidos

**Dependencias:**
- ✅ ADRs aprobados (INTEGRA)

**Validación:**
- [ ] `pnpm install` no da errores
- [ ] `pnpm dev` levanta todas las apps
- [ ] `pnpm build` compila sin warnings

---

### 2.2 CORE-AUTH (Backend)
**Necesidad:** Autenticación centralizada + roles/permisos por tenant.

**Flujo de usuario:**
```
Usuario ingresa email/password 
  → Firebase Auth login 
  → Custom Claims (role, tenant_id) 
  → Protected routes (middleware)
  → Dashboard
```

**Componentes UI requeridos:**
- Login form (email + password)
- "Forgot password" flow
- Selector de tenant (si tiene acceso a múltiples)

**Backend requerido:**
- Función Cloud (Node.js + Firebase Admin SDK)
- Middleware de autenticación
- Middleware de autorización (roles)

**Entregables:**
- [ ] Firebase proyecto creado + config en `.env`
- [ ] `packages/core-auth/` con:
  - `signUp()` - Crear usuario + enviar email
  - `signIn()` - Login con Firebase
  - `setCustomClaims()` - Asignar rol + tenant
  - `verifyToken()` - Middleware Express
- [ ] LoginPage en Next.js
- [ ] Protected API routes

**Dependencias:**
- ✅ core-setup completado

**Referencia UI:**
- Demo legacy: `LEGACY_IMPORT/ami-rd/.../Demos funcionales/RD/admin_portal_-_admin_portal.html` (login)

**Validación:**
- [ ] Crear usuario funciona
- [ ] Login funciona, devuelve token
- [ ] Custom Claims se asignan correctamente
- [ ] Protected route devuelve 401 sin token

---

### 2.3 CORE-DATABASE (Backend)
**Necesidad:** Base de datos multi-tenant con Prisma + PostgreSQL (Railway).

**Modelo de datos base:**
```
Tenant
  ├── User (email, role, tenant_id)
  ├── AuditLog (quién, qué, cuándo)
  ├── Clinic (nombre, dirección, horario)
  ├── Service (nombre, código, costo)
  └── Company (nombre, servicios contratados)
```

**Características:**
- [ ] Middleware de tenant (auto-filtrado en queries)
- [ ] Soft deletes (isDeleted + deletedAt)
- [ ] Auditoría automática (createdBy, updatedBy, timestamps)
- [ ] Índices en tenant_id (performance)

**Entregables:**
- [ ] PostgreSQL en Railway
- [ ] `packages/core-database/` con:
  - `schema.prisma` (Tenant, User, AuditLog, Clinic, Service, Company)
  - `prisma.client()` configurado
  - Middleware de tenant en Apollo GraphQL (o similar)
  - Seeds iniciales
- [ ] Migraciones de Prisma
- [ ] Docker para PostgreSQL local (dev)

**Dependencias:**
- ✅ core-setup completado

**Validación:**
- [ ] Migraciones aplican sin error
- [ ] Seeds populan datos iniciales
- [ ] Query con filtro tenant_id funciona
- [ ] AuditLog se crea automáticamente

---

### 2.4 CORE-STORAGE (Backend)
**Necesidad:** Almacenar PDFs médicos con URLs temporales (GCP Cloud Storage).

**Flujo:**
```
Médico carga PDF 
  → Verificar formato (PDF medical)
  → Calcular hash (deduplicación)
  → Subir a GCS con metadata
  → Devolver signed URL (24h)
  → Guardar ref en DB
```

**Características:**
- [ ] Upload directo desde navegador (CORS)
- [ ] Validación de tipo MIME
- [ ] Metadata: filename, size, uploadedBy, tenant_id
- [ ] Signed URLs con expiración
- [ ] Borrado automático de obsoletos (lifecycle policy)

**Entregables:**
- [ ] GCP proyecto + Cloud Storage bucket
- [ ] `packages/core-storage/` con:
  - `uploadFile()` - Generar signed URLs para PUT
  - `createSignedUrl()` - Generar URLs de descarga
  - `deleteFile()` - Borrar si no hay refs
- [ ] CORS configurado en bucket
- [ ] Lifecycle policy (30 días archivos sin ref)

**Dependencias:**
- ✅ core-setup completado

**Validación:**
- [ ] Upload de PDF funciona desde navegador
- [ ] Signed URL devuelve archivo
- [ ] URL expira después del tiempo
- [ ] Metadata se guarda en Firestore/DB

---

### 2.5 CORE-UI (Frontend)
**Necesidad:** Design system consistente + layout responsive + componentes base.

**Componentes necesarios:**
```
Layout (Header, Sidebar, Main)
  ├── Button (primario, secundario, warning)
  ├── Card (con border, shadow)
  ├── Form (Input, Select, Checkbox, Radio)
  ├── Modal (confirmación, formularios)
  ├── Table (datos, paginación)
  ├── Badge (status: pending, progress, blocked, done)
  ├── Toast (notificaciones)
  └── Loader (skeleton, spinner)
```

**Diseño:**
- [ ] Color palette AMI (corporativo) 
- [ ] Tipografía consistente (Roboto / Inter)
- [ ] Breakpoints responsive (mobile-first)
- [ ] Tema claro/oscuro (Tailwind CSS)

**Entregables:**
- [ ] `packages/core-ui/` con componentes shadcn/ui
- [ ] `packages/web-app/` (Next.js) con layout
- [ ] Storybook para documentación de componentes
- [ ] Tailwind CSS configurado
- [ ] CSS modules o styled-components

**Dependencias:**
- ✅ core-setup completado

**Referencia UI:**
- Demo legacy: `LEGACY_IMPORT/ami-rd/.../Demos funcionales/RD/` (layout, colores)

**Validación:**
- [ ] Componentes se renderizan en Storybook
- [ ] Layout responsive en móvil/tablet/desktop
- [ ] Tema oscuro funciona
- [ ] Performance: Lighthouse > 80

---

### 2.6 CORE-PWA (Frontend)
**Necesidad:** Offline-first + service worker + progressive enhancement.

**Características:**
- [ ] Manifest.json + iconos
- [ ] Service Worker (cache estrategia)
- [ ] Install prompt (iOS/Android)
- [ ] Sync en background
- [ ] Offline indicator

**Entregables:**
- [ ] `next.config.js` con `next-pwa`
- [ ] Configuración de cache estrategia (network-first, cache-first)
- [ ] Manifest customizado (AMI branding)
- [ ] Service Worker hooks

**Dependencias:**
- ✅ core-ui completado

**Validación:**
- [ ] App instala en móvil
- [ ] Funciona offline (dados cacheados)
- [ ] Sincroniza cuando vuelve conexión

---

### 2.7 CORE-SIGNATURES (Backend)
**Necesidad:** Generar firmas digitales únicas por médico (para dictámenes).

**Flujo:**
```
Médico dicta validación 
  → Sistema genera firma PNG (nombre + timestamp)
  → Inserta en PDF/documento
  → Guarda ref en AuditLog
```

**Características:**
- [ ] Canvas 2D para renderizar firma
- [ ] Font médico oficial (si existe)
- [ ] Metadata: médico_id, timestamp, expediente_id
- [ ] Verificación (QR con datos)

**Entregables:**
- [ ] `packages/core-signatures/` con:
  - `generateSignature()` - Crear PNG de firma
  - `verifySignature()` - Validar autenticidad
- [ ] Canvas renderización en Next.js Image

**Dependencias:**
- ✅ core-ui completado

**Validación:**
- [ ] Firma se renderiza correctamente
- [ ] QR es scaneable
- [ ] Metadata se guarda

---

### 2.8 MOD-CLINICAS (Frontend · Backend)
**Necesidad:** Gestionar clínicas, horarios, capacidad de atención.

**Flujo:**
```
Admin ingresa clínicas 
  → Configura horarios (Lun-Dom, 8am-6pm)
  → Define capacidad por turno (ej: 5 pacientes/turno)
  → Sistema valida en MOD-CITAS
```

**Datos necesarios:**
```
Clinic {
  id, tenant_id, nombre, dirección, teléfono, 
  lat/lng, horarios[], capacidadPorTurno, 
  serviciosDisponibles[], createdAt, updatedAt
}
```

**Componentes UI:**
- [ ] Tabla de clínicas (CRUD)
- [ ] Modal de edición
- [ ] Horarios picker (days + time)
- [ ] Mapa (Google Maps) - opcional

**API requerida:**
- [ ] GET /clinics - Listar
- [ ] POST /clinics - Crear
- [ ] PUT /clinics/:id - Editar
- [ ] DELETE /clinics/:id - Borrar (soft delete)

**Entregables:**
- [ ] Página `app/admin/clinics`
- [ ] CRUD completo
- [ ] Validación (nombre requerido, horarios válidos)

**Dependencias:**
- ✅ core-database completado
- ✅ core-auth completado

**Referencia UI:**
- Demo legacy: Tabla CRUD genérica

**Validación:**
- [ ] Crear clínica funciona
- [ ] Listar muestra datos
- [ ] Editar actualiza BD
- [ ] Borrar hace soft delete

---

### 2.9 MOD-SERVICIOS (Frontend · Backend)
**Necesidad:** Catálogo de servicios/estudios + baterías (paquetes).

**Flujo:**
```
Admin ingresa servicios (ej: Rayos X, Electrocardiograma)
  → Agrupa en baterías (ej: "Batería Completa" = RX + ECG)
  → Las empresas contratan baterías (no servicios individuales)
```

**Datos necesarios:**
```
Service {
  id, código, nombre, descripción, costo, 
  tiempoEstimado(min), requiereEquipo, createdAt
}

Battery {
  id, nombre, descripción, servicios[], 
  costTotal, duracionTotal(min), createdAt
}
```

**Componentes UI:**
- [ ] Tabla de servicios (CRUD)
- [ ] Tabla de baterías (CRUD)
- [ ] Multi-select de servicios en baterías
- [ ] Preview de costo total

**API requerida:**
- [ ] GET /services + POST, PUT, DELETE
- [ ] GET /batteries + POST, PUT, DELETE

**Entregables:**
- [ ] Página `app/admin/services`
- [ ] Página `app/admin/batteries`
- [ ] CRUD completo para ambos

**Dependencias:**
- ✅ core-database completado
- ✅ MOD-CLINICAS completado

**Validación:**
- [ ] Crear servicio funciona
- [ ] Crear batería con múltiples servicios funciona
- [ ] Costo total se calcula automáticamente

---

### 2.10 MOD-EMPRESAS (Frontend · Backend)
**Necesidad:** Gestionar empresas clientes + qué baterías contratan + perfiles puesto.

**Flujo:**
```
Admin ingresa empresa (ej: "Constructora ABC")
  → Asigna baterías contratadas (ej: "Batería Completa" + "Oftalmología")
  → Define perfiles puesto (ej: "Operario" → requiere RX)
  → Sistema valida en MOD-CITAS (solo esos servicios se pueden agendar)
```

**Datos necesarios:**
```
Company {
  id, tenant_id, nombre, dirección, contacto, 
  bateriasContratadas[], perfilesPuesto[], 
  createdAt, updatedAt
}

JobProfile {
  id, nombre, descripción, bateriasRequeridas[], 
  riesgoNivel (alto/medio/bajo), createdAt
}
```

**Componentes UI:**
- [ ] Tabla de empresas (CRUD)
- [ ] Modal: seleccionar baterías contratadas
- [ ] Modal: definir perfiles puesto
- [ ] Preview de servicios que puede agendar

**API requerida:**
- [ ] GET /companies + POST, PUT, DELETE
- [ ] GET /companies/:id/batteries
- [ ] PUT /companies/:id/batteries
- [ ] GET /companies/:id/job-profiles + POST, PUT, DELETE

**Entregables:**
- [ ] Página `app/admin/companies`
- [ ] Página `app/admin/companies/:id/job-profiles`
- [ ] CRUD completo

**Dependencias:**
- ✅ MOD-SERVICIOS completado

**Validación:**
- [ ] Crear empresa funciona
- [ ] Asignar baterías funciona
- [ ] Definir perfiles funciona
- [ ] En MOD-CITAS solo aparecen servicios contratados

---

## 3. Mapa de Dependencias

```
FASE 0:
┌─────────────────────────────────────────────┐
│ core-setup (pnpm + Turborepo + TypeScript)  │
└────────┬────────┬────────────────┬──────────┘
         │        │                │
    ┌────▼──┐ ┌───▼──────┐ ┌──────▼─────┐
    │Auth   │ │Database  │ │ UI + PWA   │
    └────┬──┘ └───┬──────┘ └──────┬─────┘
         │        │               │
    ┌────▼──┐ ┌───▼──────┐ ┌──────▼──────┐
    │Storage│ │Signatures│ │  Storybook  │
    └────┬──┘ └──────────┘ └──────┬──────┘
         │                        │
    ┌────▼─────────────────────────▼────────┐
    │  MOD-CLINICAS (CRUD clínicas)         │
    └────┬─────────────────────────────────┘
         │
    ┌────▼─────────────────────────────────┐
    │  MOD-SERVICIOS (Servicios + Baterías)│
    └────┬─────────────────────────────────┘
         │
    ┌────▼─────────────────────────────────┐
    │  MOD-EMPRESAS (Empresas + Perfiles)  │
    └─────────────────────────────────────┘
```

---

## 4. Desglose por Semana

### Semana 1: Setup Base + Core Auth/DB/Storage
**Objetivo:** Infraestructura + backends operacionales

- **core-setup**: ✅ Monorepo funcional
- **core-auth**: ✅ Firebase + login
- **core-database**: ✅ Prisma + PostgreSQL
- **core-storage**: ✅ GCP Cloud Storage

**Entregables:**
- `pnpm dev` levanta todas las apps
- Login funciona
- Base de datos crea tablas
- Upload de archivos a GCS funciona

---

### Semana 1-2: Core UI + PWA
**Objetivo:** Design system + offline capability

- **core-ui**: ✅ Components + Storybook
- **core-pwa**: ✅ Service worker + manifest
- **core-signatures**: ✅ Generador de firmas

**Entregables:**
- Storybook documentando todos los componentes
- App instala en móvil
- Funciona offline

---

### Semana 2-3: MOD-CLINICAS + MOD-SERVICIOS (base)
**Objetivo:** Catálogos base operacionales

- **MOD-CLINICAS**: ✅ CRUD clínicas + horarios
- **MOD-SERVICIOS**: ✅ CRUD servicios + baterías

**Entregables:**
- Admin puede crear clínicas
- Admin puede crear servicios/baterías
- Datos se validan y almacenan

---

### Semana 3-5: MOD-EMPRESAS + Pruebas
**Objetivo:** Catálago empresas + validación integral

- **MOD-EMPRESAS**: ✅ CRUD empresas + perfiles puesto
- **Testing**: ✅ Unit tests + integration tests
- **Documentation**: ✅ README de setup, API docs

**Entregables:**
- Admin puede crear empresas
- Admin asigna baterías y perfiles
- Pruebas automatizadas > 70% cobertura
- README con instrucciones de setup local

---

## 5. Checklist de Validación

### Por Módulo

#### ✅ core-setup
- [ ] `pnpm install` sin errores
- [ ] `pnpm dev` levanta apps
- [ ] `pnpm build` compila sin warnings
- [ ] `pnpm lint` no tiene errores de sintaxis
- [ ] GitHub Actions soft-gates pasa

#### ✅ core-auth
- [ ] Usuario puede registrarse
- [ ] Usuario puede loguear
- [ ] Custom Claims se asignan (role, tenant_id)
- [ ] Protected routes devuelven 401 sin token
- [ ] Token se almacena en localStorage/cookies
- [ ] Logout limpia token

#### ✅ core-database
- [ ] Migraciones aplican
- [ ] Seeds populan datos
- [ ] Query con filtro tenant_id funciona
- [ ] AuditLog registra cambios automáticamente
- [ ] Soft deletes funcionan (isDeleted)
- [ ] Índices mejoran performance

#### ✅ core-storage
- [ ] Upload de PDF desde navegador funciona
- [ ] Signed URL devuelve el archivo
- [ ] URL expira después del tiempo configurado
- [ ] Borrado automático de obsoletos funciona
- [ ] CORS permite requests desde navegador

#### ✅ core-ui
- [ ] Todos los componentes renderizan en Storybook
- [ ] Responsive en mobile/tablet/desktop
- [ ] Tema oscuro/claro funciona
- [ ] Accesibilidad: WCAG AA (contrast, labels)
- [ ] Performance: Lighthouse > 80

#### ✅ core-pwa
- [ ] App instala con prompt en móvil
- [ ] Service worker cachea assets
- [ ] Funciona offline (datos cacheados)
- [ ] Sincroniza cuando vuelve conexión
- [ ] Manifest tiene iconos correctos

#### ✅ core-signatures
- [ ] Firma PNG se renderiza
- [ ] Metadata se guarda correctamente
- [ ] QR es scaneable
- [ ] Verificación de autenticidad funciona

#### ✅ MOD-CLINICAS
- [ ] CRUD completo (Create, Read, Update, Delete)
- [ ] Validación: nombre, dirección requeridos
- [ ] Horarios se validan (rangos válidos)
- [ ] Tabla list es responsive
- [ ] Búsqueda/filtro por nombre funciona

#### ✅ MOD-SERVICIOS
- [ ] CRUD de servicios completo
- [ ] CRUD de baterías completo
- [ ] Multi-select de servicios en baterías
- [ ] Costo total se calcula automáticamente
- [ ] Búsqueda funciona

#### ✅ MOD-EMPRESAS
- [ ] CRUD de empresas completo
- [ ] Asignar baterías funciona
- [ ] Crear/editar perfiles puesto funciona
- [ ] Validación de datos
- [ ] MOD-CITAS solo muestra servicios contratados

### Cross-Cutting

- [ ] Logging (quién, qué, cuándo en AuditLog)
- [ ] Error handling consistente (Toast + console)
- [ ] Loading states en todas las acciones async
- [ ] No hay N+1 queries (Prisma select optimizado)
- [ ] Passwords hasheadas (bcrypt)
- [ ] CORS configurado correctamente
- [ ] Rate limiting en API (opcional pero recomendado)

---

## 6. Documentación a Crear

| Documento | Ubicación | Contenido |
|-----------|-----------|----------|
| Setup Local | `README.md` (raíz) | `pnpm install`, `pnpm dev`, variables .env |
| API Docs | `docs/API.md` | Endpoints, schemas, ejemplos |
| Database Docs | `docs/DATABASE.md` | Schema, relaciones, indices |
| UI Docs | `packages/core-ui/README.md` | Componentes, props, ejemplos |
| Component Library | Storybook | Visual + interactivo |
| ADR Runtime | `context/decisions/` | Decisiones técnicas tomadas |

---

## 7. Puntos de Validación con Otros Agentes

### 🏗️ INTEGRA (Arquitecto)
- **Validar cada módulo** antes de pasar a siguiente
- **Revisar dependencias** si se descubren gaps
- **Aprobar cambios** de scope o UI

### 🔍 GEMINI (QA/Infra)
- **Tests automatizados** > 70% cobertura
- **Performance**: Lighthouse > 80
- **Seguridad**: SQLi, XSS, CSRF validados
- **Infra**: Railway (DB), GCP (Storage), Firebase (Auth) configurados

### 📋 CRONISTA (Admin)
- **Actualizar PROYECTO.md** al completar módulo
- **Crear checkpoints** cada 2-3 semanas
- **Dashboard** actualizado con progreso real

---

## 8. Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|--------|-----------|
| PostgreSQL en Railway falla | Media | Alto | Tener backup en local Docker |
| GCP Cloud Storage quota excedida | Baja | Medio | Monitorear uso, cleanup automático |
| Tipos TypeScript complejos | Media | Medio | Revisar types con INTEGRA |
| Diseño UI requiere ajustes | Alta | Bajo | Validar con mockups antes de code |
| Dependencias NPM rotas | Baja | Medio | Usar `pnpm audit`, lock files |

---

## 9. Estado y Próximos Pasos

**Estado:** 🟡 Planificación completada, lista para empezar Semana 1

**Próximos pasos:**
1. Validar este plan con **INTEGRA**
2. Configurar cuentas (Railway, GCP, Firebase) - **GEMINI**
3. Crear estructura inicial monorepo - **SOFIA**
4. Iniciar core-setup - **SOFIA**

---

**🏗️ MÉTODO INTEGRA**: Checkpoint enriquecido con análisis de necesidades, dependencias y validación.  
**✍️ AUTOR:** SOFIA (Builder)  
**🤝 RESPONSABLE:** SOFIA  
**📅 PRÓXIMA REVISIÓN:** 2026-01-15 (Sem 1)
