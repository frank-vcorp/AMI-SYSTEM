# E2E Demo Flow - FASE 1 Flujo Completo

> **Fecha Creación:** 2026-01-20  
> **Responsable:** DEBY (Builder Asistente)  
> **Estado:** ✅ READY FOR DEMO (Jueves 23 Enero 2026)

## 🎯 Objetivo

Demostrar el flujo completo end-to-end de AMI-SYSTEM el jueves:

```
CITA (CHECK_IN) → EXPEDIENTE → ESTUDIOS → VALIDACIÓN → REPORTE
```

Este documento proporciona instrucciones paso-a-paso para ejecutar la demo, validar la BD, y verificar que todos los módulos funcionan correctamente.

---

## 📋 Prerrequisitos

- [ ] Build de Vercel pasando (✅ 326fbee1)
- [ ] BD PostgreSQL en Railway conectada (✅ LIVE)
- [ ] Variables de entorno configuradas (.env.local)
- [ ] Dev server corriendo: `npm run dev --filter=@ami/web-app`

---

## 🚀 Preparación (Viernes 21 - 30 min)

### Paso 1: Crear Datos de Demo

Ejecutar el script de seed:

```bash
# Ejecutar seed (no requiere dependencias adicionales)
npx ts-node scripts/e2e-demo-seed.ts
```

**Salida esperada:**
```
🌱 Iniciando E2E Demo Seed para FASE 1...

📍 1. Creando clínicas...
✅ 3 clínicas creadas

🏢 2. Creando empresas...
✅ 5 empresas creadas

🔬 3. Creando servicios y baterías...
✅ 3 servicios + 3 baterías creadas

📅 4. Creando citas en estado CHECK_IN...
✅ 10 citas creadas en estado CHECK_IN

📋 5. Creando expedientes...
✅ 5 expedientes creados con exámenes médicos

📎 6. Agregando estudios a expedientes...
✅ 10 estudios/archivos agregados

✅ 7. Creando tareas de validación...
✅ 5 tareas de validación creadas

🎉 E2E DEMO DATA SEED COMPLETADO
...
```

---

## 🎬 Demo Script (Jueves 23 - Live)

### Escena 1: MOD-CITAS - Gestión de Citas (5 min)

**UI:** http://localhost:3000/admin/citas

1. **Mostrar tabla de citas:**
   - Filtrar por status `CHECK_IN` (citas ya completadas)
   - Mostrar que hay 10 citas en la tabla
   - Explicar campos: Paciente, Clínica, Empresa, Batería de servicios, Fecha

2. **Acciones disponibles:**
   - Click en fila para ver detalles (expandir)
   - Botón **"📋 Generar Expediente"** (verde) - Esto es lo clave

**Narración:**
> "Aquí vemos las citas que ya pasaron check-in. El sistema está listo para crear el expediente del paciente. Vamos a hacer clic en 'Generar Expediente' para iniciar el flujo."

---

### Escena 2: MOD-EXPEDIENTES - Crear Expediente (3 min)

**UI:** http://localhost:3000/admin/expedientes/new?appointmentId=xxx&patientId=yyy

1. **Verificar pre-llenado:**
   - El formulario debe tener:
     - ✅ Nombre del paciente (desde cita)
     - ✅ Clínica (desde cita)
     - ✅ Empresa (desde cita)
     - ✅ ID de cita visible

2. **Llenar datos faltantes (si aplica):**
   - Antecedentes médicos
   - Medicamentos actuales

3. **Click "Crear Expediente"**
   - Esperar confirmación
   - Redirige a: `/admin/expedientes/[id]`

**Narración:**
> "El sistema automáticamente pre-llena los datos de la cita. Ahora creamos el expediente con el folio único que lo identifica en todo el flujo."

---

### Escena 3: MOD-EXPEDIENTES - Agregar Estudios (3 min)

**UI:** http://localhost:3000/admin/expedientes/[id]

1. **Panel izquierdo - Detalles del Expediente:**
   - Mostrar folio único (EXP-CLI-CDMX-01-...)
   - Estado: `IN_PROGRESS`
   - Datos del paciente, clínica, empresa

2. **Sección Central - Examen Médico:**
   - Click en "Agregar Examen Médico"
   - Modal con campos:
     - Presión arterial (120/80)
     - Frecuencia cardíaca (72)
     - Temperatura (36.5)
     - Peso (75 kg)
     - Altura (170 cm)
     - Hallazgos físicos (textarea)
   - Click "Guardar Examen"
   - Verificar que se agrega a la lista

3. **Sección Derecha - Estudios/Archivos:**
   - Drag-drop zona para subir archivos
   - Simulación: Subir "Radiografía de Tórax.pdf"
   - Simulación: Subir "Análisis de Sangre.pdf"
   - Mostrar archivos en lista

**Narración:**
> "Aquí los médicos registran los vitales y suben los estudios (radiografías, análisis de sangre, etc.). El sistema organiza todo bajo un único expediente del paciente."

---

### Escena 4: MOD-VALIDACION - Validación por IA (3 min)

**UI:** http://localhost:3000/admin/validaciones

1. **Lista de Tareas de Validación:**
   - Mostrar tabla con `[Semaphore Status]` (🟢🟡🔴)
   - Los expedientes del seed mostrarán `YELLOW` (pendiente validación)

