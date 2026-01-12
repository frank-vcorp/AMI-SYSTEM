# HANDOFF: SOFIA - FASE 0 Cimientos

**ID:** HANDOFF-20260112-01  
**Fecha:** 2026-01-12  
**De:** INTEGRA (Arquitecto)  
**Para:** SOFIA (Builder)  
**Estado:** Listo para implementación

---

## Resumen Ejecutivo

La arquitectura de AMI-SYSTEM v2.0 está definida y documentada. SOFIA puede iniciar la implementación de FASE 0 (Cimientos).

**Objetivo FASE 0:** Infraestructura base + catálogos configurables  
**Duración estimada:** 5 semanas (Sem 1-5)  
**Entregable:** Monorepo funcional con Core y 3 módulos base

---

## Documentación de Referencia

Antes de empezar, familiarízate con:

| Documento | Ubicación | Contenido |
|-----------|-----------|-----------|
| Arquitectura Modular | [ADR-ARCH-20260112-01](../decisions/ADR-ARCH-20260112-01.md) | Estructura monorepo, packages |
| Stack Tecnológico | [ADR-ARCH-20260112-02](../decisions/ADR-ARCH-20260112-02.md) | Next.js, Prisma, PWA config |
| Modelo de Datos | [ADR-ARCH-20260112-03](../decisions/ADR-ARCH-20260112-03.md) | Schema Prisma completo |
| Módulos | [SPEC-MODULOS-AMI](../SPEC-MODULOS-AMI.md) | Detalle de cada módulo |
| Flujos | [SPEC-FLUJOS-USUARIO](../SPEC-FLUJOS-USUARIO.md) | Flujos de usuario |
| Crear Módulos | [GUIA-CREAR-MODULO](../GUIA-CREAR-MODULO.md) | Cómo estructurar módulos |
| Demo Visual | `LEGACY_IMPORT/ami-rd/.../Demos funcionales/RD/` | Referencia UI |

---

## Orden de Implementación FASE 0

### Semana 1: Setup Monorepo

```
1. core-setup (DevOps)
   ├── Crear estructura packages/
   ├── Configurar pnpm workspaces
   ├── Configurar Turborepo
   ├── Setup TypeScript base
   └── Setup ESLint + Prettier
```

