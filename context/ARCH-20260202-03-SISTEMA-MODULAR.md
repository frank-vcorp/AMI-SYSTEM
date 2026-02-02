# ARCH-20260202-03: Sistema Modular AMI - Arquitectura Asíncrona

**Autor:** @INTEGRA  
**Fecha:** 2026-02-02  
**Estado:** APROBADO  
**Prioridad:** CRÍTICA  

---

## 🎯 VISIÓN CORREGIDA DEL SISTEMA

AMI NO es un flujo lineal. Es un **ecosistema de módulos independientes** que operan en **momentos temporales diferentes** (minutos, horas, días, semanas) pero comparten un **núcleo de datos común**.

### ❌ LO QUE NO ES
- Un wizard paso a paso
- Un proceso que debe completarse en una sesión
- Un flujo donde el usuario avanza linealmente

### ✅ LO QUE SÍ ES
- Un sistema de **módulos autónomos** accesibles desde un menú
- Cada módulo puede usarse **independientemente** en diferentes momentos
- Los datos fluyen entre módulos pero **no bloquean** la operación de otros

---

## 🏗️ ARQUITECTURA DE MÓDULOS

### 1️⃣ MÓDULO: EMPRESAS (Marketing/Admin)
**Responsable:** Dar de alta empresas y perfiles de puesto  
**Momento:** Semanas/meses antes de las citas  
**Independiente de:** Citas, Expedientes, Validaciones  

**Entidades:**
- `Company`
- `JobProfile`
- `ClinicService` (Servicios contratados)

**Acciones:**
- Crear empresa
- Definir perfiles de puesto
- Asignar servicios/baterías médicas

---

### 2️⃣ MÓDULO: CITAS (RH/Call Center)
**Responsable:** Agendar trabajadores para exámenes  
**Momento:** Días antes de la atención  
**Depende de:** Empresas (debe existir la empresa)  
**Independiente de:** Expedientes, Validaciones  

**Entidades:**
- `Appointment`
- `Patient` (se crea o vincula aquí)

**Acciones:**
- Crear cita
- **Generar QR único**
- Enviar confirmación al trabajador
- Reagendar/Cancelar

**Estados de Cita:**
```prisma
enum AppointmentStatus {
  PENDING       // Agendada, QR generado
  CONFIRMED     // Trabajador confirmó asistencia
  CHECKED_IN    // Llegó y escaneó QR
  COMPLETED     // Atención finalizada
  CANCELLED     // Cancelada
  NO_SHOW       // No se presentó
}
```

---

### 3️⃣ MÓDULO: CHECK-IN (Recepción)
**Responsable:** Registrar arribo del paciente  
**Momento:** Día de la cita (AM)  
**Depende de:** Cita existente  
**Crea:** Expediente  

**Flujo:**
1. Escanear QR del trabajador
2. Validar cita activa
3. **Crear Expedient** con estado `CHECKED_IN`
4. Imprimir papeleta de atención

**Entidades:**
- `Expedient` (se crea aquí por primera vez)

---

### 4️⃣ MÓDULO: EXAMEN MÉDICO (Médico/Enfermería)
**Responsable:** Realizar examen físico y tomar muestras  
**Momento:** Día de la cita (durante atención)  
**Depende de:** Expediente abierto (Check-in realizado)  
**Independiente de:** Estudios, Validación  

**Entidades:**
- `MedicalExam`

**Acciones:**
- Capturar signos vitales
- Registrar hallazgos físicos
- Indicar estudios/laboratorios requeridos
- Marcar expediente como `EXAM_COMPLETED`

**El trabajador se va después de esto.**

---

### 5️⃣ MÓDULO: ESTUDIOS/LABORATORIOS (Capturista/IA)
**Responsable:** Subir y procesar resultados de estudios  
**Momento:** 1-3 días después del examen (asíncrono)  
**Depende de:** Expediente con examen completado  
**Independiente de:** Validación (puede subirse antes o después)  

**Entidades:**
- `StudyUpload`
- `ExtractedData` (datos capturados por IA)

**Flujo:**
1. Capturista sube PDF de laboratorio
2. **IA extrae datos automáticamente** (OCR + LLM)
3. Sistema marca estudio como `EXTRACTED`
4. Datos quedan disponibles para validador

**Estados de Estudio:**
```prisma
enum StudyStatus {
  UPLOADED      // PDF subido, pendiente procesamiento
  PROCESSING    // IA analizando
  EXTRACTED     // Datos capturados exitosamente
  MANUAL_REVIEW // IA no pudo extraer, requiere captura manual
  VALIDATED     // Validador revisó y aprobó
}
```

---

### 6️⃣ MÓDULO: VALIDACIÓN (Médico Validador)
**Responsable:** Revisar expediente completo y emitir dictamen  
**Momento:** Cuando TODO esté listo (puede ser horas o días después)  
**Depende de:** Examen + Estudios completos  
**Crea:** Dictamen final  