2. **Click en una validación:**
   - Panel 2-columnas:
     - **Izquierda:** PDF Viewer (radiografía o archivo)
     - **Derecha:** Datos extraídos (vitales, laboratorio)

3. **Cambiar Semaphore Status:**
   - De `YELLOW` a `GREEN` (todo bien) o `RED` (revisar)
   - Explicar reglas: presión > 140 = YELLOW, etc.

4. **Agregar Opinión Médica:**
   - Textarea con conclusión
   - Ejemplo: "Paciente apto para trabajar en puesto actual"

5. **Firma Digital:**
   - Canvas de firma
   - Botón "Firmar Documento"
   - Estado cambia a `SIGNED`

**Narración:**
> "La IA ha extraído automáticamente los datos de los estudios. El médico valida los números, ajusta si es necesario, determina el veredicto con el semáforo, y firma digitalmente. Es rápido y cumple regulaciones."

---

### Escena 5: MOD-REPORTES - Descarga PDF (2 min)

**UI:** http://localhost:3000/admin/reportes/[expedientId]

1. **Mostrar CertificateViewer:**
   - Certificado con datos del paciente
   - Veredicto (🟢 Apto / 🟡 Apto con restricciones / 🔴 No apto)
   - Firma digital visible
   - Empresa y clínica

2. **Click "Descargar PDF":**
   - Se descarga: `Certificado-EXP-{folio}.pdf`
   - Mostrar en explorador (o Preview)

3. **Mostrar que se guardó en BD:**
   - Status del expediente: `COMPLETED`
   - Último update timestamp

**Narración:**
> "El reporte final es automáticamente generado y firmado. Empresas y pacientes descargan este PDF como comprobante. Todo auditado y centralizado."

---

## ✅ Checklist Final (Jueves antes de demo)

### Técnico
- [ ] Build en Vercel: `npm run build` sin errores
- [ ] Dev local: `npm run dev --filter=@ami/web-app` corriendo
- [ ] BD: Conexión Railway verificada, datos de seed insertados
- [ ] Rutas: Todas las páginas cargan sin 404
- [ ] TypeScript: `npm run type-check` pasando

### Funcional
- [ ] MOD-CITAS: Tabla visible, botón "Generar Expediente" funciona
- [ ] MOD-EXPEDIENTES: Formulario pre-llena, exámenes se agregan, archivos se suben
- [ ] MOD-VALIDACION: Semáforos calculan, firma digital funciona
- [ ] MOD-REPORTES: PDF descarga correctamente

### UX
- [ ] Navegación entre módulos fluida (breadcrumbs, sidebar)
- [ ] Mensajes de error claros (si aplica)
- [ ] Loading states visibles durante operaciones
- [ ] Mobile responsive (probar en DevTools)

### Documentación
- [ ] Este archivo actualizado
- [ ] Checkpoint final creado
- [ ] PROYECTO.md actualizado con estado 100% FASE 1

---

## 🎓 Explicación para el Cliente

### Slide 1: Arquitectura
```
PACIENTE → CITA (MOD-CITAS)
         ↓
      EXPEDIENTE (MOD-EXPEDIENTES) - El corazón del sistema
         ├─ Vitales (Examen médico)
         ├─ Estudios (Radiografías, análisis)
         └─ Folio único
         ↓
      VALIDACIÓN (MOD-VALIDACION) - IA + Médico
         ├─ Extracción de datos automática
         ├─ Semáforos de riesgo
         └─ Firma digital
         ↓
      REPORTE (MOD-REPORTES) - PDF final
         └─ Certificado descargable

Todo en 1 dashboard. Multi-tenant. Escalable.
```

### Slide 2: Beneficios Demostrados
- ✅ **Automatización:** De cita a expediente en 1 click
- ✅ **Centralización:** Todo en un sistema, sin papeles
- ✅ **Cumplimiento:** Firmas digitales, auditoría completa
- ✅ **Escalabilidad:** Soporta múltiples clínicas/empresas

---

## 📞 Troubleshooting

| Problema | Solución |
|----------|----------|
| Datos de seed no aparecen | Ejecutar `npx ts-node scripts/e2e-demo-seed.ts` nuevamente |
| Formulario no pre-llena | Verificar URL tiene `?appointmentId=xxx&patientId=yyy` |
| PDF no descarga | Verificar `core-storage` configurado, variables de entorno |
| Firma digital no guarda | Verificar Canvas API disponible en navegador (no IE11) |
| Slow UI | Puede ser BD. Ejecutar: `SELECT COUNT(*) FROM Expedient;` en Railway |

---

## 📊 Métricas Demo

**Tiempo total:** ~15 minutos  
**Módulos involucrados:** 4 (CITAS, EXPEDIENTES, VALIDACION, REPORTES)  
**Operaciones BD:** ~25 (create, read, update)  
**API calls:** ~8  
**Componentes React:** 12+

---

## 🚀 Próximas Fases (Post-Demo)

- [ ] **FASE 2:** MOD-DASHBOARD (gráficas), MOD-BITACORA (auditoría)
- [ ] **FASE 3:** Portal de Empresas (clientes ven sus propios reportes)
- [ ] **Integraciones:** OpenAI para extracción IA mejorada, Twilio para SMS

---

> **Last Updated:** 2026-01-20 15:45 UTC  
> **Status:** ✅ READY  
> **Next Review:** Jueves 23 Enero 2026 (Post-Demo)