**Checklist:**
- [ ] `pnpm init` en raíz
- [ ] `pnpm-workspace.yaml` con packages/*
- [ ] `turbo.json` con pipelines build/dev/test
- [ ] `tsconfig.base.json` compartido
- [ ] `.eslintrc.js` + `.prettierrc`
- [ ] Scripts: `pnpm dev`, `pnpm build`, `pnpm lint`

### Semana 1-2: Core Components

```
2. core-auth (Backend)
   ├── Firebase Auth config
   ├── Login/logout
   ├── Roles (ADMIN, COORDINADOR, MEDICO, etc.)
   ├── Middleware de protección
   └── Custom Claims

3. core-database (Backend)
   ├── Prisma setup
   ├── PostgreSQL connection (Railway)
   ├── Schema base (Tenant, User, AuditLog)
   ├── Middleware multi-tenant
   └── Seeds de datos

4. core-storage (Backend)
   ├── GCP Cloud Storage config
   ├── Upload service
   ├── Signed URLs
   └── Categorización de PDFs
```

### Semana 2-3: Core UI + PWA

```
5. core-ui (Frontend)
   ├── shadcn/ui setup
   ├── Tema AMI (colores, tipografía)
   ├── Componentes base
   ├── Layout responsive
   └── Navegación adaptativa

6. core-pwa (Frontend)
   ├── next-pwa config
   ├── manifest.json
   ├── Service worker
   └── Offline básico

7. core-signatures (Backend)
   ├── Generador de firma Canvas
   ├── Storage en perfil usuario
   └── Inserción en PDFs
```

### Semana 3-4: Módulos Base

```
8. mod-clinicas (Frontend · Backend)
   ├── Schema: Clinic, ClinicSchedule, ClinicService
   ├── API: CRUD clínicas
   ├── UI: Lista, formularios, horarios
   └── UI: Vista capacidad

9. mod-servicios (Frontend · Backend)
   ├── Schema: Service, Battery, BatteryItem
   ├── API: CRUD servicios y baterías
   ├── UI: Catálogo de servicios
   └── UI: Gestión de baterías

10. mod-empresas (Frontend · Backend)
    ├── Schema: Company, CompanyBattery, JobProfile
    ├── API: CRUD empresas
    ├── UI: Lista empresas
    └── UI: Asignar baterías, perfiles puesto
```

---

## Stack Técnico (Recordatorio)

```json
{
  "frontend": {
    "framework": "Next.js 14 (App Router)",
    "ui": "shadcn/ui + Tailwind CSS",
    "state": "Zustand",
    "forms": "React Hook Form + Zod",
    "pwa": "next-pwa"
  },
  "backend": {
    "api": "Next.js API Routes",
    "orm": "Prisma",
    "database": "PostgreSQL (Railway)",
    "auth": "Firebase Auth",
    "storage": "GCP Cloud Storage"
  },
  "tooling": {
    "monorepo": "pnpm + Turborepo",
    "typescript": "^5.0",
    "testing": "Vitest + Playwright"
  }
}
```

---

## Estructura de Carpetas Objetivo

```
AMI-SYSTEM/
├── apps/
│   └── web/                    ← Next.js app
│       ├── app/
│       │   ├── (auth)/         ← Rutas protegidas
│       │   ├── api/            ← API routes
│       │   └── layout.tsx
│       ├── next.config.js
│       └── package.json
│
├── packages/
│   ├── core/
│   │   ├── auth/
│   │   ├── database/
│   │   ├── storage/
│   │   ├── ui/
│   │   └── signatures/
│   │
│   ├── mod-clinicas/
│   ├── mod-servicios/
│   └── mod-empresas/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

---

## Variables de Entorno Requeridas

```env
# Database
DATABASE_URL="postgresql://..."

# Firebase Auth
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
FIREBASE_ADMIN_PRIVATE_KEY="..."

# GCP Storage
GCP_PROJECT_ID="..."
GCP_STORAGE_BUCKET="ami-system-pdfs"
GCP_SERVICE_ACCOUNT_KEY="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Criterios de Aceptación FASE 0

- [ ] Monorepo funciona con `pnpm dev`
- [ ] Login/logout con Firebase Auth
- [ ] Roles funcionan (ADMIN ve todo, otros restringido)
- [ ] CRUD de clínicas completo
- [ ] CRUD de servicios y baterías completo
- [ ] CRUD de empresas con asignación de baterías
- [ ] UI responsive (probar en móvil)
- [ ] PWA instalable
- [ ] Multi-tenant funciona (filtro por tenantId)
- [ ] Tests unitarios >80% en Core

---

## Notas Importantes

1. **Mobile-first**: Diseñar primero para móvil, luego adaptar a desktop
2. **Multi-tenant**: SIEMPRE incluir `tenantId` en queries
3. **Audit log**: Registrar cambios importantes en `AuditLog`
4. **Demo visual**: Usar el demo legacy como referencia de UI/UX
5. **Commits**: Seguir conventional commits (`feat:`, `fix:`, etc.)

---

## Contacto y Dudas

- **Dudas de arquitectura**: Crear interconsulta en `context/interconsultas/`
- **Bloqueos técnicos**: Escalar a GEMINI (QA/Infra)
- **Decisiones de negocio**: Consultar con usuario

---

## Próximo Handoff

Al completar FASE 0, SOFIA debe:
1. Actualizar PROYECTO.md con progreso (status: `done`, progress: `100`)
2. Crear checkpoint en `Checkpoints/`
3. Notificar para iniciar FASE 1 (MOD-CITAS)

---

**¡Éxito con la implementación!** 🚀

---

**🏗️ ARCH REFERENCE:** HANDOFF-20260112-01  
**🤖 AUTHOR:** INTEGRA (Arquitecto IA)
