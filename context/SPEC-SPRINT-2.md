# SPEC-SPRINT-2: Certificación, Reportes y Dashboard Operativo

**ID:** ARCH-20260202-01  
**Autor:** @INTEGRA  
**Estado:** PLANIFICADO  
**Sprint:** 2  

---

## 🎯 Objetivos del Sprint

1. **Certificación Médica Digital (PDF Real):** Pasar de placeholders a archivos PDF reales y descargables para la Papeleta de Aptitud y el Certificado Médico.
2. **Dashboard Operativo Conectado:** Reemplazar los datos mock del administrador por métricas reales obtenidas mediante consultas a Prisma.
3. **Digital Signature Integration:** Asegurar que la firma capturada en el panel de validación se incruste correctamente en los reportes generados.

---

## 🛠️ Arquitectura y Componentes Relacionados

### 1. MOD-REPORTES (Generación de Documentos)
- **Componente:** `RealTimePDFGenerator` (basado en `react-pdf`).
- **Plantilla A:** Papeleta de Aptitud (Resumen rápido para el paciente).
- **Plantilla B:** Certificado de Aptitud Médica Laboral (Detallado con firma).
- **Integración:** API `/api/reportes/generar/[expedientId]`.

### 2. MOD-DASHBOARD (Métricas en Tiempo Real)
- **API Endpoints:**
  - `GET /api/dashboard/stats`: Retorna KPIs (Pacientes hoy, Pendientes, TAT).
  - `GET /api/dashboard/funnel`: Retorna distribución por estados.
- **Frontend:** Conexión de `packages/web-app/src/app/admin/page.tsx` con SWR/useEffect para cargar datos reales.

### 3. MOD-VALIDACION (Cierre del Círculo)
- **Refuerzo:** Al firmar un expediente, disparar la generación automática del reporte PDF.

---

## 📋 Tareas de Implementación (Backlog)

### Bloque A: Reportes Digitales (@SOFIA)
- [ ] Implementar `PDFCertificate` en `@ami/mod-reportes` usando `react-pdf`.
- [ ] Crear la lógica de mapeo de `ExtractedDataSet` + `MedicalExam` al formato de impresión oficial.
- [ ] Implementar la pre-visualización en el `CertificateViewer`.

### Bloque B: Dashboard Operativo (@SOFIA)
- [ ] Crear `dashboardService.ts` en `@ami/core` para realizar agregaciones de Prisma.
- [ ] Exponer rutas API en `packages/web-app/src/app/api/dashboard`.
- [ ] Refactorizar el dashboard para mostrar estados de carga y datos persistidos.

### Bloque C: Validación y Despliegue (@DEBY)
- [ ] Validar la legibilidad de los PDFs generados en diferentes dispositivos.
- [ ] Verificar que los KPIs del dashboard coincidan con los datos de auditoría de la DB.
- [ ] Verificación de seguridad multi-tenant en todas las nuevas rutas API.

---

## 🚦 Flujo de Trabajo (Protocolo INTEGRA)

1. **ARCH:** Esta SPEC define la guía.
2. **IMPL:** @SOFIA inicia con la integración de `react-pdf` y las APIs de métricas.
3. **FIX/QA:** @DEBY audita la calidad visual y de datos.
4. **DOC:** @INTEGRA actualiza `PROYECTO.md` al finalizar.
