# SPEC-SPRINT-2: Certificación, Reportes y Dashboard Operativo

**ID:** ARCH-20260202-01  
**Autor:** @INTEGRA  
**Estado:** PLANIFICADO  
**Sprint:** 2  

---

## 🎯 Objetivos del Sprint

1. **VMS Unificado (Centro de Mandos):** Crear la interfaz de "una sola parada" basada en el diseño `index.html`, unificando Recepción, Examen, Estudios, Validación y Reportes.
2. **Ciclo de Vida E2E:** Implementar el flujo completo desde la Cita/Papeleta hasta la Entrega del Certificado.
3. **Identidad Médica Persistente (Unique ID):** Generación de un ID único de trabajador (ej. AMI-ID) que trascienda la empresa actual.
4. **Gestión de Entidades Express:** Implementar los flujos de "Alta de Empresa" y "Alta de Trabajador" integrados en el registro inicial.
5. **Certificación Médica Digital (PDF Real):** Generación de PDFs reales y descargables con firma digital incrustada.
6. **Dashboard Operativo Conectado:** Métricas reales obtenidas mediante consultas a Prisma.

---

## 🛠️ Arquitectura y Componentes Relacionados

### 1. MOD-VMS (Centro de Operaciones Unificado)
- **Componente Maestro:** `VMSOrchestrator` en `packages/web-app/src/app/admin/vms`.
- **Tabs Dinámicos:** Integración de Recepción, Examen, Estudios, Validación y Reportes.
- **Contexto de Sesión:** Persistencia del "Paciente/Folio Actual" durante todo el flujo.

### 2. MOD-PACIENTES (Identidad Médica)
- **Unique Worker ID:** Generación automática de ID único (AMI-ID) al primer registro.
- **Alta Integrada:** Formularios rápidos de Empresa y Trabajador dentro del Tab de Recepción.

### 3. MOD-REPORTES (Generación de Documentos)
- **Componente:** `RealTimePDFGenerator` (basado en `react-pdf`).
- **Plantilla A:** Papeleta de Aptitud (Resumen rápido para el paciente).
- **Plantilla B:** Certificado de Aptitud Médica Laboral (Detallado con firma).

---

## 📋 Tareas de Implementación (Backlog)

### Bloque A: El Centro de Mandos (UX/UI de Impacto - @SOFIA)
- [ ] Construir el `VMSOrchestrator` con navegación por pestañas basada en `RD/index.html`.
- [ ] Implementar el "Header de Paciente" persistente.
- [ ] Integrar formularios de "Alta Express" para Empresas y Trabajadores.
- [ ] Configurar las 3 sucursales oficiales de AMI en la base de datos (Seeded ✅).

### Bloque B: Motor IA y Datos (@SOFIA)
- [ ] Migrar el Lector de Estudios (`context/RD/LECTOR`) al backend real usando la OpenAI API Key.
- [ ] Implementar la generación del ID Único de Trabajador.
- [ ] Asegurar flujo de datos: Recepción -> Examen -> Estudios.

### Bloque C: Validación y Despliegue (@DEBY)
- [ ] Auditoría de "Impacto Visual": Comparar con `index.html`.
- [ ] Prueba de estrés con archivos en `context/RD/expedientes/RD-2025-001`.
- [ ] Verificación de seguridad multi-tenant y IDs persistentes.

---

## 🚦 Flujo de Trabajo (Protocolo INTEGRA)

1. **ARCH:** Esta SPEC define la guía.
2. **IMPL:** @SOFIA inicia con la integración de `react-pdf` y las APIs de métricas.
3. **FIX/QA:** @DEBY audita la calidad visual y de datos.
4. **DOC:** @INTEGRA actualiza `PROYECTO.md` al finalizar.
