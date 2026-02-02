# 🩺 AMI SYSTEM - Documentación de Entrega Técnica (Handover)

**Fecha:** 2 de Febrero 2026  
**Estado:** MVP Operativo (Demo Data Loaded)  
**Versión:** 0.2.1-DEMO

---

## 🏗️ Arquitectura del Sistema

El proyecto opera como un **Monorepo** gestionado con TurboRepo y PNPM.

### Estructura Principal
- **`packages/web-app`**: Aplicación Next.js 14 principal (Admin Panel).
- **`packages/mod-expedientes`**: Módulo de gestión de expedientes e historiales.
- **`packages/core-*`**: Librerías compartidas (UI, Types, Auth, Database).
- **`prisma/`**: Schema de base de datos único (PostgreSQL).

## 🚀 Despliegue en Producción

El frontend está desplegado en Vercel y la base de datos en Railway.

- **URL Producción:** `https://web-app-ecru-seven.vercel.app`
- **Dashboard:** `/admin`
- **Credenciales Demo:** El sistema usa autenticación mock o directa en esta fase (dependiendo de la configuración de `core-auth`).

### Comandos de Despliegue (CLI)
Para actualizar producción manualmente:
```bash
# Desde la raíz del proyecto
npx vercel --prod --yes
```

> **Nota Crítica:** Actualmente la configuración de TypeScript en `next.config.js` ignora errores de build (`ignoreBuildErrors: true`) para permitir iteraciones rápidas de UI. Se recomienda reactivar el chequeo estricto para fases de estabilización.

---

## 🗄️ Base de Datos y Datos de Prueba

El sistema utiliza PostgreSQL. El esquema se gestiona con Prisma ORM.

### Carga de Datos Demo
Para resetear la base de datos y cargar los 5 expedientes de prueba con sus archivos adjuntos:

```bash
# Limpia, migra y carga datos
npm run seed:demo
```

### Script de Seed (`prisma/seeds/demo-data.ts`)
- **Tenant ID por defecto:** `550e8400-e29b-41d4-a716-446655440000`
- **Pacientes:** 5 registros con folios `AMI-DEMO-001` a `005`.
- **Archivos:** Se copian automáticamente de `context/` a `public/uploads` para ser accesibles vía web.

---

## 🛠️ Entorno de Desarrollo (VSCode + Copilot)

Para retomar el trabajo con asistentes de código, sigue estos pasos:

1. **Instalar Dependencias:**
   ```bash
   npm install
   ```

2. **Generar Cliente Prisma:**
   ```bash
   npx prisma generate
   ```

3. **Levantar Servidor Local:**
   ```bash
   npm run dev
   # Acceder en http://localhost:3000
   ```

### Puntos de Entrada Clave
- **Dashboard UI:** `packages/web-app/src/app/admin/page.tsx`
- **Tabla Expedientes:** `packages/mod-expedientes/src/components/ExpedientTable.tsx`
- **API Routes:** `packages/web-app/src/app/api/`

---

## 📋 Lista de Tareas Pendientes (Backlog Técnico)

1. **Saneamiento de Tipos:** Resolver errores de TypeScript en `mod-expedientes` y reactivar `ignoreBuildErrors: false`.
2. **Conexión de VMS:** El módulo "Centro de Operaciones (VMS)" ubicado en `app/admin/vms` es un prototipo interactivo. Debe conectarse a la API real de `ActivePatient`.
3. **Autenticación Real:** Implementar flujo completo de login con `core-auth` (actualmente en modo permisivo).
4. **Almacenamiento Cloud:** Migrar `public/uploads` a S3/Firebase Storage para persistencia real en producción.

---

**AMI System - Tecnología Médica Avanzada**
