# INTERCONSULTA TÉCNICA: INFRAESTRUCTURA MVP (MOD-CITAS)

**ID:** GEMINI-SOFIA-INTERCONSULTA-INFRAESTRUCTURA
**FECHA:** 2026-01-12
**INTERLOCUTORES:** SOFIA (Builder) -> GEMINI (Cloud Architect/QA)
**ESTADO:** APROBADO CON MODIFICACIONES

---

## 1. RESUMEN DE DECISIÓN ARQUITECTÓNICA

Se aprueba el despliegue del MVP para validar `MOD-CITAS` en entorno productivo. Se establece una arquitectura híbrida optimizada para velocidad de desarrollo (Time-to-market) manteniendo estándares de calidad.

### Stack de Infraestructura Aprobado:
| Capa | Tecnología | Proveedor | Justificación Técnica |
| :--- | :--- | :--- | :--- |
| **Frontend & API** | Next.js 14 (App Router) | **Vercel** | Optimización nativa, soporte Monorepo `turborepo`/`pnpm`, Edge Network. |
| **Base de Datos** | PostgreSQL 16 | **Railway** | Setup rápido, coste eficiente bajo demanda, fácil gestión de variables. |
| **Auth & Files** | Auth & Storage | **Firebase** | Integración existente en stack, seguridad robusta (Google Cloud Identity Platform). |
| **CI/CD** | GitHub Actions | **GitHub** | Automatización de Quality Gates y `prisma migrate deploy`. |

---

## 2. HOJA DE RUTA DE IMPLEMENTACIÓN (PASO A PASO)

SOFIA, ejecuta estos pasos en orden secuencial.

### FASE 1: Base de Datos (Railway)
1.  Crear proyecto nuevo en Railway: `AMI-SYSTEM-PROD`.
2.  Añadir servicio: **PostgreSQL**.
3.  Configurar variables en Railway:
    *   Fijar versión a `16`.
    *   Copiar la `DATABASE_URL` (Public Networking enabled para acceso desde Vercel/Local).
4.  **Acción Local:**
    *   Actualizar `.env` local con la nueva `DATABASE_URL`.
    *   Ejecutar migración inicial: `pnpm prisma migrate dev --name init_production`.
    *   Verificar que las tablas de `MOD-CITAS` (Citas, Disponibilidad) existen en Railway.

### FASE 2: Identidad y Almacenamiento (Firebase)
1.  Ir a Firebase Console -> Crear proyecto `ami-system-mvp`.
2.  **Authentication:** Habilitar Email/Password y Google Provider.
3.  **Firestore:** Crear base de datos (modo producción) -> Región: `us-central`.
4.  Letra de reglas de seguridad (Básica): Permitir lectura/escritura solo a autenticados por ahora.
5.  **Storage:** Habilitar bucket para `docs-medicos`.

### FASE 3: Despliegue Aplicación (Vercel)
1.  Importar repositorio en Vercel.
2.  **Configuración de Build (Monorepo):**
    *   Root Directory: `packages/web-app` (O la raíz si usas turborepo remote caching, pero recomiendo apuntar a la app web).
    *   Framework Preset: `Next.js`.
    *   Build Command: `cd ../.. && pnpm build` (o dejar que Vercel detecte Turbo).
3.  **Variables de Entorno (Vercel Project Settings):**
    *   `DATABASE_URL`: (Valor de Railway)
    *   `NEXT_PUBLIC_FIREBASE_API_KEY`: (...)
    *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: (...)
    *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: (...)
    *   `NEXT_PUBLIC_API_URL`: (URL del deployment de Vercel, actualizar post-deploy si es necesario)
4.  **Deploy:** Ejecutar primer despliegue.

---

## 3. CONSIDERACIONES DE CALIDAD & RIESGOS

### Migraciones de Prisma
**Riesgo:** Desincronización del esquema en producción.
**Mitigación:**
*   No ejecutar `migrate dev` contra la base de datos de Railway desde local salvo en setup inicial.
*   En CI/CD (o build command de Vercel), usar `prisma migrate deploy`.

### Seguridad
*   **Reglas Firebase:** No dejar reglas `allow read, write: if true;` en producción más de 24 horas.
*   **Variables:** Nunca comitear `.env` al repositorio.

### Monitorización
*   Habilitar **Vercel Analytics** (gratuito plan hobby/pro trials) para controlar Web Vitals.
*   Revisar logs de Railway para detectar "slow queries" en la base de datos.
---

## 4. PRÓXIMOS PASOS
1.  Ejecutar configuración de Fase 1 y 2.
2.  Realizar despliegue en Vercel.
3.  Realizar "Smoke Test": Crear un paciente, agendar una cita y verificar que el registro aparece en la tabla `Cita` de Railway.

Firma:
**GEMINI-CLOUD-QA**
*Arquitecto de Infraestructura & Calidad*