**Trigger de Creación:**
```
IF (expedient.status === 'EXAM_COMPLETED' 
    AND all_required_studies.status === 'EXTRACTED')
THEN CREATE ValidationTask
```

**Entidades:**
- `ValidationTask`

**Acciones:**
- Ver examen físico
- Ver estudios con datos extraídos
- Capturar opinión médica
- Emitir veredicto (APTO/NO APTO/APTO CON RESTRICCIONES)
- **Firmar electrónicamente**
- Marcar expediente como `VALIDATED`

---

### 7️⃣ MÓDULO: REPORTES (Automatizado)
**Responsable:** Generar y enviar certificado médico  
**Momento:** Inmediatamente después de validación  
**Depende de:** Expediente validado  

**Acciones:**
- Generar PDF con dictamen
- Enviar a empresa vía email
- Registrar entrega

---

## 🔄 FLUJO DE ESTADOS DEL EXPEDIENTE

```
CITA AGENDADA (Appointment.PENDING)
        ↓
    [Días pasan...]
        ↓
CHECK-IN → Expedient.CHECKED_IN
        ↓
EXAMEN FÍSICO → Expedient.EXAM_COMPLETED
        ↓
    [Trabajador se va]
        ↓
    [1-3 días pasan...]
        ↓
ESTUDIOS SUBIDOS → Expedient.AWAITING_STUDIES
        ↓
IA PROCESA → Expedient.DATA_EXTRACTED
        ↓
    [Sistema detecta completitud]
        ↓
CREA ValidationTask → Expedient.READY_FOR_REVIEW
        ↓
    [Validador se conecta cuando puede]
        ↓
VALIDACIÓN → Expedient.IN_VALIDATION
        ↓
FIRMA → Expedient.VALIDATED
        ↓
REPORTE GENERADO → Expedient.DELIVERED
```

---

## 🎨 INTERFAZ: MENÚ MODULAR

Cada rol ve solo sus módulos:

### Admin/Marketing
- 🏢 Empresas
- 👔 Perfiles de Puesto
- 🔧 Servicios

### RH/Call Center
- 📅 Citas
- 👥 Pacientes

### Recepción
- ✅ Check-in (Escanear QR)
- 📋 Papeletas

### Médico/Enfermería
- 🩺 Exámenes Médicos
- 📊 Expedientes en Atención

### Capturista
- 📄 Subir Estudios
- 🤖 Revisar Extracciones de IA

### Validador
- ✍️ Tareas de Validación
- 📝 Dictámenes Pendientes

---

## 🛠️ CAMBIOS TÉCNICOS REQUERIDOS

### 1. Actualizar `ExpedientStatus`
```prisma
enum ExpedientStatus {
  CHECKED_IN
  IN_PHYSICAL_EXAM
  EXAM_COMPLETED
  AWAITING_STUDIES
  STUDIES_UPLOADED
  DATA_EXTRACTED
  READY_FOR_REVIEW
  IN_VALIDATION
  VALIDATED
  DELIVERED
  ARCHIVED
}
```

### 2. Hacer `ValidationTask` condicional
- NO crear automáticamente
- Crear solo cuando: `EXAM_COMPLETED + ALL_STUDIES_EXTRACTED`

### 3. Agregar `StudyStatus` granular
```prisma
enum StudyStatus {
  UPLOADED
  PROCESSING
  EXTRACTED
  MANUAL_REVIEW
  VALIDATED
}
```

### 4. Desacoplar APIs
- Cada módulo tiene sus propias rutas
- No asumir flujo lineal
- Permitir acceso directo a cualquier módulo

---

## 📋 TAREAS PARA @SOFIA

### Fase 1: Esquema (Prioridad ALTA)
- [ ] Actualizar `ExpedientStatus` en `schema.prisma`
- [ ] Agregar `StudyStatus` enum
- [ ] Hacer `ValidationTask.medicalExamId` opcional (ya hecho)
- [ ] Agregar campo `requiredStudies` a `JobProfile`

### Fase 2: APIs (Prioridad ALTA)
- [ ] Refactorizar `/api/expedientes` para soportar estados asíncronos
- [ ] Crear `/api/check-in` para escaneo de QR
- [ ] Actualizar `/api/validaciones` para creación condicional
- [ ] Agregar webhook/trigger para detectar completitud

### Fase 3: Frontend (Prioridad MEDIA)
- [ ] Crear menú modular por rol
- [ ] Separar vistas de cada módulo
- [ ] Eliminar wizards lineales
- [ ] Agregar indicadores de estado en cada módulo

---

## ✅ CRITERIOS DE ÉXITO

1. Un usuario de RH puede crear citas sin que exista expediente
2. Un médico puede completar examen sin que existan estudios
3. Un capturista puede subir estudios días después del examen
4. Un validador solo ve tareas cuando TODO está completo
5. Cada módulo es accesible independientemente desde el menú

---

**@SOFIA: Procede con Fase 1 (Esquema). Reporta cuando esté listo para Fase 2.**
